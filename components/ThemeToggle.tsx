
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        {isDark ? (
          <Sun
            key="sun"
            className="absolute h-5 w-5 animate-[spin_0.45s_ease-out] text-amber-400 transition-transform duration-300 group-hover:rotate-45"
          />
        ) : (
          <Moon
            key="moon"
            className="absolute h-5 w-5 animate-[spin_0.45s_ease-out] text-slate-700 transition-transform duration-300 group-hover:-rotate-12 dark:text-slate-200"
          />
        )}
      </span>
    </button>
  );
}
