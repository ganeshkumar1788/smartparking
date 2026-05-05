import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import ParkingSpace from "../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../lib/apiHelpers";

// GET /api/admin/spaces
export async function GET(request) {
  try {
    await connectDB();
    const { error } = await requireAuth(request, ["admin"]);
    if (error) return error;
    const spaces = await ParkingSpace.find().populate("hostId", "name email").sort({ createdAt: -1 });
    return NextResponse.json({ spaces });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
