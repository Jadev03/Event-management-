const mongoose = require('mongoose');

const USER_ROLES = ['student', 'organizer', 'facultyCoordinator', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES,
    },
    passwordResetOtpHash: {
      type: String,
      default: null,
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetLastSentAt: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Persistent admin-visible security alert for repeated failed logins.
    // NOTE: This should NOT auto-clear on successful login; admin must mark as read.
    loginSecurityAlertActive: {
      type: Boolean,
      default: false,
    },
    loginSecurityAlertTriggeredAt: {
      type: Date,
      default: null,
    },
    loginSecurityAlertReadAt: {
      type: Date,
      default: null,
    },
    isDeactivated: {
      type: Boolean,
      default: false,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    deactivatedReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  USER_ROLES,
};

