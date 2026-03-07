const express = require('express');
const router = express.Router();
const {
    createSubscription,
    verifySubscription,
    cancelSubscription,
    handleRazorpayWebhook,
    createOrder,
    verifyPayment
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── Auto-pay Subscription routes (authenticated) ──
router.post('/create-subscription', protect, adminOnly, createSubscription);
router.post('/verify-subscription', protect, adminOnly, verifySubscription);
router.post('/cancel-subscription', protect, adminOnly, cancelSubscription);

// ── Razorpay Webhook (NO auth — Razorpay calls this directly) ──
// Must be raw JSON for signature verification
router.post('/razorpay-webhook', express.json({ type: '*/*' }), handleRazorpayWebhook);

// ── Legacy one-time payment (kept for backward compat) ──
router.post('/create-order', protect, adminOnly, createOrder);
router.post('/verify-payment', protect, adminOnly, verifyPayment);

module.exports = router;
