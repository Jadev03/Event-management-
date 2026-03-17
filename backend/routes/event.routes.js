const express = require('express');
const {
  createEvent,
  listMyEvents,
  updateMyEvent,
  checkInQr,
  getOrganizerOverview,
} = require('../controllers/event.controller');

const router = express.Router();

// Organizer event endpoints
router.post('/', createEvent);
router.get('/overview', getOrganizerOverview);
router.get('/mine', listMyEvents);
router.put('/:id', updateMyEvent);
router.post('/:id/checkin', checkInQr);

module.exports = router;

