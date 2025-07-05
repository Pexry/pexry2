// src/app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the auth cookie
  response.headers.set(
    "Set-Cookie",
    "payload-token=; Path=/; HttpOnly; Max-Age=0"
  );

  return response;
}
