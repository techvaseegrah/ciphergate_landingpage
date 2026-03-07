import React, { useState } from 'react';
import Modal from './Modal';
import { usePayment } from '../../hooks/usePayment';

const CheckIcon = ({ color = "#111" }) => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5l3 3 7-7" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
);

const CrossIcon = ({ color = "#ccc" }) => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    </svg>
);

const PricingModal = ({ isOpen, onClose }) => {
    const [isYearly, setIsYearly] = useState(false);
    const { handlePremiumSubscribe, isProcessing } = usePayment();

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="xl"
            showCloseButton={false}
        >
            <div className="py-2 px-2 relative">
                {/* Close Button top right */}
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 border border-gray-200 z-10 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block">Our Website Packages</span>
                    <h2 className="text-3xl font-light text-gray-900 uppercase tracking-widest mb-4">Choose Your Plan</h2>
                    <p className="text-gray-500 font-light text-sm max-w-md mx-auto">Upgrade specifically to fit your business goals with no hidden fees.</p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="relative flex items-center p-1 bg-gray-100 border border-gray-200 rounded-full">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-8 py-3 text-xs font-medium uppercase tracking-wider rounded-full transition-all ${!isYearly ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Monthly Plan
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-8 py-3 text-xs font-medium uppercase tracking-wider rounded-full flex items-center gap-3 transition-all ${isYearly ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Yearly Plan
                        </button>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Starter</span>
                        <h3 className="text-2xl font-light text-gray-900 uppercase tracking-wider mb-3">Free Plan</h3>
                        <p className="text-sm text-gray-500 font-light mb-8">Perfect for small businesses exploring smart attendance.</p>

                        <div className="mb-10">
                            <span className="text-5xl font-light text-gray-900 leading-none mr-1">₹0</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">/month</span>
                        </div>

                        <ul className="space-y-5 mb-10 flex-1">
                            {freeFeatures.map((f, i) => (
                                <li key={i} className={`flex items-center gap-3 ${f.enabled ? 'opacity-100' : 'opacity-50'}`}>
                                    {f.enabled ? <CheckIcon color="#111" /> : <CrossIcon />}
                                    <span className={`text-sm tracking-wide ${f.enabled ? 'text-gray-800' : 'text-gray-400'}`}>{f.text}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="w-full py-4 border border-gray-200 bg-gray-50 text-gray-400 text-xs font-medium uppercase tracking-widest rounded-xl cursor-not-allowed"
                            disabled
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-gray-900 p-8 md:p-10 relative flex flex-col">
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-4 shadow-sm">
                            Pro Features
                        </div>

                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Pro</span>
                        <h3 className="text-2xl font-light text-white uppercase tracking-wider mb-3">Premium Plan</h3>
                        <p className="text-sm text-gray-400 font-light mb-8">For growing businesses and enterprises needing full power.</p>

                        <div className="mb-10 flex items-end">
                            <span className="text-5xl font-light text-white leading-none mr-1">{isYearly ? '₹1,200' : '₹99'}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest mb-1.5">{isYearly ? '/year' : '/month'}</span>
                        </div>

                        <ul className="space-y-5 mb-10 flex-1">
                            {premiumFeatures.map((f, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckIcon color="#fff" />
                                    <span className="text-sm tracking-wide text-gray-300">{f.text}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handlePremiumSubscribe(isYearly)}
                            disabled={isProcessing}
                            className={`w-full py-4 border border-white text-xs font-medium uppercase tracking-widest transition-colors rounded-xl shadow-lg hover:shadow-xl ${isProcessing
                                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                                : 'bg-white text-gray-900 hover:bg-transparent hover:text-white'
                                }`}
                        >
                            {isProcessing ? 'Processing Transaction...' : 'Upgrade Now'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-8 tracking-wide">
                    Secure & Encrypted • Cancel Anytime
                </p>
            </div>
        </Modal>
    );
};

export default PricingModal;
