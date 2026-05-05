import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Booking from "../../../../../lib/models/Booking";
import ParkingSpace from "../../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/bookings/host — host sees all bookings for their spaces
export async function GET(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;
    const spaces = await ParkingSpace.find({ hostId: user._id }).select("_id");
    const spaceIds = spaces.map((s) => s._id);
    const bookings = await Booking.find({ spaceId: { $in: spaceIds } })
      .populate("spaceId", "title")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json({ bookings });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
