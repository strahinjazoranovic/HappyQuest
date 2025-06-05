// This file is being handled to fetch points for all the children

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/")[3];
  
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      "SELECT id, name, earned_points FROM users WHERE id = $1",
       [id]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(userResult.rows[0]);
  } catch (err) {
    console.error("ERROR: API - ", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message, returnedStatus: 500 },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = url.pathname.split("/")[3]; // user_id from URL

  const client = await pool.connect();
  try {
    const { points } = await request.json();
    if (typeof points !== "number" || points <= 0) {
      return NextResponse.json(
        { error: "Invalid points value", returnedStatus: 400 },
        { status: 400 }
      );
    }

    // Update the user's earned points
    const result = await client.query(
      "UPDATE users SET earned_points = earned_points + $1 WHERE id = $2 RETURNING id, name, earned_points",
      [points, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR: API - ", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message, returnedStatus: 500 },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
