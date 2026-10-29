import { Check, Download, LoaderCircle, RefreshCw, WifiOff } from "lucide-react";

function FloatingDownloadButton({ status, surahNumber, isOnline, onDownload }) {
  if (status?.surahNumber !== surahNumber || (status.state === "unavailable" && status.total === 0)) return null;

  const isBusy = status.state === "checking" || status.state === "downloading";
  const isReady = status.state === "ready";
  const isDisabled = isBusy || isReady || !isOnline;
  const progress = status.state === "downloading" && status.total > 0
    ? Math.round((status.processed / status.total) * 100)
    : null;

  let label = "Télécharger hors connexion";
  let Icon = Download;
  if (status.state === "checking") { label = "Vérification du cache"; Icon = LoaderCircle; }
  if (status.state === "downloading") { label = `Téléchargement ${progress}%`; Icon = LoaderCircle; }
  if (status.state === "ready") { label = "Disponible hors connexion"; Icon = Check; }
  if (status.state === "partial") { label = "Reprendre le téléchargement"; Icon = Download; }
  if (status.state === "offline" || !isOnline) { label = "Connexion requise"; Icon = WifiOff; }
  if (status.state === "unavailable") { label = "Réessayer le téléchargement"; Icon = RefreshCw; }

  const accessibleLabel = status.state === "downloading"
    ? `${label} : ${status.processed} sur ${status.total} fichiers`
    : label;

  return (
    <div className="pointer-events-none fixed bottom-16 right-4 z-40">
      <button
        type="button"
        onClick={onDownload}
        disabled={isDisabled}
        aria-label={accessibleLabel}
        title={accessibleLabel}
        className="pointer-events-auto inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground shadow-lg transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-muted hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:translate-y-0"
      >
        <Icon size={17} className={isBusy ? "animate-spin" : "shrink-0"} aria-hidden="true" />
        <span className="truncate">{label}</span>
      </button>
    </div>
  );
}

export default FloatingDownloadButton;
