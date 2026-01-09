import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Navigate to registration after a short delay
    setTimeout(() => {
      navigate('/admin/register');
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <section id="pricing" className="py-20 bg-transparent">
      <div className="max-w-[1280px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark-navy font-poppins mb-6 tracking-tight">Choose The Plan That Suits You</h2>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center space-x-4 mb-16">
            <span className={`text-sm font-semibold ${!isYearly ? 'text-dark-navy' : 'text-gray-text'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 bg-gray-200 rounded-full p-1 relative shadow-inner border border-gray-300 transition-colors duration-300"
            >
              <div className={`w-5 h-5 bg-primary-green rounded-full transition-all duration-300 ${isYearly ? 'ml-7' : 'ml-0'}`} />
            </button>
            <span className={`text-sm font-semibold ${isYearly ? 'text-dark-navy' : 'text-gray-text'}`}>Yearly <span className="text-primary-green font-bold text-[10px] bg-primary-green/10 px-2 py-0.5 rounded-full ml-1">SAVE 20%</span></span>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Standard Plan - Free Account */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-card border border-gray-200/50 relative"
            variants={cardVariants}
            whileHover="hover"
          >
            <h3 className="text-2xl font-bold text-dark-navy mb-3">Free Plan</h3>
            <p className="text-gray-text text-base mb-6">Perfect for small businesses and startups</p>
            <div className="text-5xl font-extrabold text-dark-navy mb-8">₹0<span className="text-lg font-normal text-gray-text">/mo</span></div>
            <ul className="text-left space-y-4 mb-10 text-base text-gray-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Up to 5 workers
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic attendance tracking
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Facial recognition
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic reporting
              </li>
              <li className="flex items-center opacity-50">
                <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center opacity-50">
                <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
            <button
              onClick={handleGetStarted}
              className="w-full py-4 bg-primary-green text-white rounded-xl font-semibold hover:bg-[#1eb36a] transition-all duration-300 shadow-lg shadow-[#26D07C]/20 hover:shadow-xl hover:shadow-[#26D07C]/30"
            >
              Get Started
            </button>
          </motion.div>

          {/* Premium Plan - Not Available */}
          <motion.div
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-10 rounded-2xl shadow-card border border-gray-200/30 relative"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-green to-green-600 text-white text-[10px] font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-[#26D07C]/30">
              Coming Soon
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Premium Plan</h3>
            <p className="text-slate-300 text-base mb-6">For growing businesses and enterprises</p>
            <div className="text-5xl font-extrabold text-white mb-8">{isYearly ? '₹1199' : '₹1499'}<span className="text-lg font-normal text-slate-300">/mo</span></div>
            <ul className="text-left space-y-4 mb-10 text-base text-slate-300">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited workers
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                All features in Free Plan
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Custom integrations
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Premium facial recognition
              </li>
            </ul>
            <button
              disabled
              className="w-full py-4 bg-slate-700 text-slate-400 rounded-xl font-semibold cursor-not-allowed"
            >
              Not Available
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;