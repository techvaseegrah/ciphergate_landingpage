// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  googleLoginAdmin,
  loginWorker,
  loginClient,
  getMe,
  checkAdminInitialization,
  subdomainAvailable,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
} = require('../controllers/authController');
const { protect, adminOnly, adminOrClient } = require('../middleware/authMiddleware');

// Subdomain avalability
router.post('/admin/subdomain-available', subdomainAvailable);

// Admin registration and login
router.post('/admin/register', registerAdmin);
router.post('/admin', loginAdmin);
router.post('/admin/google', googleLoginAdmin);
router.post('/worker', loginWorker);
router.post('/client/login', loginClient);

// Check admin initialization
router.get('/check-admin', checkAdminInitialization);

// Protected route to get current admin info
router.get('/me', protect, getMe);

// Routes to manage all admin accounts (accessible by admin or client)
router.get('/admins', protect, adminOrClient, getAllAdmins);
router.get('/admins/:id', protect, adminOrClient, getAdminById);
router.put('/admins/:id', protect, adminOrClient, updateAdmin);
router.delete('/admins/:id', protect, adminOrClient, deleteAdmin);

// New routes for forgot password feature
router.post('/request-reset-otp', requestPasswordResetOtp);
router.put('/reset-password-with-otp', resetPasswordWithOtp);

module.exports = router;