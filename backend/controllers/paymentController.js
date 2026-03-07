const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Admin = require('../models/Admin');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// @desc    Create Razorpay Subscription (Auto-Pay)
// @route   POST /api/payments/create-subscription
// @access  Private/Admin
// ─────────────────────────────────────────────
const createSubscription = asyncHandler(async (req, res) => {
    const { planType } = req.body; // 'monthly' | 'yearly'

    const planId = planType === 'yearly'
        ? process.env.RAZORPAY_YEARLY_PLAN_ID
        : process.env.RAZORPAY_MONTHLY_PLAN_ID;

    if (!planId) {
        res.status(500);
        throw new Error(`Razorpay Plan ID for "${planType}" is not configured in .env`);
    }

    try {
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            quantity: 1,
            total_count: planType === 'yearly' ? 12 : 120, // cycles (10 years worth)
            notes: {
                adminId: req.user._id.toString(),
                subdomain: req.user.subdomain,
                planType
            }
        });

        res.status(200).json(subscription);
    } catch (error) {
        console.error('Razorpay Subscription Error:', error);
        res.status(500);
        throw new Error('Failed to create Razorpay subscription');
    }
});

// ─────────────────────────────────────────────
// @desc    Verify first Subscription Payment & activate account
// @route   POST /api/payments/verify-subscription
// @access  Private/Admin
// ─────────────────────────────────────────────
const verifySubscription = asyncHandler(async (req, res) => {
    const {
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature,
        planType
    } = req.body;

    const body = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        res.status(400);
        throw new Error('Invalid payment signature');
    }

    const admin = await Admin.findById(req.user._id);
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    const now = new Date();
    const endDate = new Date(now);
    if (planType === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    admin.accountType = 'premium';
    admin.accountStatus = 'active';
    admin.subscriptionPlan = planType === 'yearly' ? 'yearly' : 'monthly';
    admin.subscriptionStartDate = now;
    admin.subscriptionEndDate = endDate;
    admin.razorpaySubscriptionId = razorpay_subscription_id;
    admin.autoRenew = true;

    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Subscription activated! Welcome to Premium.',
        accountType: 'premium',
        accountStatus: 'active'
    });
});

// ─────────────────────────────────────────────
// @desc    Cancel Auto-Renew (cancel Razorpay subscription)
// @route   POST /api/payments/cancel-subscription
// @access  Private/Admin
// ─────────────────────────────────────────────
const cancelSubscription = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    if (!admin.razorpaySubscriptionId) {
        res.status(400);
        throw new Error('No active subscription found');
    }

    try {
        // Cancel at end of current billing cycle (cancel_at_cycle_end = 1)
        await razorpay.subscriptions.cancel(admin.razorpaySubscriptionId, true);

        admin.autoRenew = false;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Auto-renew cancelled. Your plan stays active until the current period ends.'
        });
    } catch (error) {
        console.error('Subscription cancel error:', error);
        res.status(500);
        throw new Error('Failed to cancel subscription');
    }
});

// ─────────────────────────────────────────────
// @desc    Razorpay Webhook Handler (payment events)
// @route   POST /api/payments/razorpay-webhook
// @access  Public (raw body, verified by signature)
// ─────────────────────────────────────────────
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (expectedSignature !== razorpaySignature) {
        console.error('[Webhook] Invalid Razorpay webhook signature');
        return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook] Event: ${event}`);

    try {
        // ── Subscription successfully charged (renewal payment) ──
        if (event === 'subscription.charged') {
            const subscription = payload.subscription?.entity;
            const subscriptionId = subscription?.id;
            if (!subscriptionId) return res.status(200).json({ status: 'ok' });

            const admin = await Admin.findOne({ razorpaySubscriptionId: subscriptionId });
            if (!admin) {
                console.warn(`[Webhook] No admin found for subscription: ${subscriptionId}`);
                return res.status(200).json({ status: 'ok' });
            }

            // Extend subscription based on plan
            const now = new Date();
            const endDate = new Date(now);
            if (admin.subscriptionPlan === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            admin.accountType = 'premium';
            admin.accountStatus = 'active';
            admin.subscriptionStartDate = now;
            admin.subscriptionEndDate = endDate;
            admin.autoRenew = true;
            await admin.save();

            console.log(`[Webhook] ✅ Subscription renewed for: ${admin.username} until ${endDate}`);
        }

        // ── Payment failed (auto-debit failed) ──
        else if (event === 'payment.failed') {
            const paymentEntity = payload.payment?.entity;
            const subscriptionId = paymentEntity?.subscription_id;
            if (!subscriptionId) return res.status(200).json({ status: 'ok' });

            const admin = await Admin.findOne({ razorpaySubscriptionId: subscriptionId });
            if (!admin) return res.status(200).json({ status: 'ok' });

            admin.accountStatus = 'paused';
            await admin.save();

            console.log(`[Webhook] ⚠️ Payment failed for: ${admin.username}. Account paused.`);
        }

        // ── Subscription cancelled ──
        else if (event === 'subscription.cancelled') {
            const subscription = payload.subscription?.entity;
            const subscriptionId = subscription?.id;
            if (!subscriptionId) return res.status(200).json({ status: 'ok' });

            const admin = await Admin.findOne({ razorpaySubscriptionId: subscriptionId });
            if (!admin) return res.status(200).json({ status: 'ok' });

            admin.autoRenew = false;
            // Keep accountType premium until end date; authMiddleware/cron will downgrade on expiry
            await admin.save();

            console.log(`[Webhook] ℹ️ Subscription cancelled for: ${admin.username}. Will expire at: ${admin.subscriptionEndDate}`);
        }

        // ── Subscription halted (too many payment retries failed) ──
        else if (event === 'subscription.halted') {
            const subscription = payload.subscription?.entity;
            const subscriptionId = subscription?.id;
            if (!subscriptionId) return res.status(200).json({ status: 'ok' });

            const admin = await Admin.findOne({ razorpaySubscriptionId: subscriptionId });
            if (!admin) return res.status(200).json({ status: 'ok' });

            admin.accountStatus = 'paused';
            admin.autoRenew = false;
            await admin.save();

            console.log(`[Webhook] ❌ Subscription halted for: ${admin.username}. Account paused.`);
        }

    } catch (err) {
        console.error('[Webhook] Error processing event:', err);
    }

    // Always return 200 to Razorpay so it doesn't retry
    res.status(200).json({ status: 'ok' });
});

// ─────────────────────────────────────────────
// @desc    Legacy one-time order (kept for backward compat)
// @route   POST /api/payments/create-order
// ─────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', planType } = req.body;
    const options = {
        amount: amount * 100,
        currency,
        receipt: `receipt_${crypto.randomBytes(10).toString('hex')}`,
        notes: {
            adminId: req.user._id.toString(),
            subdomain: req.user.subdomain,
            planType: planType || 'premium'
        }
    };
    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500);
        throw new Error('Failed to create Razorpay order');
    }
});

// ─────────────────────────────────────────────
// @desc    Verify one-time payment (legacy)
// @route   POST /api/payments/verify-payment
// ─────────────────────────────────────────────
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        const admin = await Admin.findById(req.user._id);
        if (!admin) { res.status(404); throw new Error('Admin not found'); }

        admin.accountType = 'premium';
        admin.accountStatus = 'active';
        admin.subscriptionPlan = planType === 'yearly' ? 'yearly' : 'monthly';
        const now = new Date();
        admin.subscriptionStartDate = now;
        const endDate = new Date(now);
        if (planType === 'yearly') { endDate.setFullYear(endDate.getFullYear() + 1); }
        else { endDate.setMonth(endDate.getMonth() + 1); }
        admin.subscriptionEndDate = endDate;
        await admin.save();

        res.status(200).json({ success: true, message: 'Payment verified and account upgraded to premium', accountType: 'premium' });
    } else {
        res.status(400);
        throw new Error('Invalid payment signature');
    }
});

module.exports = {
    createSubscription,
    verifySubscription,
    cancelSubscription,
    handleRazorpayWebhook,
    createOrder,
    verifyPayment
};
