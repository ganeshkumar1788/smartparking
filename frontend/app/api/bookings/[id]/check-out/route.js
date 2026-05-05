import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import Booking from "../../../../../../lib/models/Booking";
import { requireAuth, calcParkingBill, getCommissionPercent } from "../../../../../../lib/apiHelpers";

// POST /api/bookings/[id]/check-out
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;

    const { qrToken } = await request.json();
    const booking = await Booking.findById(params.id).populate("spaceId");
    if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    if (String(booking.spaceId.hostId) !== String(user._id))
      return NextResponse.json({ message: "Forbidden: You are not the host of this space" }, { status: 403 });
    if (booking.qrToken !== qrToken)
      return NextResponse.json({ message: "Invalid QR token" }, { status: 400 });
    if (booking.status !== "active" || !booking.entryTime)
      return NextResponse.json({ message: "Booking is not active" }, { status: 400 });

    const exitTime = new Date();
    const commissionPercent = await getCommissionPercent();
    const summary = calcParkingBill({
      entryTime: booking.entryTime,
      exitTime,
      expectedDurationHours: booking.expectedDurationHours,
      pricePerHour: booking.spaceId.pricePerHour,
      commissionPercent,
    });

    booking.exitTime = exitTime;
    booking.durationHours = summary.durationHours;
    booking.totalAmount = summary.totalAmount;
    booking.commission = summary.commission;
    booking.hostEarning = summary.hostEarning;
    booking.status = "completed";
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate("userId", "name phone");
    return NextResponse.json({ booking: populatedBooking, summary });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
