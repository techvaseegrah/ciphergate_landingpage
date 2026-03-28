const mongoose = require('mongoose');

const leaveSchema = mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Worker'
  },
  subdomain: {
    type: String,
    required: [true, 'Company name is missing']
  },
  leaveType: {
    type: String,
    enum: [
      'Annual Leave',
      'Sick Leave',
      'Hospitalization Leave',
      'Urgent Leave',
      'Marriage Leave',
      'Paternity Leave',
      'Compassionate Leave',
      'Unpaid Leave',
      'Personal Leave',
      'Permission',
      'Home Country Leave',
      'Others'
    ],
    required: [true, 'Please add leave type']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add end date']
  },
  totalDays: {
    type: Number,
    required: [true, 'Please add total days']
  },
  reason: {
    type: String,
    required: [true, 'Please add a reason']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  workerViewed: {
    type: Boolean,
    default: false
  },
  document: {
    type: String
  },
  // Time-based leave fields (for Permission / half-day)
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  // Half-day support
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['AM', 'PM', null],
    default: null
  },
  // Notice period details
  noticeDaysBefore: {
    type: Number,
    default: 0
  },
  // Return ticket required flag (for long/home-country leaves)
  returnTicketRequired: {
    type: Boolean,
    default: false
  },
  returnTicketProvided: {
    type: Boolean,
    default: false
  },
  // Admin approval notes
  adminNote: {
    type: String,
    default: ''
  },
  // Track if sick leave certificate was provided
  doctorCertificateProvided: {
    type: Boolean,
    default: false
  },
  // Salary deduction applied
  deductionApplied: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);