import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Booking from "../../../../../lib/models/Booking";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/bookings/my — driver's own bookings
export async function GET(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["driver"]);
    if (error) return error;
    const bookings = await Booking.find({ userId: user._id })
      .populate("spaceId", "title address pricePerHour")
      .sort({ createdAt: -1 });
    return NextResponse.json({ bookings });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
