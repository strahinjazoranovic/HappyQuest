// This file is being used to handle assigned_tasks, which are tasks assigned to childeren, and will be used to update the description of the task when it is rejected or approved by the parent.

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Check if the pool is connected and GET the assigned tasks from the parents
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/")[3]; // parent_id

  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      SELECT 
        at2.completed_at, 
        at2.id AS assigned_task_id, 
        COALESCE(at2.task_id, 0) AS task_id,
        COALESCE(at2.task_name, t.name) AS task_name,
        COALESCE(at2.points, t.points) AS points,
        u.name AS child_name, 
        u.id AS child_id,
        at2.approved_at
      FROM assigned_tasks at2
      LEFT JOIN tasks t ON t.id = at2.task_id
      INNER JOIN users u ON u.id = at2.child_id
      WHERE at2.parent_id = $1 AND at2.approved_at IS NULL 
      `,
      [id]
    );
    return NextResponse.json({ assignedTasks: result.rows });
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

// POST request to create a new assigned task
export async function POST(request: Request) {
  const url = new URL(request.url);
  const parentId = url.pathname.split("/")[3];

  const client = await pool.connect();
  try {
    const { task_id, task_name, points, child_id } = await request.json();

    let finalTaskName = task_name;
    const finalTaskId = task_id ?? null;
    let finalPoints = points;

    // If task_id is provided, look up the name and points from the tasks table
    if (task_id) {
      const taskRes = await client.query(
        `SELECT name, points FROM tasks WHERE id = $1`,
        [task_id]
      );
      if (taskRes.rows.length > 0) {
        finalTaskName = taskRes.rows[0].name;
        finalPoints = taskRes.rows[0].points;
      } else {
        finalTaskName = "Unknown Task";
      }
    }

    // Insert the new assigned task, including task_id
    const result = await client.query(
      `
      INSERT INTO assigned_tasks (task_id, task_name, points, child_id, parent_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id AS assigned_task_id, task_id, task_name, points, child_id, parent_id
      `,
      [finalTaskId, finalTaskName, finalPoints, child_id, parentId]
    );

    return NextResponse.json({ assignedTask: result.rows[0] });
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

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const parentId = url.pathname.split("/")[3];
  const client = await pool.connect();
  try {
    const { assigned_task_id } = await request.json();
    const result = await client.query(
      `
  DELETE FROM assigned_tasks
  WHERE id = $1 AND parent_id = $2
  RETURNING id AS assigned_task_id, parent_id;
  `,
      [assigned_task_id, parentId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Task not found", returnedStatus: 404 },
        { status: 404 }
      );
    }
    return NextResponse.json({ deletedTask: result.rows[0] });
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
