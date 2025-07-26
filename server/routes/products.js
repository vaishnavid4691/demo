const express = require('express');
const router = express.Router();

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: 'Fresh Tomatoes',
    description: 'Organic red tomatoes, locally sourced',
    price: 40,
    unit: 'kg',
    stock: 50,
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1546470427-e4bb4d79e3d8?w=300&h=200&fit=crop',
    supplierName: 'Green Valley Farms',
    supplierId: 1,
    fssaiCertified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Fresh Onions',
    description: 'Premium quality red onions',
    price: 30,
    unit: 'kg',
    stock: 75,
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=200&fit=crop',
    supplierName: 'Farm Fresh Co.',
    supplierId: 2,
    fssaiCertified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Basmati Rice',
    description: 'Premium long-grain basmati rice',
    price: 120,
    unit: 'kg',
    stock: 100,
    category: 'grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
    supplierName: 'Rice Mills Ltd.',
    supplierId: 3,
    fssaiCertified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Fresh Apples',
    description: 'Crisp and sweet Shimla apples',
    price: 150,
    unit: 'kg',
    stock: 30,
    category: 'fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
    supplierName: 'Mountain Fruits',
    supplierId: 4,
    fssaiCertified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Turmeric Powder',
    description: 'Pure turmeric powder, ground fresh',
    price: 200,
    unit: 'kg',
    stock: 25,
    category: 'spices',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=200&fit=crop',
    supplierName: 'Spice Masters',
    supplierId: 5,
    fssaiCertified: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Get all products
router.get('/', (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      supplier,
      page = 1, 
      limit = 20 
    } = req.query;

    let filteredProducts = [...mockProducts];

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.supplierName.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    // Filter by supplier
    if (supplier) {
      filteredProducts = filteredProducts.filter(p => p.supplierId === parseInt(supplier));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredProducts.length / limit),
        totalProducts: filteredProducts.length,
        hasNext: endIndex < filteredProducts.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = mockProducts.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product categories
router.get('/meta/categories', (req, res) => {
  try {
    const categories = [...new Set(mockProducts.map(p => p.category))];
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new product (supplier only)
router.post('/', (req, res) => {
  try {
    const {
      name,
      description,
      price,
      unit,
      stock,
      category,
      image,
      supplierId,
      supplierName
    } = req.body;

    // Validation
    if (!name || !price || !unit || !stock || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, price, unit, stock, category' 
      });
    }

    const newProduct = {
      id: mockProducts.length + 1,
      name,
      description: description || '',
      price: parseFloat(price),
      unit,
      stock: parseInt(stock),
      category,
      image: image || '',
      supplierName: supplierName || 'Unknown Supplier',
      supplierId: supplierId || 1,
      fssaiCertified: true,
      createdAt: new Date().toISOString()
    };

    mockProducts.push(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = mockProducts.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
      ...mockProducts[productIndex],
      ...req.body,
      id: productId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    mockProducts[productIndex] = updatedProduct;

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = mockProducts.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    mockProducts.splice(productIndex, 1);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;