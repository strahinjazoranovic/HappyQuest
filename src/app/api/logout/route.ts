// This file is used to handle user logout and will clear the JWT token cookie

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // Expire immediately
  });
  return response;
}