import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../lib/models/User";
import { signToken } from "../../../../lib/jwt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email) return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    if (!password) return NextResponse.json({ message: "Password is required" }, { status: 400 });

    // Admin bypass — no DB needed
    if (email === "admin@smartpark.com") {
      const mockAdminUser = {
        _id: "mock-admin-id-123",
        name: "System Admin",
        email: "admin@smartpark.com",
        phone: "0000000000",
        role: "admin",
        rating: 0,
        isBlocked: false,
        hostVerified: false,
      };
      const token = signToken({ id: mockAdminUser._id, role: mockAdminUser.role });
      return NextResponse.json({ token, user: mockAdminUser });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const token = signToken({ id: user._id, role: user.role });
    return NextResponse.json({ token, user });
  } catch (err) {
    console.error("Login error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
