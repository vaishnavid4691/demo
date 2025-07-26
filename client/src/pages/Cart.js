import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, Download, ShoppingBag } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Cart = () => {
  const { t } = useLanguage();
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const generateInvoice = async () => {
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      items: items,
      total: getCartTotal(),
      gst: getCartTotal() * 0.18, // 18% GST
      grandTotal: getCartTotal() * 1.18
    };

    // Create PDF
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('BazaarSetu Invoice', 20, 30);
    
    // Invoice details
    pdf.setFontSize(12);
    pdf.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, 50);
    pdf.text(`Date: ${invoiceData.date}`, 20, 60);
    
    // Items table header
    pdf.text('Item', 20, 80);
    pdf.text('Qty', 80, 80);
    pdf.text('Price', 110, 80);
    pdf.text('Total', 150, 80);
    
    // Draw line
    pdf.line(20, 85, 190, 85);
    
    // Items
    let yPosition = 95;
    items.forEach((item) => {
      pdf.text(item.name.substring(0, 25), 20, yPosition);
      pdf.text(item.quantity.toString(), 80, yPosition);
      pdf.text(`₹${item.price}`, 110, yPosition);
      pdf.text(`₹${(item.price * item.quantity).toFixed(2)}`, 150, yPosition);
      yPosition += 10;
    });
    
    // Totals
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    pdf.text(`Subtotal: ₹${invoiceData.total.toFixed(2)}`, 110, yPosition);
    yPosition += 10;
    pdf.text(`GST (18%): ₹${invoiceData.gst.toFixed(2)}`, 110, yPosition);
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.text(`Grand Total: ₹${invoiceData.grandTotal.toFixed(2)}`, 110, yPosition);
    
    // Save PDF
    pdf.save(`BazaarSetu-Invoice-${invoiceData.invoiceNumber}.pdf`);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">{t('emptyCart')}</h2>
        <p className="text-gray-500 mb-8">Start shopping to add items to your cart</p>
        <a
          href="/"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('cart')} ({items.length} items)</h1>
        <button
          onClick={clearCart}
          className="text-danger-600 hover:text-danger-700 font-medium transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <img
                  src={item.image || '/api/placeholder/80/80'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/80x80/e2e8f0/64748b?text=${encodeURIComponent(item.name.substring(0, 2))}`;
                  }}
                />

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-sm text-gray-500">Supplier: {item.supplierName}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-lg font-bold text-primary-600">₹{item.price}</span>
                    <span className="text-sm text-gray-500">/{item.unit}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="bg-primary-600 hover:bg-primary-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-danger-600 hover:text-danger-700 text-sm flex items-center space-x-1 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('cartTotal')}</h2>
            
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{getCartTotal().toFixed(2)}</span>
              </div>
              
              {/* GST */}
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium">₹{(getCartTotal() * 0.18).toFixed(2)}</span>
              </div>
              
              {/* Delivery */}
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-medium text-success-600">Free</span>
              </div>
              
              <hr className="border-gray-200" />
              
              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600">₹{(getCartTotal() * 1.18).toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                {t('checkout')}
              </button>
              
              <button
                onClick={generateInvoice}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{t('downloadInvoice')}</span>
              </button>
            </div>

            {/* Continue Shopping */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href="/"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                ← Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Secure Payment</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Free Delivery</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Fresh Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;