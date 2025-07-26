import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Suppliers from './pages/Suppliers';
import SupplierDashboard from './pages/SupplierDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import HealthChecker from './pages/HealthChecker';
import AskAnna from './pages/AskAnna';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
                    <Route path="/health-checker" element={<HealthChecker />} />
                    <Route path="/ask-anna" element={<AskAnna />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </Router>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;