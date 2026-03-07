import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PricingModal from './PricingModal';

const PausedScreen = ({ user }) => {
    const [showPricing, setShowPricing] = useState(false);

    const isExpired = user?.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date();

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)',
                }}
            >
                {/* Subtle ambient glow */}
                <div
                    style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '600px', height: '600px',
                        background: 'radial-gradient(circle, rgba(180,30,30,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }}
                />

                <div className="relative z-10 text-center max-w-lg mx-auto px-8">
                    {/* Pause icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="flex justify-center mb-10"
                    >
                        <div style={{
                            width: '80px', height: '80px',
                            borderRadius: '50%',
                            border: '2px solid rgba(220,50,50,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(220,50,50,0.08)'
                        }}>
                            {/* Pause bars */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ width: '6px', height: '28px', background: 'rgba(220,80,80,0.9)', borderRadius: '2px' }} />
                                <div style={{ width: '6px', height: '28px', background: 'rgba(220,80,80,0.9)', borderRadius: '2px' }} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Label */}
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            display: 'inline-block',
                            fontSize: '0.6rem', fontWeight: 600,
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: 'rgba(220,80,80,0.8)',
                            border: '1px solid rgba(220,80,80,0.2)',
                            padding: '5px 14px',
                            marginBottom: '20px'
                        }}
                    >
                        Account Paused
                    </motion.span>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                            fontWeight: 200,
                            color: '#fff',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            lineHeight: 1.2,
                            marginBottom: '16px'
                        }}
                    >
                        Your App Is{' '}
                        <span style={{ color: 'rgba(220,80,80,0.9)' }}>Paused</span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.9rem',
                            fontWeight: 300,
                            lineHeight: 1.7,
                            marginBottom: '12px'
                        }}
                    >
                        {isExpired
                            ? 'Your subscription has expired. Renew to continue using CipherGate.'
                            : 'Your last payment failed. Update your payment to resume service.'}
                    </motion.p>

                    {/* Data safety note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            color: 'rgba(255,255,255,0.25)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.05em',
                            marginBottom: '48px'
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Your data is safe and preserved — nothing has been deleted
                    </motion.div>

                    {/* Renew button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button
                            onClick={() => setShowPricing(true)}
                            style={{
                                padding: '16px 40px',
                                background: '#fff',
                                color: '#111',
                                border: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,80,80,0.9)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; }}
                        >
                            Renew Subscription
                        </button>

                        <a
                            href="mailto:support@ciphergate.in"
                            style={{
                                padding: '16px 32px',
                                background: 'transparent',
                                color: 'rgba(255,255,255,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.7rem',
                                fontWeight: 400,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                        >
                            Contact Support
                        </a>
                    </motion.div>
                </div>
            </motion.div>

            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
        </>
    );
};

export default PausedScreen;
