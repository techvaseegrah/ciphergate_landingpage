// backend/controllers/salaryController.js
const asyncHandler = require('express-async-handler');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');
const Leave = require('../models/Leave');
const Department = require('../models/Department');
const Settings = require('../models/Settings');
const mongoose = require('mongoose');
const { calculateWorkerProductivity } = require('../utils/productivityCalculator');

// ─────────────────────────────────────────────────────────────────────────────
// OVERTIME CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calculate overtime for a worker in a given period.
 * Rules: OT if > 8 hrs/day OR > 44 hrs/week. Pay: 1.5x hourly. Cap: 72 hrs/month.
 */
const calculateOvertime = (attendanceData, worker, department) => {
    const regularHoursPerDay = department?.salaryPolicy?.regularHoursPerDay ?? 8;
    const regularHoursPerWeek = department?.salaryPolicy?.regularHoursPerWeek ?? 44;
    const overtimeRateMultiplier = department?.salaryPolicy?.overtimeRateMultiplier ?? 1.5;
    const maxOvertimeHoursPerMonth = department?.salaryPolicy?.maxOvertimeHoursPerMonth ?? 72;

    // Group attendance by week for weekly OT check
    const weeklyHours = {};
    const dailyOTRecords = [];

    let totalOvertimeHours = 0;
    let totalOvertimePay = 0;

    const divisor = 22 * regularHoursPerDay;
    const perHourSalary = divisor > 0 ? (worker.salary || 0) / divisor : 0; // ~22 working days/month

    attendanceData.forEach(record => {
        if (!record.checkIn || !record.checkOut) return;

        const checkIn = new Date(record.checkIn);
        const checkOut = new Date(record.checkOut);
        const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);

        if (hoursWorked <= 0) return;

        // Daily overtime
        const dailyOT = Math.max(0, hoursWorked - regularHoursPerDay);

        // Group by week (ISO week)
        const dateStr = record.date || checkIn.toISOString().split('T')[0];
        const date = new Date(dateStr);
        const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;

        if (!weeklyHours[weekKey]) weeklyHours[weekKey] = 0;
        weeklyHours[weekKey] += hoursWorked;

        dailyOTRecords.push({
            date: dateStr,
            hoursWorked: parseFloat(hoursWorked.toFixed(2)),
            regularHours: regularHoursPerDay,
            overtimeHours: parseFloat(dailyOT.toFixed(2)),
            weekKey
        });
    });

    // Now apply OT caps: daily OT + weekly OT (whichever is higher)
    dailyOTRecords.forEach(rec => {
        const weeklyOT = Math.max(0, (weeklyHours[rec.weekKey] || 0) - regularHoursPerWeek);
        const effectiveOT = Math.max(rec.overtimeHours, weeklyOT / Object.values(dailyOTRecords).filter(r => r.weekKey === rec.weekKey).length);

        totalOvertimeHours += effectiveOT;
    });

    // Apply monthly cap
    totalOvertimeHours = Math.min(totalOvertimeHours, maxOvertimeHoursPerMonth);
    totalOvertimePay = totalOvertimeHours * perHourSalary * overtimeRateMultiplier;

    return {
        totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
        totalOvertimePay: parseFloat(totalOvertimePay.toFixed(2)),
        regularHoursPerDay,
        regularHoursPerWeek,
        overtimeRateMultiplier,
        maxOvertimeHoursPerMonth,
        perHourSalary: parseFloat(perHourSalary.toFixed(4)),
        dailyBreakdown: dailyOTRecords
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// DEDUCTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Calculate total deductions for a worker in a period.
 * Enforces max deduction cap (default 50% of salary).
 */
const calculateDeductions = (worker, fromDate, toDate, department) => {
    const maxDeductionPercent = department?.salaryPolicy?.maxDeductionPercent ?? 50;
    const maxDeductionAmount = (worker.salary || 0) * (maxDeductionPercent / 100);

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Fines in period
    const finesInPeriod = (worker.fines || []).filter(f => {
        const d = new Date(f.date);
        return d >= from && d <= to;
    });
    const totalFines = finesInPeriod.reduce((sum, f) => sum + (f.amount || 0), 0);

    // Deductions in period
    const deductionsInPeriod = (worker.deductions || []).filter(d => {
        const dt = new Date(d.date);
        return dt >= from && dt <= to;
    });
    const totalDeductions = deductionsInPeriod.reduce((sum, d) => sum + (d.amount || 0), 0);

    const grossDeduction = totalFines + totalDeductions;
    const cappedDeduction = Math.min(grossDeduction, maxDeductionAmount);

    return {
        totalFines,
        totalDeductions,
        grossDeduction,
        cappedDeduction,
        maxDeductionPercent,
        maxDeductionAmount,
        finesInPeriod,
        deductionsInPeriod
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Give a bonus to a worker
// @route   POST /api/salary/give-bonus/:id
// ─────────────────────────────────────────────────────────────────────────────
const giveBonus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, fromDate, toDate, reason } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: 'Bonus amount must be a valid number' });
    }
    if (!fromDate || !toDate) {
        return res.status(400).json({ message: 'Date range (fromDate and toDate) is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Worker not found (Invalid ID format)' });
    }

    const worker = await Worker.findById(id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const attendanceData = await Attendance.find({
        worker: id,
        date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    });

    const leaveData = await Leave.find({ worker: id, status: 'Approved' });
    const holidays = await Holiday.find({});
    const settings = await Settings.findOne({ subdomain: worker.subdomain });
    const batches = settings ? settings.batches : [];

    const productivityReport = calculateWorkerProductivity({
        worker,
        attendanceData,
        fromDate,
        toDate,
        options: {
            batches,
            holidays,
            permissionTimeMinutes: settings ? settings.permissionTimeMinutes : 15,
            deductSalary: settings ? settings.deductSalary : true,
            deductLateMinutes: settings ? settings.deductLateMinutes : true,
            intervals: settings ? settings.intervals : []
        }
    });

    const actualEarnedSalary = productivityReport.summary.finalSalary || 0;
    const bonusAmount = Number(amount);

    // Fix bonus calculation: Add the bonus amount directly to the earned salary
    const finalPayout = actualEarnedSalary + bonusAmount;

    worker.bonuses.push({
        amount: bonusAmount,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        reason: reason || ''
    });
    worker.finalSalary = finalPayout;
    await worker.save();

    res.status(200).json({
        message: 'Bonus calculated and added successfully',
        worker,
        calculationDetails: {
            baseSalary: worker.salary,
            bonusAmount,
            actualEarnedSalary,
            finalPayout
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Remove bonus from a worker
// @route   POST /api/salary/remove-bonus/:id
// ─────────────────────────────────────────────────────────────────────────────
const removeBonus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const worker = await Worker.findById(id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    worker.finalSalary = worker.salary;
    worker.bonuses = [];
    await worker.save();

    res.status(200).json({ message: 'Bonus removed successfully', worker });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset salary for all workers in a subdomain
// @route   POST /api/salary/reset-salary
// ─────────────────────────────────────────────────────────────────────────────
const resetSalary = asyncHandler(async (req, res) => {
    const { subdomain } = req.body;
    if (!subdomain) return res.status(400).json({ message: 'Subdomain is required' });

    const workers = await Worker.find({ subdomain });
    if (workers.length === 0) return res.status(404).json({ message: 'No workers found' });

    const updatePromises = workers.map(worker => {
        worker.finalSalary = worker.salary;
        worker.bonuses = [];
        return worker.save();
    });
    await Promise.all(updatePromises);

    res.status(200).json({ message: 'Salaries reset successfully', updatedCount: workers.length });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get salary report for a worker (with overtime + deductions)
// @route   GET /api/salary/report/:id
// ─────────────────────────────────────────────────────────────────────────────
const getWorkerSalaryReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) return res.status(400).json({ message: 'Start and end dates are required' });

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid worker ID' });
        }

        const worker = await Worker.findById(id).populate('department').select('+fines +deductions +overtimeRecords');
        if (!worker) return res.status(404).json({ message: 'Worker not found' });

        const allAttendanceData = await Attendance.find({ worker: id });
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        const attendanceData = allAttendanceData.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= fromDateObj && recordDate <= toDateObj;
        });

        const leaveData = await Leave.find({ worker: id, status: 'Approved' });
        const holidays = await Holiday.find({});
        const settings = await Settings.findOne({ subdomain: worker.subdomain });
        const batches = settings ? settings.batches : [];

        const report = calculateWorkerProductivity({
            worker,
            attendanceData,
            fromDate,
            toDate,
            options: {
                batches,
                holidays,
                permissionTimeMinutes: settings ? settings.permissionTimeMinutes : 15,
                deductSalary: settings ? settings.deductSalary : true,
                deductLateMinutes: settings ? settings.deductLateMinutes : true,
                intervals: settings ? settings.intervals : []
            }
        });

        // Bonus calculation
        const bonusesForPeriod = (worker.bonuses || []).filter(bonus =>
            bonus.fromDate && bonus.toDate &&
            new Date(bonus.fromDate) <= new Date(toDate) &&
            new Date(bonus.toDate) >= new Date(fromDate)
        );
        const totalBonusAmount = bonusesForPeriod.reduce((total, bonus) => total + (bonus.amount || 0), 0);

        let finalSalaryWithBonus = report.summary?.finalSalary || 0;
        if (totalBonusAmount > 0) {
            finalSalaryWithBonus = (report.summary?.finalSalary || 0) + totalBonusAmount;
        }

        // Deduction engine
        const deductionSummary = calculateDeductions(worker, fromDate, toDate, worker.department);

        // Overtime engine
        const overtimeSummary = calculateOvertime(attendanceData, worker, worker.department);

        // Final salary = earned + overtime - deductions
        const finalSalaryWithFines = Math.max(0, finalSalaryWithBonus - (deductionSummary?.cappedDeduction || 0));
        const finalSalaryWithOvertime = finalSalaryWithFines + (overtimeSummary?.totalOvertimePay || 0);

        res.status(200).json({
            message: 'Salary report generated successfully',
            report,
            bonuses: bonusesForPeriod,
            totalBonusAmount,
            // Deductions
            totalFinesAmount: deductionSummary.totalFines,
            totalDeductionsAmount: deductionSummary.totalDeductions,
            grossDeduction: deductionSummary.grossDeduction,
            cappedDeduction: deductionSummary.cappedDeduction,
            maxDeductionPercent: deductionSummary.maxDeductionPercent,
            // Overtime
            overtime: overtimeSummary,
            // Final salaries
            finalSalaryWithBonus,
            finalSalaryWithFines,
            finalSalaryWithOvertime,
            worker: {
                name: worker.name,
                salary: worker.salary,
                finalSalary: worker.finalSalary,
                perDaySalary: worker.perDaySalary,
                fines: worker.fines,
                deductions: worker.deductions,
                leaveBalance: worker.leaveBalance,
                warnings: worker.warnings,
                performance: worker.performance,
                overtimeRecords: worker.overtimeRecords,
                department: worker.department
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate salary report' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a deduction for a worker
// @route   POST /api/salary/add-deduction/:id
// ─────────────────────────────────────────────────────────────────────────────
const addDeduction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, date, reason, deductionType } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ message: 'Deduction amount must be a positive number' });
    }

    const worker = await Worker.findById(id).populate('department');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    // Enforce max deduction cap (including fines for this month)
    const maxDeductionPercent = worker.department?.salaryPolicy?.maxDeductionPercent ?? 50;
    const maxDeductionAmount = (worker.salary || 0) * (maxDeductionPercent / 100);

    // Calculate total existing deductions and fines to enforce the cap properly
    const totalExistingDeductions = (worker.deductions || []).reduce((s, d) => s + (d.amount || 0), 0);
    const totalExistingFines = (worker.fines || []).reduce((s, f) => s + (f.amount || 0), 0);

    if (totalExistingDeductions + totalExistingFines + Number(amount) > maxDeductionAmount) {
        return res.status(400).json({
            message: `Deduction exceeds maximum allowed (${maxDeductionPercent}% of salary = ${maxDeductionAmount.toFixed(2)}) including existing fines and deductions.`,
            maxDeductionAmount
        });
    }

    worker.deductions = worker.deductions || [];
    worker.deductions.push({
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        reason: reason || '',
        deductionType: deductionType || 'Other',
        isAutomatic: false
    });

    // Update the worker's final salary by subtracting the deduction amount
    const currentSalary = worker.finalSalary !== undefined ? worker.finalSalary : worker.salary || 0;
    worker.finalSalary = Math.max(0, currentSalary - Number(amount));

    await worker.save();
    res.status(200).json({ message: 'Deduction added successfully', worker });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a deduction for a worker
// @route   DELETE /api/salary/deduction/:workerId/:deductionId
// ─────────────────────────────────────────────────────────────────────────────
const deleteDeduction = asyncHandler(async (req, res) => {
    const { workerId, deductionId } = req.params;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    // Find the deduction to restore the amount
    const deduction = (worker.deductions || []).find(d => d._id.toString() === deductionId);
    const amountToRestore = deduction ? (deduction.amount || 0) : 0;

    worker.deductions = (worker.deductions || []).filter(d => d._id.toString() !== deductionId);

    // Update the worker's final salary
    const currentSalary = worker.finalSalary !== undefined ? worker.finalSalary : worker.salary || 0;
    worker.finalSalary = currentSalary + amountToRestore;

    await worker.save();
    res.status(200).json({ message: 'Deduction deleted successfully', worker });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Issue a performance-based salary increment
// @route   POST /api/salary/increment/:id
// ─────────────────────────────────────────────────────────────────────────────
const giveIncrement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { incrementAmount, reason, performanceRating } = req.body;

    if (!incrementAmount || isNaN(incrementAmount) || Number(incrementAmount) <= 0) {
        return res.status(400).json({ message: 'Increment amount must be a positive number' });
    }

    const worker = await Worker.findById(id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    const previousSalary = worker.salary || 0;
    const newSalary = previousSalary + Number(incrementAmount);

    worker.salary = newSalary;
    worker.finalSalary = newSalary;
    worker.perDaySalary = newSalary / 26;

    // Performance record
    if (!worker.performance) worker.performance = { rating: 0, incrementHistory: [] };
    if (performanceRating !== undefined) worker.performance.rating = Number(performanceRating);
    worker.performance.lastReviewDate = new Date();
    worker.performance.incrementHistory = worker.performance.incrementHistory || [];
    worker.performance.incrementHistory.push({
        amount: Number(incrementAmount),
        previousSalary,
        newSalary,
        reason: reason || 'Performance-based increment',
        date: new Date()
    });

    await worker.save();
    res.status(200).json({
        message: 'Salary increment applied successfully',
        previousSalary,
        newSalary,
        worker
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get department-wise salary summary
// @route   GET /api/salary/department/:subdomain
// ─────────────────────────────────────────────────────────────────────────────
const getDepartmentSalarySummary = asyncHandler(async (req, res) => {
    const { subdomain } = req.params;
    const { fromDate, toDate } = req.query;

    const workers = await Worker.find({ subdomain }).populate('department');
    const departmentMap = {};

    workers.forEach(worker => {
        const deptName = worker.department?.name || 'Unassigned';
        if (!departmentMap[deptName]) {
            departmentMap[deptName] = {
                department: deptName,
                headCount: 0,
                totalBaseSalary: 0,
                totalFinalSalary: 0,
                policy: worker.department?.salaryPolicy || {}
            };
        }
        departmentMap[deptName].headCount++;
        departmentMap[deptName].totalBaseSalary += worker.salary || 0;
        departmentMap[deptName].totalFinalSalary += worker.finalSalary || 0;
    });

    res.status(200).json({
        message: 'Department salary summary',
        departments: Object.values(departmentMap)
    });
});

module.exports = {
    giveBonus,
    removeBonus,
    resetSalary,
    getWorkerSalaryReport,
    addDeduction,
    deleteDeduction,
    giveIncrement,
    getDepartmentSalarySummary
};