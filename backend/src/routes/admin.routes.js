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
  try {
    const applications = await HostApplication.find().populate("userId", "name email role").sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    console.error("DB Error in /hosts/applications:", err.message);
    res.json({ applications: [] });
  }
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
  try {
    const [userCount, hostCount, driverCount, bookingCount, spaceCount, paymentCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "host" }),
      User.countDocuments({ role: "driver" }),
      Booking.countDocuments(),
      ParkingSpace.countDocuments(),
      Payment.countDocuments({ status: "success" })
    ]);

    const payments = await Payment.find({ status: "success" }).select("amount commission hostEarning");
    const completedBookings = await Booking.find({ status: "completed" }).select("totalAmount commission hostEarning");

    let gross = 0;
    let commission = 0;
    let hostPayout = 0;

    payments.forEach(p => {
      gross += p.amount || 0;
      commission += p.commission || 0;
      hostPayout += p.hostEarning || 0;
    });

    completedBookings.forEach(b => {
      gross += b.totalAmount || 0;
      commission += b.commission || 0;
      hostPayout += b.hostEarning || 0;
    });

    res.json({
      metrics: {
        userCount,
        hostCount,
        driverCount,
        bookingCount,
        spaceCount,
        paymentCount,
        grossRevenue: Number(gross.toFixed(2)),
        platformCommission: Number(commission.toFixed(2)),
        hostPayout: Number(hostPayout.toFixed(2))
      }
    });
  } catch (err) {
    console.error("DB Error in /analytics:", err.message);
    res.json({
      metrics: {
        userCount: 0, hostCount: 0, driverCount: 0,
        bookingCount: 0, spaceCount: 0, paymentCount: 0,
        grossRevenue: 0, platformCommission: 0, hostPayout: 0
      }
    });
  }
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
