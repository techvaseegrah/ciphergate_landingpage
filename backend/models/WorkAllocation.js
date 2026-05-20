const mongoose = require('mongoose');

const workAllocationSchema = new mongoose.Schema({
  subdomain: {
    type: String,
    required: [true, 'Company name is missing'],
    index: true
  },
  taskNumber: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  workspace: {
    type: String,
    default: 'Untitled Workspace...'
  },
  subtasks: {
    type: [{
      title: String,
      completed: { type: Boolean, default: false }
    }],
    default: []
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  phase: {
    type: String,
    enum: ['to_do', 'in_progress', 'review', 'done'],
    default: 'to_do'
  },
  assignType: {
    type: String,
    enum: ['team', 'individual', 'both'],
    default: 'individual'
  },
  assignedWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  }],
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  workType: {
    type: String,
    enum: ['task', 'bug', 'story', 'epic'],
    default: 'task'
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  executionData: {
    type: [{
      date: { type: Date, default: Date.now },
      progress: Number,
      note: String
    }],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdByModel: {
    type: String,
    enum: ['Admin', 'Worker'],
    default: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkAllocation', workAllocationSchema);
