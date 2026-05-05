import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import PlatformSetting from "../../../../lib/models/PlatformSetting";
import { requireAuth } from "../../../../lib/apiHelpers";

// GET /api/admin/commission
export async function GET(request) {
  try {
    await connectDB();
    const { error } = await requireAuth(request, ["admin"]);
    if (error) return error;
    const setting = await PlatformSetting.findOne({ key: "commissionPercent" });
    return NextResponse.json({ commissionPercent: Number(setting?.value || process.env.PLATFORM_COMMISSION_PERCENT || 10) });
  } catch (err) {
    return NextResponse.json({ commissionPercent: 10 });
  }
}

// PUT /api/admin/commission
export async function PUT(request) {
  try {
    await connectDB();
    const { error } = await requireAuth(request, ["admin"]);
    if (error) return error;
    const { commissionPercent } = await request.json();
    const value = Number(commissionPercent);
    if (Number.isNaN(value) || value < 0 || value > 100)
      return NextResponse.json({ message: "commissionPercent must be between 0 and 100" }, { status: 400 });
    const setting = await PlatformSetting.findOneAndUpdate(
      { key: "commissionPercent" }, { value }, { new: true, upsert: true }
    );
    return NextResponse.json({ commissionPercent: Number(setting.value) });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
