const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true
  },
  rfid: {
    type: String,
    required: [true, 'RFID is missing'],
    unique: true
  },
  subdomain: {
    type: String,
    required: [true, 'Company name is missing'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  batch: {
    type: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Please select a department']
  },
  // Basic Employee Details
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  pinNumber: {
    type: String
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add a contact number']
  },
  email: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  dob: {
    type: Date
  },
  // Employment Details
  dateOfJoining: {
    type: Date,
    required: [true, 'Please add a date of joining']
  },
  dateOfExit: {
    type: Date
  },
  resignationStatus: {
    type: String,
    enum: ['Active', 'Resigned'],
    default: 'Active'
  },
  // Probation
  onProbation: {
    type: Boolean,
    default: false
  },
  probationEndDate: {
    type: Date,
    default: null
  },
  // Work Pass Details
  workPassType: {
    type: String,
    enum: ['Work Permit', 'S Pass', 'E Pass', 'TEP']
  },
  passportNumber: {
    type: String
  },
  nationality: {
    type: String
  },
  passExpiryDate: {
    type: Date
  },
  // Address Details
  address: {
    type: String
  },
  // Emergency Contact Details
  emergencyContactNumber: {
    type: String
  },
  emergencyContactName: {
    type: String
  },
  relationship: {
    type: String
  },
  // Bank & Payroll Details
  bankAccountNumber: {
    type: String
  },
  // Additional Details
  qualification: {
    type: String
  },
  photo: {
    type: String,
    default: ''
  },
  // Face embeddings for face recognition
  faceEmbeddings: {
    type: [[Number]],
    default: []
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  topicPoints: {
    type: Object,
    default: {}
  },
  lastSubmission: {
    type: Object,
    default: {}
  },

  // ─── Salary Fields ──────────────────────────────────────────────────────────
  salary: {
    type: Number,
    default: 0
  },
  finalSalary: {
    type: Number,
    default: 0
  },
  perDaySalary: {
    type: Number,
    default: 0
  },
  bonuses: {
    type: [{
      amount: Number,
      fromDate: Date,
      toDate: Date,
      reason: { type: String, default: '' },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  fines: {
    type: [{
      amount: Number,
      date: Date,
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },

  // ─── Deductions ─────────────────────────────────────────────────────────────
  deductions: {
    type: [{
      amount: Number,
      date: Date,
      reason: String,       // e.g. "Property Damage", "Utility Excess", "Policy Violation"
      deductionType: {
        type: String,
        enum: ['Property Damage', 'Utility Excess', 'Policy Violation', 'Other'],
        default: 'Other'
      },
      isAutomatic: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },

  // ─── Overtime Records ───────────────────────────────────────────────────────
  overtimeRecords: {
    type: [{
      date: Date,
      hoursWorked: Number,
      regularHours: Number,
      overtimeHours: Number,
      overtimePay: Number,
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },

  // ─── Leave Balance ──────────────────────────────────────────────────────────
  leaveBalance: {
    annualLeave: { type: Number, default: 7 },
    sickLeave: { type: Number, default: 14 },
    hospitalizationLeave: { type: Number, default: 60 },
    urgentLeave: { type: Number, default: 3 },
    marriageLeave: { type: Number, default: 3 },
    paternityLeave: { type: Number, default: 3 },
    compassionateLeave: { type: Number, default: 3 },
    unpaidLeave: { type: Number, default: 0 },
    homeCountryLeave: { type: Number, default: 0 },
    personalLeave: { type: Number, default: 3 }
  },

  // ─── Warning Records ────────────────────────────────────────────────────────
  warnings: {
    type: [{
      reason: String,
      warningType: {
        type: String,
        enum: ['Safety Violation', 'Misconduct', 'Policy Violation', 'Performance', 'Other'],
        default: 'Other'
      },
      date: Date,
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
      },
      linkedDeduction: { type: Number, default: 0 },
      notes: String,
      issuedBy: String,
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },

  // ─── Performance ────────────────────────────────────────────────────────────
  performance: {
    rating: { type: Number, default: 0, min: 0, max: 5 },
    lastReviewDate: { type: Date, default: null },
    incrementHistory: {
      type: [{
        amount: Number,
        previousSalary: Number,
        newSalary: Number,
        reason: String,
        date: Date,
        createdAt: { type: Date, default: Date.now }
      }],
      default: []
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', workerSchema);