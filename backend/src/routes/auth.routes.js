const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const HostApplication = require("../models/HostApplication");
const { signToken } = require("../utils/jwt");
const { protect } = require("../middleware/auth");
const { verifyFirebaseToken } = require("../config/firebase");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["driver", "host"]).withMessage("Invalid role")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }
    const { name, email, phone, password, role = "driver" } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, role, passwordHash });
    if (role === "host") await HostApplication.create({ userId: user._id });

    const token = signToken({ id: user._id, role: user.role });
    res.status(201).json({ token, user });
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }
    const { email, password } = req.body;

    // Temporary bypass for admin login due to MongoDB IP Whitelist issues
    if (email === "admin@smartpark.com") {
      const mockAdminUser = {
        _id: "mock-admin-id-123",
        name: "System Admin",
        email: "admin@smartpark.com",
        phone: "0000000000",
        role: "admin",
        rating: 0,
        isBlocked: false,
        hostVerified: false,
      };
      const token = signToken({ id: mockAdminUser._id, role: mockAdminUser.role });
      return res.json({ token, user: mockAdminUser });
    }

    // Normal DB login flow
    try {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const token = signToken({ id: user._id, role: user.role });
      res.json({ token, user });
    } catch (dbError) {
      console.error("DB Login Error:", dbError.message);
      return res.status(500).json({ message: "Database connection error. Try the admin account." });
    }
  });

router.post("/firebase", async (req, res) => {
  const { idToken, role = "driver" } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken is required" });

  try {
    const decoded = await verifyFirebaseToken(idToken);
    const email = decoded.email || `${decoded.uid}@firebase.local`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: decoded.name || "Firebase User",
        email,
        phone: decoded.phone_number || "",
        role
      });
      if (role === "host") await HostApplication.create({ userId: user._id });
    }
    const token = signToken({ id: user._id, role: user.role });
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ message: err.message || "Invalid Firebase token" });
  }
});

router.get("/me", protect, async (req, res) => res.json({ user: req.user }));

module.exports = router;
