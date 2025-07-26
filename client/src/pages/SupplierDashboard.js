import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Package, 
  Upload, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Camera
} from 'lucide-react';

const SupplierDashboard = () => {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Mock supplier data
  const supplierStats = {
    totalProducts: 25,
    totalOrders: 156,
    monthlyRevenue: 45000,
    averageRating: 4.8
  };

  const recentOrders = [
    {
      id: 1,
      vendor: 'Ravi\'s Food Stall',
      items: 'Fresh Tomatoes (5kg), Onions (3kg)',
      amount: 350,
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 2,
      vendor: 'Street Food Corner',
      items: 'Basmati Rice (10kg)',
      amount: 1200,
      status: 'completed',
      date: '2024-01-14'
    },
    {
      id: 3,
      vendor: 'Snack Palace',
      items: 'Wheat Flour (8kg)',
      amount: 360,
      status: 'shipped',
      date: '2024-01-13'
    }
  ];

  const products = [
    {
      id: 1,
      name: 'Fresh Tomatoes',
      category: 'vegetables',
      price: 40,
      unit: 'kg',
      stock: 50,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1546470427-e4bb4d79e3d8?w=150&h=150&fit=crop'
    },
    {
      id: 2,
      name: 'Fresh Onions',
      category: 'vegetables',
      price: 30,
      unit: 'kg',
      stock: 75,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=150&h=150&fit=crop'
    },
    {
      id: 3,
      name: 'Basmati Rice',
      category: 'grains',
      price: 120,
      unit: 'kg',
      stock: 100,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&h=150&fit=crop'
    }
  ];

  const AddProductForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      category: 'vegetables',
      price: '',
      unit: 'kg',
      stock: '',
      description: '',
      image: null
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission
      console.log('Adding product:', formData);
      setShowAddProduct(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload product image</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="product-image"
                  />
                  <label
                    htmlFor="product-image"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-700 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="spices">Spices</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat & Poultry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                    placeholder="₹0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Enter product description"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (userProfile?.userType !== 'supplier') {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-16 w-16 text-warning-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">This dashboard is only available for suppliers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Supplier Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {userProfile?.name}! Manage your products and track your business.
            </p>
          </div>
          <div className="bg-success-100 border border-success-200 px-3 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <span className="text-sm font-medium text-success-800">FSSAI Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{supplierStats.totalProducts}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{supplierStats.totalOrders}</p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{supplierStats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-gray-800">{supplierStats.averageRating}</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'documents', label: 'Documents', icon: Upload }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{order.vendor}</h3>
                        <p className="text-sm text-gray-600">{order.items}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{order.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-success-100 text-success-800'
                            : order.status === 'shipped'
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-warning-100 text-warning-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Products</h2>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                        <p className="text-lg font-bold text-primary-600">₹{product.price}/{product.unit}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.status === 'active'
                          ? 'bg-success-100 text-success-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-700">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-danger-600 hover:text-danger-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">All Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">#{order.id}</td>
                        <td className="py-3 px-4">{order.vendor}</td>
                        <td className="py-3 px-4">{order.items}</td>
                        <td className="py-3 px-4 font-bold">₹{order.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' 
                              ? 'bg-success-100 text-success-800'
                              : order.status === 'shipped'
                              ? 'bg-primary-100 text-primary-800'
                              : 'bg-warning-100 text-warning-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Documents & Certificates</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FSSAI Certificate */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-800 mb-2">FSSAI Certificate</h3>
                  <p className="text-gray-600 mb-4">Upload your FSSAI license certificate</p>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Upload Certificate
                  </button>
                </div>

                {/* Business License */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-800 mb-2">Business License</h3>
                  <p className="text-gray-600 mb-4">Upload your business registration certificate</p>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Upload License
                  </button>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-success-600" />
                    <div>
                      <p className="font-medium text-success-800">FSSAI Certificate</p>
                      <p className="text-sm text-success-700">License: 12345678901234 • Verified ✓</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && <AddProductForm />}
    </div>
  );
};

export default SupplierDashboard;