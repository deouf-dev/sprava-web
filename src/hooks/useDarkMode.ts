import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sprava_theme");
    const enabled = saved
      ? saved === "dark"
      : document.documentElement.classList.contains("dark");

    setIsDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("sprava_theme", next ? "dark" : "light");
      return next;
    });
  };

  return { isDark, toggle };
}
