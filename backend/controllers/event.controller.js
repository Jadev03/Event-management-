const { Event, EVENT_TYPES } = require('../models/event.model');
const { logger } = require('../utils/logger');

const requireOrganizer = (req, res) => {
  const role = req.user?.role;
  if (role !== 'organizer') {
    return res.status(403).json({ message: 'Organizer access required' });
  }
  return null;
};

const createEvent = async (req, res) => {
  try {
    const deny = requireOrganizer(req, res);
    if (deny) return;

    const {
      name,
      description = '',
      type,
      date,
      time,
      place,
      totalSeats,
      thumbnailUrl = '',
    } = req.body || {};

    if (!name || !type || !date || !time || !place || !totalSeats) {
      return res.status(400).json({
        message:
          'name, type, date, time, place and totalSeats are required fields',
      });
    }

    if (!EVENT_TYPES.includes(type)) {
      return res.status(400).json({
        message: 'Invalid event type. Allowed: academic, work, sports, social',
      });
    }

    const seats = Number.parseInt(totalSeats, 10);
    if (!Number.isFinite(seats) || seats < 1) {
      return res
        .status(400)
        .json({ message: 'totalSeats must be a number >= 1' });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const created = await Event.create({
      name: String(name).trim(),
      description: String(description).trim(),
      type,
      date: parsedDate,
      time: String(time).trim(),
      place: String(place).trim(),
      totalSeats: seats,
      thumbnailUrl: String(thumbnailUrl).trim(),
      createdBy: req.user.id,
    });

    logger.info('Event created', {
      eventId: created._id.toString(),
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: created._id.toString(),
        name: created.name,
        description: created.description,
        type: created.type,
        date: created.date,
        time: created.time,
        place: created.place,
        totalSeats: created.totalSeats,
        thumbnailUrl: created.thumbnailUrl,
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error creating event', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const listMyEvents = async (req, res) => {
  try {
    const deny = requireOrganizer(req, res);
    if (deny) return;

    const items = await Event.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      events: items.map((e) => ({
        id: e._id.toString(),
        name: e.name,
        description: e.description,
        type: e.type,
        date: e.date,
        time: e.time,
        place: e.place,
        totalSeats: e.totalSeats,
        thumbnailUrl: e.thumbnailUrl,
        status: e.status,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    logger.error('Error listing organizer events', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateMyEvent = async (req, res) => {
  try {
    const deny = requireOrganizer(req, res);
    if (deny) return;

    const eventId = req.params?.id;
    if (!eventId) {
      return res.status(400).json({ message: 'Event id is required' });
    }

    const event = await Event.findOne({ _id: eventId, createdBy: req.user.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const {
      name,
      description,
      type,
      date,
      time,
      place,
      totalSeats,
      thumbnailUrl,
      status,
    } = req.body || {};

    if (typeof name === 'string') event.name = name.trim();
    if (typeof description === 'string') event.description = description.trim();
    if (typeof type === 'string') {
      if (!EVENT_TYPES.includes(type)) {
        return res.status(400).json({
          message: 'Invalid event type. Allowed: academic, work, sports, social',
        });
      }
      event.type = type;
    }
    if (typeof date === 'string' || date instanceof Date) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
      }
      event.date = parsedDate;
    }
    if (typeof time === 'string') event.time = time.trim();
    if (typeof place === 'string') event.place = place.trim();
    if (totalSeats !== undefined) {
      const seats = Number.parseInt(totalSeats, 10);
      if (!Number.isFinite(seats) || seats < 1) {
        return res
          .status(400)
          .json({ message: 'totalSeats must be a number >= 1' });
      }
      event.totalSeats = seats;
    }
    if (typeof thumbnailUrl === 'string') event.thumbnailUrl = thumbnailUrl.trim();

    // Optional: allow organizer to set status (e.g., mark completed)
    if (typeof status === 'string') {
      const allowed = ['pending', 'completed'];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          message: 'Invalid status update. Allowed: pending, completed',
        });
      }
      event.status = status;
    }

    await event.save();

    return res.status(200).json({
      message: 'Event updated successfully',
      event: {
        id: event._id.toString(),
        name: event.name,
        description: event.description,
        type: event.type,
        date: event.date,
        time: event.time,
        place: event.place,
        totalSeats: event.totalSeats,
        thumbnailUrl: event.thumbnailUrl,
        status: event.status,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error updating event', { message: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createEvent,
  listMyEvents,
  updateMyEvent,
};

