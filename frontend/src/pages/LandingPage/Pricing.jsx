import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { usePayment } from '../../hooks/usePayment';
import { useAuth } from '../../hooks/useAuth';

const CheckIcon = ({ color = "#111" }) => (
  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5l3 3 7-7" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
  </svg>
);

const CrossIcon = ({ color = "#ccc" }) => (
  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { handlePremiumSubscribe, isProcessing } = usePayment();

  const handleGetStarted = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate('/admin/register');
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const freeFeatures = [
    { text: 'Up to 5 workers', enabled: true },
    { text: 'Basic attendance tracking', enabled: true },
    { text: 'Facial recognition login', enabled: true },
    { text: 'Basic reporting & exports', enabled: true },
    { text: 'Advanced analytics', enabled: false },
    { text: 'Priority support', enabled: false },
  ];

  const premiumFeatures = [
    { text: 'Unlimited workers', enabled: true },
    { text: 'Everything in Free Plan', enabled: true },
    { text: 'Advanced analytics dashboard', enabled: true },
    { text: 'Custom integrations & API', enabled: true },
    { text: 'Premium facial recognition', enabled: true },
    { text: 'Priority 24/7 support', enabled: true },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-white border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">

        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-2xl md:text-5xl lg:text-6xl font-light tracking-widest text-gray-900 leading-tight mb-6 uppercase">
            Our Website Packages
          </h2>
          <p className="text-gray-500 text-xs md:text-base max-w-lg mx-auto font-light leading-relaxed tracking-wide">
            Tailored for every budget and business goal — simple, transparent pricing with no hidden fees.
          </p>

          {/* Premium Animated Toggle */}
          <div className="flex justify-center mt-4 mb-4">
            <div className="relative flex items-center p-1 bg-[#fafafa] border border-gray-200 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] max-w-full overflow-hidden">
              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 px-4 sm:px-8 py-2.5 sm:py-3.5 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-colors duration-500 rounded-full outline-none ${!isYearly ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Monthly Plan
                {!isYearly && (
                  <motion.div
                    layoutId="pricingToggle"
                    className="absolute inset-0 bg-[#111] rounded-full -z-10 shadow-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 px-4 sm:px-8 py-2.5 sm:py-3.5 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-colors duration-500 rounded-full flex items-center justify-center gap-2 sm:gap-3 outline-none ${isYearly ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <span>Yearly Plan</span>
                {isYearly && (
                  <motion.div
                    layoutId="pricingToggle"
                    className="absolute inset-0 bg-[#111] rounded-full -z-10 shadow-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-2 gap-px border border-gray-200 bg-gray-200 max-w-5xl mx-auto overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* FREE PLAN */}
          <motion.div variants={cardVariants} className="bg-white p-4 sm:p-10 md:p-14 border-gray-200">
            <div className="flex flex-col h-full">
              <div className="mb-6 md:mb-8">
                <span className="text-[8px] md:text-[11px] font-medium tracking-[0.2em] uppercase text-gray-400 inline-block mb-2 md:mb-3">
                  Starter
                </span>
                <h3 className="text-sm md:text-3xl font-light text-gray-900 tracking-wide uppercase leading-tight">
                  Free Plan
                </h3>
                <p className="text-gray-500 text-[10px] md:text-sm mt-3 font-light leading-relaxed hidden sm:block">
                  Perfect for small businesses and startups exploring smart attendance.
                </p>
              </div>

              <div className="mb-8 md:mb-10 flex flex-col">
                <span className="text-3xl md:text-6xl font-extralight text-gray-900 leading-none tracking-tight">₹0</span>
                <span className="text-[8px] md:text-[10px] text-gray-400 mt-2 tracking-[0.1em] uppercase">/month</span>
              </div>

              <ul className="list-none p-0 m-0 mb-8 md:mb-10 flex flex-col gap-3 md:gap-4 flex-1">
                {freeFeatures.map((f, i) => (
                  <li key={i} className={`flex items-start md:items-center gap-2 md:gap-3 ${f.enabled ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="mt-1 md:mt-0"><CheckIcon color="#111" /></div>
                    <span className={`text-[10px] md:text-sm tracking-wide font-light leading-tight ${f.enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGetStarted}
                className="w-full py-3 md:py-4 bg-transparent text-gray-900 border border-gray-900 text-[8px] md:text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-400 hover:bg-gray-900 hover:text-white"
              >
                Get Started
              </button>
            </div>
          </motion.div>

          {/* PREMIUM PLAN */}
          <motion.div variants={cardVariants} className="bg-[#111] p-4 sm:p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
            <div className="flex flex-col h-full relative z-10">
              <div className="absolute top-0 right-0 text-white text-[7px] md:text-[9px] font-medium tracking-[0.2em] uppercase px-2 md:px-3 py-1 md:py-1.5 bg-rose-gold-animate shadow-lg shadow-[#B76E79]/20">
                Pro
              </div>

              <div className="mb-6 md:mb-8 text-white">
                <span className="text-[8px] md:text-[11px] font-medium tracking-[0.2em] uppercase text-gray-500 inline-block mb-2 md:mb-3">
                  Pro
                </span>
                <h3 className="text-sm md:text-3xl font-light tracking-wide uppercase leading-tight">
                  Premium Plan
                </h3>
                <p className="text-gray-400 text-[10px] md:text-sm mt-3 font-light leading-relaxed hidden sm:block">
                  For growing businesses and enterprises that need full power.
                </p>
              </div>

              <div className="mb-8 md:mb-10 flex flex-col">
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-3xl md:text-6xl font-extralight leading-none tracking-tight">
                    {isYearly ? (
                      <>
                        <span className="hidden sm:inline">₹1,100</span>
                        <span className="inline sm:hidden">₹1.1k</span>
                      </>
                    ) : '₹99'}
                  </span>
                </div>
                <span className="text-[8px] md:text-[10px] text-gray-600 mt-2 tracking-[0.1em] uppercase">{isYearly ? '/year' : '/month'}</span>
              </div>

              <ul className="list-none p-0 m-0 mb-8 md:mb-10 flex flex-col gap-3 md:gap-4 flex-1">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-start md:items-center gap-2 md:gap-3">
                    <div className="mt-1 md:mt-0"><CheckIcon color="#fff" /></div>
                    <span className="text-[10px] md:text-sm text-gray-300 font-light tracking-wide leading-tight">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePremiumSubscribe(isYearly)}
                disabled={isProcessing}
                className={`w-full py-3 md:py-4 text-[8px] md:text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-400 border ${isProcessing ? 'bg-gray-800 text-gray-500 border-gray-800 cursor-not-allowed' : 'bg-white text-gray-900 border-white hover:bg-transparent hover:text-white'}`}
              >
                {isProcessing ? '...' : user?.accountType === 'premium' ? 'Current' : 'Upgrade'}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          className="text-center mt-12 text-[10px] text-gray-400 font-light tracking-widest uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          No credit card required · Cancel anytime · Secure &amp; encrypted
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;