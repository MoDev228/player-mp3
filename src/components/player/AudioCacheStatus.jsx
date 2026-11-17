import { LoaderCircle, WifiOff } from "lucide-react";

const LOADING_STATES = new Set(["preparing", "checking"]);
const VISIBLE_STATES = new Set(["preparing", "checking", "downloading", "partial"]);

function AudioCacheStatus({ status, surahNumber }) {
  const current = status?.surahNumber === surahNumber ? status : null;
  if (!current) return null;

  if (current.state === "offline") {
    return (
      <div
        role="status"
        className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground"
      >
        <WifiOff size={12} className="shrink-0 text-accent" aria-hidden="true" />
        Hors connexion · cet audio n’est pas en cache
      </div>
    );
  }

  if (!VISIBLE_STATES.has(current.state)) return null;

  const total = Number.isFinite(current.total) ? Math.max(current.total, 0) : 0;
  const value = current.state === "partial" ? current.completed : current.processed;
  const isIndeterminate = LOADING_STATES.has(current.state) || (current.state === "downloading" && total > 0 && !value);
  const percent = !isIndeterminate && total > 0 ? Math.round((value / total) * 100) : null;

  let message = "";
  if (current.state === "preparing") message = "Préparation de la sourate…";
  if (current.state === "checking") message = "Vérification du cache…";
  if (current.state === "downloading") {
    message = `Téléchargement hors connexion… ${current.processed}/${total}`;
  }
  if (current.state === "partial") {
    message = `${current.completed}/${total} versets en cache`;
  }

  return (
    <div className="mt-2 w-full" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5" title={message}>
          {isIndeterminate && (
            <LoaderCircle size={12} className="shrink-0 animate-spin text-primary" aria-hidden="true" />
          )}
          <span className="truncate">{message}</span>
        </span>
        {percent !== null && (
          <span className="shrink-0 font-medium tabular-nums text-primary">{percent} %</span>
        )}
      </div>
      <progress
        className="download-progress mt-1.5"
        max={total || 1}
        value={isIndeterminate ? undefined : value}
        aria-label="Progression du téléchargement audio"
      />
    </div>
  );
}

export default AudioCacheStatus;
