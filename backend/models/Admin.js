// backend/models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
    },
    subdomain: {  // subdomain is an unique key of a company
      type: String,
      required: [true, 'Please add a subdomain'],
      unique: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      default: 'admin',
    },
    // New fields for password reset with OTP
    resetPasswordOtp: String,
    resetPasswordExpire: Date,

    // Account type for subscription management
    accountType: {
      type: String,
      default: 'free',
      enum: ['free', 'premium']
    },
    subscriptionPlan: {
      type: String,
      enum: ['monthly', 'yearly', 'none'],
      default: 'none'
    },
    subscriptionStartDate: {
      type: Date,
      default: null
    },
    subscriptionEndDate: {
      type: Date,
      default: null
    },
    // 'active' = working normally, 'paused' = payment failed/expired, 'cancelled' = manually cancelled
    accountStatus: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active'
    },
    // Razorpay Subscription ID for managing auto-renew
    razorpaySubscriptionId: {
      type: String,
      default: null
    },
    // Whether auto-renew is enabled
    autoRenew: {
      type: Boolean,
      default: false
    },

    // Additional fields for business details collected during registration
    businessType: {
      type: String,
      default: 'Other'
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    fullName: {
      type: String,
      default: ''
    },
    shopName: {
      type: String,
      default: ''
    },

    // Step 1: Business details
    flatShopNo: {
      type: String,
      default: ''
    },
    street: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    district: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: 'India',
      required: false
    },
    website: {
      type: String,
      default: ''
    },
    gstNumber: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('Admin', adminSchema);