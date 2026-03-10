import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import { createOrder, verifyPayment, cancelSubscription } from '../services/paymentService';

// ── Plan amounts in INR (single source of truth in code) ──
const PLAN_AMOUNTS = {
    monthly: 99,   // ₹99/month
    yearly: 1100,  // ₹1100/year
};

export const usePayment = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // ── One-time order payment (amount driven by code, not Razorpay plan ID) ──
    const handlePremiumSubscribe = async (isYearly = false) => {
        if (!user || user.role !== 'admin') {
            toast.info('Please login as an admin to subscribe');
            navigate('/admin/login');
            return;
        }

        if (user.accountType === 'premium' && user.accountStatus === 'active') {
            toast.info('You are already on the Premium Plan');
            return;
        }

        setIsProcessing(true);
        const res = await loadRazorpay();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            setIsProcessing(false);
            return;
        }

        try {
            const planType = isYearly ? 'yearly' : 'monthly';
            const amount = PLAN_AMOUNTS[planType]; // ₹99 or ₹1100

            // Create a one-time Razorpay order with the correct amount
            const order = await createOrder({ amount, currency: 'INR', planType });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RqbpSczDZIkHfe',
                order_id: order.id,
                amount: order.amount,           // in paise (already multiplied by 100 on backend)
                currency: order.currency,
                name: 'CipherGate Premium',
                description: `${isYearly ? 'Yearly ₹1,100' : 'Monthly ₹99'} Premium Plan`,
                handler: async (response) => {
                    try {
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planType,
                        });
                        toast.success('🎉 Payment successful! Welcome to Premium.');
                        setTimeout(() => window.location.reload(), 2000);
                    } catch (err) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user.username,
                    email: user.email,
                    contact: user.phoneNumber || '',
                },
                theme: { color: '#111111' },
                modal: {
                    ondismiss: () => {
                        toast.info('Payment cancelled.');
                        setIsProcessing(false);
                    },
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment Error:', error);
            toast.error('Failed to initiate payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Cancel auto-renew ──
    const handleCancelAutoRenew = async () => {
        if (!user || !user.razorpaySubscriptionId) {
            toast.error('No active subscription found.');
            return;
        }

        setIsCancelling(true);
        try {
            await cancelSubscription();
            toast.success('Auto-renew cancelled. Your plan runs until the current period ends.');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error('Failed to cancel auto-renew. Please try again.');
        } finally {
            setIsCancelling(false);
        }
    };

    return { handlePremiumSubscribe, handleCancelAutoRenew, isProcessing, isCancelling };
};
