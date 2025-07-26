import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { t } = useLanguage();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      updateQuantity(product.id, 0);
    }
  };

  return (
    <div className="card card-hover fade-in">
      {/* Product Image */}
      <div className="relative mb-4">
        <img
          src={product.image || '/api/placeholder/300/200'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`;
          }}
        />
        
        {/* Stock Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
          product.stock > 0 
            ? 'bg-success-100 text-success-800' 
            : 'bg-danger-100 text-danger-800'
        }`}>
          {product.stock > 0 ? t('available') : t('outOfStock')}
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
          {t(product.category)}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.description}</p>
        </div>

        {/* Supplier Info */}
        <div className="text-sm text-gray-500">
          <span className="font-medium">Supplier:</span> {product.supplierName}
        </div>

        {/* Price and Stock */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-primary-600">₹{product.price}</span>
            <span className="text-sm text-gray-500 ml-1">/{product.unit}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{t('stock')}:</span> {product.stock}
          </div>
        </div>

        {/* Add to Cart / Quantity Controls */}
        <div className="pt-3 border-t border-gray-200">
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{t('addToCart')}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handleDecrement}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="font-semibold text-lg mx-4">{quantity}</span>
              
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stock}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  quantity >= product.stock
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* FSSAI Badge */}
        {product.fssaiCertified && (
          <div className="flex items-center space-x-2 bg-success-50 border border-success-200 rounded-lg p-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-xs font-medium text-success-800">FSSAI Certified</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;