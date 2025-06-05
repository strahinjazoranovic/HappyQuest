// This file is being used to handle assigned tasks completion actions for the childeren.

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string; taskId: string }> }
) {
  const { userId, taskId } = await params;

  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE assigned_tasks
       SET completed_at = NOW()
       WHERE id = $1 AND child_id = $2`,
      [taskId, userId]
    );

    return NextResponse.json({ status: 200 });
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
