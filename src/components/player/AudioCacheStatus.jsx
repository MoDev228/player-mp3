function AudioCacheStatus({ status, surahNumber }) {
  if (status?.surahNumber !== surahNumber) return null;

  let message = "";
  if (status.state === "checking") message = "Vérification du cache hors connexion…";
  if (status.state === "idle") message = "Cette sourate n’est pas encore téléchargée.";
  if (status.state === "offline") message = "Cette sourate n’est pas disponible hors connexion.";
  if (status.state === "ready") message = "Sourate prête hors connexion";
  if (status.state === "partial") message = `Téléchargement partiel : ${status.completed}/${status.total} versets audio`;
  if (status.state === "unavailable") message = "Le cache audio n’est pas disponible pour cette sourate.";
  if (status.state === "downloading") message = `Téléchargement hors connexion… ${status.processed}/${status.total}`;
  if (!message) return null;

  return (
    <div className="mt-3 flex flex-col items-center gap-2 text-center" aria-live="polite">
      <p className="text-xs text-muted-foreground">{message}</p>
      {status.state === "downloading" && (
        <progress className="h-1.5 w-full max-w-48 accent-primary" max={status.total} value={status.processed} aria-label="Progression du téléchargement audio" />
      )}
    </div>
  );
}

export default AudioCacheStatus;
