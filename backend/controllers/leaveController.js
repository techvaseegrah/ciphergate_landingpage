const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const Admin = require('../models/Admin');
const Worker = require('../models/Worker');
const Department = require('../models/Department');
const Settings = require('../models/Settings');

const { sendNewLeaveRequestNotification } = require('../services/notificationService');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Get the leave balance field name for a given leave type
// ─────────────────────────────────────────────────────────────────────────────
const getLeaveBalanceKey = (leaveType) => {
  const map = {
    'Annual Leave': 'annualLeave',
    'Sick Leave': 'sickLeave',
    'Hospitalization Leave': 'hospitalizationLeave',
    'Urgent Leave': 'urgentLeave',
    'Marriage Leave': 'marriageLeave',
    'Paternity Leave': 'paternityLeave',
    'Compassionate Leave': 'compassionateLeave',
    'Unpaid Leave': 'unpaidLeave',
    'Home Country Leave': 'homeCountryLeave',
    'Personal Leave': 'personalLeave',
    'Permission': null,   // time-based, no day balance
    'Others': null
  };
  return map[leaveType] ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Get department leave policy, falling back to defaults
// ─────────────────────────────────────────────────────────────────────────────
const getDeptPolicy = (department) => {
  const defaults = {
    annualLeaveLimit: 7,
    sickLeaveLimit: 14,
    hospitalizationLeaveLimit: 60,
    urgentLeaveLimit: 3,
    marriageLeaveLimit: 3,
    paternityLeaveLimit: 3,
    compassionateLeaveLimit: 3,
    eligibilityMonths: 3,
    normalNoticeDays: 7,
    homeCountryNoticeDays: 30,
    preventContinuousLeaveDays: 0,
    requireReturnTicketDays: 7
  };
  if (!department || !department.leavePolicy) return defaults;
  return { ...defaults, ...department.leavePolicy.toObject() };
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Dynamic Leave Balance Calculator
// ─────────────────────────────────────────────────────────────────────────────
const calculateLeaveBalance = (worker, settings) => {
  const policyArray = settings?.leavePolicy;
  let policyList = [];
  if (Array.isArray(policyArray)) {
    policyList = policyArray;
  } else {
    // fallback if no array
    policyList = [
      { type: 'annual', label: 'Annual Leave', defaultDays: 7, overrides: [] },
      { type: 'sick', label: 'Sick Leave', defaultDays: 14, overrides: [] },
      { type: 'hospital', label: 'Hospitalization Leave', defaultDays: 60, overrides: [] },
      { type: 'urgent', label: 'Urgent Leave', defaultDays: 3, overrides: [] },
      { type: 'marriage', label: 'Marriage Leave', defaultDays: 3, overrides: [] },
      { type: 'paternity', label: 'Paternity Leave', defaultDays: 3, overrides: [] },
      { type: 'compassion', label: 'Compassionate Leave', defaultDays: 3, overrides: [] },
      { type: 'personal', label: 'Personal Leave', defaultDays: 3, overrides: [] },
      { type: 'unpaid', label: 'Unpaid Leave', defaultDays: 0, overrides: [] },
      { type: 'homeCountry', label: 'Home Country Leave', defaultDays: 0, overrides: [] }
    ];
  }
  const workerOverrides = worker?.leaveOverrides || {};
  const finalBalances = {};

  policyList.forEach(leave => {
    // 1. Worker Profile Override (Top level overrides applied on individual Worker management view)
    if (workerOverrides[leave.type] !== undefined && workerOverrides[leave.type] !== '' && workerOverrides[leave.type] !== null) {
      finalBalances[leave.label] = Number(workerOverrides[leave.type]);
    } 
    // 2. Policy Settings Group Override
    else if (Array.isArray(leave.overrides) && worker && worker._id) {
      const match = leave.overrides.find(o => 
        Array.isArray(o.employeeIds) && o.employeeIds.some(id => id.toString() === worker._id.toString())
      );
      if (match) {
        finalBalances[leave.label] = Number(match.days);
      } else {
        // 3. Global Default
        finalBalances[leave.label] = Number(leave.defaultDays);
      }
    } 
    // 3. Global Default
    else {
      finalBalances[leave.label] = Number(leave.defaultDays || 0);
    }
  });

  return finalBalances;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE VALIDATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const validateLeaveApplication = async (worker, leaveData, department) => {
  const errors = [];
  const { leaveType, startDate, endDate, totalDays } = leaveData;
  const policy = getDeptPolicy(department);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);

  // Fetch settings for eligibility and dynamic limits
  const settings = await Settings.findOne({ subdomain: leaveData.subdomain || worker.subdomain });
  const eligibilityValue = settings?.leaveEligibilityValue !== undefined ? settings.leaveEligibilityValue : 3;
  const eligibilityUnit = settings?.leaveEligibilityUnit || 'months';

  // 1. ELIGIBILITY CHECK
  const joiningDate = new Date(worker.dateOfJoining);
  let eligibleDate = new Date(joiningDate);
  
  if (eligibilityUnit === 'days') {
      eligibleDate.setDate(eligibleDate.getDate() + eligibilityValue);
  } else {
      eligibleDate.setMonth(eligibleDate.getMonth() + eligibilityValue);
  }
 
  // Format eligible date DD-MM-YYYY
  const dd = String(eligibleDate.getDate()).padStart(2, '0');
  const mm = String(eligibleDate.getMonth() + 1).padStart(2, '0');
  const yyyy = eligibleDate.getFullYear();
  const formattedDate = `${dd}-${mm}-${yyyy}`;

  if (today < eligibleDate) {
    errors.push(
      `You can apply leave after ${formattedDate}`
    );
  }

  // 2. SICK LEAVE – restricted during initial eligibility period
  if ((leaveType === 'Sick Leave' || leaveType === 'Hospitalization Leave') && today < eligibleDate) {
    errors.push(`Sick / Hospitalization Leave is not allowed before ${formattedDate}`);
  }

  // 3. NOTICE PERIOD CHECK
  if (leaveType !== 'Permission' && leaveType !== 'Urgent Leave') {
    const noticeDays = leaveType === 'Home Country Leave'
      ? policy.homeCountryNoticeDays
      : policy.normalNoticeDays;

    const daysUntilLeave = Math.floor((start - today) / (1000 * 60 * 60 * 24));
    if (daysUntilLeave < noticeDays) {
      errors.push(
        `${leaveType === 'Home Country Leave' ? 'Home Country Leave' : 'Leave'} requires at least ${noticeDays} days prior notice. You applied ${daysUntilLeave} day(s) before.`
      );
    }
  }

  // 4. DYNAMIC LEAVE BALANCE CHECK (skip for Permission / Others)
  if (leaveType !== 'Permission' && leaveType !== 'Others' && totalDays > 0) {
    const finalBalances = calculateLeaveBalance(worker, settings);
    const allowedDays = finalBalances[leaveType] ?? 0;

    // Calculate used days dynamically
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31);
    const approvedLeaves = await Leave.find({
      worker: worker._id,
      status: 'Approved',
      startDate: { $gte: startOfYear, $lte: endOfYear },
      leaveType: leaveType
    });
    
    let usedThisYear = 0;
    approvedLeaves.forEach(l => {
      usedThisYear += l.totalDays || 0;
    });

    const remaining = allowedDays - usedThisYear;
    
    if (remaining < totalDays) {
      errors.push(`Insufficient ${leaveType} balance. Available: ${remaining} day(s), Requested: ${totalDays} day(s).`);
    }
  }

  // 5. PREVENT CONTINUOUS LEAVE (if configured)
  if (policy.preventContinuousLeaveDays > 0 && totalDays >= policy.preventContinuousLeaveDays) {
    errors.push(
      `Continuous leave of ${totalDays} day(s) exceeds the maximum allowed continuous leave of ${policy.preventContinuousLeaveDays - 1} day(s).`
    );
  }

  // 6. SUPPORTING DOCUMENT VALIDATION (Strictly Mandatory)
  if (!leaveData.document) {
    errors.push("Supporting document is strictly required for all leave applications.");
  }

  const labelLower = (leaveType || '').toLowerCase();
  const isMedical = labelLower.includes('medical') || labelLower.includes('sick') || labelLower.includes('hospital');

  const doctorCertRequired = isMedical && !leaveData.document;

  return { errors, doctorCertRequired, policy };
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all leave applications (for Admin) or own leaves (for Worker)
// @route   GET /api/leaves/:subdomain/:me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getLeaves = asyncHandler(async (req, res) => {
  const { subdomain, me } = req.params;

  if (!['1', '0'].includes(me)) {
    res.status(404);
    throw new Error('URL not found');
  }

  if (!subdomain || subdomain === 'main') {
    res.status(400);
    throw new Error('Company name is missing, login again.');
  }

  let leaves;

  if (me === '1') {
    leaves = await Leave.find({ worker: req.user._id }).sort({ createdAt: -1 });
  } else if (me === '0') {
    const user = await Admin.findById(req.user._id);
    if (user) {
      leaves = await Leave.find({ subdomain })
        .populate('worker', 'name department leaveBalance')
        .sort({ createdAt: -1 });
    } else {
      res.status(403);
      throw new Error('Access denied. Admin access required.');
    }
  }

  res.status(200).json(leaves);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get my leave applications (dedicated route for workers)
// @route   GET /api/leaves/me
// @access  Private (Worker)
// ─────────────────────────────────────────────────────────────────────────────
const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ worker: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(leaves);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get leave balance for the logged-in worker
// @route   GET /api/leaves/balance
// @access  Private (Worker)
// ─────────────────────────────────────────────────────────────────────────────
const getLeaveBalance = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.user._id).populate('department');
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }
  const policy = getDeptPolicy(worker.department);
  const settings = await Settings.findOne({ subdomain: worker.subdomain });
  
  const eligibilityValue = settings?.leaveEligibilityValue !== undefined ? settings.leaveEligibilityValue : 3;
  const eligibilityUnit = settings?.leaveEligibilityUnit || 'months';

  // Calculate strict theoretical limits based on Top > Group > Global tiers
  const finalBalances = calculateLeaveBalance(worker, settings);

  // Compute actual Consumed Leave days statically for the current Year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const endOfYear = new Date(new Date().getFullYear(), 11, 31);
  
  const leavesThisYear = await Leave.find({
    worker: worker._id,
    status: { $in: ['Approved', 'Pending'] },
    startDate: { $gte: startOfYear, $lte: endOfYear }
  });

  const usedLeaves = {};
  leavesThisYear.forEach(l => {
    if (!usedLeaves[l.leaveType]) usedLeaves[l.leaveType] = 0;
    usedLeaves[l.leaveType] += (l.totalDays || 0);
  });

  res.status(200).json({
    calculatedBalances: finalBalances,
    leaveUsed: usedLeaves,
    leaveBalance: worker.leaveBalance, // legacy backward preservation 
    policy: settings?.leavePolicy || {},
    leaveOverrides: worker.leaveOverrides || {},
    eligibilityValue,
    eligibilityUnit,
    dateOfJoining: worker.dateOfJoining
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new leave application with full validation
// @route   POST /api/leaves
// @access  Private (Worker)
// ─────────────────────────────────────────────────────────────────────────────
const createLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, totalDays, reason, startTime, endTime,
    subdomain, isHalfDay, halfDayPeriod, returnTicketProvided } = req.body;

  // Basic validation
  if (!leaveType || !startDate || !endDate || !reason || !subdomain) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (leaveType === 'Permission' && (!startTime || !endTime)) {
    res.status(400);
    throw new Error('Start Time and End Time are required for Permission leave');
  }

  const worker = await Worker.findById(req.user._id).populate('department');
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }

  // Strict document check as required by senior dev
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Supporting document is required"
    });
  }

  // Run validation engine
  const leaveData = { leaveType, startDate, endDate, totalDays: Number(totalDays || 0), document: req.file };
  const { errors, doctorCertRequired, policy } = await validateLeaveApplication(worker, leaveData, worker.department);

  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(' | '));
  }

  const document = req.file ? req.file.filename : null;

  // Calculate notice days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDateObj = new Date(startDate);
  const noticeDaysBefore = Math.max(0, Math.floor((startDateObj - today) / (1000 * 60 * 60 * 24)));

  // Determine if return ticket is required
  const returnTicketRequired = Number(totalDays || 0) >= policy.requireReturnTicketDays;

  const leave = await Leave.create({
    worker: req.user._id,
    subdomain,
    leaveType,
    startDate,
    endDate,
    totalDays: Number(totalDays || 0),
    reason,
    document,
    startTime: leaveType === 'Permission' ? startTime : null,
    endTime: leaveType === 'Permission' ? endTime : null,
    isHalfDay: isHalfDay === 'true' || isHalfDay === true,
    halfDayPeriod: (isHalfDay === 'true' || isHalfDay === true) ? halfDayPeriod : null,
    noticeDaysBefore,
    returnTicketRequired,
    returnTicketProvided: returnTicketProvided === 'true' || returnTicketProvided === true,
    doctorCertificateProvided: !!document && (leaveType === 'Sick Leave' || leaveType === 'Hospitalization Leave'),
    status: 'Pending',
    workerViewed: false
  });

  if (leave) {
    sendNewLeaveRequestNotification(leave)
      .then(result => {
        if (result.success) {
          console.log(`✅ Leave notification sent. Summary: ${result.summary}`);
        } else {
          console.error(`❌ Leave notification failed: ${result.error}`);
        }
      })
      .catch(error => {
        console.error(`❌ Notification error: ${error.message}`);
      });
  }

  res.status(201).json(leave);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update leave status (admin only) + deduct leave balance
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const leaveId = req.params.id;

  if (!['Approved', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status provided.');
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found.');
  }

  const updatedLeave = await Leave.findByIdAndUpdate(
    leaveId,
    { status, workerViewed: false, adminNote: adminNote || '' },
    { new: true }
  ).populate('worker', 'name');

  // Handle salary deduction & leave balance deduction on approval
  if (status === 'Approved') {
    const worker = await Worker.findById(leave.worker);
    if (worker) {
      // 1. Dynamic calculation means we don't manually deduct from leaveBalance object anymore!
      // worker.leaveBalance is retained for legacy usage but not strictly updated here.

      // 2. Salary deduction
      let deduction = 0;
      if (leave.leaveType === 'Permission' && leave.startTime && leave.endTime) {
        const start = new Date(`1970-01-01T${leave.startTime}:00`);
        const end = new Date(`1970-01-01T${leave.endTime}:00`);
        const durationHours = (end - start) / (1000 * 60 * 60);
        const perHourSalary = (worker.perDaySalary || 0) / 8;
        deduction = durationHours * perHourSalary;
      } else if (leave.leaveType !== 'Unpaid Leave') {
        // No salary deduction for paid leave types (they use the leave balance)
        deduction = 0;
      } else {
        // Unpaid leave → deduct per-day salary
        deduction = leave.totalDays * (worker.perDaySalary || 0);
      }

      // 3. Save deduction record
      if (deduction > 0) {
        worker.deductions = worker.deductions || [];
        worker.deductions.push({
          amount: deduction,
          date: new Date(),
          reason: `${leave.leaveType} deduction (Leave ID: ${leave._id})`,
          deductionType: 'Other',
          isAutomatic: true
        });
        await Leave.findByIdAndUpdate(leaveId, { deductionApplied: deduction });
      }
      worker.finalSalary = Math.max(0, (worker.finalSalary || 0) - deduction);
      await worker.save();
    }
  }

  res.status(200).json(updatedLeave);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Filter leaves by status
// @route   GET /api/leaves/status
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getLeavesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status && status !== 'all' ? { status } : {};
  query.subdomain = req.user.subdomain;

  const leaves = await Leave.find(query)
    .populate('worker', 'name department')
    .sort({ createdAt: -1 });

  res.status(200).json(leaves);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark a leave as viewed by the worker
// @route   PUT /api/leaves/:id/viewed
// @access  Private (Worker)
// ─────────────────────────────────────────────────────────────────────────────
const markLeaveAsViewed = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found.');
  }

  if (leave.worker.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to perform this action.');
  }

  leave.workerViewed = true;
  await leave.save();
  res.status(200).json({ message: 'Leave marked as viewed' });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get leaves within a specific date range
// @route   GET /api/leaves/range
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getLeavesByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide both start and end dates.');
  }

  const leaves = await Leave.find({
    subdomain: req.user.subdomain,
    $or: [
      { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } }
    ]
  })
    .populate('worker', 'name department')
    .sort({ createdAt: -1 });

  res.status(200).json(leaves);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark all leaves as viewed by admin
// @route   PUT /api/leaves/mark-viewed-by-admin
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const markLeavesAsViewedByAdmin = asyncHandler(async (req, res) => {
  await Leave.updateMany(
    { subdomain: req.user.subdomain, workerViewed: false },
    { $set: { workerViewed: true } }
  );
  res.status(200).json({ message: 'All leaves marked as viewed by admin' });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get leave summary per worker (balance + used)
// @route   GET /api/leaves/summary/:workerId
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getWorkerLeaveSummary = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const worker = await Worker.findById(workerId).populate('department');
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }

  // Fetch Global Policy from Settings
  const settings = await Settings.findOne({ subdomain: worker.subdomain });

  // Count approved leaves by type for current year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const endOfYear = new Date(new Date().getFullYear(), 11, 31);

  const approvedLeaves = await Leave.find({
    worker: workerId,
    status: 'Approved',
    startDate: { $gte: startOfYear, $lte: endOfYear }
  });

  // Build used summary
  const leaveUsed = {};
  approvedLeaves.forEach(l => {
    if (!leaveUsed[l.leaveType]) leaveUsed[l.leaveType] = 0;
    leaveUsed[l.leaveType] += l.totalDays || 0;
  });

  // Calculate final limits
  const calculatedBalances = calculateLeaveBalance(worker, settings);

  res.status(200).json({
    worker: { name: worker.name, department: worker.department?.name },
    calculatedBalances,
    leaveUsed,
    policy: settings?.leavePolicy,
    leaveOverrides: worker.leaveOverrides || {},
    eligibilityValue: settings?.leaveEligibilityValue || 3,
    eligibilityUnit: settings?.leaveEligibilityUnit || 'months',
    dateOfJoining: worker.dateOfJoining
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update individual worker's leave balance (admin override)
// @route   PUT /api/leaves/balance/:workerId
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateLeaveBalance = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const { leaveBalance } = req.body;

  if (!leaveBalance || typeof leaveBalance !== 'object') {
    res.status(400);
    throw new Error('leaveBalance object is required');
  }

  const worker = await Worker.findById(workerId);
  if (!worker) {
    res.status(404);
    throw new Error('Worker not found');
  }

  // Merge incoming values (only override provided keys)
  worker.leaveBalance = {
    ...(worker.leaveBalance?.toObject ? worker.leaveBalance.toObject() : worker.leaveBalance || {}),
    ...leaveBalance
  };

  await worker.save();

  res.status(200).json({
    message: 'Leave balance updated successfully',
    leaveBalance: worker.leaveBalance
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset annual leave balance for all workers in a subdomain
// @route   POST /api/leaves/reset-balance
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const resetLeaveBalance = asyncHandler(async (req, res) => {
  const { subdomain } = req.body;
  if (!subdomain) {
    res.status(400);
    throw new Error('Subdomain is required');
  }

  const settings = await Settings.findOne({ subdomain });
  const policy = settings?.leavePolicy || {};

  const workers = await Worker.find({ subdomain });
  const updates = workers.map(async (worker) => {
    const overrides = worker.leaveOverrides || {};
    worker.leaveBalance = {
      annualLeave: overrides.annual ?? policy.annual ?? 7,
      sickLeave: overrides.sick ?? policy.sick ?? 14,
      hospitalizationLeave: overrides.hospital ?? policy.hospital ?? 60,
      urgentLeave: overrides.urgent ?? policy.urgent ?? 3,
      marriageLeave: overrides.marriage ?? policy.marriage ?? 3,
      paternityLeave: overrides.paternity ?? policy.paternity ?? 3,
      compassionateLeave: overrides.compassion ?? policy.compassion ?? 3,
      unpaidLeave: overrides.unpaid ?? policy.unpaid ?? 0,
      homeCountryLeave: overrides.homeCountry ?? policy.homeCountry ?? 0,
      personalLeave: overrides.personal ?? policy.personal ?? 3
    };
    return worker.save();
  });

  await Promise.all(updates);
  res.status(200).json({ message: 'Leave balances reset for all workers', count: workers.length });
});

module.exports = {
  getLeaves,
  getMyLeaves,
  getLeaveBalance,
  createLeave,
  updateLeaveStatus,
  getLeavesByStatus,
  markLeaveAsViewed,
  getLeavesByDateRange,
  markLeavesAsViewedByAdmin,
  getWorkerLeaveSummary,
  resetLeaveBalance,
  updateLeaveBalance
};