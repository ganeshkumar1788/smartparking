const mongoose = require("mongoose");

const hostApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    idDocumentUrl: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostApplication", hostApplicationSchema);
