import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Booking from "../../../../../lib/models/Booking";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/bookings/space/[spaceId]/availability
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    if (!start || !end) return NextResponse.json({ message: "start and end are required" }, { status: 400 });

    const startTime = new Date(start);
    const endTime = new Date(end);

    const conflicts = await Booking.find({
      spaceId: params.spaceId,
      status: { $in: ["confirmed", "active", "pending"] },
      $or: [
        { scheduledStart: { $lte: startTime }, scheduledEnd: { $gt: startTime } },
        { scheduledStart: { $lt: endTime }, scheduledEnd: { $gte: endTime } },
        { scheduledStart: { $gte: startTime }, scheduledEnd: { $lte: endTime } },
      ],
    }).select("slotId");

    const bookedSlotIds = conflicts.map((b) => b.slotId).filter(Boolean);
    return NextResponse.json({ bookedSlotIds });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
