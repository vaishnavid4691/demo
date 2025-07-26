import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Globe, 
  Heart, 
  MessageCircle,
  LogOut,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { currentUser, userProfile, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-800">BazaarSetu</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('home')}
            </Link>
            
            <Link 
              to="/suppliers" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('suppliers')}
            </Link>

            <Link 
              to="/health-checker" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              {t('healthChecker')}
            </Link>

            <Link 
              to="/ask-anna" 
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{t('askAnna')}</span>
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">
                  {languages.find(lang => lang.code === language)?.flag}
                </span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm">{userProfile?.name || currentUser.email}</span>
                </Link>
                
                {userProfile?.userType === 'supplier' && (
                  <Link 
                    to="/supplier-dashboard" 
                    className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-primary-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-danger-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t('register')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Cart for mobile */}
            <Link 
              to="/cart" 
              className="relative text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              
              <Link 
                to="/suppliers" 
                className="text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('suppliers')}
              </Link>

              <Link 
                to="/health-checker" 
                className="text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('healthChecker')}
              </Link>

              <Link 
                to="/ask-anna" 
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t('askAnna')}</span>
              </Link>

              <div className="border-t border-gray-200 pt-3 mt-3">
                {currentUser ? (
                  <div className="space-y-3">
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-2 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>{userProfile?.name || currentUser.email}</span>
                    </Link>
                    
                    {userProfile?.userType === 'supplier' && (
                      <Link 
                        to="/supplier-dashboard" 
                        className="block bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-danger-600 hover:text-danger-700 px-2 py-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/login" 
                      className="block text-gray-700 hover:text-primary-600 font-medium px-2 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link 
                      to="/register" 
                      className="block bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Language selector for mobile */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-2 py-1 text-sm text-gray-600 font-medium">Language</div>
                <div className="flex space-x-3 mt-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded text-sm ${
                        language === lang.code 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;