const mongoose = require("mongoose");
const Booking = require("./src/models/Booking");
require("dotenv").config();

const clearBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartpark");
        console.log("Connected to MongoDB");

        const result = await Booking.deleteMany({});
        console.log(`Deleted ${result.deletedCount} bookings from the database.`);

        process.exit(0);
    } catch (error) {
        console.error("Error clearing bookings:", error);
        process.exit(1);
    }
};

clearBookings();
