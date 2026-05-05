import { NextResponse } from "next/server";
import crypto from "crypto";
import QRCode from "qrcode";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../lib/models/Booking";
import ParkingSpace from "../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../lib/apiHelpers";

// POST /api/bookings — create a booking (driver only)
export async function POST(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["driver"]);
    if (error) return error;

    const { spaceId, slotId, scheduledStart, scheduledEnd, vehicleNumber, phoneNumber, expectedDurationHours } =
      await request.json();

    const space = await ParkingSpace.findById(spaceId);
    if (!space || !space.isActive) return NextResponse.json({ message: "Space not found" }, { status: 404 });

    if (scheduledStart && scheduledEnd) {
      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);
      if (start >= end) return NextResponse.json({ message: "End time must be after start time." }, { status: 400 });

      const query = {
        spaceId,
        status: { $in: ["confirmed", "active", "pending"] },
        $or: [
          { scheduledStart: { $lte: start }, scheduledEnd: { $gt: start } },
          { scheduledStart: { $lt: end }, scheduledEnd: { $gte: end } },
          { scheduledStart: { $gte: start }, scheduledEnd: { $lte: end } },
        ],
      };
      if (slotId) query.slotId = slotId;

      const conflict = await Booking.findOne(query);
      if (conflict) return NextResponse.json({ message: "This slot is already booked for that time." }, { status: 409 });
    }

    const qrToken = crypto.randomBytes(16).toString("hex");
    const booking = await Booking.create({
      userId: user._id,
      spaceId,
      slotId,
      scheduledStart: scheduledStart || null,
      scheduledEnd: scheduledEnd || null,
      status: space.autoApproveBookings ? "confirmed" : "pending",
      vehicleNumber,
      phoneNumber,
      expectedDurationHours,
      qrToken,
    });

    const qrPayload = JSON.stringify({ bookingId: booking._id, qrToken });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);
    booking.qrCodeDataUrl = qrCodeDataUrl;
    await booking.save();

    return NextResponse.json({ booking, qrCodeDataUrl }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
