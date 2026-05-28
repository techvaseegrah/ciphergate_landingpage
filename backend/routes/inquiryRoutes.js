const express = require('express');
const router = express.Router();
const { createInquiry, getInquiries } = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createInquiry);
router.get('/', protect, getInquiries); // Assuming protect middleware is applicable for Super Admin

module.exports = router;
