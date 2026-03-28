const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
  },
  subdomain: {
    type: String,
    required: [true, 'Company name is missing'],
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  // ─── Leave Policies ────────────────────────────────────────────────────────
  leavePolicy: {
    annualLeaveLimit: { type: Number, default: 7 },
    sickLeaveLimit: { type: Number, default: 14 },
    hospitalizationLeaveLimit: { type: Number, default: 60 },
    urgentLeaveLimit: { type: Number, default: 3 },
    marriageLeaveLimit: { type: Number, default: 3 },
    paternityLeaveLimit: { type: Number, default: 3 },
    compassionateLeaveLimit: { type: Number, default: 3 },
    eligibilityMonths: { type: Number, default: 3 },          // months before leave allowed
    normalNoticeDays: { type: Number, default: 7 },           // notice days for normal leave
    homeCountryNoticeDays: { type: Number, default: 30 },     // notice days for home country
    preventContinuousLeaveDays: { type: Number, default: 0 }, // 0 = disabled
    requireReturnTicketDays: { type: Number, default: 7 }     // require ticket if leave >= X days
  },

  // ─── Salary Structure ──────────────────────────────────────────────────────
  salaryPolicy: {
    baseSalary: { type: Number, default: 0 },           // dept default base salary
    overtimeRateMultiplier: { type: Number, default: 1.5 }, // 1.5x
    maxOvertimeHoursPerMonth: { type: Number, default: 72 },
    regularHoursPerDay: { type: Number, default: 8 },
    regularHoursPerWeek: { type: Number, default: 44 },
    maxDeductionPercent: { type: Number, default: 50 }  // max deduction % of salary
  },

  // ─── Working Hours / Shift ─────────────────────────────────────────────────
  workingHours: {
    shiftStart: { type: String, default: '09:00' },
    shiftEnd: { type: String, default: '18:00' },
    workDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  },

  // ─── Approval Hierarchy ────────────────────────────────────────────────────
  approvalHierarchy: {
    requireManagerApproval: { type: Boolean, default: false },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null }
  }
}, {
  timestamps: true
});

departmentSchema.pre('save', async function (next) {
  console.log('Pre-save Hook - Original Name:', this.name);

  if (this.isModified('name')) {
    this.name = this.name.trim();
    console.log('Pre-save Hook - Processed Name:', this.name);

    const existingDepartment = await this.constructor.findOne({
      name: this.name
    });

    if (existingDepartment && existingDepartment._id.toString() !== this._id.toString()) {
      const error = new Error('A department with this name already exists');
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Department', departmentSchema);