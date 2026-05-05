import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import HostApplication from "../../../../../lib/models/HostApplication";
import User from "../../../../../lib/models/User";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/admin/hosts/applications
export async function GET(request) {
  try {
    await connectDB();
    const { error } = await requireAuth(request, ["admin"]);
    if (error) return error;
    const applications = await HostApplication.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });
    return NextResponse.json({ applications });
  } catch (err) {
    return NextResponse.json({ applications: [] });
  }
}
