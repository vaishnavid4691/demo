const express = require('express');
const router = express.Router();

// Mock suppliers data
const mockSuppliers = [
  {
    id: 1,
    name: 'Green Valley Farms',
    email: 'contact@greenvalley.com',
    phone: '+91 98765 43210',
    address: 'Plot 123, Agricultural Zone, Maharashtra',
    fssaiNumber: '12345678901234',
    rating: 4.8,
    totalProducts: 25,
    specialties: ['Organic Vegetables', 'Fresh Fruits'],
    description: 'Premium organic farm specializing in fresh vegetables and fruits with FSSAI certification.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Rice Mills Ltd.',
    email: 'info@ricemills.com',
    phone: '+91 98765 43211',
    address: 'Industrial Area Phase 2, Punjab',
    fssaiNumber: '23456789012345',
    rating: 4.6,
    totalProducts: 15,
    specialties: ['Rice & Grains', 'Flour'],
    description: 'Leading rice processing mill with state-of-the-art facilities and quality assurance.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Get all suppliers
router.get('/', (req, res) => {
  try {
    const { 
      specialty, 
      search, 
      location,
      verified = 'true',
      page = 1, 
      limit = 20 
    } = req.query;

    let filteredSuppliers = [...mockSuppliers];

    // Filter by verification status
    if (verified !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(s => s.verified === (verified === 'true'));
    }

    // Filter by specialty
    if (specialty && specialty !== 'all') {
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.specialties.some(spec => spec.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.specialties.some(spec => spec.toLowerCase().includes(searchLower)) ||
        s.address.toLowerCase().includes(searchLower)
      );
    }

    // Filter by location
    if (location) {
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Sort by rating (highest first)
    filteredSuppliers.sort((a, b) => b.rating - a.rating);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    res.json({
      suppliers: paginatedSuppliers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredSuppliers.length / limit),
        totalSuppliers: filteredSuppliers.length,
        hasNext: endIndex < filteredSuppliers.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const supplier = mockSuppliers.find(s => s.id === supplierId);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Get supplier specialties
router.get('/meta/specialties', (req, res) => {
  try {
    const specialties = [...new Set(mockSuppliers.flatMap(s => s.specialties))];
    res.json({ specialties });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch specialties' });
  }
});

module.exports = router;