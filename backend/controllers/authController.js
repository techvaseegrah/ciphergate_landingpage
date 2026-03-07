const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Worker = require('../models/Worker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new admin
// @route   POST /api/auth/admin/register    
// @access  Public
const registerAdmin = asyncHandler(async (req, res) => {
  const {
    username,
    subdomain,
    email,
    password,
    businessType,
    phoneNumber,
    flatShopNo,
    street,
    pincode,
    city,
    district,
    state,
    country,
    website,
    gstNumber
  } = req.body;

  // Validate input
  if (!username || !subdomain || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if admin already exists
  const adminExists = await Admin.findOne({ $or: [{ username }, { email }] });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin already exists');
  }

  // check if subdomain exixts
  const subdomainExists = await Admin.findOne({ subdomain });

  if (subdomainExists) {
    res.status(400);
    throw new Error('Company name already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create admin
  const admin = await Admin.create({
    username,
    subdomain,
    email,
    password: hashedPassword,
    role: 'admin',
    accountType: 'free',  // Set account type to free by default
    businessType: businessType || 'Other',
    phoneNumber: phoneNumber || '',
    flatShopNo: flatShopNo || '',
    street: street || '',
    pincode: pincode || '',
    city: city || '',
    district: district || '',
    state: state || '',
    country: country || 'India',
    website: website || '',
    gstNumber: gstNumber || ''
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      subdomain: admin.subdomain,
      email: admin.email,
      role: admin.role,
      accountType: admin.accountType, // Include account type
      businessType: admin.businessType, // Include business type
      phoneNumber: admin.phoneNumber, // Include phone number
      flatShopNo: admin.flatShopNo, // Include business details
      street: admin.street,
      pincode: admin.pincode,
      city: admin.city,
      district: admin.district,
      state: admin.state,
      country: admin.country,
      website: admin.website,
      gstNumber: admin.gstNumber,
      createdAt: admin.createdAt, // Include creation timestamp
      organizationId: admin.subdomain, // Include organization ID
      token: generateToken(admin._id, 'admin')
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// @desc    Login admin
// @route   POST /api/auth/admin
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Check for admin using either email or username
  let admin;
  if (email) {
    admin = await Admin.findOne({ email }).select('+password');
  } else if (username) {
    admin = await Admin.findOne({ username }).select('+password');
  } else {
    res.status(400);
    throw new Error('Please provide either email or username');
  }

  if (admin && (await bcrypt.compare(password, admin.password))) {
    // ── Subscription expiry check ──
    if (
      admin.accountType === 'premium' &&
      admin.subscriptionEndDate &&
      new Date(admin.subscriptionEndDate) < new Date()
    ) {
      admin.accountType = 'free';
      admin.subscriptionPlan = 'none';
      admin.subscriptionStartDate = null;
      admin.subscriptionEndDate = null;
      await admin.save({ validateBeforeSave: false });
    }
    res.json({
      _id: admin._id,
      username: admin.username,
      subdomain: admin.subdomain,
      email: admin.email,
      role: admin.role,
      accountType: admin.accountType,
      businessType: admin.businessType,
      phoneNumber: admin.phoneNumber,
      createdAt: admin.createdAt,
      organizationId: admin.subdomain,
      token: generateToken(admin._id, 'admin')
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Google Login admin
// @route   POST /api/auth/admin/google
// @access  Public
const googleLoginAdmin = asyncHandler(async (req, res) => {
  const { credential, access_token } = req.body;
  let email;

  try {
    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
    } else if (access_token) {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      email = response.data.email;
    } else {
      res.status(400);
      throw new Error('Google token is missing');
    }

    if (!email) {
      res.status(400);
      throw new Error('Failed to retrieve email from Google');
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (admin) {
      // ── Subscription expiry check ──
      if (
        admin.accountType === 'premium' &&
        admin.subscriptionEndDate &&
        new Date(admin.subscriptionEndDate) < new Date()
      ) {
        admin.accountType = 'free';
        admin.subscriptionPlan = 'none';
        admin.subscriptionStartDate = null;
        admin.subscriptionEndDate = null;
        await admin.save({ validateBeforeSave: false });
      }
      res.json({
        _id: admin._id,
        username: admin.username,
        subdomain: admin.subdomain,
        email: admin.email,
        role: admin.role,
        accountType: admin.accountType,
        businessType: admin.businessType,
        phoneNumber: admin.phoneNumber,
        createdAt: admin.createdAt,
        organizationId: admin.subdomain,
        token: generateToken(admin._id, 'admin')
      });
    } else {
      res.status(404);
      throw new Error('Account not found. Please register first.');
    }
  } catch (error) {
    console.error("Google login verification error:", error);
    res.status(401);
    throw new Error(error.message || 'Invalid Google token');
  }
});

// @desc    Login worker
// @route   POST /api/auth/worker
// @access  Public
const loginWorker = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check for worker username and password
  const worker = await Worker.findOne({ username }).select('+password').populate('department');

  if (worker && (await bcrypt.compare(password, worker.password))) {
    res.json({
      _id: worker._id,
      username: worker.username,
      subdomain: worker.subdomain,
      email: worker.email,
      role: 'worker', // Set the role as 'worker' since worker model doesn't have a role field
      name: worker.name,
      department: worker.department,
      departmentName: worker.department ? worker.department.name : '',
      rfid: worker.rfid,
      salary: worker.salary,
      finalSalary: worker.finalSalary,
      perDaySalary: worker.perDaySalary,
      token: generateToken(worker._id, 'worker')
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get logged in user info
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const { password, ...adminData } = req.user.toObject();
  // Ensure createdAt and organizationId are included in the response

  let responseData = {
    ...adminData,
    createdAt: req.user.createdAt,
    organizationId: req.user.subdomain
  };

  if (req.user.role === 'worker') {
    responseData.departmentName = req.user.department ? req.user.department.name : '';
  }

  res.status(200).json(responseData);
});

// @desc    Client login
// @route   POST /api/auth/client/login
// @access  Public
const loginClient = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check if credentials match environment variables
  if (username === process.env.CLIENT_LOGIN_USERNAME && password === process.env.CLIENT_LOGIN_PASSWORD) {
    // Generate a token for the client (using a fixed ID since it's environment-based)
    const token = generateToken('client_user', 'client');

    res.json({
      _id: 'client_user',
      username: username,
      role: 'client',
      token: token
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Check if admin initialization is needed
// @route   GET /api/auth/check-admin
// @access  Public
const checkAdminInitialization = asyncHandler(async (req, res) => {
  const adminCount = await Admin.countDocuments();
  res.json({ needInitialAdmin: adminCount === 0 });
});

// @desc    Check if subdomain is available
// @route   POST /api/auth/admin/subdomain-available
// @access  Public
const subdomainAvailable = asyncHandler(async (req, res) => {
  const { subdomain } = req.body;

  const existingAdmin = await Admin.findOne({ subdomain });

  res.json({ available: !existingAdmin });
});

// @desc    Get all admin accounts
// @route   GET /api/auth/admins
// @access  Private/Admin
const getAllAdmins = asyncHandler(async (req, res) => {
  // Allow both admin and client users to access this
  if (req.user.role !== 'admin' && req.user.role !== 'client') {
    res.status(403);
    throw new Error('Access denied. Admin or Client access required.');
  }

  // Get all admin accounts, excluding passwords
  const admins = await Admin.find({}).select('-password');

  // Ensure createdAt and updatedAt are included in the response
  const adminsData = admins.map(admin => {
    const adminObj = admin.toObject();
    return {
      ...adminObj,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
  });

  res.json(adminsData);
});

// @desc    Get admin account by ID
// @route   GET /api/auth/admins/:id
// @access  Private/Admin or Client
const getAdminById = asyncHandler(async (req, res) => {
  // Allow both admin and client users to access this
  if (req.user.role !== 'admin' && req.user.role !== 'client') {
    res.status(403);
    throw new Error('Access denied. Admin or Client access required.');
  }

  const { id } = req.params;

  const admin = await Admin.findById(id).select('-password');

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  res.json({
    ...admin.toObject(),
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt
  });
});

// @desc    Update admin account
// @route   PUT /api/auth/admins/:id
// @access  Private/Admin
const updateAdmin = asyncHandler(async (req, res) => {
  // Allow both admin and client users to access this
  if (req.user.role !== 'admin' && req.user.role !== 'client') {
    res.status(403);
    throw new Error('Access denied. Admin or Client access required.');
  }

  const { id } = req.params;
  const {
    username,
    email,
    businessType,
    phoneNumber,
    accountType,
    flatShopNo,
    street,
    pincode,
    city,
    district,
    state,
    country,
    website,
    gstNumber
  } = req.body;

  const admin = await Admin.findById(id);

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Update fields
  admin.username = username || admin.username;
  admin.email = email || admin.email;
  admin.businessType = businessType || admin.businessType;
  admin.phoneNumber = phoneNumber || admin.phoneNumber;
  admin.accountType = accountType || admin.accountType;
  admin.flatShopNo = flatShopNo || admin.flatShopNo;
  admin.street = street || admin.street;
  admin.pincode = pincode || admin.pincode;
  admin.city = city || admin.city;
  admin.district = district || admin.district;
  admin.state = state || admin.state;
  admin.country = country || admin.country;
  admin.website = website || admin.website;
  admin.gstNumber = gstNumber || admin.gstNumber;

  const updatedAdmin = await admin.save();

  res.json({
    _id: updatedAdmin._id,
    username: updatedAdmin.username,
    subdomain: updatedAdmin.subdomain,
    email: updatedAdmin.email,
    role: updatedAdmin.role,
    accountType: updatedAdmin.accountType,
    businessType: updatedAdmin.businessType,
    phoneNumber: updatedAdmin.phoneNumber,
    flatShopNo: updatedAdmin.flatShopNo,
    street: updatedAdmin.street,
    pincode: updatedAdmin.pincode,
    city: updatedAdmin.city,
    district: updatedAdmin.district,
    state: updatedAdmin.state,
    country: updatedAdmin.country,
    website: updatedAdmin.website,
    gstNumber: updatedAdmin.gstNumber
  });
});

// @desc    Delete admin account
// @route   DELETE /api/auth/admins/:id
// @access  Private/Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  // Allow both admin and client users to access this
  if (req.user.role !== 'admin' && req.user.role !== 'client') {
    res.status(403);
    throw new Error('Access denied. Admin or Client access required.');
  }

  const { id } = req.params;

  const admin = await Admin.findById(id);

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  await Admin.findByIdAndDelete(id);

  res.json({ message: 'Admin account deleted successfully' });
});

// @desc    Request password reset OTP
// @route   POST /api/auth/request-reset-otp
// @access  Public
const requestPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    res.status(404);
    throw new Error('No admin found with this email');
  }

  // Generate OTP and expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  admin.resetPasswordOtp = otp;
  admin.resetPasswordExpire = otpExpiry;

  await admin.save({ validateBeforeSave: false });

  // In a real app, send the OTP via email
  // For now, just return success
  res.json({ success: true, message: 'OTP sent to your email' });
});

// @desc    Reset password with OTP
// @route   PUT /api/auth/reset-password-with-otp
// @access  Public
const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const admin = await Admin.findOne({
    email,
    resetPasswordOtp: otp,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!admin) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);

  // Clear OTP fields
  admin.resetPasswordOtp = undefined;
  admin.resetPasswordExpire = undefined;

  await admin.save();

  res.json({ success: true, message: 'Password reset successfully' });
});

module.exports = {
  registerAdmin,
  loginAdmin,
  loginWorker,
  loginClient,
  getMe,
  checkAdminInitialization,
  subdomainAvailable,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  googleLoginAdmin
};