const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { logger, requestLogger } = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const eventRoutes = require('./routes/event.routes');
const { authenticate, requireAdmin } = require('./middleware/auth.middleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, requireAdmin, adminRoutes);
app.use('/api/events', authenticate, eventRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('Error connecting to MongoDB', { message: err.message });
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Event Management backend is running' });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

