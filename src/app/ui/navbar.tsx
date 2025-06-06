"use client"
import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";


const Navbar = () => {
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
    <nav className="z-1 w-full pl-10 pr-10 pt-5 pb-5">
      <div className="flex items-center justify-between">
        <Link href="/">
          <h1 className="text-left text-4xl">
            <span className="text-blue-300">Happy</span>Quest
          </h1>
        </Link>
        <div className="flex">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
