import { NextResponse } from "next/server";

// GET /api/health — simple health check, no backend needed
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
