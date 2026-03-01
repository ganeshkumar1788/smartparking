const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const ParkingSpace = require("../models/ParkingSpace");
const { protect, authorize } = require("../middleware/auth");
const { calcParkingBill } = require("../utils/calc");
const { getCommissionPercent } = require("../utils/platform");

const router = express.Router();

// Get availability for a specific space's slots
router.get("/space/:spaceId/availability", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: "Start and end times are required" });
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    // Find all bookings for this space that overlap with the requested time
    const conflictingBookings = await Booking.find({
      spaceId: req.params.spaceId,
      status: { $in: ["confirmed", "active", "pending"] },
      $or: [
        { scheduledStart: { $lte: startTime }, scheduledEnd: { $gt: startTime } },
        { scheduledStart: { $lt: endTime }, scheduledEnd: { $gte: endTime } },
        { scheduledStart: { $gte: startTime }, scheduledEnd: { $lte: endTime } }
      ]
    }).select("slotId");

    const bookedSlotIds = conflictingBookings.map(b => b.slotId).filter(Boolean);
    res.json({ bookedSlotIds });
  } catch (error) {
    res.status(500).json({ message: "Error fetching availability", error: error.message });
  }
});

router.post("/", protect, authorize("driver"), async (req, res) => {
  const { spaceId, slotId, scheduledStart, scheduledEnd, vehicleNumber, phoneNumber, expectedDurationHours } = req.body;
  const space = await ParkingSpace.findById(spaceId);
  if (!space || !space.isActive) return res.status(404).json({ message: "Space not found" });

  if (scheduledStart && scheduledEnd) {
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    if (start >= end) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    // Conflict Resolution: Find overlapping bookings for this specific space AND slot
    const query = {
      spaceId,
      status: { $in: ["confirmed", "active", "pending"] },
      $or: [
        { scheduledStart: { $lte: start }, scheduledEnd: { $gt: start } },
        { scheduledStart: { $lt: end }, scheduledEnd: { $gte: end } },
        { scheduledStart: { $gte: start }, scheduledEnd: { $lte: end } }
      ]
    };
    if (slotId) query.slotId = slotId;

    const conflictingBooking = await Booking.findOne(query);

    if (conflictingBooking) {
      return res.status(409).json({ message: "This parking slot is already booked during the selected time period." });
    }
  }

  const qrToken = crypto.randomBytes(16).toString("hex");

  // Create a placeholder booking so we can get its _id for the QR payload
  const booking = await Booking.create({
    userId: req.user._id,
    spaceId,
    slotId,
    scheduledStart: scheduledStart || null,
    scheduledEnd: scheduledEnd || null,
    status: space.autoApproveBookings ? "confirmed" : "pending",
    vehicleNumber,
    phoneNumber,
    expectedDurationHours,
    qrToken
  });

  const qrPayload = JSON.stringify({ bookingId: booking._id, qrToken });
  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

  // We save the generated data URL back to the DB to prevent needing to re-generate it on GET requests
  booking.qrCodeDataUrl = qrCodeDataUrl;
  await booking.save();

  res.status(201).json({ booking, qrCodeDataUrl });
});

router.get("/my", protect, authorize("driver"), async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("spaceId", "title address pricePerHour")
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

router.get("/host", protect, authorize("host"), async (req, res) => {
  const spaces = await ParkingSpace.find({ hostId: req.user._id }).select("_id");
  const spaceIds = spaces.map((s) => s._id);
  const bookings = await Booking.find({ spaceId: { $in: spaceIds } })
    .populate("spaceId", "title")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

router.post("/:id/approve", protect, authorize("host"), async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("spaceId");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (String(booking.spaceId.hostId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  booking.status = "confirmed";
  await booking.save();
  res.json({ booking });
});

router.post("/:id/check-in", protect, authorize("host"), async (req, res) => {
  const { qrToken } = req.body;
  const booking = await Booking.findById(req.params.id).populate("spaceId");

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  // Verify that the person scanning is the host of this space
  if (String(booking.spaceId.hostId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden: You are not the host of this space" });
  }

  if (booking.qrToken !== qrToken) return res.status(400).json({ message: "Invalid QR token" });
  if (!["confirmed", "pending"].includes(booking.status)) {
    return res.status(400).json({ message: "Booking is not eligible for check-in" });
  }

  booking.entryTime = new Date();
  booking.status = "active";
  await booking.save();

  // Re-fetch populated for frontend
  const populatedBooking = await Booking.findById(booking._id).populate("userId", "name phone");
  res.json({ booking: populatedBooking });
});

router.post("/:id/check-out", protect, authorize("host"), async (req, res) => {
  const { qrToken } = req.body;
  const booking = await Booking.findById(req.params.id).populate("spaceId");

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  // Verify that the person scanning is the host of this space
  if (String(booking.spaceId.hostId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden: You are not the host of this space" });
  }

  if (booking.qrToken !== qrToken) return res.status(400).json({ message: "Invalid QR token" });
  if (booking.status !== "active" || !booking.entryTime) {
    return res.status(400).json({ message: "Booking is not active" });
  }

  const exitTime = new Date();
  const commissionPercent = await getCommissionPercent();
  const summary = calcParkingBill({
    entryTime: booking.entryTime,
    exitTime,
    expectedDurationHours: booking.expectedDurationHours,
    pricePerHour: booking.spaceId.pricePerHour,
    commissionPercent
  });

  booking.exitTime = exitTime;
  booking.durationHours = summary.durationHours;
  booking.totalAmount = summary.totalAmount;
  booking.commission = summary.commission;
  booking.hostEarning = summary.hostEarning;
  booking.status = "completed";
  await booking.save();

  // Re-fetch populated for frontend
  const populatedBooking = await Booking.findById(booking._id).populate("userId", "name phone");
  res.json({ booking: populatedBooking, summary });
});

module.exports = router;
