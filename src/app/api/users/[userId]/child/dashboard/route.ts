// This file is being used to handle assigned tasks and fetch them for the childeren

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
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/")[3];

  const client = await pool.connect();
  try {
    const resultTasks = await client.query(
      `
      SELECT 
        at2.completed_at, 
        at2.id AS assigned_task_id, 
        at2.points, 
        at2.task_name,
        at2.description,
        u.id AS child_id
      FROM assigned_tasks at2
      LEFT JOIN tasks t ON t.id = at2.task_id
      INNER JOIN users u ON u.id = at2.child_id
      WHERE at2.child_id = $1 AND at2.completed_at IS NULL
      `,
      [id]
    );
    return NextResponse.json({ assignedTasks: resultTasks.rows});
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
