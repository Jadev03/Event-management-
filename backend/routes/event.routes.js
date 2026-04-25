const express = require('express');
const {
  createEvent,
  listMyEvents,
  updateMyEvent,
  listPendingEvents,
  listAllEventsForFaculty,
  listApprovedEvents,
  approveEvent,
  rejectEvent,
  updateDecisionComment,
  checkInQr,
  getOrganizerOverview,
  registerForEvent,
  getStudentRegistrations,
  getStudentTickets,
  cancelMyRegistration,
  getOrganizerMonthlyEventStatusAnalytics,
} = require('../controllers/event.controller');

const router = express.Router();

// Organizer event endpoints
router.post('/', createEvent);
router.get('/overview', getOrganizerOverview);
router.get('/analytics/events-by-month', getOrganizerMonthlyEventStatusAnalytics);
router.get('/mine', listMyEvents);
router.get('/approved', listApprovedEvents);
router.put('/:id', updateMyEvent);
router.post('/:id/checkin', checkInQr);
router.post('/:id/register', registerForEvent);

// Student endpoints
router.get('/student/registrations', getStudentRegistrations);
router.get('/student/tickets', getStudentTickets);
router.post('/:id/cancel', cancelMyRegistration);

// Faculty coordinator endpoints
router.get('/pending', listPendingEvents);
router.get('/faculty/all', listAllEventsForFaculty);
router.post('/:id/approve', approveEvent);
router.post('/:id/reject', rejectEvent);
router.patch('/:id/comment', updateDecisionComment);

module.exports = router;

