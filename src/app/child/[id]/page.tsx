"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Define the Task interface
interface Task {
  assigned_task_id: number;
  points: number;
  task_name: string;
  child_name: string;
  child_id: number;
  approved_at: Date | null;
  completed_at: Date | null;
  description?: string;
}

export default function ChildTaskPage() {
  const params = useParams();
  const { id } = params;
  const [tasks, setTasks] = useState<Task[]>([]);

  // State for earned points
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [childName, setChildName] = useState<string>("");

  // State for leaderboard
  const [leaderbord, setLeaderbord] = useState<
    { name: string; earned_points: number }[]
  >([]);

  // Fetch assigned tasks for the child from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(`/api/users/${id}/child/dashboard`);
        const response = await data.json();
        setTasks(
          Array.isArray(response.assignedTasks) ? response.assignedTasks : []
        );
        if (typeof response.earned_points === "number") {
          setEarnedPoints(response.earned_points);
        }
        if (typeof response.child_name === "string") {
          setChildName(response.child_name);
        }
      } catch (error) {
        setTasks([]);
        setEarnedPoints(0);
        setChildName("");
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  // Fetch points for the logged-in child
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(`/api/users/${id}/points`);
        const data = await response.json();
        if (typeof data.earned_points === "number") {
          setEarnedPoints(data.earned_points);
        }
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };
    fetchPoints();
  }, [id]);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderbord = async () => {
      try {
        const response = await fetch(`/api/users/leaderbord`);
        const data = await response.json();
        setLeaderbord(Array.isArray(data.leaderbord) ? data.leaderbord : []);
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };
    fetchLeaderbord();
  }, []);

  const [dark, setDark] = useState(false);

  useEffect(() => {
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
        setDark(true);
      }
    }, []);
  
    const toggleDark = () => {
      if (dark) {
        document.documentElement.classList.remove("dark");
        localStorage.theme = "light";
        setDark(false);
      } else {
        document.documentElement.classList.add("dark");
        localStorage.theme = "dark";
        setDark(true);
      }
    };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-center p-6 bg-white shadow-xl backdrop-blur-md border-b border-zinc-300">
        <h1 className="text-3xl font-bold tracking-tight">
          {childName ? childName : "Child"}
          <button
            onClick={toggleDark}
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 100,
              background: dark ? "#7c3aed" : "#a5b4fc",
              color: dark ? "#f4f4f5" : "#23232b",    
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: "pointer",
            }}
            aria-label="Toggle dark mode"
          >
            {dark ? "🌞" : "🌙"}
          </button>
        </h1>
      </header>
      {/* Padding for header on mobile */}
      <div className="h-16 md:hidden" />

      <div className="flex flex-col lg:flex-row w-full p-8 gap-10">
        {/* Unfinished Tasks Section */}
        <div className="flex-1 mb-8 lg:mb-0">
          <h2 className="text-3xl font-bold mb-5">Unfinished Tasks</h2>
          <ul className="grid grid-cols-1 gap-6 pb-2">
            {tasks.length === 0 && (
              <li className="text-gray-500 m-5 col-span-full text-center">
                No tasks.
              </li>
            )}
            {tasks.map((task) => (
              <li
                key={task.assigned_task_id}
                className="bg-white backdrop-blur-md rounded-xl shadow-xl border border-zinc-400 p-6 flex flex-col items-start"
              >
                <div className="flex w-full items-center mb-2">
                  <span className="font-semibold text-3xl truncate">
                    {task.task_name}
                  </span>
                  <span className="ml-auto text-xl font-semibold text-blue-300">
                    {task.points} pts
                  </span>
                </div>
                {/* Show rejection reason if task is not completed and has a description */}
                {task.completed_at == null && task.description != null && (
                  <div className="mt-2 text-red-600 font-semibold text-base">
                    Rejection reason: {task.description}
                  </div>
                )}
                {/* Show complete button only if task is not completed */}
                {task.completed_at == null && (
                  <button
                    className="btn mt-4 p-2 bg-blue-300 text-white text-lg w-full rounded transition-transform hover:scale-102"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/users/${id}/assigned-tasks/${task.assigned_task_id}/actions/complete`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                          }
                        );
                        if (response.ok) {
                          setTasks((prev) =>
                            prev.filter(
                              (t) => t.assigned_task_id !== task.assigned_task_id
                            )
                          );
                        } else {
                          console.error("Failed to complete task");
                        }
                      } catch (error) {
                        console.error("Error completing task:", error);
                      }
                    }}
                  >
                    Complete Task and earn {task.points} pts!
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Leaderboard Section */}
        <div className="w-full lg:w-1/3">
          <div className="text-center lg:text-right backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 mb-4">
              <h2 className="text-3xl font-bold">Leaderboard</h2>
              <h1 className="text-lg">
                Your points:{" "}
                <span className="text-2xl font-bold text-blue-300">{earnedPoints}</span>
              </h1>
            </div>
            <ul className="space-y-4">
              {leaderbord.length === 0 && (
                <li className="text-gray-500 text-center">
                  No leaderboard data.
                </li>
              )}
              {leaderbord.map((user) => (
                <li
                  key={user.name}
                  className="bg-white backdrop-blur-md rounded-xl shadow-xl border border-zinc-400 p-6 flex justify-between items-center"
                >
                  <span className="text-xl font-semibold">{user.name}</span>
                  <span className="text-lg text-blue-300">
                    {user.earned_points} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}