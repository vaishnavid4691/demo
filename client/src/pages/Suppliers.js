import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, MapPin, Phone, Mail, CheckCircle, Star, Package, Filter } from 'lucide-react';

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
    fssaiCertificate: 'https://via.placeholder.com/600x400/success/white?text=FSSAI+Certificate',
    products: [
      { name: 'Fresh Tomatoes', price: 40, unit: 'kg' },
      { name: 'Fresh Onions', price: 30, unit: 'kg' },
      { name: 'Fresh Apples', price: 150, unit: 'kg' }
    ]
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
    fssaiCertificate: 'https://via.placeholder.com/600x400/primary/white?text=FSSAI+Certificate',
    products: [
      { name: 'Basmati Rice', price: 120, unit: 'kg' },
      { name: 'Wheat Flour', price: 45, unit: 'kg' }
    ]
  },
  {
    id: 3,
    name: 'Spice Masters',
    email: 'sales@spicemasters.com',
    phone: '+91 98765 43212',
    address: 'Spice Market, Kerala',
    fssaiNumber: '34567890123456',
    rating: 4.9,
    totalProducts: 40,
    specialties: ['Spices', 'Masalas', 'Herbs'],
    description: 'Traditional spice merchants with 50+ years of experience in authentic Indian spices.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
    fssaiCertificate: 'https://via.placeholder.com/600x400/warning/white?text=FSSAI+Certificate',
    products: [
      { name: 'Turmeric Powder', price: 200, unit: 'kg' },
      { name: 'Red Chili Powder', price: 180, unit: 'kg' }
    ]
  },
  {
    id: 4,
    name: 'Dairy Fresh',
    email: 'orders@dairyfresh.com',
    phone: '+91 98765 43213',
    address: 'Dairy Cooperative, Gujarat',
    fssaiNumber: '45678901234567',
    rating: 4.7,
    totalProducts: 12,
    specialties: ['Dairy Products', 'Fresh Milk'],
    description: 'Cooperative dairy farm ensuring fresh and pure dairy products with complete hygiene.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    fssaiCertificate: 'https://via.placeholder.com/600x400/info/white?text=FSSAI+Certificate',
    products: [
      { name: 'Fresh Milk', price: 60, unit: 'liter' }
    ]
  },
  {
    id: 5,
    name: 'Poultry Farm',
    email: 'contact@poultryfarm.com',
    phone: '+91 98765 43214',
    address: 'Farm House, Haryana',
    fssaiNumber: '56789012345678',
    rating: 4.5,
    totalProducts: 8,
    specialties: ['Poultry', 'Eggs', 'Meat'],
    description: 'Hygienic poultry farm with modern facilities ensuring fresh and healthy meat products.',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop',
    fssaiCertificate: 'https://via.placeholder.com/600x400/secondary/white?text=FSSAI+Certificate',
    products: [
      { name: 'Fresh Chicken', price: 250, unit: 'kg' }
    ]
  }
];

const Suppliers = () => {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [filteredSuppliers, setFilteredSuppliers] = useState(mockSuppliers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Get all unique specialties
  const allSpecialties = ['all', ...new Set(suppliers.flatMap(supplier => supplier.specialties))];

  // Filter and sort suppliers
  useEffect(() => {
    let filtered = suppliers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        supplier.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(supplier =>
        supplier.specialties.includes(selectedSpecialty)
      );
    }

    // Sort suppliers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          return b.totalProducts - a.totalProducts;
        default:
          return 0;
      }
    });

    setFilteredSuppliers(filtered);
  }, [searchQuery, selectedSpecialty, sortBy, suppliers]);

  const SupplierCard = ({ supplier }) => (
    <div className="card card-hover cursor-pointer" onClick={() => setSelectedSupplier(supplier)}>
      {/* Supplier Image */}
      <div className="relative mb-4">
        <img
          src={supplier.image}
          alt={supplier.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
          <Star className="h-4 w-4 text-warning-500" />
          <span className="text-sm font-medium">{supplier.rating}</span>
        </div>
        <div className="absolute top-2 left-2 bg-success-100 border border-success-200 px-2 py-1 rounded-full">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-success-600" />
            <span className="text-xs font-medium text-success-800">FSSAI Verified</span>
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{supplier.name}</h3>
          <p className="text-sm text-gray-600">{supplier.description}</p>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2">
          {supplier.specialties.map((specialty, index) => (
            <span
              key={index}
              className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{supplier.address}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>{supplier.phone}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{supplier.totalProducts} products</span>
          </div>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const SupplierModal = ({ supplier, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{supplier.name}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <Star className="h-5 w-5 text-warning-500" />
                <span className="font-medium">{supplier.rating}</span>
                <span className="text-gray-500">• {supplier.totalProducts} products</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Supplier Image */}
              <img
                src={supplier.image}
                alt={supplier.name}
                className="w-full h-64 object-cover rounded-lg"
              />

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                    <span>{supplier.address}</span>
                  </div>
                </div>
              </div>

              {/* FSSAI Certificate */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">FSSAI Certificate</h3>
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="font-medium text-success-800">Verified Supplier</span>
                  </div>
                  <p className="text-sm text-success-700">
                    FSSAI License: {supplier.fssaiNumber}
                  </p>
                  <img
                    src={supplier.fssaiCertificate}
                    alt="FSSAI Certificate"
                    className="w-full mt-3 rounded border"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                <p className="text-gray-600">{supplier.description}</p>
              </div>

              {/* Specialties */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sample Products</h3>
                <div className="space-y-3">
                  {supplier.products.map((product, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                      <span className="font-medium text-gray-800">{product.name}</span>
                      <span className="text-primary-600 font-bold">₹{product.price}/{product.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  Contact Supplier
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  View All Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('suppliers')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with verified suppliers offering fresh and quality raw materials with FSSAI certification
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search suppliers, specialties, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="rating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
            <option value="products">Sort by Products</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {filteredSuppliers.length} suppliers found
        </h2>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No suppliers found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Supplier Modal */}
      {selectedSupplier && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
};

export default Suppliers;