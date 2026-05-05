import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Payment from "../../../../../lib/models/Payment";
import Booking from "../../../../../lib/models/Booking";
import ParkingSpace from "../../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/payments/host/earnings
export async function GET(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;

    const spaces = await ParkingSpace.find({ hostId: user._id }).select("_id");
    const spaceIds = spaces.map((s) => s._id);
    const bookings = await Booking.find({ spaceId: { $in: spaceIds }, status: "completed" }).select("_id hostEarning");
    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({ bookingId: { $in: bookingIds }, status: "success" }).sort({ createdAt: -1 });

    let total = 0;
    payments.forEach((p) => { total += p.hostEarning || 0; });
    bookings.forEach((b) => { total += b.hostEarning || 0; });

    return NextResponse.json({ totalEarnings: Number(total.toFixed(2)), payments, bookings });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
