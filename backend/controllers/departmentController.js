const Department = require('../models/Department');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const asyncHandler = require('express-async-handler');

const createDepartment = asyncHandler(async (req, res) => {
  const { name, subdomain } = req.body;

  // Validate input
  if (!name || name.trim().length < 2) {
    res.status(400);
    throw new Error('Department name must be at least 2 characters long');
  }

  if (!subdomain || subdomain == 'main') {
    res.status(400);
    throw new Error('Company name is missing, login again.');
  }

  try {
    const existingDepartment = await Department.findOne({
      name: name.trim()
    });

    if (existingDepartment) {
      res.status(400);
      throw new Error('Department with this name already exists.');
    }

    // Create department with exact case preservation
    const department = new Department({ name, subdomain });

    await department.save();

    // Get worker count
    const workerCount = await Worker.countDocuments({
      department: department._id
    });

    // Prepare response
    const departmentResponse = {
      ...department.toObject(),
      workerCount
    };

    res.status(201).json(departmentResponse);
  } catch (error) {
    console.error('Department Creation Error:', error);
    throw error;
  }
});

const getDepartments = asyncHandler(async (req, res) => {
  const { subdomain } = req.body;
  if (!subdomain || subdomain === 'main') {
    res.status(400);
    throw new Error('Subdomain is missing or invalid.');
  }

  try {
    // 1. Load all departments for this subdomain
    const departments = await Department
      .find({ subdomain })
      .sort({ createdAt: -1 });

    // 2. Get current date in Asia/Kolkata timezone
    const now = new Date();
    const indiaTimezoneDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const currentDateFormatted = indiaTimezoneDate.format(now);

    // Start and end of today for Leave check
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // 3. For each department, fetch its workers and build the response
    const departmentsWithData = await Promise.all(
      departments.map(async (department) => {
        // Find all workers in this department
        const workers = await Worker
          .find({ department: department._id })
          .select('name photo');

        const workerIds = workers.map(emp => emp._id);

        // Fetch all attendance for these workers today
        const attendanceToday = await Attendance.find({
          worker: { $in: workerIds },
          date: currentDateFormatted,
          presence: true
        }).select('worker');

        const presentWorkerIds = new Set(attendanceToday.map(a => a.worker.toString()));

        // Fetch all approved leaves for these workers today
        const leavesToday = await Leave.find({
          worker: { $in: workerIds },
          status: 'Approved',
          startDate: { $lte: endOfToday },
          endDate: { $gte: startOfToday }
        }).select('worker');

        const leaveWorkerIds = new Set(leavesToday.map(l => l.worker.toString()));

        const employeesWithStatus = workers.map(worker => {
          let status = 'Absent';
          if (presentWorkerIds.has(worker._id.toString())) {
            status = 'Present';
          } else if (leaveWorkerIds.has(worker._id.toString())) {
            status = 'On Leave';
          }

          return {
            ...worker.toObject(),
            status
          };
        });

        return {
          ...department.toObject(),
          workerCount: workers.length,
          punchedInCount: presentWorkerIds.size,
          employees: employeesWithStatus
        };
      })
    );

    // 4. Send back JSON array
    res.json(departmentsWithData);

  } catch (error) {
    console.error('Get Departments Error:', error);
    res.status(500).json({ message: 'Failed to fetch departments.' });
  }
});


const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  // Check for associated workers
  const workerCount = await Worker.countDocuments({
    department: req.params.id
  });

  if (workerCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete department. ${workerCount} workers are assigned.`);
  }

  await department.deleteOne();
  res.json({
    message: 'Department removed successfully',
    departmentId: req.params.id
  });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Validate input
  if (!name || name.trim().length < 2) {
    res.status(400);
    throw new Error('Department name must be at least 2 characters long');
  }

  try {
    // Check for existing department (case-insensitive)
    const existingDepartment = await Department.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      _id: { $ne: id } // Exclude current department
    });

    if (existingDepartment) {
      res.status(400);
      throw new Error('A department with this name already exists');
    }

    // Find the department and update with exact case
    const department = await Department.findById(id);

    if (!department) {
      res.status(404);
      throw new Error('Department not found');
    }

    department.name = name.trim();
    await department.save(); // Use save() to trigger validation

    // Get worker count
    const workerCount = await Worker.countDocuments({
      department: department._id
    });

    // Prepare response
    const departmentResponse = {
      ...department.toObject(),
      workerCount
    };

    res.json(departmentResponse);
  } catch (error) {
    // Handle specific errors
    if (error.code === 11000) {
      res.status(400);
      throw new Error('A department with this name already exists');
    }

    // Rethrow other errors
    throw error;
  }
});

module.exports = {
  createDepartment,
  getDepartments,
  deleteDepartment,
  updateDepartment
};