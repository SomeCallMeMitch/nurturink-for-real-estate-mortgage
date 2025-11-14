import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return stored === "true";
    }
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Persist to localStorage
    localStorage.setItem("darkMode", isDark.toString());
  }, [isDark]);

  const setLightMode = () => setIsDark(false);
  const setDarkMode = () => setIsDark(true);
  const toggleDarkMode = () => setIsDark((prev) => !prev);

  return {
    isDark,
    setLightMode,
    setDarkMode,
    toggleDarkMode,
  };
}