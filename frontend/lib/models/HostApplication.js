import mongoose from "mongoose";

const hostApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    idDocumentUrl: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.HostApplication || mongoose.model("HostApplication", hostApplicationSchema);
