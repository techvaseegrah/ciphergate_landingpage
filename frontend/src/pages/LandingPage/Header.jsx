import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Registration from './Registration.jsx';

// Updated modal styles to match the rounded Travigo aesthetic
const modalStyles = () => (`
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  @media (max-width: 640px) {
    .modal-container {
      max-height: 95vh;
      margin: 1rem;
    }
  }
  .glass-input {
    background-color: #F8FAFC;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }
  .glass-input:focus {
    background-color: #ffffff;
    border-color: #26D07C;
    box-shadow: 0 0 0 4px rgba(38, 208, 124, 0.1);
  }
`);

const Header = () => {
  const navigate = useNavigate();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/30 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#26D07C] rounded-xl flex items-center justify-center shadow-lg shadow-[#26D07C]/20">
              <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
            </div>
            {/* CipherGate name with half black and half green effect */}
            <h1 className="text-xl font-extrabold font-poppins tracking-tight">
              <span className="bg-gradient-to-r from-black to-black bg-clip-text text-transparent">Cipher</span>
              <span className="bg-gradient-to-r from-green-500 to-green-500 bg-clip-text text-transparent">Gate</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-10">
            <a href="#features" className="text-[#67748E] hover:text-[#26D07C] transition-all duration-300 font-semibold text-sm tracking-tight">
              Features
            </a>
            <a href="#use-case" className="text-[#67748E] hover:text-[#26D07C] transition-all duration-300 font-semibold text-sm tracking-tight">
              Use Cases
            </a>
            <a href="#pricing" className="text-[#67748E] hover:text-[#26D07C] transition-all duration-300 font-semibold text-sm tracking-tight">
              Pricing
            </a>
            <a href="#contact" className="text-[#67748E] hover:text-[#26D07C] transition-all duration-300 font-semibold text-sm tracking-tight">
              Contact
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <button
                onClick={handleSignIn}
                className="text-sm font-semibold text-[#1A2B3C] hover:text-[#26D07C] transition-colors duration-300"
              >
                Sign In
              </button>

              {/* Login Options Dropdown */}
              {showLoginOptions && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg py-2 z-50 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleLoginOption('/admin/login')}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#26D07C]/5 transition-colors duration-200"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => handleLoginOption('/worker/login')}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#26D07C]/5 transition-colors duration-200"
                  >
                    Employee Login
                  </button>
                  <button
                    onClick={() => handleLoginOption('/client/login')}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#26D07C]/5 transition-colors duration-200"
                  >
                    Client Login
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/admin/register')}
              className="px-6 py-2.5 bg-[#26D07C] text-white rounded-xl hover:bg-[#1eb36a] transition-all duration-300 font-semibold text-sm shadow-lg shadow-[#26D07C]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#26D07C]/30"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#1A2B3C] hover:text-[#26D07C] transition-colors p-2 rounded-lg hover:bg-gray-100/50"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-xl z-40 p-6 space-y-4 border-t border-gray-200">
          <a href="#features" className="block text-lg font-semibold text-[#67748E] hover:text-[#26D07C] transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#use-case" className="block text-lg font-semibold text-[#67748E] hover:text-[#26D07C] transition-colors" onClick={() => setIsMenuOpen(false)}>Use Cases</a>
          <a href="#pricing" className="block text-lg font-semibold text-[#67748E] hover:text-[#26D07C] transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</a>
          <a href="#contact" className="block text-lg font-semibold text-[#67748E] hover:text-[#26D07C] transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a>
          <div className="pt-4 border-t border-gray-200 flex flex-col space-y-4">
            <div className="relative">
              <button onClick={() => { setIsMenuOpen(false); setShowLoginOptions(true); }} className="text-left font-semibold text-[#1A2B3C]">Sign In</button>

              {/* Mobile Login Options Dropdown */}
              {showLoginOptions && (
                <div
                  className="absolute left-0 mt-2 w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg py-2 z-50 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleLoginOption('/admin/login')}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#26D07C]/5 transition-colors duration-200"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => handleLoginOption('/worker/login')}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#26D07C]/5 transition-colors duration-200"
                  >
                    Employee Login
                  </button>
                  <button
                    onClick={() => handleLoginOption('/client/login')}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#26D07C]/5 transition-colors duration-200"
                  >
                    Client Login
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => { setIsMenuOpen(false); navigate('/admin/register'); }} className="w-full py-3 bg-[#26D07C] text-white rounded-xl font-semibold shadow-lg shadow-[#26D07C]/20 hover:bg-[#1eb36a] transition-all duration-300">Get Started</button>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {isSignInOpen && (
        <div
          className="fixed inset-0 bg-[#1A2B3C]/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setIsSignInOpen(false)}
        >
          <style dangerouslySetInnerHTML={{ __html: modalStyles() }} />

          <div
            className="bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-md overflow-hidden transform transition-all hide-scrollbar modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 sm:p-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-[#26D07C] rounded-xl flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
                  </div>
                  {/* CipherGate name with half black and half green effect in modal */}
                  <h3 className="text-xl font-extrabold font-poppins">
                    <span className="bg-gradient-to-r from-black to-black bg-clip-text text-transparent">Cipher</span>
                    <span className="bg-gradient-to-r from-green-500 to-green-500 bg-clip-text text-transparent">Gate</span>
                  </h3>
                </div>
                <button onClick={() => setIsSignInOpen(false)} className="text-gray-400 hover:text-[#26D07C] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#67748E] mb-2 ml-1">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-[#26D07C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <input
                      type="email" name="email" required
                      className="w-full pl-12 pr-6 py-3 rounded-xl text-sm font-medium outline-none glass-input text-[#1A2B3C]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#67748E] mb-2 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-[#26D07C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <input
                      type="password" name="password" required
                      className="w-full pl-12 pr-6 py-3 rounded-xl text-sm font-medium outline-none glass-input text-[#1A2B3C]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#26D07C] text-white py-3.5 rounded-xl hover:bg-[#1eb36a] transition-all duration-300 font-semibold shadow-lg shadow-[#26D07C]/20 hover:-translate-y-0.5"
                >
                  Sign in to your account
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-[#67748E]">
                  Don't have an account?{' '}
                  <button onClick={() => { setIsSignInOpen(false); navigate('/admin/login'); }} className="text-[#26D07C] font-semibold hover:underline transition-all">
                    Start a free trial
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRegistrationOpen && (
        <Registration onClose={() => setIsRegistrationOpen(false)} />
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