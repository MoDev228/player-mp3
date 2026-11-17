import Main from "./components/Main";
import Home from "./components/Home";
import SettingsPage from "./components/settings/SettingsPage";
import { useCallback, useEffect, useState } from "react";
import { removeLegacyCaches } from "@/lib/cacheCleanup";
import { readSettings, saveSettings } from "@/lib/settingsStorage";

const HOME_HASH = "#/";
const PLAYER_HASH = "#/lecteur";
const SETTINGS_HASH = "#/reglages";

function readRoute() {
  if (typeof window === "undefined") return "home";
  if (window.location.hash === PLAYER_HASH) return "player";
  if (window.location.hash === SETTINGS_HASH) return "settings";
  return "home";
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });
  const [route, setRoute] = useState(readRoute);
  const [settings, setSettings] = useState(readSettings);

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
    if (!window.location.hash || window.location.hash === HOME_HASH) {
      history.replaceState(null, "", HOME_HASH);
    }
  }, []);

  useEffect(() => {
    removeLegacyCaches();
  }, []);

  useEffect(() => {
    document.title = route === "player"
      ? "Quran MP3 — Lecteur"
      : route === "settings"
        ? "Quran MP3 — Réglages"
        : "Quran MP3 — Accueil";
    document.querySelector("main h1")?.focus({ preventScroll: true });
  }, [route]);

  useEffect(() => {
    function handleHashChange() {
      setRoute(readRoute());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const handleSaveSettings = useCallback((nextSettings) => {
    saveSettings(nextSettings);
    setSettings(nextSettings);
  }, []);

  if (route === "player") {
    return (
      <Main theme={theme} onToggleTheme={toggleTheme} settings={settings} />
    );
  }

  if (route === "settings") {
    return (
      <SettingsPage
        theme={theme}
        onToggleTheme={toggleTheme}
        settings={settings}
        onSave={handleSaveSettings}
      />
    );
  }

  return <Home theme={theme} onToggleTheme={toggleTheme} />;
}

export default App;
