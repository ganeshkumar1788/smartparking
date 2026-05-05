import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../lib/db";
import User from "../../../../lib/models/User";
import HostApplication from "../../../../lib/models/HostApplication";
import { signToken } from "../../../../lib/jwt";

export async function POST(request) {
  try {
    const { name, email, phone, password, role = "driver" } = await request.json();

    if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });
    if (!email || !/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });

    await connectDB();
    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ message: "Email already registered" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone: phone || "", role, passwordHash });
    if (role === "host") await HostApplication.create({ userId: user._id });

    const token = signToken({ id: user._id, role: user.role });
    return NextResponse.json({ token, user }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
