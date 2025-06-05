"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../ui/navbar";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Clear previous errors
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      const userId = data.userId;
      const userType = data.userType;
      if (userType === "parent") {
        router.push("/dashboard/" + userId);
      } else {
        router.push("/child/" + userId);
      }
    } else if (response.status === 401) {
      setErrorMsg("Wrong password or email. Please try again.");
    } else {
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 rounded-2xl shadow-2xl w-84 md:w-128">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 w-full px-4 py-2 border border-black rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 w-full px-4 py-2 border border-black rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {errorMsg && (
              <div className="text-red-600 text-center font-semibold text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn w-full rounded-xl bg-blue-300 border-none flex items-center justify-center"
              disabled={loading}
            >
              {loading && (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="6"
                    />
                    <path
                      className="opacity-75"
                      fill="black"
                      d="M12 2a10 10 0 1 1-7.07 2.93l1.42 1.42A8 8 0 1 0 12 4V2z"
                    />
                  </svg>
                  <span className="text-black">Logging in...</span>
                </span>
              )}
              {!loading && "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
