import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/apiHelpers";
import { connectDB } from "../../../../lib/db";

export async function GET(request) {
  await connectDB();
  const { user, error } = await requireAuth(request);
  if (error) return error;
  return NextResponse.json({ user });
}
