import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpace", required: true },
    slotId: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },
    vehicleNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    expectedDurationHours: { type: Number, required: true },
    scheduledStart: { type: Date, default: null },
    scheduledEnd: { type: Date, default: null },
    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null },
    durationHours: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    hostEarning: { type: Number, default: 0 },
    qrToken: { type: String, required: true },
    qrCodeDataUrl: { type: String, default: null },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
