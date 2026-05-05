import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import User from "../../../../../lib/models/User";
import { requireAuth } from "../../../../../lib/apiHelpers";

// PATCH /api/admin/users/[id]/block
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { error } = await requireAuth(request, ["admin"]);
    if (error) return error;
    const { blocked } = await request.json();
    const user = await User.findByIdAndUpdate(params.id, { isBlocked: !!blocked }, { new: true }).select("-passwordHash");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
