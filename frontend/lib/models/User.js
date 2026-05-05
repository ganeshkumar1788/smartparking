import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    role: { type: String, enum: ["driver", "host", "admin"], default: "driver" },
    rating: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    hostVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
