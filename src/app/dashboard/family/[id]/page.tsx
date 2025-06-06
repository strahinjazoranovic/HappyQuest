"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../ui/sidebar";

// Define the User interface
interface User {
  id: number;
  name: string;
  type?: string;
}

export default function FamilyPointsPage() {
  const [children, setChildren] = useState<User[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [points, setPoints] = useState<number>(0);

  // State for loading
  const [loading, setLoading] = useState(false);

  // State for success and error messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch children from the API so you can give points to them
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        const childrenArr = Array.isArray(data.users)
          ? data.users.filter(
              (u: User) =>
                u.type &&
                (u.type.toLowerCase() === "child" ||
                  u.type.toLowerCase() === "children")
            )
          : [];
        setChildren(childrenArr);
      } catch (error) {
        console.error("Failed to fetch children:", error);
      }
    };
    fetchChildren();
  }, []);

  // Handle giving points to a child using an API call
  const handleGivePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/users/${userId}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });
      if (response.ok) {
        setSuccessMsg("Points successfully given!");
        setPoints(0);
      } else {
        setErrorMsg("Failed to give points.");
      }
    } catch (error) {
      console.error("Error giving points:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="flex flex-col w-full md:w-3/4">
        <header className="flex items-center justify-center p-4 sm:p-6 mb-4 sm:mb-8 shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Family Management
          </h1>
        </header>
        <main className="flex flex-col items-center justify-center w-full px-2 sm:px-8 py-4 gap-6">
          <form
            onSubmit={handleGivePoints}
            className="rounded-2xl shadow-2xl border border-zinc-400 p-4 sm:p-8 flex flex-col gap-6 w-full max-w-md"
          >
            <label className="font-semibold text-lg">
              Select Child:
              <select
                className="w-full border border-blue-200 rounded p-2 mt-1 focus:ring-2 focus:ring-blue-300 transition"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Choose a child
                </option>
                {children.map((child) => (
                  <option key={child.id} value={child.id} className="text-black">
                    {child.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="font-semibold text-lg">
              Points:
              <input
                type="number"
                className="w-full border border-blue-200 rounded p-2 mt-1 focus:ring-2 focus:ring-blue-300 transition"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={1}
                required
              />
            </label>
            <button
              type="submit"
              className="btn bg-blue-300 text-white font-bold p-3 rounded-lg mt-2 shadow hover:scale-105 transition-transform"
              disabled={loading}
            >
              {loading ? "Giving Points..." : "Give Points"}
            </button>
            {successMsg && (
              <div className="text-green-600 font-semibold text-center">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="text-red-600 font-semibold text-center">
                {errorMsg}
              </div>
            )}
          </form>
        </main>
      </div>
      <Sidebar />
    </div>
  );
}
