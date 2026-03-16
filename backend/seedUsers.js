const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { User } = require('./models/user.model');
const { logger } = require('./utils/logger');

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB for seeding users');

    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      logger.warn('Users already exist, skipping seeding');
      await mongoose.disconnect();
      return;
    }

    const plainUsers = [
      {
        email: 'student1@university.ac.lk',
        password: 'student123',
        name: 'Student One',
        role: 'student',
      },
      {
        email: 'faculty1@university.ac.lk',
        password: 'faculty123',
        name: 'Faculty Coordinator',
        role: 'facultyCoordinator',
      },
      {
        email: 'organizer1@university.ac.lk',
        password: 'organizer123',
        name: 'Event Organizer',
        role: 'organizer',
      },
      {
        email: 'admin1@university.ac.lk',
        password: 'admin123',
        name: 'System Admin',
        role: 'admin',
      },
    ];

    const saltRounds = 10;

    const usersToInsert = await Promise.all(
      plainUsers.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, saltRounds);
        return {
          email: u.email.toLowerCase(),
          password: hashedPassword,
          name: u.name,
          role: u.role,
        };
      })
    );

    await User.insertMany(usersToInsert);
    logger.info('Default users seeded successfully');

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB after seeding');
  } catch (error) {
    logger.error('Error seeding users', { message: error.message });
    process.exit(1);
  }
};

seedUsers();

