const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: Number, required: true },
    commission: { type: Number, required: true },
    hostEarning: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["upi", "card", "wallet"], required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ["success", "failed"], default: "success" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
