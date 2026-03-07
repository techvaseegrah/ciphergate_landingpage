import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Registration from './Registration.jsx';
import useSmoothScroll from '../../hooks/useSmoothScroll.js';

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
    background-color: #fafafa;
    border: 1px solid #e5e5e5;
    transition: all 0.4s ease;
  }
  .glass-input:focus {
    background-color: #ffffff;
    border-color: #111;
    box-shadow: none;
    outline: none;
  }
`);

const Header = () => {
  const navigate = useNavigate();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If mobile menu is open, don't auto-close the login options via the outside click
      // as it's an inline accordion menu there.
      if (isMenuOpen) return;

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginOptions(false);
      }
    };

    if (showLoginOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginOptions, isMenuOpen]);

  useSmoothScroll();

  const handleSignIn = (e) => {
    e.preventDefault();
    setShowLoginOptions(!showLoginOptions);
  };

  const handleLoginOption = (path) => {
    setShowLoginOptions(false);
    navigate(path);
  };

  const closeLoginOptions = () => {
    setShowLoginOptions(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <nav className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-center h-24">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
            <h1 className="text-xl font-light tracking-[0.2em] uppercase text-[#111] leading-none mb-0 pt-1">
              <span>Cipher</span>
              <span className="font-semibold text-[#B76E79]">Gate</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-12">
            <a href="#features" className="text-gray-500 hover:text-[#111] transition-colors duration-400 text-[10px] font-medium tracking-[0.2em] uppercase">
              Features
            </a>
            <a href="#use-case" className="text-gray-500 hover:text-[#111] transition-colors duration-400 text-[10px] font-medium tracking-[0.2em] uppercase">
              Use Cases
            </a>
            <a href="#pricing" className="text-gray-500 hover:text-[#111] transition-colors duration-400 text-[10px] font-medium tracking-[0.2em] uppercase">
              Pricing
            </a>
            <a href="#contact" className="text-gray-500 hover:text-[#111] transition-colors duration-400 text-[10px] font-medium tracking-[0.2em] uppercase">
              Contact
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleSignIn}
                className="px-6 py-2.5 border border-gray-200 text-[10px] font-medium text-gray-500 hover:text-[#111] hover:border-[#111] transition-all duration-400 tracking-[0.2em] uppercase"
              >
                Sign In
              </button>

              {/* Login Options Dropdown */}
              {showLoginOptions && (
                <div
                  className="absolute right-0 mt-4 w-56 bg-white border border-gray-100 shadow-xl py-4 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleLoginOption('/admin/login')}
                    className="block w-full text-left px-6 py-3 text-[10px] font-medium text-gray-500 hover:text-[#111] hover:bg-gray-50 transition-colors duration-300 uppercase tracking-[0.1em]"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => handleLoginOption('/worker/login')}
                    className="block w-full text-left px-6 py-3 text-[10px] font-medium text-gray-500 hover:text-[#111] hover:bg-gray-50 transition-colors duration-300 uppercase tracking-[0.1em]"
                  >
                    Employee Login
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/admin/register')}
              className="px-8 py-3 bg-[#111] text-white hover:bg-black transition-all duration-500 text-[10px] font-semibold tracking-[0.2em] uppercase"
            >
              Get Started
            </button>
            {/* Profile Icon for Client Login */}
            <div className="relative group p-[2px] rounded-full">
              {/* Outerline Gradient Border on Hover */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, #111111, #8b5cf6, #ec4899, #111111)',
                  backgroundSize: '300% 300%',
                  animation: 'slowGradient 6s linear infinite'
                }}
              ></div>
              <button
                onClick={() => {
                  setShowLoginOptions(false);
                  navigate('/client/login');
                }}
                className="relative z-10 p-2 text-gray-400 hover:text-[#111] border border-gray-200 rounded-full hover:border-transparent bg-white transition-all duration-400 flex items-center justify-center"
                aria-label="Client Login"
                data-cursor-text="Super Admin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#111] p-2 hover:bg-gray-50 transition-colors duration-300"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {
        isMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 right-0 bg-white shadow-2xl z-40 p-8 space-y-6 border-t border-gray-100">
            <a href="#features" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-[#111] transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#use-case" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-[#111] transition-colors" onClick={() => setIsMenuOpen(false)}>Use Cases</a>
            <a href="#pricing" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-[#111] transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="#contact" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-[#111] transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <div className="pt-6 border-t border-gray-100 flex flex-col space-y-6">
              <div className="relative">
                <button
                  onClick={() => setShowLoginOptions(!showLoginOptions)}
                  className="w-full flex justify-between items-center text-left text-xs font-medium tracking-[0.2em] uppercase text-[#111]"
                >
                  <span>Sign In</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showLoginOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mobile Login Options Dropdown */}
                {showLoginOptions && (
                  <div
                    className="mt-4 w-full bg-gray-50 border border-gray-100 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setIsMenuOpen(false); handleLoginOption('/admin/login'); }}
                      className="block w-full text-left px-6 py-4 text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-[#111] hover:bg-gray-100 transition-colors duration-200"
                    >
                      Admin Login
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); handleLoginOption('/worker/login'); }}
                      className="block w-full text-left px-6 py-4 text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-[#111] hover:bg-gray-100 transition-colors duration-200"
                    >
                      Employee Login
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => { setIsMenuOpen(false); navigate('/admin/register'); }} className="w-full py-4 bg-[#111] text-white text-xs font-medium tracking-[0.2em] uppercase hover:bg-black transition-all duration-300">Get Started</button>
              {/* Profile Icon for Client Login - Mobile */}
              <div className="relative group p-[2px]">
                {/* Outerline Gradient Border on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, #111111, #8b5cf6, #ec4899, #111111)',
                    backgroundSize: '300% 300%',
                    animation: 'slowGradient 6s linear infinite'
                  }}
                ></div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/client/login');
                  }}
                  className="relative z-10 w-full flex items-center justify-center p-4 text-gray-500 hover:text-[#111] transition-colors duration-300 border border-gray-100 bg-white"
                  aria-label="Super Admin Login"
                  data-cursor-text="Super Admin"
                >
                  <span className="text-xs font-medium tracking-[0.2em] uppercase">Super Admin</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Sign In Modal */}
      {
        isSignInOpen && (
          <div
            className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsSignInOpen(false)}
          >
            <style dangerouslySetInnerHTML={{ __html: modalStyles() }} />

            <div
              className="bg-white border border-gray-200 w-full max-w-md overflow-hidden transform transition-all hide-scrollbar modal-container shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-10 sm:p-14">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center space-x-3">
                    <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
                    <h3 className="text-xl font-light tracking-[0.2em] uppercase text-[#111] leading-none mb-0 pt-1">
                      <span>Cipher</span>
                      <span className="font-semibold text-[#B76E79]">Gate</span>
                    </h3>
                  </div>
                  <button onClick={() => setIsSignInOpen(false)} className="text-gray-400 hover:text-[#111] transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666] mb-3">Email address</label>
                    <div className="relative">
                      <input
                        type="email" name="email" required
                        className="w-full px-5 py-4 text-xs tracking-wider outline-none glass-input text-[#111]"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666] mb-3">Password</label>
                    <div className="relative">
                      <input
                        type="password" name="password" required
                        className="w-full px-5 py-4 text-xs tracking-wider outline-none glass-input text-[#111]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#111] text-white py-4 mt-6 text-xs font-medium tracking-[0.2em] uppercase hover:bg-black transition-all duration-400"
                  >
                    Sign in to your account
                  </button>
                </form>

                <div className="mt-8 text-center pt-8 border-t border-gray-100">
                  <p className="text-[10px] font-medium tracking-[0.1em] text-[#888] uppercase">
                    Don't have an account?{' '}
                    <button onClick={() => { setIsSignInOpen(false); navigate('/admin/login'); }} className="text-[#111] font-semibold transition-all">
                      Start a free trial
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        isRegistrationOpen && (
          <Registration onClose={() => setIsRegistrationOpen(false)} />
        )
      }
    </header >
  );
};

export default Header;