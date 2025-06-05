// This file handles the API route for fetching users on the sidebar

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// GET all users (for /api/users)
export async function GET() {
  const client = await pool.connect();
  try {
    const usersResult = await client.query(
      "SELECT id, name, email FROM users WHERE type = 'parent' ORDER BY name ASC"
    );
    return NextResponse.json({ users: usersResult.rows });
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