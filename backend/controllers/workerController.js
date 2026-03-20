const asyncHandler = require('express-async-handler');
const Worker = require('../models/Worker');
const Task = require('../models/Task');
const Department = require('../models/Department');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
// const nodemailer = require('nodemailer');
// const QRCode = require('qrcode');

// @desc    Create new worker
// @route   POST /api/workers
// @access  Private/Admin
const createWorker = asyncHandler(async (req, res) => {
  try {
    // Extract subdomain from the authenticated user (from JWT token via auth middleware)
    let subdomain = req.user?.subdomain || '';

    // If subdomain is still empty, try to get it from request body as fallback
    if (!subdomain && req.body.subdomain) {
      const bodySubdomain = typeof req.body === 'object' && req.body.subdomain
        ? req.body.subdomain.trim()
        : '';
      if (bodySubdomain && bodySubdomain !== 'main') {
        subdomain = bodySubdomain;
      }
    }

    // Get admin account info to check account type
    const admin = await Admin.findOne({ subdomain });
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found for this subdomain');
    }

    // Check if free account has reached worker limit (5 workers)
    if (admin.accountType === 'free') {
      const workerCount = await Worker.countDocuments({ subdomain });
      if (workerCount >= 5) {
        res.status(400);
        throw new Error('Free account limit reached. Maximum 5 workers allowed. Upgrade to premium for unlimited workers.');
      }
    }

    const {
      name, username, rfid, salary, password, department, photo, batch, faceEmbeddings,
      employeeId, pinNumber, contactNumber, email, gender, dob,
      dateOfJoining, dateOfExit, resignationStatus,
      workPassType, passportNumber, nationality, passExpiryDate,
      address, emergencyContactNumber, emergencyContactName, relationship,
      bankAccountNumber, qualification
    } = req.body;

    const trimmedName = name ? name.trim() : '';
    const trimmedUsername = username ? username.trim() : '';
    const trimmedRfid = rfid ? rfid.trim() : '';
    const numericSalary = salary ? Number(String(salary).trim()) : 0;
    const trimmedPassword = password ? password.trim() : '';
    const trimmedDepartment = department ? department.trim() : '';

    if (numericSalary <= 0) {
      res.status(400);
      throw new Error('Minimum salary is required and cannot be empty');
    }

    const perDaySalary = numericSalary / 30;

    // Comprehensive server-side validation
    if (!trimmedName) {
      res.status(400);
      throw new Error('Name is required');
    }

    if (!trimmedUsername) {
      res.status(400);
      throw new Error('Username is required');
    }

    if (!trimmedPassword) {
      res.status(400);
      throw new Error('Password is required');
    }

    if (!trimmedDepartment) {
      res.status(400);
      throw new Error('Department is required');
    }

    if (!contactNumber) {
      res.status(400);
      throw new Error('Contact number is required');
    }

    if (!workPassType) {
      res.status(400);
      throw new Error('Work Pass Type is required');
    }

    if (!dateOfJoining) {
      res.status(400);
      throw new Error('Date of Joining is required');
    }

    if (employeeId) {
      const idExists = await Worker.findOne({ employeeId });
      if (idExists) {
        res.status(400);
        throw new Error('Employee ID already exists');
      }
    }

    // Check if worker exists
    const workerExists = await Worker.findOne({ username });
    if (workerExists) {
      res.status(400);
      throw new Error('Worker with this username already exists');
    }

    // Validate department
    const departmentDoc = await Department.findById(trimmedDepartment);
    if (!departmentDoc) {
      res.status(400);
      throw new Error('Invalid department');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

    // Create worker
    const worker = await Worker.create({
      name: trimmedName,
      username: trimmedUsername,
      rfid: trimmedRfid,
      salary: numericSalary,
      finalSalary: numericSalary,
      perDaySalary,
      subdomain,
      password: hashedPassword,
      department: departmentDoc._id,
      photo: photo || '',
      batch: batch || '',
      faceEmbeddings: faceEmbeddings || [],
      employeeId,
      pinNumber,
      contactNumber,
      email,
      gender,
      dob,
      dateOfJoining,
      dateOfExit,
      resignationStatus: resignationStatus || 'Active',
      workPassType,
      passportNumber,
      nationality,
      passExpiryDate,
      address,
      emergencyContactNumber,
      emergencyContactName,
      relationship,
      bankAccountNumber,
      qualification,
      totalPoints: 0
    });

    res.status(201).json({
      ...worker.toObject(),
      department: departmentDoc.name,
      password: undefined // Don't return password
    });

  } catch (error) {
    console.error('Worker Creation Error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to create worker');
  }
});
// Generate an unique RFID
const generateUniqueRFID = async () => {
  const generateRFID = () => {
    const letters = String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
      65 + Math.floor(Math.random() * 26)
    );
    const numbers = Math.floor(1000 + Math.random() * 9000).toString();
    return `${letters}${numbers}`;
  };

  let rfid;
  let isUnique = false;

  while (!isUnique) {
    rfid = await generateRFID();
    const existingWorker = await Worker.findOne({ rfid });
    if (!existingWorker) {
      isUnique = true;
    }
  }

  return rfid;
};

// @desc    Check if an RFID is unique
// @route   POST /api/workers/check-rfid
// @access  Public or Protected (depending on your use case)
const generateId = asyncHandler(async (req, res) => {
  const rfid = await generateUniqueRFID();

  res.status(200).json({
    rfid: rfid,
    message: "ID was generated"
  });
});

// @desc    Get all workers
// @route   GET /api/workers
// @access  Private/Admin
const getWorkers = asyncHandler(async (req, res) => {
  try {
    // Handle both object and string formats for subdomain
    const subdomain = typeof req.body === 'object' && req.body.subdomain
      ? req.body.subdomain
      : (req.query.subdomain || req.body);

    const { workPassType, expiryStatus, resignationStatus } = req.query;

    let query = { subdomain };

    if (workPassType) {
      query.workPassType = workPassType;
    }

    if (resignationStatus) {
      query.resignationStatus = resignationStatus;
    }

    if (expiryStatus) {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      if (expiryStatus === 'expired') {
        query.passExpiryDate = { $lt: today };
      } else if (expiryStatus === 'expiring') {
        query.passExpiryDate = { $gte: today, $lte: thirtyDaysFromNow };
      }
    }

    const workers = await Worker.find(query)
      .select('-password')
      .populate('department', 'name');

    // Transform workers to include department name and full photo URL
    const transformedWorkers = workers.map(worker => ({
      ...worker.toObject(),
      department: worker.department ? worker.department.name : 'N/A',
      photoUrl: worker.photo
        ? `/uploads/${worker.photo}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}`
    }));

    res.json(transformedWorkers);
  } catch (error) {
    console.error('Get Workers Error:', error);
    res.status(500);
    throw new Error('Failed to retrieve workers');
  }
});
const getPublicWorkers = asyncHandler(async (req, res) => {
  try {
    // Handle both object and string formats for subdomain
    const subdomain = typeof req.body === 'object' && req.body.subdomain
      ? req.body.subdomain
      : req.body;

    const workers = await Worker.find({ subdomain })
      .select('name username subdomain department photo')
      .populate('department', 'name');

    const transformedWorkers = workers.map(worker => ({
      _id: worker._id,
      name: worker.name,
      username: worker.username,
      subdomain: worker.subdomain,
      department: worker.department ? worker.department.name : 'Unassigned',
      photo: worker.photo
    }));

    res.json(transformedWorkers);
  } catch (error) {
    console.error('Get Public Workers Error:', error);
    res.status(500);
    throw new Error('Failed to retrieve workers');
  }
});
// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Private
const getWorkerById = asyncHandler(async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .select('-password')
      .populate('department', 'name');

    if (!worker) {
      res.status(404);
      throw new Error('Worker not found');
    }

    res.json(worker);
  } catch (error) {
    console.error('Get Worker by ID Error:', error);
    res.status(404);
    throw new Error(error.message || 'Worker not found');
  }
});

// @desc    Update worker 
// @route   PUT /api/workers/:id
// @access  Private/Admin
const updateWorker = asyncHandler(async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      res.status(404);
      throw new Error('Worker not found');
    }

    const {
      name, username, salary, department, password, photo, batch, faceEmbeddings,
      employeeId, pinNumber, contactNumber, email, gender, dob,
      dateOfJoining, dateOfExit, resignationStatus,
      workPassType, passportNumber, nationality, passExpiryDate,
      address, emergencyContactNumber, emergencyContactName, relationship,
      bankAccountNumber, qualification
    } = req.body;

    const updateData = {};

    // Validate department if provided
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        res.status(400);
        throw new Error('Invalid department');
      }
      updateData.department = department;
    }

    if (name) updateData.name = name;

    if (username) {
      const usernameExists = await Worker.findOne({
        username,
        _id: { $ne: req.params.id }
      });
      if (usernameExists) {
        res.status(400);
        throw new Error('Username already exists');
      }
      updateData.username = username;
    }

    if (employeeId) {
      const idExists = await Worker.findOne({
        employeeId,
        _id: { $ne: req.params.id }
      });
      if (idExists) {
        res.status(400);
        throw new Error('Employee ID already exists');
      }
      updateData.employeeId = employeeId;
    }

    if (photo) updateData.photo = photo;
    if (batch) updateData.batch = batch;
    if (faceEmbeddings) updateData.faceEmbeddings = faceEmbeddings;

    // New fields
    if (pinNumber !== undefined) updateData.pinNumber = pinNumber;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (email !== undefined) updateData.email = email;
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) updateData.dob = dob;
    if (dateOfJoining !== undefined) updateData.dateOfJoining = dateOfJoining;
    if (dateOfExit !== undefined) updateData.dateOfExit = dateOfExit;
    if (resignationStatus !== undefined) updateData.resignationStatus = resignationStatus;
    if (workPassType !== undefined) updateData.workPassType = workPassType;
    if (passportNumber !== undefined) updateData.passportNumber = passportNumber;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (passExpiryDate !== undefined) updateData.passExpiryDate = passExpiryDate;
    if (address !== undefined) updateData.address = address;
    if (emergencyContactNumber !== undefined) updateData.emergencyContactNumber = emergencyContactNumber;
    if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName;
    if (relationship !== undefined) updateData.relationship = relationship;
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber;
    if (qualification !== undefined) updateData.qualification = qualification;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (salary) {
      const numericSalary = Number(salary);
      if (isNaN(numericSalary) || numericSalary <= 0) {
        res.status(400);
        throw new Error('Invalid salary value');
      }
      updateData.salary = numericSalary;
      updateData.finalSalary = numericSalary;
      updateData.perDaySalary = numericSalary / 30;
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department', 'name');

    res.json({
      ...updatedWorker.toObject(),
      department: updatedWorker.department ? updatedWorker.department.name : 'N/A',
      password: undefined
    });
  } catch (error) {
    console.error('Update Worker Error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to update worker');
  }
});

// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Private/Admin
const deleteWorker = asyncHandler(async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      res.status(404);
      throw new Error('Worker not found');
    }

    // Optional: Delete worker's photo file if exists
    if (worker.photo) {
      const photoPath = path.join(__dirname, '../uploads', worker.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await worker.deleteOne();
    res.json({ message: 'Worker removed successfully' });
  } catch (error) {
    console.error('Delete Worker Error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to delete worker');
  }
});

// @desc    Get worker activities
// @route   GET /api/workers/:id/activities
// @access  Private
const getWorkerActivities = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find({ worker: req.params.id })
      .populate('topics', 'name points')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get Worker Activities Error:', error);
    res.status(500);
    throw new Error('Failed to retrieve worker activities');
  }
});

// @desc    Reset worker activities
// @route   DELETE /api/workers/:id/activities
// @access  Private/Admin
const resetWorkerActivities = asyncHandler(async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      res.status(404);
      throw new Error('Worker not found');
    }

    // Delete all tasks for this worker
    await Task.deleteMany({ worker: req.params.id });

    // Reset worker points
    worker.totalPoints = 0;
    worker.topicPoints = {};
    worker.lastSubmission = {};
    await worker.save();

    res.json({ message: 'Worker activities reset successfully' });
  } catch (error) {
    console.error('Reset Worker Activities Error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to reset worker activities');
  }
});

// @desc    Get workers by department
// @route   GET /api/workers/department/:departmentId
// @access  Private/Admin
const getWorkersByDepartment = asyncHandler(async (req, res) => {
  try {
    const workers = await Worker.find({ department: req.params.departmentId })
      .select('-password')
      .populate('department', 'name');

    res.json(workers);
  } catch (error) {
    console.error('Get Workers by Department Error:', error);
    res.status(500);
    throw new Error('Failed to retrieve workers by department');
  }
});

// @desc    Get worker by RFID
// @route   POST /api/worker/get-worker-by-rfid
// @access  Private
const getWorkerByRfid = asyncHandler(async (req, res) => {
  try {
    const { rfid } = req.body;

    if (!rfid) {
      res.status(400);
      throw new Error('RFID is required');
    }

    const worker = await Worker.findOne({ rfid })
      .select('-password')
      .populate('department', 'name');

    if (!worker) {
      res.status(404);
      throw new Error('Worker not found');
    }

    res.json({
      worker: {
        _id: worker._id,
        name: worker.name,
        username: worker.username,
        rfid: worker.rfid,
        subdomain: worker.subdomain,
        department: worker.department ? worker.department.name : 'N/A',
        photo: worker.photo
      }
    });
  } catch (error) {
    console.error('Get Worker by RFID Error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to retrieve worker');
  }
});

module.exports = {
  getWorkers,
  createWorker,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getWorkerActivities,
  resetWorkerActivities,
  getWorkersByDepartment,
  getPublicWorkers,
  generateId,
  getWorkerByRfid
};