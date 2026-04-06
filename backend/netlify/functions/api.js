const serverless = require("serverless-http");
const app = require("../../src/app");
const connectDB = require("../../src/config/db");

// Ensure the database is connected when the lambda function boots up
connectDB();

// Wrap the Express app using serverless-http
module.exports.handler = serverless(app);
