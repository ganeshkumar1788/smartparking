import { NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import User from "./models/User";
import { connectDB } from "./db";

// Returns { user } or throws a NextResponse error
export async function requireAuth(request, roles = []) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { error: NextResponse.json({ message: "Not authenticated" }, { status: 401 }) };
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return { error: NextResponse.json({ message: "Invalid or expired token" }, { status: 401 }) };
  }

  // Admin mock bypass
  if (decoded.id === "mock-admin-id-123" && decoded.role === "admin") {
    const mockAdmin = {
      _id: "mock-admin-id-123",
      name: "System Admin",
      email: "admin@smartpark.com",
      phone: "0000000000",
      role: "admin",
      rating: 0,
      isBlocked: false,
      hostVerified: false,
    };
    if (roles.length && !roles.includes("admin")) {
      return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
    }
    return { user: mockAdmin };
  }

  await connectDB();
  const user = await User.findById(decoded.id).select("-passwordHash");
  if (!user) return { error: NextResponse.json({ message: "User not found" }, { status: 401 }) };
  if (user.isBlocked) return { error: NextResponse.json({ message: "Account blocked" }, { status: 403 }) };
  if (roles.length && !roles.includes(user.role)) {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export const calcParkingBill = ({ entryTime, exitTime, expectedDurationHours = 0, pricePerHour, commissionPercent }) => {
  const ms = Math.max(0, new Date(exitTime).getTime() - new Date(entryTime).getTime());
  const actualHours = ms / (1000 * 60 * 60);
  const billableHours = Math.max(expectedDurationHours, actualHours);
  const roundedHours = Math.max(0.25, Number(billableHours.toFixed(2)));
  const totalAmount = Number((roundedHours * pricePerHour).toFixed(2));
  const commission = Number(((totalAmount * commissionPercent) / 100).toFixed(2));
  const hostEarning = Number((totalAmount - commission).toFixed(2));
  return { durationHours: roundedHours, totalAmount, commission, hostEarning };
};

export async function getCommissionPercent() {
  try {
    const PlatformSetting = (await import("./models/PlatformSetting")).default;
    const setting = await PlatformSetting.findOne({ key: "commissionPercent" });
    return Number(setting?.value || process.env.PLATFORM_COMMISSION_PERCENT || 10);
  } catch {
    return Number(process.env.PLATFORM_COMMISSION_PERCENT || 10);
  }
}
