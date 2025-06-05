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
  const { points, description } = await request.json();
  const client = await pool.connect();

  try {
    await client.query(
      `UPDATE assigned_tasks
       SET approved_at = NOW(), given_points = $3, description = $4
       WHERE id = $1 AND parent_id = $2`,
      [taskId, userId, points, description]
    );

    await client.query(
      `UPDATE users
       SET earned_points = earned_points + $1
       FROM assigned_tasks at2
       WHERE at2.child_id = users.id
       AND at2.id = $2`,
      [points, taskId]
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