const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, default: '', trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    role: { type: String, default: '' },
    success: { type: Boolean, required: true },
    reason: { type: String, default: '' },
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

loginAttemptSchema.index({ attemptedAt: 1 });
loginAttemptSchema.index({ userId: 1, attemptedAt: 1 });

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

module.exports = { LoginAttempt };

