const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { authenticateToken, requireVendor } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, requireVendor, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Create empty cart if it doesn't exist
      await cartRef.set({
        userId: req.user.uid,
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return res.json({
        cart: {
          items: [],
          total: 0
        }
      });
    }

    const cartData = cartDoc.data();
    
    // Get product details for each cart item
    const itemsWithDetails = await Promise.all(
      cartData.items.map(async (item) => {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await productRef.get();
        
        if (productDoc.exists) {
          const productData = productDoc.data();
          return {
            ...item,
            product: {
              id: productDoc.id,
              name: productData.name,
              price: productData.price,
              unit: productData.unit,
              imageUrl: productData.imageUrl,
              supplierName: productData.supplierName
            }
          };
        } else {
          // Product no longer exists, remove from cart
          return null;
        }
      })
    );

    // Filter out null items (deleted products)
    const validItems = itemsWithDetails.filter(item => item !== null);
    
    // Update cart if items were removed
    if (validItems.length !== cartData.items.length) {
      const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await cartRef.update({
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        updatedAt: new Date()
      });
    }

    res.json({
      cart: {
        items: validItems,
        total: validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, requireVendor, [
  body('productId').notEmpty(),
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    // Check if product exists
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productData = productDoc.data();

    // Check stock availability
    if (productData.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    let cartData;
    if (cartDoc.exists) {
      cartData = cartDoc.data();
    } else {
      cartData = {
        userId: req.user.uid,
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Check if item already exists in cart
    const existingItemIndex = cartData.items.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      cartData.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cartData.items.push({
        productId,
        quantity,
        price: productData.price
      });
    }

    // Calculate total
    cartData.total = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartData.updatedAt = new Date();

    await cartRef.set(cartData);

    res.json({
      message: 'Item added to cart successfully',
      cart: cartData
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/update/:productId', authenticateToken, requireVendor, [
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartData = cartDoc.data();
    const itemIndex = cartData.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Check stock availability
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    
    if (productDoc.exists) {
      const productData = productDoc.data();
      if (productData.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    }

    // Update quantity
    cartData.items[itemIndex].quantity = quantity;
    cartData.total = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartData.updatedAt = new Date();

    await cartRef.update(cartData);

    res.json({
      message: 'Cart updated successfully',
      cart: cartData
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, requireVendor, async (req, res) => {
  try {
    const { productId } = req.params;
    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartData = cartDoc.data();
    const itemIndex = cartData.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Remove item
    cartData.items.splice(itemIndex, 1);
    cartData.total = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartData.updatedAt = new Date();

    await cartRef.update(cartData);

    res.json({
      message: 'Item removed from cart successfully',
      cart: cartData
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, requireVendor, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    await cartRef.update({
      items: [],
      total: 0,
      updatedAt: new Date()
    });

    res.json({
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Checkout cart
router.post('/checkout', authenticateToken, requireVendor, async (req, res) => {
  try {
    const cartRef = db.collection('carts').doc(req.user.uid);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartData = cartDoc.data();

    if (cartData.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Verify stock availability and update stock
    for (const item of cartData.items) {
      const productRef = db.collection('products').doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(400).json({ error: `Product ${item.productId} no longer available` });
      }

      const productData = productDoc.data();
      if (productData.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${productData.name}` });
      }

      // Update stock
      await productRef.update({
        stock: productData.stock - item.quantity,
        updatedAt: new Date()
      });
    }

    // Create order
    const orderData = {
      userId: req.user.uid,
      userName: req.user.name,
      items: cartData.items,
      total: cartData.total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderRef = await db.collection('orders').add(orderData);

    // Clear cart
    await cartRef.update({
      items: [],
      total: 0,
      updatedAt: new Date()
    });

    res.json({
      message: 'Order placed successfully',
      orderId: orderRef.id,
      order: orderData
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to checkout' });
  }
});

module.exports = router;