const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    giveBonus,
    removeBonus,
    resetSalary,
    getWorkerSalaryReport,
    addDeduction,
    deleteDeduction,
    giveIncrement,
    getDepartmentSalarySummary
} = require('../controllers/salaryController');
const router = express.Router();

router.route('/give-bonus/:id').post(protect, giveBonus);
router.route('/remove-bonus/:id').post(protect, removeBonus);
router.route('/reset-salary').post(protect, resetSalary);
router.route('/report/:id').get(protect, getWorkerSalaryReport);
router.route('/add-deduction/:id').post(protect, addDeduction);
router.route('/deduction/:workerId/:deductionId').delete(protect, deleteDeduction);
router.route('/increment/:id').post(protect, giveIncrement);
router.route('/department-summary/:subdomain').get(protect, getDepartmentSalarySummary);

module.exports = router;