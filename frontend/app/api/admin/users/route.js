import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../lib/models/User";
import HostApplication from "../../../../lib/models/HostApplication";
import ParkingSpace from "../../../../lib/models/ParkingSpace";
import Booking from "../../../../lib/models/Booking";
import Payment from "../../../../lib/models/Payment";
import PlatformSetting from "../../../../lib/models/PlatformSetting";
import { requireAuth } from "../../../../lib/apiHelpers";

async function adminAuth(request) {
  await connectDB();
  const { user, error } = await requireAuth(request, ["admin"]);
  return { user, error };
}

// GET /api/admin/users
export async function GET(request) {
  try {
    const { error } = await adminAuth(request);
    if (error) return error;
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
