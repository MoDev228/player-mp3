import { Moon, Sun } from "lucide-react";

function ThemeToggle({ theme, onToggleTheme, className = "" }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
      className={`group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/70 text-primary shadow-sm transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted hover:text-foreground hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${className}`}
    >
      {isDark ? (
        <Sun
          size={17}
          aria-hidden="true"
          className="transition-transform duration-300 ease-out group-hover:rotate-45"
        />
      ) : (
        <Moon
          size={17}
          aria-hidden="true"
          className="transition-transform duration-300 ease-out group-hover:-rotate-12"
        />
      )}
    </button>
  );
}

export default ThemeToggle;
