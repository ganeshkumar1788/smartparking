import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import ParkingSpace from "../../../../lib/models/ParkingSpace";
import Review from "../../../../lib/models/Review";
import { requireAuth } from "../../../../lib/apiHelpers";

// GET /api/spaces
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filters = { isActive: true };
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const vehicleType = searchParams.get("vehicleType");
    const minRating = searchParams.get("minRating");

    if (minPrice || maxPrice) {
      filters.pricePerHour = {};
      if (minPrice) filters.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filters.pricePerHour.$lte = Number(maxPrice);
    }
    if (vehicleType) filters.vehicleType = vehicleType;
    if (minRating) filters.rating = { $gte: Number(minRating) };

    const spaces = await ParkingSpace.find(filters).sort({ createdAt: -1 });
    return NextResponse.json({ spaces });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// POST /api/spaces
export async function POST(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["host"]);
    if (error) return error;
    if (!user.hostVerified) return NextResponse.json({ message: "Host is not verified by admin" }, { status: 403 });

    const body = await request.json();

    const slots = [];
    const vehicleTypeArr = [];
    if (body.capacities && Array.isArray(body.capacities)) {
      body.capacities.forEach((cap) => {
        const prefix = cap.type === "car" ? "C" : cap.type === "bike" ? "B" : cap.type === "ev" ? "E" : "T";
        for (let i = 1; i <= cap.count; i++) {
          slots.push({ slotId: `${prefix}${i}`, vehicleType: cap.type, isActive: true });
        }
        if (!vehicleTypeArr.includes(cap.type)) vehicleTypeArr.push(cap.type);
      });
    }

    const payload = {
      ...body,
      hostId: user._id,
      slots: slots.length > 0 ? slots : [{ slotId: "A1", vehicleType: body.vehicleType?.[0] || "car", isActive: true }],
      vehicleType: vehicleTypeArr.length > 0 ? vehicleTypeArr : body.vehicleType || ["car"],
    };

    const space = await ParkingSpace.create(payload);
    return NextResponse.json({ space }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
