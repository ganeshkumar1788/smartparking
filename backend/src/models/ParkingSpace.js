const mongoose = require("mongoose");

const parkingSpaceSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    pricePerHour: { type: Number, required: true, min: 0 },
    slots: [
      {
        slotId: { type: String, required: true },
        vehicleType: { type: String, enum: ["car", "bike", "ev", "truck"], required: true },
        isActive: { type: Boolean, default: true }
      }
    ],
    vehicleType: [{ type: String, enum: ["car", "bike", "ev", "truck"] }], // Legacy format for existing active spaces
    images: [{ type: String }],
    availability: [
      {
        day: String,
        from: String,
        to: String
      }
    ],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    autoApproveBookings: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    liveStatus: {
      isCameraActive: { type: Boolean, default: false },
      cameraUrl: { type: String, trim: true },
      occupancy: [
        {
          slotId: { type: String, required: true },
          isOccupied: { type: Boolean, default: false }
        }
      ],
      lastUpdated: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParkingSpace", parkingSpaceSchema);
