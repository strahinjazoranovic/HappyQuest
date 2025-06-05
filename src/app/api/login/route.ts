// This file is used to handle user login and return a JWT token that lasts 60 minutes

import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Handle user login and return JWT token
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const { email, password } = await request.json();
    const userResult = await client.query(
      "select id, email, password, type from users where email = $1",
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json(
        { error: "User not found", returnedStatus: 401 },
        { status: 401 }
      );
    }
    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials", returnedStatus: 401 },
        { status: 401 }
      );
    }
    // Create a JWT token
    const token = jwt.sign({ email: user.email, type: user.type, id: user.id }, "stra", {
      expiresIn: "1h",
    });
    // Set JWT as cookie
    const response = NextResponse.json({ userId: user.id, userType: user.type });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
    return response;
  } finally {
    client.release();
  }
}
