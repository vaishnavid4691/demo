import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Apple, Carrot, Beef, Package, Milk, Wheat } from 'lucide-react';

// Mock data - in a real app, this would come from an API
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
    fssaiCertified: true
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
    fssaiCertified: true
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
    fssaiCertified: true
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
    fssaiCertified: true
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
    fssaiCertified: true
  },
  {
    id: 6,
    name: 'Fresh Milk',
    description: 'Pure cow milk, pasteurized',
    price: 60,
    unit: 'liter',
    stock: 40,
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop',
    supplierName: 'Dairy Fresh',
    fssaiCertified: true
  },
  {
    id: 7,
    name: 'Red Chili Powder',
    description: 'Hot and flavorful chili powder',
    price: 180,
    unit: 'kg',
    stock: 35,
    category: 'spices',
    image: 'https://images.unsplash.com/photo-1583342159862-d8d0ef5f3d6c?w=300&h=200&fit=crop',
    supplierName: 'Spice Masters',
    fssaiCertified: true
  },
  {
    id: 8,
    name: 'Fresh Chicken',
    description: 'Farm-raised fresh chicken',
    price: 250,
    unit: 'kg',
    stock: 20,
    category: 'meat',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
    supplierName: 'Poultry Farm',
    fssaiCertified: true
  },
  {
    id: 9,
    name: 'Fresh Bananas',
    description: 'Sweet and ripe bananas',
    price: 50,
    unit: 'dozen',
    stock: 60,
    category: 'fruits',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
    supplierName: 'Tropical Fruits',
    fssaiCertified: true
  },
  {
    id: 10,
    name: 'Wheat Flour',
    description: 'Fine quality wheat flour',
    price: 45,
    unit: 'kg',
    stock: 80,
    category: 'grains',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    supplierName: 'Grain Mills',
    fssaiCertified: true
  }
];

const categories = [
  { id: 'all', name: 'All', icon: Package },
  { id: 'fruits', name: 'fruits', icon: Apple },
  { id: 'vegetables', name: 'vegetables', icon: Carrot },
  { id: 'spices', name: 'spices', icon: Package },
  { id: 'grains', name: 'grains', icon: Wheat },
  { id: 'dairy', name: 'dairy', icon: Milk },
  { id: 'meat', name: 'meat', icon: Beef }
];

const Home = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('welcome')}</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          {t('tagline')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder={t('search')}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-gray-800">{t('category')}</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{category.name === 'All' ? category.name : t(category.name)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedCategory === 'all' 
              ? 'All Products' 
              : `${t(selectedCategory)} (${filteredProducts.length})`
            }
          </h2>
          <div className="text-sm text-gray-600">
            {filteredProducts.length} products found
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose BazaarSetu?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-success-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Apple className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Fresh & Quality</h3>
            <p className="text-gray-600 text-sm">All products are sourced directly from verified suppliers ensuring freshness and quality.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">FSSAI Certified</h3>
            <p className="text-gray-600 text-sm">All suppliers are FSSAI certified, ensuring food safety and health standards.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-warning-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Milk className="h-8 w-8 text-warning-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
            <p className="text-gray-600 text-sm">Get intelligent recommendations and health safety checks with our AI assistant Anna.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;