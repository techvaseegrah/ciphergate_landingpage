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
    sparse: true // Allow nulls while maintaining uniqueness
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
    type: [[Number]], // Storing arrays of numbers for face embeddings
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', workerSchema);