import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    home: 'Home',
    cart: 'Cart',
    suppliers: 'Suppliers',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Categories
    fruits: 'Fruits',
    vegetables: 'Vegetables',
    spices: 'Spices',
    grains: 'Grains',
    dairy: 'Dairy',
    meat: 'Meat & Poultry',
    
    // Product
    addToCart: 'Add to Cart',
    price: 'Price',
    stock: 'Stock',
    available: 'Available',
    outOfStock: 'Out of Stock',
    
    // Cart
    cartTotal: 'Cart Total',
    checkout: 'Checkout',
    downloadInvoice: 'Download Invoice',
    emptyCart: 'Your cart is empty',
    
    // Health Checker
    healthChecker: 'Health Label Checker',
    uploadImage: 'Upload Image',
    scanning: 'Scanning...',
    healthy: 'Healthy',
    expired: 'Expired',
    fssaiValid: 'FSSAI Valid',
    fssaiInvalid: 'FSSAI Invalid',
    
    // Ask Anna
    askAnna: 'Ask Anna',
    typeMessage: 'Type your message...',
    send: 'Send',
    
    // Supplier
    supplierRegistration: 'Supplier Registration',
    productName: 'Product Name',
    category: 'Category',
    uploadFSSAI: 'Upload FSSAI Certificate',
    register: 'Register',
    
    // Common
    search: 'Search',
    filter: 'Filter',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Welcome messages
    welcome: 'Welcome to BazaarSetu',
    tagline: 'Your trusted marketplace for fresh and safe ingredients'
  },
  
  hi: {
    // Navigation
    home: 'होम',
    cart: 'कार्ट',
    suppliers: 'आपूर्तिकर्ता',
    profile: 'प्रोफाइल',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    
    // Categories
    fruits: 'फल',
    vegetables: 'सब्जियां',
    spices: 'मसाले',
    grains: 'अनाज',
    dairy: 'डेयरी',
    meat: 'मांस और मुर्गी',
    
    // Product
    addToCart: 'कार्ट में जोड़ें',
    price: 'कीमत',
    stock: 'स्टॉक',
    available: 'उपलब्ध',
    outOfStock: 'स्टॉक नहीं',
    
    // Cart
    cartTotal: 'कुल राशि',
    checkout: 'चेकआउट',
    downloadInvoice: 'इनवॉइस डाउनलोड करें',
    emptyCart: 'आपका कार्ट खाली है',
    
    // Health Checker
    healthChecker: 'स्वास्थ्य लेबल चेकर',
    uploadImage: 'छवि अपलोड करें',
    scanning: 'स्कैन कर रहे हैं...',
    healthy: 'स्वस्थ',
    expired: 'समाप्त',
    fssaiValid: 'FSSAI वैध',
    fssaiInvalid: 'FSSAI अवैध',
    
    // Ask Anna
    askAnna: 'अन्ना से पूछें',
    typeMessage: 'अपना संदेश टाइप करें...',
    send: 'भेजें',
    
    // Supplier
    supplierRegistration: 'आपूर्तिकर्ता पंजीकरण',
    productName: 'उत्पाद का नाम',
    category: 'श्रेणी',
    uploadFSSAI: 'FSSAI प्रमाणपत्र अपलोड करें',
    register: 'रजिस्टर',
    
    // Common
    search: 'खोजें',
    filter: 'फिल्टर',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    
    // Welcome messages
    welcome: 'बाजारसेतु में आपका स्वागत है',
    tagline: 'ताजा और सुरक्षित सामग्री के लिए आपका विश्वसनीय बाजार'
  },
  
  mr: {
    // Navigation
    home: 'होम',
    cart: 'कार्ट',
    suppliers: 'पुरवठादार',
    profile: 'प्रोफाइल',
    login: 'लॉगिन',
    register: 'नोंदणी',
    logout: 'लॉगआउट',
    
    // Categories
    fruits: 'फळे',
    vegetables: 'भाजीपाला',
    spices: 'मसाले',
    grains: 'धान्य',
    dairy: 'दुग्धजन्य',
    meat: 'मांस आणि कोंबडी',
    
    // Product
    addToCart: 'कार्टमध्ये जोडा',
    price: 'किंमत',
    stock: 'स्टॉक',
    available: 'उपलब्ध',
    outOfStock: 'स्टॉक नाही',
    
    // Cart
    cartTotal: 'एकूण रक्कम',
    checkout: 'चेकआउट',
    downloadInvoice: 'बील डाउनलोड करा',
    emptyCart: 'तुमची कार्ट रिकामी आहे',
    
    // Health Checker
    healthChecker: 'आरोग्य लेबल तपासणी',
    uploadImage: 'प्रतिमा अपलोड करा',
    scanning: 'स्कॅन करत आहे...',
    healthy: 'निरोगी',
    expired: 'कालबाह्य',
    fssaiValid: 'FSSAI वैध',
    fssaiInvalid: 'FSSAI अवैध',
    
    // Ask Anna
    askAnna: 'अण्णाला विचारा',
    typeMessage: 'तुमचा संदेश टाइप करा...',
    send: 'पाठवा',
    
    // Supplier
    supplierRegistration: 'पुरवठादार नोंदणी',
    productName: 'उत्पादनाचे नाव',
    category: 'श्रेणी',
    uploadFSSAI: 'FSSAI प्रमाणपत्र अपलोड करा',
    register: 'नोंदणी',
    
    // Common
    search: 'शोधा',
    filter: 'फिल्टर',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    loading: 'लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यश',
    
    // Welcome messages
    welcome: 'बाजारसेतूमध्ये आपले स्वागत',
    tagline: 'ताजा आणि सुरक्षित घटकांसाठी आपला विश्वसनीय बाजारपेठ'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('bazaarsetu-language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('bazaarsetu-language', newLanguage);
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};