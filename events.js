const express = require("express");
const Event = require("../models/Event");
const router = express.Router();

// Middleware to verify user authentication
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Create Event
router.post("/", authMiddleware, async (req, res) => {
  try {
    const event = new Event({ ...req.body, createdBy: req.user.id });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Events
router.get("/", async (req, res) => {
  const events = await Event.find().populate("createdBy", "name");
  res.json(events);
});

// Attend Event
router.post("/:eventId/attend", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.attendees.push(req.user.id);
    await event.save();
    res.json({ message: "You have joined the event" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
