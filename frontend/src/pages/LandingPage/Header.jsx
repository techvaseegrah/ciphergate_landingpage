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
    background-color: #111;
    border: 1px solid #333;
    transition: all 0.4s ease;
  }
  .glass-input:focus {
    background-color: #000;
    border-color: #fff;
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
    <header className="fixed top-4 md:top-6 lg:top-8 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300">
      <nav className="header w-full max-w-7xl bg-black/60 backdrop-blur-[40px] border border-white/20 rounded-[24px] md:rounded-[32px] lg:rounded-[40px] px-6 md:px-10 lg:px-14 h-[56px] md:h-[64px] lg:h-[84px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
        {/* LOGO - Always Visible */}
        <div className="logo-container">
          <img src="/image%201_layerstyle.png" alt="Ciphergate" className="logo-icon" />
          <span className="logo-text font-bruno text-white uppercase">CIPHERGATE</span>
        </div>

        {/* DESKTOP NAV - Hidden on mobile/tablet, visible on lg (1024px+) */}
        <div className="hidden lg:flex space-x-8 xl:space-x-10 items-center justify-center flex-1 mx-4">
          <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-400 text-[15px] font-medium tracking-normal leading-none flex items-center">
            Home
          </a>
          <a href="#our-story" className="text-gray-300 hover:text-white transition-colors duration-400 text-[15px] font-medium tracking-normal leading-none flex items-center">
            Our Story
          </a>
          <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-400 text-[15px] font-medium tracking-normal leading-none flex items-center">
            Features
          </a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-400 text-[15px] font-medium tracking-normal leading-none flex items-center">
            Pricing
          </a>
          <a href="#faq" className="text-gray-300 hover:text-white transition-colors duration-400 text-[15px] font-medium tracking-normal leading-none flex items-center">
            FAQ
          </a>
          <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-400 text-[15px] font-medium tracking-normal leading-none flex items-center">
            Contact Us
          </a>
        </div>

        {/* AUTH BUTTONS - Hidden on mobile (<768px), visible on md+ (768px+) */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          {/* Sign In Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleSignIn}
              className="px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 font-poppins text-[13px] lg:text-[14px] font-medium flex items-center gap-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              <span>Sign In</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showLoginOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Desktop Dropdown */}
            {showLoginOptions && (
              <div 
                className="absolute right-0 mt-3 w-52 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2 z-50 overflow-hidden ring-1 ring-white/10 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleLoginOption('/admin/login')}
                  className="w-full text-left px-5 py-3.5 text-xs font-poppins font-medium tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 border-b border-white/5"
                >
                  <svg className="w-4 h-4 text-primary-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>Admin Login</span>
                </button>
                <button
                  onClick={() => handleLoginOption('/worker/login')}
                  className="w-full text-left px-5 py-3.5 text-xs font-poppins font-medium tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span>Employee Login</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/admin/register')}
            className="pl-4 lg:pl-6 pr-2 py-1.5 lg:py-2 bg-white text-black hover:bg-gray-200 transition-all duration-300 font-poppins text-[13px] lg:text-[14px] font-semibold tracking-tight flex items-center gap-3 lg:gap-4 shadow-[0_0_20px_rgba(255,255,255,0.15)] h-[44px] md:h-[48px] lg:h-[52px]"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }}
          >
            <span className="whitespace-nowrap">Start Free Trial</span>
            <div className="bg-black rounded-full p-2 lg:p-2.5 text-white flex items-center justify-center">
              <svg width="12" height="12" lg:width="14" lg:height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z" fill="white"/>
              </svg>
            </div>
          </button>

          {/* Super Admin Profile Button */}
          <div className="relative group flex items-center">
            <button
              onClick={() => navigate('/client/login')}
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#111] border border-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 bg-gradient-to-tr from-gray-900 to-black"
              aria-label="Super Admin Login"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <div className="absolute right-0 top-14 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 bg-black text-white text-[11px] px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap shadow-xl z-50">
              Super Admin
            </div>
          </div>
        </div>

        {/* HAMBURGER ICON - Hidden only on desktop (lg, 1024px+) */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 hover:bg-gray-800 rounded-md transition-colors duration-300"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {
        isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 mx-4 bg-[#0a0a0a] shadow-2xl z-40 p-6 rounded-2xl border border-white/10 space-y-6">
            <a href="#home" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#our-story" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Our Story</a>
            <a href="#features" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#pricing" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <a href="#contact" className="block text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Contact Us</a>
            <div className="pt-6 border-t border-[#222] flex flex-col space-y-6">
              <div className="relative">
                <button
                  onClick={() => setShowLoginOptions(!showLoginOptions)}
                  className="w-full flex justify-between items-center text-left text-xs font-medium tracking-[0.2em] uppercase text-white"
                >
                  <span>Sign In</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showLoginOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mobile Login Options Dropdown */}
                {showLoginOptions && (
                  <div
                    className="mt-4 w-full bg-[#111] border border-[#222] py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setIsMenuOpen(false); handleLoginOption('/admin/login'); }}
                      className="block w-full text-left px-6 py-4 text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white hover:bg-[#222] transition-colors duration-200"
                    >
                      Admin Login
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); handleLoginOption('/worker/login'); }}
                      className="block w-full text-left px-6 py-4 text-xs font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white hover:bg-[#222] transition-colors duration-200"
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
                  className="relative z-10 w-full flex items-center justify-center p-4 text-gray-500 hover:text-white transition-colors duration-300 border border-[#222] bg-[#0a0a0a]"
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
            className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsSignInOpen(false)}
          >
            <style dangerouslySetInnerHTML={{ __html: modalStyles() }} />

            <div
              className="bg-[#0a0a0a] border border-[#222] w-full max-w-md overflow-hidden transform transition-all hide-scrollbar modal-container shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-10 sm:p-14">
                <div className="flex justify-between items-center mb-12">
                  <div className="logo-container">
                    <img src="/image%201_layerstyle.png" alt="Ciphergate" className="logo-icon" style={{ height: '24px' }} />
                    <span className="logo-text font-bruno text-white uppercase leading-none mb-0 pt-1" style={{ fontSize: '24px' }}>CIPHERGATE</span>
                  </div>
                  <button onClick={() => setIsSignInOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666] mb-3">Email address</label>
                    <div className="relative">
                      <input
                        type="email" name="email" required
                        className="w-full px-5 py-4 text-xs tracking-wider outline-none glass-input text-white"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#666] mb-3">Password</label>
                    <div className="relative">
                      <input
                        type="password" name="password" required
                        className="w-full px-5 py-4 text-xs tracking-wider outline-none glass-input text-white"
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

                <div className="mt-8 text-center pt-8 border-t border-[#222]">
                  <p className="text-[10px] font-medium tracking-[0.1em] text-[#888] uppercase">
                    Don't have an account?{' '}
                    <button onClick={() => { setIsSignInOpen(false); navigate('/admin/login'); }} className="text-white font-semibold transition-all">
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