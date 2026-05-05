import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import Booking from "../../../../../../lib/models/Booking";
import { requireAuth, calcParkingBill, getCommissionPercent } from "../../../../../../lib/apiHelpers";

// POST /api/bookings/[id]/approve
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;
    const booking = await Booking.findById(params.id).populate("spaceId");
    if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    if (String(booking.spaceId.hostId) !== String(user._id))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    booking.status = "confirmed";
    await booking.save();
    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
