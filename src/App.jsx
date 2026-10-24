import Main from "./components/Main";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Changer de thème"
        className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-card border shadow-sm transition-colors hover:bg-muted"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <Main />
    </>
  );
}

export default App;
