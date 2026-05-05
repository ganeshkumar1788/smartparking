import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import ParkingSpace from "../../../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../../../lib/apiHelpers";

// PUT /api/spaces/[id]/live-status
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { occupancy } = await request.json();
    const space = await ParkingSpace.findByIdAndUpdate(
      params.id,
      { $set: { "liveStatus.occupancy": occupancy, "liveStatus.lastUpdated": new Date() } },
      { new: true }
    );
    if (!space) return NextResponse.json({ message: "Space not found" }, { status: 404 });
    return NextResponse.json({ message: "Live status updated successfully", space });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
