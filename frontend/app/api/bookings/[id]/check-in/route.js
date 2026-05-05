import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import Booking from "../../../../../../lib/models/Booking";
import { requireAuth } from "../../../../../../lib/apiHelpers";

// POST /api/bookings/[id]/check-in
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
    if (!["confirmed", "pending"].includes(booking.status))
      return NextResponse.json({ message: "Booking is not eligible for check-in" }, { status: 400 });

    booking.entryTime = new Date();
    booking.status = "active";
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate("userId", "name phone");
    return NextResponse.json({ booking: populatedBooking });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
