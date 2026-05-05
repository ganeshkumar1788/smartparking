import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "../../../../lib/db";
import Payment from "../../../../lib/models/Payment";
import Booking from "../../../../lib/models/Booking";
import ParkingSpace from "../../../../lib/models/ParkingSpace";
import { requireAuth, getCommissionPercent } from "../../../../lib/apiHelpers";

// POST /api/payments
export async function POST(request) {
  try {
    await connectDB();
    const { user, error } = await requireAuth(request, ["driver"]);
    if (error) return error;

    const { bookingId, paymentMethod } = await request.json();
    const booking = await Booking.findById(bookingId).populate("spaceId");
    if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    if (String(booking.userId) !== String(user._id))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    if (booking.status !== "completed")
      return NextResponse.json({ message: "Check-out required before payment" }, { status: 400 });

    const existing = await Payment.findOne({ bookingId });
    if (existing) return NextResponse.json({ message: "Payment already completed", payment: existing }, { status: 409 });

    const commissionPercent = await getCommissionPercent();
    const commission = Number(((booking.totalAmount * commissionPercent) / 100).toFixed(2));
    const hostEarning = Number((booking.totalAmount - commission).toFixed(2));

    const payment = await Payment.create({
      bookingId,
      amount: booking.totalAmount,
      commission,
      hostEarning,
      paymentMethod,
      transactionId: `TXN-${crypto.randomUUID()}`,
      status: "success",
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
