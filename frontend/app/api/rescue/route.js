// This rescue route is no longer needed — the backend is now built into Next.js.
// Kept as a passthrough to avoid breaking any existing callers.
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Backend is now integrated into Next.js" });
}
