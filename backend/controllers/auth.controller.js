const {
  authenticateUserDetailed,
  AUTH_FAILURE_REASON,
} = require('../services/auth.service');
const { logger } = require('../utils/logger');
const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const ADMIN_ALERT_THRESHOLD = 3;
const AUTO_DEACTIVATE_THRESHOLD = 10;

const printDevEmail = ({ to, subject, body }) => {
  // eslint-disable-next-line no-console
  console.log(
    `\n========== DEV EMAIL ==========\nTo: ${to}\nSubject: ${subject}\n\n${body}\n===============================\n`,
  );
};

const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const clearPasswordResetFields = (user) => {
  user.passwordResetOtpHash = null;
  user.passwordResetOtpExpiresAt = null;
  // keep passwordResetLastSentAt for rate-limit context; clear on successful reset
  user.passwordResetLastSentAt = null;
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { email });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim();
    const result = await authenticateUserDetailed(normalizedEmail, password);

    if (!result.ok) {
      if (result.reason === AUTH_FAILURE_REASON.DEACTIVATED) {
        logger.warn('Login blocked: account deactivated', { email: normalizedEmail });
        return res.status(403).json({
          message:
            'Your account is temporarily blocked. Please contact the administrator.',
        });
      }

      if (result.reason === AUTH_FAILURE_REASON.INVALID_PASSWORD && result.user) {
        const userDoc = result.user;

        // Requirement: only Student/FacultyCoordinator/Organizer are tracked & enforced.
        if (userDoc.role === 'admin') {
          logger.warn('Invalid login attempt (admin - not counted)', {
            email: normalizedEmail,
          });
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const nextAttempts = (userDoc.failedLoginAttempts || 0) + 1;
        userDoc.failedLoginAttempts = nextAttempts;

        if (nextAttempts >= AUTO_DEACTIVATE_THRESHOLD) {
          userDoc.isDeactivated = true;
          userDoc.deactivatedAt = new Date();
          userDoc.deactivatedReason = 'too_many_failed_logins';

          // Reset attempts on deactivation so admin re-activation starts clean.
          userDoc.failedLoginAttempts = 0;

          await userDoc.save();

          logger.warn('Auto-deactivated account due to failed logins', {
            email: userDoc.email,
            role: userDoc.role,
          });

          printDevEmail({
            to: userDoc.email,
            subject: 'Account temporarily blocked',
            body:
              'Your account has been temporarily blocked due to too many failed login attempts.\n' +
              'Please contact the administrator to reactivate your account.',
          });

          return res.status(403).json({
            message:
              'Your account is temporarily blocked. Please contact the administrator.',
          });
        }

        await userDoc.save();

        if (nextAttempts === ADMIN_ALERT_THRESHOLD) {
          logger.warn('Admin alert: 3 consecutive failed logins', {
            email: userDoc.email,
            role: userDoc.role,
            failedLoginAttempts: nextAttempts,
          });
          printDevEmail({
            to: 'admin@university.ac.lk',
            subject: 'Security alert: repeated failed login attempts',
            body:
              `User ${userDoc.email} (${userDoc.role}) has ${ADMIN_ALERT_THRESHOLD} consecutive failed login attempts.\n` +
              'Admin can decide whether to deactivate this account.',
          });
        }

        logger.warn('Invalid login attempt', { email: normalizedEmail });
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // user not found: do not leak details, no counter update
      logger.warn('Invalid login attempt', { email: normalizedEmail });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userDoc = result.user;

    // Successful login resets counter (requirement).
    if (userDoc.failedLoginAttempts && userDoc.failedLoginAttempts > 0) {
      userDoc.failedLoginAttempts = 0;
      await userDoc.save();
    }

    req.authUser = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
    };

    logger.info('User authenticated successfully', {
      email: userDoc.email,
      role: userDoc.role,
    });

    return next();
  } catch (error) {
    logger.error('Error during login', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body || {};

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Old password, new password, and confirm password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: 'New password and confirm password do not match' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOldMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    logger.info('Password changed successfully', { userId });
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error during changePassword', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = (req.body?.email || '').trim();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const now = Date.now();
    if (
      user.passwordResetLastSentAt &&
      now - user.passwordResetLastSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      const retryAfterSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - user.passwordResetLastSentAt.getTime())) /
          1000,
      );
      return res.status(429).json({
        message: 'Please wait before requesting another code',
        retryAfterSeconds,
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpiresAt = new Date(now + OTP_EXPIRY_MS);
    user.passwordResetLastSentAt = new Date(now);
    await user.save();

    logger.info('Password reset OTP (dev: also printed for support)', {
      email: user.email,
      role: user.role,
      otp,
    });
    // eslint-disable-next-line no-console
    console.log(
      `\n========== PASSWORD RESET OTP ==========\nEmail: ${user.email}\nOTP: ${otp}\nExpires in: 5 minutes\n========================================\n`,
    );

    const expiresAt = user.passwordResetOtpExpiresAt.toISOString();
    const resendAvailableAt = new Date(now + RESEND_COOLDOWN_MS).toISOString();

    return res.status(200).json({
      message: 'Verification code sent. Check the server terminal for the OTP in development.',
      expiresAt,
      resendAvailableAt,
      otpExpiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
    });
  } catch (error) {
    logger.error('Error during forgotPassword', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  try {
    const email = (req.body?.email || '').trim();
    const otp = (req.body?.otp || '').trim();
    const { newPassword, confirmPassword } = req.body || {};

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Email, OTP, new password, and confirm password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: 'New password and confirm password do not match' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOtpHash) {
      return res.status(400).json({
        message: 'Invalid or expired verification code. Request a new code.',
      });
    }

    if (
      !user.passwordResetOtpExpiresAt ||
      user.passwordResetOtpExpiresAt.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        message: 'Verification code has expired. Request a new code.',
      });
    }

    const otpOk = await bcrypt.compare(otp, user.passwordResetOtpHash);
    if (!otpOk) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    clearPasswordResetFields(user);
    await user.save();

    logger.info('Password reset via OTP completed', { email: user.email });
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error during resetPasswordWithOtp', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  changePassword,
  forgotPassword,
  resetPasswordWithOtp,
};

