import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Download,
  History,
  Keyboard,
  Play,
  RotateCcw,
} from "lucide-react";
import { readSavedPlayback, savePlayback } from "@/lib/playbackStorage";
import InstallPrompt from "./InstallPrompt";
import ThemeToggle from "./ThemeToggle";
import GitHubLink from "./GitHubLink";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Verset par verset",
  },
  {
    icon: Download,
    title: "Hors connexion",
  },
  {
    icon: History,
    title: "Reprise automatique",
  },
  {
    icon: Keyboard,
    title: "Raccourcis clavier",
  },
];

const ACTION_BASE =
  "flex items-center justify-center gap-2 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";
const ACTION_FILLED = `${ACTION_BASE} bg-primary text-primary-foreground transition-transform motion-safe:hover:scale-[1.02]`;
const ACTION_ICON =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function formatTime(time) {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Home({ theme, onToggleTheme }) {
  const [savedPlayback] = useState(readSavedPlayback);
  const hasSavedPlayback = Boolean(savedPlayback);

  function restartSurah() {
    if (!savedPlayback) return;

    savePlayback({
      ...savedPlayback,
      ayahIndex: 0,
      currentTime: 0,
    });
  }

  return (
    <main className="flex min-h-[100dvh] w-full justify-center bg-background sm:items-center sm:p-6">
      <article className="flex min-h-[100dvh] w-full flex-col justify-center bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-card-foreground sm:min-h-0 sm:max-w-3xl sm:rounded-3xl sm:border sm:border-border sm:px-8 sm:py-8 sm:shadow-xl">
        <InstallPrompt />

        <header className="mt-5 text-center sm:mt-6">
          <div className="flex items-center justify-between gap-2">
            <GitHubLink />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Le Noble Coran
            </p>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>

          <h1
            tabIndex={-1}
            className="mt-2 text-balance text-[clamp(1.5rem,0.9rem_+_3vw,3rem)] font-semibold leading-tight outline-none"
          >
            Écoutez le Coran, verset par verset
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            Écoutez la récitation et reprenez votre écoute à tout moment.
          </p>
        </header>

        {hasSavedPlayback && (
          <section
            aria-labelledby="resume-title"
            className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="resume-title"
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary"
                >
                  Reprendre l’écoute
                </h2>
                <p className="mt-1 text-sm font-semibold leading-snug">
                  Sourate {savedPlayback.surahNumber}
                  <span aria-hidden="true"> · </span>
                  verset {savedPlayback.ayahIndex + 1}
                </p>
                {savedPlayback.currentTime > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    à {formatTime(savedPlayback.currentTime)}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href="#/lecteur"
                  onClick={restartSurah}
                  aria-label="Revenir au début de la sourate"
                  title="Revenir au début"
                  className={ACTION_ICON}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                </a>
                <a
                  href="#/lecteur"
                  className={`${ACTION_FILLED} h-10 shrink-0 px-4`}
                >
                  <Play size={15} aria-hidden="true" />
                  Continuer
                </a>
              </div>
            </div>
          </section>
        )}

        {!hasSavedPlayback && (
          <a
            href="#/lecteur"
            className={`${ACTION_FILLED} mt-6 h-12 w-full px-5`}
          >
            <Play size={17} aria-hidden="true" />
            Ouvrir le lecteur
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        )}

        <details className="group mt-4 rounded-2xl border border-border bg-background/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            Ce que vous pouvez faire
            <ChevronDown
              size={16}
              className="text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <ul className="grid grid-cols-2 gap-2 px-3 pb-3">
            {FEATURES.map(({ icon: Icon, title }) => (
              <li
                key={title}
                className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-xs font-medium sm:text-sm"
              >
                <Icon
                  size={16}
                  className="shrink-0 text-primary"
                  aria-hidden="true"
                />
                {title}
              </li>
            ))}
          </ul>
          <p className="px-4 pb-3 text-center text-xs text-muted-foreground">
            Sans compte <span aria-hidden="true">·</span> Sans publicité
            <span aria-hidden="true"> · </span>
            Données sur votre appareil
          </p>
        </details>
      </article>
    </main>
  );
}

export default Home;
