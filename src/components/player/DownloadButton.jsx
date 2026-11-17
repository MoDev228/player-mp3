import { Check, Download, LoaderCircle, RefreshCw, WifiOff } from "lucide-react";

function DownloadButton({ status, surahNumber, isOnline, onDownload }) {
  if (
    status?.surahNumber !== surahNumber ||
    (status.state === "unavailable" && status.total === 0)
  ) {
    return null;
  }

  const isBusy =
    status.state === "preparing" ||
    status.state === "checking" ||
    status.state === "downloading";
  const isReady = status.state === "ready";
  const isDisabled = isBusy || isReady || !isOnline;
  const progress =
    status.state === "downloading" && status.total > 0
      ? Math.round((status.processed / status.total) * 100)
      : null;

  let label = "Télécharger hors connexion";
  let Icon = Download;
  if (status.state === "preparing") {
    label = "Préparation de la sourate…";
    Icon = LoaderCircle;
  }
  if (status.state === "checking") {
    label = "Vérification du cache";
    Icon = LoaderCircle;
  }
  if (status.state === "downloading") {
    label = `Téléchargement ${progress}%`;
    Icon = LoaderCircle;
  }
  if (status.state === "ready") {
    label = "Disponible hors connexion";
    Icon = Check;
  }
  if (status.state === "partial") {
    label = "Reprendre le téléchargement";
    Icon = Download;
  }
  if (status.state === "offline" || !isOnline) {
    label = "Connexion requise";
    Icon = WifiOff;
  }
  if (status.state === "unavailable") {
    label = "Réessayer le téléchargement";
    Icon = RefreshCw;
  }

  const accessibleLabel =
    status.state === "downloading"
      ? `${label} : ${status.processed} sur ${status.total} fichiers`
      : label;

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={isDisabled}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-muted-foreground sm:px-3"
    >
      <Icon
        size={18}
        className={isBusy ? "animate-spin" : "shrink-0"}
        aria-hidden="true"
      />
      <span className="hidden text-xs font-medium sm:inline">{label}</span>
    </button>
  );
}

export default DownloadButton;
