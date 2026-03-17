const express = require('express');
const {
  createEvent,
  listMyEvents,
  updateMyEvent,
} = require('../controllers/event.controller');

const router = express.Router();

// Organizer event endpoints
router.post('/', createEvent);
router.get('/mine', listMyEvents);
router.put('/:id', updateMyEvent);

module.exports = router;

