import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Payment from "../../../../../lib/models/Payment";
import Booking from "../../../../../lib/models/Booking";
import ParkingSpace from "../../../../../lib/models/ParkingSpace";
import { requireAuth } from "../../../../../lib/apiHelpers";

// GET /api/payments/receipt/[bookingId]
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { error } = await requireAuth(request);
    if (error) return error;

    const payment = await Payment.findOne({ bookingId: params.bookingId });
    if (!payment) return NextResponse.json({ message: "Payment not found" }, { status: 404 });

    const booking = await Booking.findById(params.bookingId).populate("spaceId");
    if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });

    const space = await ParkingSpace.findById(booking.spaceId._id).populate("hostId", "name");
    return NextResponse.json({
      receipt: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        commission: payment.commission,
        hostEarning: payment.hostEarning,
        paymentMethod: payment.paymentMethod,
        parkingSpace: space.title,
        hostName: space.hostId.name,
        entryTime: booking.entryTime,
        exitTime: booking.exitTime,
        durationHours: booking.durationHours,
        issuedAt: payment.createdAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
