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
  const { user } = useAuth(); // Keeping useAuth here as it's used elsewhere in Pricing components

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
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Section Header */}
        <motion.div
          className="text-center mb-20 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Eyebrow label */}
          <span
            style={{
              display: 'inline-block',
              border: '1px solid #e5e5e5',
              color: '#666',
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              padding: '6px 16px',
              marginBottom: '24px',
            }}
          >
            Our Website Packages
          </span>

          <h2
            className="font-light tracking-widest text-gray-900"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.2, marginBottom: '20px', textTransform: 'uppercase' }}
          >
            Handcrafted <span style={{ color: '#B76E79' }}>Digital</span> Experiences
          </h2>
          <p style={{ color: '#888', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 40px', fontWeight: 300, lineHeight: 1.8, letterSpacing: '0.02em' }}>
            Tailored for every budget and business goal — simple, transparent pricing with no hidden fees.
          </p>

          {/* Premium Animated Toggle */}
          <div className="flex justify-center mt-4 mb-4">
            <div className="relative flex items-center p-1.5 bg-[#fafafa] border border-gray-200 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">

              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 px-6 sm:px-8 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 rounded-full outline-none ${!isYearly ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
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
                className={`relative z-10 px-6 sm:px-8 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 rounded-full flex items-center justify-center gap-3 outline-none ${isYearly ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-200 bg-gray-50 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* ── FREE PLAN ── */}
          <motion.div variants={cardVariants} className="bg-white p-8 md:p-14 border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="flex flex-col h-full">
              {/* Plan badge + name */}
              <div className="mb-8">
                <span style={{
                  fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#666', display: 'inline-block', marginBottom: '12px'
                }}>
                  Starter
                </span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 300, color: '#111', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Free Plan
                </h3>
                <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '12px', fontWeight: 300, lineHeight: 1.6 }}>
                  Perfect for small businesses and startups exploring smart attendance.
                </p>
              </div>

              {/* Price */}
              <div className="mb-12 flex flex-col">
                <span style={{ fontSize: '4rem', fontWeight: 200, color: '#111', lineHeight: 1, letterSpacing: '-0.02em' }}>₹0</span>
                <span style={{ fontSize: '0.75rem', color: '#999', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>/month</span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {freeFeatures.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: f.enabled ? 1 : 0.5 }}>
                    {f.enabled ? <CheckIcon color="#111" /> : <CrossIcon />}
                    <span style={{ fontSize: '0.85rem', color: f.enabled ? '#333' : '#999', fontWeight: 300, letterSpacing: '0.02em' }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={handleGetStarted}
                style={{
                  width: '100%', padding: '16px 0',
                  background: 'transparent',
                  color: '#111', border: '1px solid #111',
                  fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  transition: 'all 0.4s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; }}
              >
                Get Started Free
              </button>
            </div>
          </motion.div>

          {/* ── PREMIUM PLAN ── */}
          <motion.div variants={cardVariants} className="bg-[#111] p-8 md:p-14 relative overflow-hidden">
            {/* Subtle highlight line instead of glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, #333 0%, #666 50%, #333 100%)' }} />

            <div className="flex flex-col h-full relative z-10">
              {/* Pro badge */}
              <div style={{
                position: 'absolute', top: '0', right: '0',
                color: '#fff', fontSize: '0.6rem', fontWeight: 500,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                border: '1px solid #333', padding: '4px 10px',
                background: '#B76E79', borderColor: '#B76E79'
              }}>
                Pro Features
              </div>

              {/* Plan badge + name */}
              <div className="mb-8">
                <span style={{
                  fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#999', display: 'inline-block', marginBottom: '12px'
                }}>
                  Pro
                </span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 300, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Premium Plan
                </h3>
                <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '12px', fontWeight: 300, lineHeight: 1.6 }}>
                  For growing businesses and enterprises that need full power.
                </p>
              </div>

              {/* Price */}
              <div className="mb-12 flex flex-col">
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 200, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {isYearly ? '₹1,200' : '₹99'}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{isYearly ? '/year' : '/month'}</span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {premiumFeatures.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckIcon color="#fff" />
                    <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 300, letterSpacing: '0.02em' }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA enabled */}
              <button
                onClick={() => handlePremiumSubscribe(isYearly)}
                disabled={isProcessing}
                style={{
                  width: '100%', padding: '16px 0',
                  background: isProcessing ? '#333' : '#fff',
                  color: isProcessing ? '#999' : '#111',
                  border: '1px solid #fff',
                  fontSize: '0.75rem', fontWeight: 500,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  transition: 'all 0.4s ease'
                }}
                onMouseEnter={e => {
                  if (!isProcessing) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isProcessing) {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#111';
                  }
                }}
              >
                {isProcessing ? 'Processing...' : user?.accountType === 'premium' ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          className="text-center mt-12"
          style={{ color: '#999', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 300 }}
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

export default Pricing