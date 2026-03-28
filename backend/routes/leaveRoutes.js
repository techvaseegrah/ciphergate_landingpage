const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getMyLeaves,
  getLeaveBalance,
  createLeave,
  updateLeaveStatus,
  getLeavesByStatus,
  markLeaveAsViewed,
  markLeavesAsViewedByAdmin,
  getLeavesByDateRange,
  getWorkerLeaveSummary,
  resetLeaveBalance,
  updateLeaveBalance
} = require('../controllers/leaveController');
const { protect, adminOnly, workerOnly } = require('../middleware/authMiddleware');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

router.route('/').post(protect, upload.single('document'), createLeave);

router.get('/me', protect, workerOnly, getMyLeaves);
router.get('/balance', protect, workerOnly, getLeaveBalance);
router.get('/range', protect, adminOnly, getLeavesByDateRange);
router.get('/status', protect, adminOnly, getLeavesByStatus);
router.get('/summary/:workerId', protect, adminOnly, getWorkerLeaveSummary);
router.put('/:id/status', protect, adminOnly, updateLeaveStatus);
router.put('/:id/viewed', protect, markLeaveAsViewed);
router.put('/mark-viewed-by-admin', protect, adminOnly, markLeavesAsViewedByAdmin);
router.put('/balance/:workerId', protect, adminOnly, updateLeaveBalance);
router.post('/reset-balance', protect, adminOnly, resetLeaveBalance);

// This route must come after specific routes to avoid matching them
router.route('/:subdomain/:me').get(protect, getLeaves);


module.exports = router;