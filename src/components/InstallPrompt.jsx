import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "quran-player-install-dismissed-v1";

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isCoarsePointer() {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(pointer: coarse)").matches;
}

function isIos() {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [supportsInstallApi] = useState(
    () =>
      typeof Navigator !== "undefined" &&
      typeof Navigator.prototype.install === "function",
  );
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [isInstalling, setIsInstalling] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function handleInstalled() {
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (dismissed || installed || isStandalone()) return null;

  const canInstall = supportsInstallApi || Boolean(deferredPrompt);
  const showHint = !canInstall && (isIos() || isCoarsePointer());

  if (!canInstall && !showHint) return null;

  const installHint = canInstall
    ? "Cliquez sur Installer pour ouvrir Quran MP3 en plein écran et l’écouter hors connexion."
    : isIos()
      ? "Sur iPhone ou iPad, touchez le bouton Partager, puis « Sur l’écran d’accueil »."
      : "Ouvrez le menu du navigateur, puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».";

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // The prompt stays dismissed for this session if storage is unavailable.
    }
  }

  async function install() {
    if (isInstalling) return;
    setIsInstalling(true);
    setStatus("");

    try {
      if (supportsInstallApi) {
        // The call runs directly from the click handler to keep user activation.
        await navigator.install();
        setStatus("Application installée.");
        setInstalled(true);
      } else if (deferredPrompt) {
        const promptEvent = deferredPrompt;
        setDeferredPrompt(null);
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;

        if (outcome === "accepted") {
          setStatus("Application installée.");
          setInstalled(true);
        } else {
          setStatus("Installation annulée.");
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setStatus("Installation annulée.");
      } else {
        setStatus("Impossible de lancer l’installation.");
        console.error(error);
      }
    } finally {
      setIsInstalling(false);
    }
  }

  return (
    <section
      aria-labelledby="install-title"
      className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3 text-left"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Download size={17} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 id="install-title" className="text-sm font-semibold">
          Installer l’application
        </h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {installHint}
        </p>
        {status && (
          <p role="status" className="mt-1 text-xs font-medium text-primary">
            {status}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {canInstall && (
          <button
            type="button"
            onClick={install}
            aria-disabled={isInstalling || undefined}
            aria-label="Installer Quran MP3"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:h-auto sm:w-auto sm:px-3 sm:py-2 sm:text-xs sm:font-semibold aria-disabled:opacity-60"
          >
            <Download size={16} className="sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">Installer</span>
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Masquer l’invitation à installer"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default InstallPrompt;
