const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000 // Timeout after 15s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to Atlas: ${error.message}`);
    console.log("Falling back to local in-memory MongoDB...");
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`Local In-Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (localError) {
      console.error(`Error starting in-memory DB: ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
