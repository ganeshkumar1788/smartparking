const express = require("express");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const ParkingSpace = require("../models/ParkingSpace");
const { protect, authorize } = require("../middleware/auth");
const { getCommissionPercent } = require("../utils/platform");

const router = express.Router();

router.post("/", protect, authorize("driver"), async (req, res) => {
  const { bookingId, paymentMethod } = req.body;
  const booking = await Booking.findById(bookingId).populate("spaceId");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (String(booking.userId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (booking.status !== "completed") {
    return res.status(400).json({ message: "Check-out required before payment" });
  }

  const existing = await Payment.findOne({ bookingId });
  if (existing) return res.status(409).json({ message: "Payment already completed", payment: existing });

  const commissionPercent = await getCommissionPercent();
  const commission = Number(((booking.totalAmount * commissionPercent) / 100).toFixed(2));
  const hostEarning = Number((booking.totalAmount - commission).toFixed(2));

  const payment = await Payment.create({
    bookingId,
    amount: booking.totalAmount,
    commission,
    hostEarning,
    paymentMethod,
    transactionId: `TXN-${crypto.randomUUID()}`,
    status: "success"
  });

  res.status(201).json({ payment });
});

router.get("/receipt/:bookingId", protect, async (req, res) => {
  const payment = await Payment.findOne({ bookingId: req.params.bookingId });
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  const booking = await Booking.findById(req.params.bookingId).populate("spaceId");
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const space = await ParkingSpace.findById(booking.spaceId._id).populate("hostId", "name");
  res.json({
    receipt: {
      transactionId: payment.transactionId,
      amount: payment.amount,
      commission: payment.commission,
      hostEarning: payment.hostEarning,
      paymentMethod: payment.paymentMethod,
      parkingSpace: space.title,
      hostName: space.hostId.name,
      entryTime: booking.entryTime,
      exitTime: booking.exitTime,
      durationHours: booking.durationHours,
      issuedAt: payment.createdAt
    }
  });
});

router.get("/host/earnings", protect, authorize("host"), async (req, res) => {
  const spaces = await ParkingSpace.find({ hostId: req.user._id }).select("_id");
  const spaceIds = spaces.map((s) => s._id);
  const bookings = await Booking.find({ spaceId: { $in: spaceIds }, status: "completed" }).select("_id hostEarning");
  const bookingIds = bookings.map((b) => b._id);
  const payments = await Payment.find({ bookingId: { $in: bookingIds }, status: "success" }).sort({ createdAt: -1 });

  let total = 0;

  // Sum earnings from formal payment records
  payments.forEach(p => { total += p.hostEarning || 0; });

  // Sum earnings directly stored on completed bookings (QR offline payments)
  bookings.forEach(b => { total += b.hostEarning || 0; });

  res.json({ totalEarnings: Number(total.toFixed(2)), payments, bookings });
});

module.exports = router;
