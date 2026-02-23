const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
require("dotenv").config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartpark");
        console.log("Connected to MongoDB");

        const email = "admin@smartpark.com";
        const password = "adminpassword";

        const exists = await User.findOne({ email });
        if (exists) {
            console.log("Admin account already exists.");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const admin = await User.create({
            name: "System Admin",
            email,
            phone: "0000000000",
            role: "admin",
            passwordHash
        });

        console.log("Admin account created successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
