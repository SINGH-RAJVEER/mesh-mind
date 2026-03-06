import { createSignal, onMount } from "solid-js";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export default function ThemeToggle() {
  const [theme, setTheme] = createSignal(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") || getSystemTheme();
  });

  onMount(() => {
    const root = window.document.documentElement;
    if (theme() === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme());
  });

  const toggleTheme = () => {
    const newTheme = theme() === "dark" ? "light" : "dark";
    setTheme(newTheme);

    const root = window.document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {theme() === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}
