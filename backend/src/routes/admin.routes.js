const express = require("express");
const User = require("../models/User");
const HostApplication = require("../models/HostApplication");
const ParkingSpace = require("../models/ParkingSpace");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const PlatformSetting = require("../models/PlatformSetting");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", async (req, res) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ users });
});

router.patch("/users/:id/block", async (req, res) => {
  const { blocked } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: !!blocked }, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

router.get("/hosts/applications", async (req, res) => {
  const applications = await HostApplication.find().populate("userId", "name email role").sort({ createdAt: -1 });
  res.json({ applications });
});

router.patch("/hosts/applications/:id", async (req, res) => {
  const { status, note = "" } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "status must be approved or rejected" });
  }
  const application = await HostApplication.findById(req.params.id);
  if (!application) return res.status(404).json({ message: "Application not found" });
  application.status = status;
  application.note = note;
  await application.save();
  await User.findByIdAndUpdate(application.userId, {
    hostVerified: status === "approved",
    role: status === "approved" ? "host" : "driver"
  });
  res.json({ application });
});

router.get("/spaces", async (req, res) => {
  const spaces = await ParkingSpace.find().populate("hostId", "name email").sort({ createdAt: -1 });
  res.json({ spaces });
});

router.get("/analytics", async (req, res) => {
  const [userCount, hostCount, driverCount, bookingCount, spaceCount, paymentCount] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "host" }),
    User.countDocuments({ role: "driver" }),
    Booking.countDocuments(),
    ParkingSpace.countDocuments(),
    Payment.countDocuments({ status: "success" })
  ]);
  const payments = await Payment.find({ status: "success" }).select("amount commission hostEarning");
  const revenue = payments.reduce(
    (acc, p) => {
      acc.gross += p.amount;
      acc.commission += p.commission;
      acc.hostPayout += p.hostEarning;
      return acc;
    },
    { gross: 0, commission: 0, hostPayout: 0 }
  );
  res.json({
    metrics: {
      userCount,
      hostCount,
      driverCount,
      bookingCount,
      spaceCount,
      paymentCount,
      grossRevenue: Number(revenue.gross.toFixed(2)),
      platformCommission: Number(revenue.commission.toFixed(2)),
      hostPayout: Number(revenue.hostPayout.toFixed(2))
    }
  });
});

router.get("/commission", async (req, res) => {
  const setting = await PlatformSetting.findOne({ key: "commissionPercent" });
  res.json({ commissionPercent: Number(setting?.value || process.env.PLATFORM_COMMISSION_PERCENT || 10) });
});

router.put("/commission", async (req, res) => {
  const { commissionPercent } = req.body;
  const value = Number(commissionPercent);
  if (Number.isNaN(value) || value < 0 || value > 100) {
    return res.status(400).json({ message: "commissionPercent must be a number between 0 and 100" });
  }
  const setting = await PlatformSetting.findOneAndUpdate(
    { key: "commissionPercent" },
    { value },
    { new: true, upsert: true }
  );
  res.json({ commissionPercent: Number(setting.value) });
});

module.exports = router;
