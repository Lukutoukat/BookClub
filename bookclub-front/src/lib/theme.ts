export type Theme = "light" | "dark";

export const getInitialTheme = (): Theme => {
  // Try to get from localStorage first
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  // Fall back to system preference
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

export const applyThemeToDOM = (theme: Theme): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const saveTheme = (theme: Theme): void => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", theme);
  }
};
