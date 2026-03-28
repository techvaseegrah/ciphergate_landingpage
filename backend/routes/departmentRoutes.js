const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  deleteDepartment,
  updateDepartment,
  updateDepartmentPolicy
} = require('../controllers/departmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/').post(protect, adminOnly, createDepartment);
router.route('/all').post(protect, getDepartments);

router.route('/:id')
  .put(protect, adminOnly, updateDepartment)
  .delete(protect, adminOnly, deleteDepartment);

router.route('/:id/policy').put(protect, adminOnly, updateDepartmentPolicy);

module.exports = router;
