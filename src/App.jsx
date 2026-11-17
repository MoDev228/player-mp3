import Main from "./components/Main";
import Home from "./components/Home";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

const PLAYER_HASH = "#/lecteur";

function readRoute() {
  if (typeof window === "undefined") return "home";
  return window.location.hash === PLAYER_HASH ? "player" : "home";
}

function focusPageHeading() {
  requestAnimationFrame(() => {
    document.querySelector("main h1")?.focus({ preventScroll: true });
  });
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#1a1714" : "#ffffff");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!window.location.hash) {
      history.replaceState(null, "", "#/");
    }
  }, []);

  useEffect(() => {
    document.title = route === "player"
      ? "Quran MP3 — Lecteur"
      : "Quran MP3 — Accueil";
  }, [route]);

  useEffect(() => {
    function handleHashChange() {
      const nextRoute = readRoute();
      const updateRoute = () => setRoute(nextRoute);
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (document.startViewTransition && !prefersReducedMotion) {
        try {
          const transition = document.startViewTransition(() => {
            flushSync(updateRoute);
          });
          transition.finished.finally(focusPageHeading);
        } catch {
          updateRoute();
          focusPageHeading();
        }
      } else {
        updateRoute();
        focusPageHeading();
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return route === "player" ? (
    <Main theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <Home theme={theme} onToggleTheme={toggleTheme} />
  );
}

export default App;
