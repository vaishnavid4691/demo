const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateCartItem, validateObjectId } = require('../middleware/validation');

// @route   GET /api/cart
// @desc    Get vendor's cart
// @access  Private (Vendor only)
router.get('/', [authenticateToken, authorize('vendor')], async (req, res) => {
  try {
    let cart = await Cart.findOne({ vendor: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name description category price minimumOrderQuantity availableQuantity supplier images',
        populate: {
          path: 'supplier',
          select: 'name businessName phone isVerified'
        }
      });

    if (!cart) {
      cart = new Cart({ vendor: req.user._id, items: [] });
      await cart.save();
    }

    // Filter out products that are no longer active
    const activeItems = cart.items.filter(item => item.product && item.product.isActive !== false);
    
    if (activeItems.length !== cart.items.length) {
      cart.items = activeItems;
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: { cart }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private (Vendor only)
router.post('/add', [
  authenticateToken,
  authorize('vendor'),
  validateCartItem
], async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true })
      .populate('supplier', 'name businessName isVerified');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    // Check if supplier is verified
    if (!product.supplier.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Can only order from verified suppliers'
      });
    }

    // Check minimum order quantity
    if (quantity < product.minimumOrderQuantity) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity is ${product.minimumOrderQuantity} ${product.price.unit}`
      });
    }

    // Check available quantity
    if (quantity > product.availableQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.availableQuantity} ${product.price.unit} available`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ vendor: req.user._id });
    if (!cart) {
      cart = new Cart({ vendor: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price, notes);

    // Populate the updated cart
    await cart.populate({
      path: 'items.product',
      select: 'name description category price minimumOrderQuantity availableQuantity supplier images',
      populate: {
        path: 'supplier',
        select: 'name businessName phone isVerified'
      }
    });

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update cart item quantity
// @access  Private (Vendor only)
router.put('/update/:productId', [
  authenticateToken,
  authorize('vendor'),
  validateObjectId('productId')
], async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ vendor: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ _id: req.params.productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    // Validate quantity constraints
    if (quantity > 0) {
      if (quantity < product.minimumOrderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity is ${product.minimumOrderQuantity} ${product.price.unit}`
        });
      }

      if (quantity > product.availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.availableQuantity} ${product.price.unit} available`
        });
      }
    }

    // Update cart item
    await cart.updateItemQuantity(req.params.productId, quantity);

    // Populate the updated cart
    await cart.populate({
      path: 'items.product',
      select: 'name description category price minimumOrderQuantity availableQuantity supplier images',
      populate: {
        path: 'supplier',
        select: 'name businessName phone isVerified'
      }
    });

    res.json({
      success: true,
      message: quantity > 0 ? 'Cart item updated successfully' : 'Item removed from cart',
      data: { cart }
    });

  } catch (error) {
    console.error('Update cart error:', error);
    
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private (Vendor only)
router.delete('/remove/:productId', [
  authenticateToken,
  authorize('vendor'),
  validateObjectId('productId')
], async (req, res) => {
  try {
    // Get cart
    const cart = await Cart.findOne({ vendor: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item from cart
    await cart.removeItem(req.params.productId);

    // Populate the updated cart
    await cart.populate({
      path: 'items.product',
      select: 'name description category price minimumOrderQuantity availableQuantity supplier images',
      populate: {
        path: 'supplier',
        select: 'name businessName phone isVerified'
      }
    });

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart }
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear all items from cart
// @access  Private (Vendor only)
router.delete('/clear', [authenticateToken, authorize('vendor')], async (req, res) => {
  try {
    // Get cart
    const cart = await Cart.findOne({ vendor: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear cart
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// @route   GET /api/cart/summary
// @desc    Get cart summary with grouped suppliers
// @access  Private (Vendor only)
router.get('/summary', [authenticateToken, authorize('vendor')], async (req, res) => {
  try {
    const cart = await Cart.findOne({ vendor: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name description category price minimumOrderQuantity availableQuantity supplier',
        populate: {
          path: 'supplier',
          select: 'name businessName phone isVerified address'
        }
      });

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        message: 'Cart is empty',
        data: {
          summary: {
            totalItems: 0,
            estimatedTotal: 0,
            supplierGroups: []
          }
        }
      });
    }

    // Group items by supplier
    const supplierGroups = {};
    
    cart.items.forEach(item => {
      if (item.product && item.product.supplier) {
        const supplierId = item.product.supplier._id.toString();
        
        if (!supplierGroups[supplierId]) {
          supplierGroups[supplierId] = {
            supplier: item.product.supplier,
            items: [],
            subtotal: 0,
            totalItems: 0
          };
        }
        
        const itemTotal = item.priceAtAdd.amount * item.quantity;
        
        supplierGroups[supplierId].items.push({
          product: item.product,
          quantity: item.quantity,
          priceAtAdd: item.priceAtAdd,
          itemTotal,
          notes: item.notes
        });
        
        supplierGroups[supplierId].subtotal += itemTotal;
        supplierGroups[supplierId].totalItems += item.quantity;
      }
    });

    const summary = {
      totalItems: cart.totalItems,
      estimatedTotal: cart.estimatedTotal,
      supplierGroups: Object.values(supplierGroups)
    };

    res.json({
      success: true,
      message: 'Cart summary retrieved successfully',
      data: { summary }
    });

  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart summary'
    });
  }
});

// @route   POST /api/cart/validate
// @desc    Validate cart items (check availability, prices, etc.)
// @access  Private (Vendor only)
router.post('/validate', [authenticateToken, authorize('vendor')], async (req, res) => {
  try {
    const cart = await Cart.findOne({ vendor: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        message: 'Cart is empty',
        data: { issues: [] }
      });
    }

    const issues = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = item.product;
      
      if (!product || !product.isActive) {
        issues.push({
          type: 'unavailable',
          item: item,
          message: 'Product is no longer available'
        });
        continue;
      }

      // Check if quantity exceeds available stock
      if (item.quantity > product.availableQuantity) {
        issues.push({
          type: 'stock',
          item: item,
          message: `Only ${product.availableQuantity} ${product.price.unit} available`,
          availableQuantity: product.availableQuantity
        });
      }

      // Check if quantity meets minimum order requirement
      if (item.quantity < product.minimumOrderQuantity) {
        issues.push({
          type: 'minimum_order',
          item: item,
          message: `Minimum order quantity is ${product.minimumOrderQuantity} ${product.price.unit}`,
          minimumOrderQuantity: product.minimumOrderQuantity
        });
      }

      // Check for price changes
      if (item.priceAtAdd.amount !== product.price.amount) {
        issues.push({
          type: 'price_change',
          item: item,
          message: `Price has changed from ₹${item.priceAtAdd.amount} to ₹${product.price.amount}`,
          oldPrice: item.priceAtAdd.amount,
          newPrice: product.price.amount
        });
      }

      validItems.push(item);
    }

    res.json({
      success: true,
      message: 'Cart validation completed',
      data: {
        issues,
        validItemsCount: validItems.length,
        totalItemsCount: cart.items.length
      }
    });

  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart'
    });
  }
});

module.exports = router;