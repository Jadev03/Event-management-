const express = require('express');
const {
  createEvent,
  listMyEvents,
  updateMyEvent,
  listPendingEvents,
  listAllEventsForFaculty,
  approveEvent,
  rejectEvent,
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

// Faculty coordinator endpoints
router.get('/pending', listPendingEvents);
router.get('/faculty/all', listAllEventsForFaculty);
router.post('/:id/approve', approveEvent);
router.post('/:id/reject', rejectEvent);

module.exports = router;

