const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { User } = require('../models/user.model');
const { logger } = require('../utils/logger');

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management';

const upsertUserByEmail = async ({
  email,
  legacyEmail,
  password,
  name,
  role,
}) => {
  const normalizedEmail = String(email).trim();
  const normalizedLegacy =
    legacyEmail != null && String(legacyEmail).trim() !== ''
      ? String(legacyEmail).trim()
      : null;

  const overwriteExistingUsers =
    process.env.SEED_OVERWRITE_EXISTING_USERS === 'true';

  const existingByTarget = await User.findOne({
    email: normalizedEmail,
  }).lean();

  const existingByLegacy =
    !existingByTarget && normalizedLegacy
      ? await User.findOne({ email: normalizedLegacy }).lean()
      : null;

  const existing = existingByTarget || existingByLegacy;

  if (existing) {
    if (!overwriteExistingUsers) {
      return { action: 'skipped', email: normalizedEmail };
    }

    // Same MongoDB _id: events/registrations stay linked. Only refresh
    // display name and/or email — never password or role.
    const filter = { _id: existing._id };
    const set = { name };
    if (existing.email !== normalizedEmail) {
      set.email = normalizedEmail;
    }

    await User.updateOne(filter, { $set: set });
    return { action: 'updated', email: normalizedEmail };
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  await User.create({
    email: normalizedEmail,
    password: hashedPassword,
    name,
    role,
  });
  return { action: 'inserted', email: normalizedEmail };
};

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB for seeding users');

    const plainUsers = [
      {
        email: 'banuharan01@gmail.com',
        legacyEmail: 'student1@university.ac.lk',
        password: 'student123',
        name: 'Banuharan',
        role: 'student',
      },
      {
        email: 'jathu01@gmail.com',
        legacyEmail: 'faculty1@university.ac.lk',
        password: 'faculty123',
        name: 'Jathushikan',
        role: 'facultyCoordinator',
      },
      {
        email: 'banusan01@gmail.com',
        legacyEmail: 'organizer1@university.ac.lk',
        password: 'organizer123',
        name: 'Banusan',
        role: 'organizer',
      },
      {
        email: 'tharshi01@gmail.com',
        legacyEmail: 'admin1@university.ac.lk',
        password: 'admin123',
        name: 'Tharsi',
        role: 'admin',
      },
    ];

    let inserted = 0;
    let skipped = 0;
    let updated = 0;
    for (const u of plainUsers) {
      const result = await upsertUserByEmail(u);
      if (result.action === 'inserted') inserted += 1;
      else if (result.action === 'skipped') skipped += 1;
      else if (result.action === 'updated') updated += 1;
    }

    logger.info('Seed users done', { inserted, skipped, updated });

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB after seeding users');
  } catch (error) {
    logger.error('Error seeding users', { message: error.message });
    process.exit(1);
  }
};

seedUsers();

