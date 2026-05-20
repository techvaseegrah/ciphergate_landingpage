import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePayment } from '../../hooks/usePayment';
import { useAuth } from '../../hooks/useAuth';
import appContext from '../../context/AppContext';
import './Pricing.css';
 
/* ─────────────────────────────────────────────────────────────
   TUBE LIGHT SYSTEM
   size="lg"  →  wide full-section tube (Figma reference)
   size="sm"  →  tiny card-top tube
───────────────────────────────────────────────────────────── */
const TubeLight = ({ size = 'lg' }) => {
 
  if (size === 'sm') {
    return (
      <div style={{ position: 'absolute', top: 0, left: '24px', zIndex: 10, pointerEvents: 'none' }}>
        <div style={{
          width: '60px', height: '2.5px', borderRadius: '2px', position: 'relative', zIndex: 2,
          background: 'linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.6) 18%,#fff 42%,#fff 58%,rgba(255,255,255,0.6) 82%,rgba(255,255,255,0) 100%)',
        }} />
        <div style={{
          position: 'absolute', top: '0.5px', left: '50%', transform: 'translateX(-50%)',
          width: '36px', height: '1.5px', background: '#fff', borderRadius: '1px', zIndex: 3,
          boxShadow: '0 0 3px 1px rgba(255,255,255,1),0 0 8px 3px rgba(255,255,255,0.6),0 0 16px 6px rgba(255,255,255,0.25)',
        }} />
        <div style={{
          position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)',
          width: '220px', height: '140px', zIndex: 1,
          background: 'radial-gradient(ellipse 75% 100% at 50% 0%,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.025) 40%,transparent 72%)',
        }} />
        <div style={{
          position: 'absolute', top: '2px', right: '100%',
          width: '50px', height: '50px', filter: 'blur(4px)',
          background: 'conic-gradient(from 90deg at 100% 0%,rgba(255,255,255,0.08) 0deg,transparent 28deg)',
        }} />
        <div style={{
          position: 'absolute', top: '2px', left: '100%',
          width: '50px', height: '50px', filter: 'blur(4px)',
          background: 'conic-gradient(from 270deg at 0% 0%,rgba(255,255,255,0.08) 0deg,transparent 28deg)',
        }} />
      </div>
    );
  }
 
  /* ── LARGE WIDE TUBE LIGHT — Clean, no effects ── */
  return (
    <div style={{
      width: '100%',
      lineHeight: 0,
      display: 'block'
    }}>
      <img
        src="/Frametb 1.png"
        alt="Tube light"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',  // Prevents baseline alignment issues
          margin: 0,
          padding: 0,
        }}
      />
    </div>
  );
};
 
/* ─────────────────────────────────────────────────────────────
   PLAN CARD
───────────────────────────────────────────────────────────── */
const PlanCard = ({ plan, index, isProcessing }) => (
  <motion.div
    className="plan-card glass-card-dark rounded-[28px] p-9 flex flex-col group"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.9, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -5 }}
  >
    <TubeLight size="sm" />
 
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '28px', pointerEvents: 'none',
      background: 'linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 42%)',
    }} />
 
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
 
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', paddingTop: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.22em' }}>
          {plan.name}
        </span>
        {index === 1 && (
          <span style={{
            padding: '3px 10px', borderRadius: '100px', background: '#fff',
            color: '#000', fontSize: '7.5px', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '0.14em',
          }}>Popular</span>
        )}
      </div>
 
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '54px', fontWeight: 500, color: '#EAEAEA', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {plan.price}
        </span>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 300, fontStyle: 'italic' }}>
          {plan.period}
        </span>
      </div>
 
      <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.8)', fontWeight: 300, lineHeight: 1.65, marginBottom: '22px', maxWidth: '270px' }}>
        {plan.description}
      </p>
 
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', marginBottom: '20px' }} />
 
      <p style={{ fontSize: '10.5px', fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '14px' }}>
        What's Included
      </p>
 
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', flexGrow: 1 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '11px', fontSize: '12.5px', color: 'rgba(234,234,234,0.72)', fontWeight: 300 }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.28)', flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>
 
      <motion.button
        onClick={plan.handler}
        disabled={isProcessing}
        className="w-full py-4 mt-2 bg-[#f4f4f4] text-black text-[15px] font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors duration-300"
        style={{
          clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          opacity: isProcessing ? 0.6 : 1,
          fontFamily: "'Inter', sans-serif"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {isProcessing ? 'Processing...' : plan.cta}
        {!isProcessing && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1">
            <path d="M5 12h14m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </motion.button>
 
    </div>
  </motion.div>
);
 
/* ─────────────────────────────────────────────────────────────
   MAIN PRICING SECTION
───────────────────────────────────────────────────────────── */
const Pricing = ({ id = "pricing-section" }) => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handlePremiumSubscribe, isProcessing } = usePayment();
  const { settings } = useContext(appContext);
 
  const handleGetStarted = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => navigate('/admin/register'), 500);
  };
 
  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      period: 'Per User/Month',
      description: 'Perfect For Small Businesses And Startups Exploring Smart Attendance.',
      features: [
        'Up To 5 Workers',
        'Basic Attendance Tracking',
        'Facial Recognition Login',
        'Basic Reporting & Exports',
        'Advanced Analytics',
        'Priority Support',
      ],
      cta: 'Get Started',
      handler: handleGetStarted,
    },
    {
      name: 'Premium Plan',
      price: isYearly ? '$990' : '$99',
      period: `Per User/${isYearly ? 'Year' : 'Month'}`,
      description: 'For Growing Businesses And Enterprises That Need Full Power.',
      features: [
        'Unlimited Workers',
        'Everything In Free Plan',
        'Advanced Analytics Dashboard',
        'Custom Integrations & API',
        'Premium Facial Recognition',
        'Priority 24/7 Support',
      ],
      cta: user?.accountType === 'premium' ? 'Current Plan' : 'Get Started',
      handler: () => handlePremiumSubscribe(isYearly),
    },
  ];
 
  return (
    <section id={id} className="pricing-section">
      {/* 1. The Light Image - Physical element for height control */}
      <div style={{ width: '100%', lineHeight: 0 }}>
        <img 
          src="/Frametb 1.png" 
          alt="Glow" 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
      </div>

      {/* 2. Overlapping Content Wrapper */}
      <div className="pricing-content-wrapper" style={{ width: '100%' }}>
        {/* Badge */}
        <motion.div
           style={{
             display: 'inline-flex', alignItems: 'center', gap: '8px',
             padding: '10px 18px', borderRadius: '14px',
             border: '1.5px solid rgba(255,255,255,0.15)',
             background: 'rgba(255,255,255,0.08)',
             backdropFilter: 'blur(16px)',
             boxShadow: 'inset 0 0 12px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
             marginBottom: '24px'
           }}
           initial={{ opacity: 0, y: 10 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
         >
           <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
           <span style={{ color: '#ffffff' }}>Pricing</span>
         </motion.div>
 
        {/* Title */}
        <motion.h2
          className="section-title text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Plans That Glow With You
        </motion.h2>
 
        {/* Subtitle */}
        <motion.p
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Tailored For Every Budget And Business Goal — Simple,<br />
          Transparent Pricing With No Hidden Fees.
        </motion.p>
 
        {/* Toggle */}
        <motion.div
          style={{
            display: 'inline-flex',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px', padding: '4px',
            marginBottom: '40px',
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {['Monthly Plan', 'Yearly Plan'].map((label, i) => {
            const active = (i === 0 && !isYearly) || (i === 1 && isYearly);
            return (
              <button
                key={label}
                onClick={() => setIsYearly(i === 1)}
                style={{
                  position: 'relative', padding: '10px 26px', borderRadius: '100px',
                  fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: 'transparent', color: active ? '#000' : '#fff',
                  transition: 'color 0.3s', zIndex: 1, fontFamily: 'inherit',
                }}
              >
                {label}
                {active && (
                  <motion.div
                    layoutId="pricingTogglePill"
                    style={{
                      position: 'absolute', inset: 0,
                      background: '#EAEAEA', borderRadius: '100px', zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
 
        {/* Cards */}
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} index={index} isProcessing={isProcessing} />
          ))}
        </div>
      </div>
    </section>
  );
};
 
export default Pricing;