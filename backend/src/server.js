require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = 5001; // Hardcoded to bypass ghost ports

const start = async () => {
  // Bind to port IMMEDIATELY so frontend doesn't get 'Failed to fetch'
  // while waiting for MongoDB/MongoMemoryServer to initialize.
  app.listen(PORT, () => {
    console.log(`SmartPark API running on port ${PORT}`);
  });

  // connectDB handles Atlas -> in-memory fallback internally
  await connectDB();

  // Auto-seed admin safely (won't crash if this fails)
  try {
    const User = require("./models/User");
    const bcrypt = require("bcryptjs");
    const email = "admin@smartpark.com";
    const exists = await User.findOne({ email });
    if (!exists) {
      const passwordHash = await bcrypt.hash("adminpassword", 10);
      await User.create({
        name: "System Admin",
        email: email,
        phone: "0000000000",
        role: "admin",
        passwordHash: passwordHash
      });
      console.log("Admin seeded: admin@smartpark.com / adminpassword");
    }
  } catch (seedErr) {
    console.warn("Admin seed skipped:", seedErr.message);
  }
};

start().catch((err) => {
  console.error("Fatal startup error:", err.message);
  process.exit(1);
});