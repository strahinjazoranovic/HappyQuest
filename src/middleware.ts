// Middleware to protect routes and handle authentication


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode("stra");

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.type == "child" && request.url.includes("/dashboard")) {
        return NextResponse.redirect(new URL("/child/" + payload.id, request.url));
      }
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }
 
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|.well-known|_next/image|favicon.ico|login).*)",
  ],
};