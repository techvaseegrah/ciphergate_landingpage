import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePayment } from '../../hooks/usePayment';
import { useAuth } from '../../hooks/useAuth';
import './Pricing.css';

const CardRimLight = () => (
  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10, pointerEvents: 'none' }}>
    <div style={{ width: '44px', height: '1.5px', background: '#fff', borderRadius: '100px', boxShadow: '0 0 8px 1px rgba(255,255,255,0.8)' }} />
    <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '40px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
  </div>
);

const DotDivider = () => (
  <div style={{ position: 'relative', width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ width: '1.5px', height: '1.5px', background: '#fff', borderRadius: '50%', opacity: 0.8 }} />
    <div style={{ width: '1.5px', height: '1.5px', background: '#fff', borderRadius: '50%', opacity: 0.8 }} />
  </div>
);

const PlanCard = ({ plan, index, isProcessing }) => (
  <motion.div className="pricing-card-target">
    <CardRimLight />
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>{plan.name}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '14px' }}>
        <span style={{ fontSize: '52px', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>{plan.price}</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{plan.period}</span>
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '24px' }}>{plan.description}</p>
      <DotDivider />
      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>What's Included</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px', flexGrow: 1 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ marginTop: '7px', width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <motion.button
        onClick={plan.handler}
        disabled={isProcessing}
        style={{
          width: '100%', padding: '16px 0', background: '#EAEAEA', color: '#000', fontSize: '15px', fontWeight: 700, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
          clipPath: "polygon(0 0, 100% 0, 100% 70%, 88% 100%, 0 100%)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        {isProcessing ? 'Processing...' : (
          <>Get Started <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg></>
        )}
      </motion.button>
    </div>
  </motion.div>
);

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handlePremiumSubscribe, isProcessing } = usePayment();
  
  const plans = [
    { name: 'Free Plan', price: '$0', period: 'Per User/Month', description: 'Perfect For Small Businesses And Startups Exploring Smart Attendance.', features: ['Up To 5 Workers', 'Basic Attendance Tracking', 'Facial Recognition Login', 'Basic Reporting & Exports', 'Advanced Analytics', 'Priority Support'], handler: () => navigate('/admin/register') },
    { name: 'Premium Plan', price: isYearly ? '$1100' : '$99', period: `Per User/${isYearly ? 'Year' : 'Month'}`, description: 'For Growing Businesses And Enterprises That Need Full Power.', features: ['Unlimited Workers', 'Everything In Free Plan', 'Advanced Analytics Dashboard', 'Custom Integrations & API', 'Premium Facial Recognition', 'Priority 24/7 Support'], handler: () => handlePremiumSubscribe(isYearly) },
  ];

  return (
    <section id="pricing" className="pricing-section">
      {/* 1. The Light Layer */}
      <div className="tubelight-container">
        <img src="/Frametb 1.png" alt="light" className="tubelight-image" />
      </div>

      {/* 2. The Content Layer */}
      <div className="content-wrapper">
        <div className="pricing-target-badge">
             <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }} />
             Pricing
        </div>
        
        <h2 className="pricing-target-h2">Plans That Glow With You</h2>
        
        <p className="pricing-target-p">
           Tailored For Every Budget And Business Goal — Simple,<br />
           Transparent Pricing With No Hidden Fees.
        </p>
        
        <div className="pricing-target-toggle">
          {['Monthly Plan', 'Yearly Plan'].map((label, i) => {
            const active = (i === 0 && !isYearly) || (i === 1 && isYearly);
            return (
              <button key={label} onClick={() => setIsYearly(i === 1)} className={`toggle-btn-target ${active ? 'active' : ''}`}>
                {label}
                {active && <motion.div layoutId="targetPill" className="toggle-pill-target" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              </button>
            );
          })}
        </div>

        {/* THIS GRID IS WHAT FIXES YOUR SIDE-BY-SIDE ISSUE */}
        <div className="plans-grid">
          {plans.map((plan, index) => (
             <PlanCard key={index} plan={plan} index={index} isProcessing={isProcessing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;