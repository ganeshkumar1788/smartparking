import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/db";
import HostApplication from "../../../../../../lib/models/HostApplication";
import User from "../../../../../../lib/models/User";
import { requireAuth } from "../../../../../../lib/apiHelpers";

// PATCH /api/admin/hosts/applications/[id]
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { error } = await requireAuth(request, ["admin"]);
    if (error) return error;
    const { status, note = "" } = await request.json();
    if (!["approved", "rejected"].includes(status))
      return NextResponse.json({ message: "status must be approved or rejected" }, { status: 400 });

    const application = await HostApplication.findById(params.id);
    if (!application) return NextResponse.json({ message: "Application not found" }, { status: 404 });
    application.status = status;
    application.note = note;
    await application.save();
    await User.findByIdAndUpdate(application.userId, {
      hostVerified: status === "approved",
      role: status === "approved" ? "host" : "driver",
    });
    return NextResponse.json({ application });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
