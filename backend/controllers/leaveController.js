const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const Admin = require('../models/Admin');
const Worker = require('../models/Worker');
const Department = require('../models/Department');

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
// LEAVE VALIDATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const validateLeaveApplication = async (worker, leaveData, department) => {
  const errors = [];
  const { leaveType, startDate, endDate, totalDays } = leaveData;
  const policy = getDeptPolicy(department);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);

  // 1. ELIGIBILITY CHECK – must have joined at least eligibilityMonths ago
  const joiningDate = new Date(worker.dateOfJoining);
  const monthsSinceJoining = (today - joiningDate) / (1000 * 60 * 60 * 24 * 30);

  if (monthsSinceJoining < policy.eligibilityMonths) {
    errors.push(
      `Not eligible for leave. You must complete ${policy.eligibilityMonths} months of employment (joined ${joiningDate.toDateString()}).`
    );
  }

  // 2. SICK LEAVE – restricted during first 3 months
  if ((leaveType === 'Sick Leave' || leaveType === 'Hospitalization Leave') && monthsSinceJoining < 3) {
    errors.push('Sick / Hospitalization Leave is not allowed during the first 3 months of employment.');
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

  // 4. LEAVE BALANCE CHECK (skip for Unpaid / Permission / Others)
  const balanceKey = getLeaveBalanceKey(leaveType);
  if (balanceKey && totalDays > 0) {
    const remaining = (worker.leaveBalance || {})[balanceKey] ?? 0;
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

  // 6. SICK LEAVE – doctor certificate required (warn, not block)
  const doctorCertRequired =
    (leaveType === 'Sick Leave' || leaveType === 'Hospitalization Leave') && !leaveData.document;

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
  res.status(200).json({
    leaveBalance: worker.leaveBalance,
    policy
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
      // 1. Deduct from leave balance
      const balanceKey = getLeaveBalanceKey(leave.leaveType);
      if (balanceKey && leave.totalDays > 0) {
        const current = (worker.leaveBalance || {})[balanceKey] ?? 0;
        worker.leaveBalance = {
          ...(worker.leaveBalance || {}),
          [balanceKey]: Math.max(0, current - leave.totalDays)
        };
      }

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

  const policy = getDeptPolicy(worker.department);

  res.status(200).json({
    worker: { name: worker.name, department: worker.department?.name },
    leaveBalance: worker.leaveBalance,
    leaveUsed,
    policy,
    eligibilityMonths: policy.eligibilityMonths,
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

  const workers = await Worker.find({ subdomain });
  const updates = workers.map(async (worker) => {
    const dept = await Department.findById(worker.department);
    const policy = getDeptPolicy(dept);
    worker.leaveBalance = {
      annualLeave: policy.annualLeaveLimit,
      sickLeave: policy.sickLeaveLimit,
      hospitalizationLeave: policy.hospitalizationLeaveLimit,
      urgentLeave: policy.urgentLeaveLimit,
      marriageLeave: policy.marriageLeaveLimit,
      paternityLeave: policy.paternityLeaveLimit,
      compassionateLeave: policy.compassionateLeaveLimit,
      unpaidLeave: 0,
      homeCountryLeave: 0,
      personalLeave: 3
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