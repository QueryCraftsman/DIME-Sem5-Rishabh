"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering a stable placeholder state until mounted
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-btn"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-[#776E65] dark:text-[#C1B8AD] hover:text-[#171717] dark:hover:text-[#F4F0E9] hover:bg-[#EFEAE2] dark:hover:bg-[#26231F] border border-transparent hover:border-[#E8E1D8] dark:hover:border-[#34302B] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 transition-all duration-200 cursor-pointer group shrink-0 ${className}`}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
    >
      <span className="sr-only">{label}</span>
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (Rotates and scales in when in dark mode) */}
        <Sun
          className={`w-[19px] h-[19px] text-amber-500 transition-all duration-300 ease-out absolute motion-reduce:transition-none ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
          aria-hidden="true"
        />
        {/* Moon Icon (Rotates and scales in when in light mode) */}
        <Moon
          className={`w-[19px] h-[19px] text-[#514B45] dark:text-[#C1B8AD] group-hover:text-[#171717] dark:group-hover:text-[#F4F0E9] transition-all duration-300 ease-out absolute motion-reduce:transition-none ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
          aria-hidden="true"
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-semibold text-text-strong">
          {isDark ? "Dark theme" : "Light theme"}
        </span>
      )}
    </button>
  );
}
