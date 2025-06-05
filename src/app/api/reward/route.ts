// This file is used to handle the rewards, allowing CRUD operations on rewards.

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Check if the pool is connected and GET
export async function GET() {
  const client = await pool.connect();

  try {
    const [rewardResult] = await Promise.all([
      client.query("SELECT id, name, points FROM rewards"),
    ]);
    return NextResponse.json({
      rewards: rewardResult.rows,
    });
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

// Create a new reward with POST
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const { name, points } = await request.json();
    if (!name || typeof points !== "number") {
      return NextResponse.json(
        { error: "Invalid input", returnedStatus: 400 },
        { status: 400 }
      );
    }
    const insertRewardResult = await client.query(
      "INSERT INTO rewards (name, points) VALUES ($1, $2) RETURNING id, name, points",
      [name, points]
    );
    return NextResponse.json({
      reward: insertRewardResult.rows[0],
    });
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

// Update a reward by PUT
export async function PUT(request: Request) {
  const client = await pool.connect();
  try {
    const { id, name, points } = await request.json();
    if (!id || !name || typeof points !== "number") {
      return NextResponse.json(
        { error: "Invalid input", returnedStatus: 400 },
        { status: 400 }
      );
    }
    // Update the reward in the database
    const updateResult = await client.query(
      "UPDATE rewards SET name = $1, points = $2 WHERE id = $3 RETURNING id, name, points",
      [name, points, id]
    );
    return NextResponse.json({ reward: updateResult.rows[0] });
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

// Delete a reward by ID
export async function DELETE(request: Request) {
  const client = await pool.connect();
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Invalid input", returnedStatus: 400 },
        { status: 400 }
      );
    }
    // Delete the reward from the database
    await client.query("DELETE FROM rewards WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
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
