import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Review from "../../../../lib/models/Review";
import Booking from "../../../../lib/models/Booking";
import ParkingSpace from "../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../lib/apiHelpers";

// POST /api/reviews
export async function POST(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["driver"]);
    if (error) return error;
    const { bookingId, spaceId, rating, comment } = await request.json();

    const booking = await Booking.findOne({ _id: bookingId, userId: user._id });
    if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    if (booking.isReviewed) return NextResponse.json({ message: "Already reviewed" }, { status: 409 });

    const review = await Review.create({ bookingId, userId: user._id, spaceId, rating, comment });
    booking.isReviewed = true;
    await booking.save();

    // Update space rating
    const allReviews = await Review.find({ spaceId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await ParkingSpace.findByIdAndUpdate(spaceId, { rating: Number(avgRating.toFixed(1)), reviewCount: allReviews.length });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
