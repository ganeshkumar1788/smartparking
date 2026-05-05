import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import ParkingSpace from "../../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/spaces/host/my/list
export async function GET(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;
    const spaces = await ParkingSpace.find({ hostId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json({ spaces });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
