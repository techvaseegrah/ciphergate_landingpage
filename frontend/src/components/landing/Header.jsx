import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    setShowLoginOptions(true);
  };

  const handleLoginOption = (path) => {
    setShowLoginOptions(false);
    navigate(path);
  };

  const closeLoginOptions = () => {
    setShowLoginOptions(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center space-x-3">
            <img src="/logo.png" alt="CipherGate Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-gray-900 font-serif">CipherGate</span>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-red transition-colors duration-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-red transition-colors duration-200 font-medium">
              Features
            </a>
            <a href="#use-case" className="text-gray-600 hover:text-primary-red transition-colors duration-200 font-medium">
              Use Cases
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-primary-red transition-colors duration-200 font-medium">
              Pricing
            </a>
            <a href="#contact" className="text-gray-600 hover:text-primary-red transition-colors duration-200 font-medium">
              Contact
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={handleSignIn}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-red transition-colors duration-200 font-medium"
              >
                Sign In
              </button>
              
              {/* Login Options Dropdown */}
              {showLoginOptions && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleLoginOption('/admin/login')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => handleLoginOption('/worker/login')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Employee Login
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/admin/register')}
              className="px-6 py-2 bg-primary-red text-white rounded-lg hover:bg-warm-brown-hover transition-all duration-200 hover-lift font-medium shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-40">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a 
              href="#features" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-red hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#use-case" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-red hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Use Cases
            </a>
            <a 
              href="#pricing" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-red hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#contact" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-red hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="pt-4 pb-2 border-t border-gray-200">
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowLoginOptions(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-red hover:bg-gray-50 transition-colors duration-200"
                >
                  Sign In
                </button>
                
                {/* Mobile Login Options Dropdown */}
                {showLoginOptions && (
                  <div 
                    className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleLoginOption('/admin/login')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Admin Login
                    </button>
                    <button
                      onClick={() => handleLoginOption('/worker/login')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Employee Login
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/admin/register');
                }}
                className="w-full mt-2 px-3 py-2 bg-primary-red text-white rounded-md hover:bg-warm-brown-hover transition-all duration-200 font-medium shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay for login options when clicked outside */}
      {showLoginOptions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeLoginOptions}
        ></div>
      )}
    </header>
  );
};

export default Header;