import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import { createSubscription, verifySubscription, cancelSubscription } from '../services/paymentService';

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

    // ── Subscribe with auto-pay ──
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
            const subscription = await createSubscription({ planType });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RqbpSczDZIkHfe',
                subscription_id: subscription.id,
                name: 'CipherGate Premium',
                description: `${isYearly ? 'Yearly' : 'Monthly'} Auto-Pay Subscription`,
                handler: async (response) => {
                    try {
                        await verifySubscription({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            planType
                        });
                        toast.success('🎉 Subscription activated! Auto-pay is now enabled.');
                        setTimeout(() => window.location.reload(), 2000);
                    } catch (err) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user.username,
                    email: user.email,
                    contact: user.phoneNumber || ''
                },
                theme: { color: '#111111' },
                modal: {
                    ondismiss: () => {
                        toast.info('Payment cancelled.');
                        setIsProcessing(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Subscription Error:', error);
            toast.error('Failed to initiate subscription. Please try again.');
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
