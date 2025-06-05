"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
}

const Sidebar = () => {
  const router = useRouter();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch user data for the sidebar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/users/sidebar");
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
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

  const linkClasses = (path: string) =>
    `flex items-center gap-3 text-left px-5 py-3 my-1 rounded-lg transition-all duration-150 font-medium
   ${
     pathname === path
       ? "bg-blue-300 text-white shadow-lg"
       : "hover:bg-blue-100 hover:text-blue-700"
   } border border-transparent hover:border-blue-300`;

  return (
    <>
      {/* Fixed Hamburger Icon (top left, always visible, above content) */}
      <button
        className="md:hidden fixed top-4 left-4 z-[100] bg-blue-300 p-2 rounded shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open sidebar"
        type="button"
      >
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
          <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor" />
          <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
          <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-grey bg-opacity-50 backdrop-blur-sm px-2"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white
          flex flex-col
          w-4/5 max-w-xs
          transition-transform duration-300
          pt-14
          md:static md:w-1/4 md:max-w-none md:translate-x-0 md:pt-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{ minHeight: "100vh" }}
      >
        <div className="px-6 py-6 border-b border-zinc-500 rounded-bl-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-200 text-blue-500 font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl">
              {users.length > 0 ? users[0].name[0] : "?"}
            </div>
            <div>
              <div className="font-bold text-lg">
                {users.length > 0 ? users[0].name : "Loading..."}
              </div>
              <div className=" text-sm">
                {users.length > 0 ? users[0].email : ""}
              </div>
            </div>
          </div>
          <button
            className="btn w-full bg-gradient-to-r from-blue-100 to-blue-300 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-transform hover:scale-105 shadow mt-4"
            onClick={async () => {
              setLoading(true);
              await fetch("/api/logout", { method: "POST" });
              setLoading(false);
              router.push("/login");
            }}
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
                <span className="text-white">Logging out...</span>
              </span>
            )}
            {!loading && "Log out"}
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-2 py-4">
          <Link
            href={users.length > 0 ? `/dashboard/${users[0].id}` : "/dashboard"}
            className={linkClasses(
              users.length > 0 ? `/dashboard/${users[0].id}` : "/dashboard"
            )}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href={users.length > 0 ? `/dashboard/task/${users[0].id}` : "/task"}
            className={linkClasses(
              users.length > 0 ? `/dashboard/task/${users[0].id}` : "/task"
            )}
            onClick={() => setOpen(false)}
          >
            Basic Task
          </Link>
          <Link
            href={
              users.length > 0 ? `/dashboard/reward/${users[0].id}` : "/reward"
            }
            className={linkClasses(
              users.length > 0 ? `/dashboard/reward/${users[0].id}` : "/reward"
            )}
            onClick={() => setOpen(false)}
          >
            Reward Center
          </Link>
          <Link
            href={
              users.length > 0 ? `/dashboard/family/${users[0].id}` : "/family"
            }
            className={linkClasses(
              users.length > 0 ? `/dashboard/family/${users[0].id}` : "/family"
            )}
            onClick={() => setOpen(false)}
          >
            Family Management
          </Link>
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
        </nav>
      </aside>
      {/* Padding for header on mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
};

export default Sidebar;
