import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import ParkingSpace from "../../../../../lib/models/ParkingSpace";
import Review from "../../../../../lib/models/Review";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/spaces/[id]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const space = await ParkingSpace.findById(params.id).populate("hostId", "name rating");
    if (!space) return NextResponse.json({ message: "Space not found" }, { status: 404 });
    const reviews = await Review.find({ spaceId: space._id }).sort({ createdAt: -1 }).limit(10);
    return NextResponse.json({ space, reviews });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// PUT /api/spaces/[id]
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;
    const body = await request.json();
    const space = await ParkingSpace.findOneAndUpdate(
      { _id: params.id, hostId: user._id },
      body,
      { new: true }
    );
    if (!space) return NextResponse.json({ message: "Space not found" }, { status: 404 });
    return NextResponse.json({ space });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// DELETE /api/spaces/[id]
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;
    const space = await ParkingSpace.findOneAndUpdate(
      { _id: params.id, hostId: user._id },
      { isActive: false },
      { new: true }
    );
    if (!space) return NextResponse.json({ message: "Space not found" }, { status: 404 });
    return NextResponse.json({ message: "Space disabled" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
