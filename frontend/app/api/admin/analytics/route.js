import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../lib/models/User";
import Booking from "../../../../lib/models/Booking";
import ParkingSpace from "../../../../lib/models/ParkingSpace";
import Payment from "../../../../lib/models/Payment";
import { requireAuth } from "../../../../lib/apiHelpers";

// GET /api/admin/analytics
export async function GET(request) {
  try {
    await connectDB();
    const { error } = await requireAuth(request, ["admin"]);
    if (error) return error;

    const [userCount, hostCount, driverCount, bookingCount, spaceCount, paymentCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "host" }),
      User.countDocuments({ role: "driver" }),
      Booking.countDocuments(),
      ParkingSpace.countDocuments(),
      Payment.countDocuments({ status: "success" }),
    ]);

    const payments = await Payment.find({ status: "success" }).select("amount commission hostEarning");
    const completedBookings = await Booking.find({ status: "completed" }).select("totalAmount commission hostEarning");

    let gross = 0, commission = 0, hostPayout = 0;
    payments.forEach((p) => { gross += p.amount || 0; commission += p.commission || 0; hostPayout += p.hostEarning || 0; });
    completedBookings.forEach((b) => { gross += b.totalAmount || 0; commission += b.commission || 0; hostPayout += b.hostEarning || 0; });

    return NextResponse.json({
      metrics: {
        userCount, hostCount, driverCount, bookingCount, spaceCount, paymentCount,
        grossRevenue: Number(gross.toFixed(2)),
        platformCommission: Number(commission.toFixed(2)),
        hostPayout: Number(hostPayout.toFixed(2)),
      },
    });
  } catch (err) {
    return NextResponse.json({
      metrics: { userCount: 0, hostCount: 0, driverCount: 0, bookingCount: 0, spaceCount: 0, paymentCount: 0, grossRevenue: 0, platformCommission: 0, hostPayout: 0 },
    });
  }
}
