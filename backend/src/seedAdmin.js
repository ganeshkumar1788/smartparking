require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

const run = async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || "admin@smartpark.local";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: "SmartPark Admin",
    email,
    passwordHash,
    role: "admin",
    hostVerified: true
  });
  console.log(`Admin created: ${email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
