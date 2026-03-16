const bcrypt = require('bcrypt');
const { User, USER_ROLES } = require('../models/user.model');
const { logger } = require('../utils/logger');

const generateRandomPassword = (length = 8) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';

  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
};

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, role } = req.body || {};

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ message: 'Name, email and role are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({
        message:
          'Invalid role. Allowed roles are: student, organizer, facultyCoordinator',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'A user with this email already exists' });
    }

    const plainPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      role,
      password: hashedPassword,
    });

    logger.info('Admin created a new user with generated password', {
      createdUserId: user._id.toString(),
      email: user.email,
      role: user.role,
      generatedPassword: plainPassword,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error creating user by admin', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createUserByAdmin,
};

