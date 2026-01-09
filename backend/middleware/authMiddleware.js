const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a client token (special case with fixed ID)
    if (decoded.id === 'client_user' && decoded.role === 'client') {
      req.user = {
        _id: 'client_user',
        username: process.env.CLIENT_LOGIN_USERNAME,
        role: 'client'
      };
    } else {
      // Try to find the user in Admin collection first
      let user = await Admin.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        req.user.role = 'admin';
      } else {
        // Then try Worker collection
        user = await Worker.findById(decoded.id).select('-password').populate('department');
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        req.user.role = 'worker';
      }
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
});

const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

const adminOnly = roleCheck(['admin']);
const workerOnly = roleCheck(['worker']);
const clientOnly = roleCheck(['client']);
const adminOrWorker = roleCheck(['admin', 'worker']);
const adminOrClient = roleCheck(['admin', 'client']);

module.exports = { protect, adminOnly, workerOnly, clientOnly, adminOrWorker, adminOrClient };
