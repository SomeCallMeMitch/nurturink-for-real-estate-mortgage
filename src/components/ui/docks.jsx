import React from "react";
import { Sun, Moon, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useDarkMode } from "@/components/hooks/useDarkMode";

export function Docks() {
  const navigate = useNavigate();
  const { isDark, setLightMode, setDarkMode } = useDarkMode();

  const handleSettingsClick = () => {
    navigate(createPageUrl("Settings"));
  };

  return (
    <div
      className="
        inline-flex rounded-lg overflow-hidden relative
        bg-white/90 dark:bg-gray-900/90
        backdrop-blur-md
        shadow-lg shadow-black/10 dark:shadow-black/40
        border border-gray-200 dark:border-gray-700
        transition-all duration-500
      "
    >
      <button
        onClick={setLightMode}
        className={`
          px-4 py-2 rounded-l-lg
          flex items-center gap-2
          transition-all duration-300
          focus:outline-none focus:ring-0
          border-r border-gray-200 dark:border-gray-700
          group
          ${
            !isDark
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
        aria-label="Toggle Light Mode"
        aria-pressed={!isDark}
      >
        <Sun
          className={`
            w-5 h-5
            transition-transform duration-300
            ${!isDark ? "scale-110" : "group-hover:scale-110"}
          `}
          aria-hidden="true"
        />
        <span className="select-none font-medium">Light</span>
      </button>

      <button
        onClick={setDarkMode}
        className={`
          px-4 py-2
          flex items-center gap-2
          transition-all duration-300
          focus:outline-none focus:ring-0
          border-r border-gray-200 dark:border-gray-700
          group
          ${
            isDark
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
        aria-label="Toggle Dark Mode"
        aria-pressed={isDark}
      >
        <Moon
          className={`
            w-5 h-5
            transition-transform duration-300
            ${isDark ? "scale-110" : "group-hover:scale-110"}
          `}
          aria-hidden="true"
        />
        <span className="select-none font-medium">Dark</span>
      </button>

      <button
        onClick={handleSettingsClick}
        className="
          px-4 py-2 rounded-r-lg
          flex items-center gap-2
          text-gray-700 dark:text-gray-300
          bg-transparent
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-all duration-300
          focus:outline-none focus:ring-0
          group
        "
        aria-label="Open Settings"
      >
        <Settings
          className="
            w-5 h-5
            transition-transform duration-300
            group-hover:rotate-90 group-hover:scale-110
          "
          aria-hidden="true"
        />
        <span className="select-none font-medium">Settings</span>
      </button>
    </div>
  );
}