require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    // Auto-seed admin if using local DB memory or empty DB
    const email = "admin@smartpark.com";
    const exists = await User.findOne({ email });
    if (!exists) {
      const passwordHash = await bcrypt.hash("adminpassword", 10);
      await User.create({
        name: "System Admin",
        email,
        phone: "0000000000",
        role: "admin",
        passwordHash
      });
      console.log("Admin seeded: admin@smartpark.com / adminpassword");
    }

    app.listen(PORT, () => {
      console.log(`SmartPark API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();