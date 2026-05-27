const asyncHandler = require('express-async-handler');
const WorkAllocation = require('../models/WorkAllocation');
const Department = require('../models/Department');
const Worker = require('../models/Worker');

// Helper to generate task # like #32F3
const generateTaskNumber = () => {
  const chars = '0123456789ABCDEF';
  let result = '#';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// @desc    Get all work allocation tasks for subdomain
// @route   GET /api/work-allocation
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const subdomain = req.user.subdomain || req.query.subdomain;
  if (!subdomain) {
    res.status(400);
    throw new Error('Subdomain is required');
  }

  let filter = { subdomain };

  // If worker, we can either show all subdomain tasks or filter if needed, but in Kanban board teamwork usually everyone sees tasks or tasks assigned to them/team
  const tasks = await WorkAllocation.find(filter)
    .populate('assignedWorkers', 'name username photo department')
    .populate('assignedTeam', 'name')
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// @desc    Create a work allocation task
// @route   POST /api/work-allocation
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const subdomain = req.user.subdomain;
  if (!subdomain) {
    res.status(400);
    throw new Error('Subdomain is required');
  }

  // Sanitize inputs to prevent BSON/Cast errors on empty strings
  if (req.body.assignedTeam === '') {
    req.body.assignedTeam = null;
  }
  if (req.body.assignedWorkers) {
    if (Array.isArray(req.body.assignedWorkers)) {
      req.body.assignedWorkers = req.body.assignedWorkers.filter(w => w && typeof w === 'string' && w.trim() !== '');
    } else {
      req.body.assignedWorkers = [];
    }
  }
  if (req.body.startDate === '') {
    req.body.startDate = null;
  }
  if (req.body.endDate === '') {
    req.body.endDate = null;
  }

  const {
    title,
    workspace,
    subtasks,
    startDate,
    endDate,
    priority,
    phase,
    assignType,
    assignedWorkers,
    assignedTeam,
    workType,
    reviewNotes,
    progress
  } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const taskNumber = generateTaskNumber();

  const task = await WorkAllocation.create({
    subdomain,
    taskNumber,
    title,
    workspace: workspace || 'Untitled Workspace...',
    subtasks: subtasks || [],
    startDate: startDate || null,
    endDate: endDate || null,
    priority: priority || 'medium',
    phase: phase || 'to_do',
    assignType: assignType || 'individual',
    assignedWorkers: assignedWorkers || [],
    assignedTeam: assignedTeam || null,
    workType: workType || 'task',
    reviewNotes: reviewNotes || '',
    progress: progress || 0,
    createdBy: req.user._id,
    createdByModel: req.user.role === 'admin' ? 'Admin' : 'Worker',
    executionData: [{ date: new Date(), progress: progress || 0, note: 'Task created' }]
  });

  const populatedTask = await WorkAllocation.findById(task._id)
    .populate('assignedWorkers', 'name username photo department')
    .populate('assignedTeam', 'name');

  res.status(201).json(populatedTask);
});

// @desc    Update a work allocation task
// @route   PUT /api/work-allocation/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await WorkAllocation.findById(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Ensure subdomain matches
  if (task.subdomain !== req.user.subdomain) {
    res.status(403);
    throw new Error('Not authorized to update this task');
  }

  // Sanitize inputs to prevent BSON/Cast errors on empty strings
  if (req.body.assignedTeam === '') {
    req.body.assignedTeam = null;
  }
  if (req.body.assignedWorkers) {
    if (Array.isArray(req.body.assignedWorkers)) {
      req.body.assignedWorkers = req.body.assignedWorkers.filter(w => w && typeof w === 'string' && w.trim() !== '');
    } else {
      req.body.assignedWorkers = [];
    }
  }
  if (req.body.startDate === '') {
    req.body.startDate = null;
  }
  if (req.body.endDate === '') {
    req.body.endDate = null;
  }

  const oldProgress = task.progress;
  const newProgress = req.body.progress !== undefined ? req.body.progress : task.progress;

  let executionData = task.executionData || [];
  if (req.body.progress !== undefined && req.body.progress !== oldProgress) {
    executionData.push({
      date: new Date(),
      progress: newProgress,
      note: `Progress updated to ${newProgress}%`
    });
  }

  const updatedTask = await WorkAllocation.findByIdAndUpdate(
    id,
    { ...req.body, executionData },
    { new: true }
  )
    .populate('assignedWorkers', 'name username photo department')
    .populate('assignedTeam', 'name');

  res.json(updatedTask);
});

// @desc    Delete a work allocation task
// @route   DELETE /api/work-allocation/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await WorkAllocation.findById(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.subdomain !== req.user.subdomain) {
    res.status(403);
    throw new Error('Not authorized to delete this task');
  }

  await WorkAllocation.findByIdAndDelete(id);
  res.json({ message: 'Task removed successfully' });
});

// @desc    Get team-wise allocation overview
// @route   GET /api/work-allocation/overview
// @access  Private
const getOverview = asyncHandler(async (req, res) => {
  const subdomain = req.user.subdomain;
  if (!subdomain) {
    res.status(400);
    throw new Error('Subdomain is required');
  }

  // Fetch all departments for subdomain
  const departments = await Department.find({ subdomain });
  const tasks = await WorkAllocation.find({ subdomain }).populate('assignedTeam', 'name');

  let overviewMap = {};

  // Initialize departments in map
  departments.forEach(dept => {
    overviewMap[dept.name] = { name: dept.name, to_do: 0, in_progress: 0, review: 0, done: 0, total: 0 };
  });

  // Also include N/A for unassigned or general tasks
  overviewMap['N/A'] = { name: 'N/A', to_do: 0, in_progress: 0, review: 0, done: 0, total: 0 };

  tasks.forEach(task => {
    let deptName = task.assignedTeam ? task.assignedTeam.name : 'N/A';
    if (!overviewMap[deptName]) {
      overviewMap[deptName] = { name: deptName, to_do: 0, in_progress: 0, review: 0, done: 0, total: 0 };
    }
    const phase = task.phase || 'to_do';
    if (phase === 'to_do') overviewMap[deptName].to_do += 1;
    else if (phase === 'in_progress') overviewMap[deptName].in_progress += 1;
    else if (phase === 'review') overviewMap[deptName].review += 1;
    else if (phase === 'done') overviewMap[deptName].done += 1;

    overviewMap[deptName].total += 1;
  });

  const overviewList = Object.values(overviewMap);
  res.json(overviewList);
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getOverview
};
