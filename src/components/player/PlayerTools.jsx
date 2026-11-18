import {
  Bookmark,
  Database,
  Moon,
  Repeat,
  Search,
} from "lucide-react";

const TOOL_BUTTON =
  "flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-border/80 bg-card/60 px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card";

function PlayerTools({
  openDialog = null,
  onOpenSearch,
  onOpenBookmarks,
  onOpenOffline,
  loopState,
  onToggleLoop,
  sleepLabel,
  onOpenSleep,
}) {
  const loopLabel = loopState === "active"
    ? "Boucle active"
    : loopState === "start"
      ? "Choisir la fin de la boucle"
      : "Définir une boucle";
  const isOpen = (name) => openDialog === name;

  return (
    <div className="mt-2 grid grid-cols-5 gap-1.5">
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Rechercher un verset"
        aria-haspopup="dialog"
        aria-expanded={isOpen("search")}
        className={TOOL_BUTTON}
      >
        <Search size={17} aria-hidden="true" />
        <span className="truncate">Recherche</span>
      </button>
      <button
        type="button"
        onClick={onOpenBookmarks}
        aria-label="Voir les versets enregistrés"
        aria-haspopup="dialog"
        aria-expanded={isOpen("bookmarks")}
        className={TOOL_BUTTON}
      >
        <Bookmark size={17} aria-hidden="true" />
        <span className="truncate">Signets</span>
      </button>
      <button
        type="button"
        onClick={onToggleLoop}
        aria-label={loopLabel}
        aria-pressed={loopState === "active"}
        className={`${TOOL_BUTTON} ${loopState !== "off" ? "text-primary" : ""}`}
      >
        <Repeat size={17} aria-hidden="true" />
        <span className="truncate">Boucle</span>
      </button>
      <button
        type="button"
        onClick={onOpenSleep}
        aria-label={`Minuteur de sommeil${sleepLabel ? ` : ${sleepLabel}` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen("sleep")}
        aria-pressed={Boolean(sleepLabel)}
        className={`${TOOL_BUTTON} ${sleepLabel ? "text-primary" : ""}`}
      >
        <Moon size={17} aria-hidden="true" />
        <span className="truncate">{sleepLabel ?? "Sommeil"}</span>
      </button>
      <button
        type="button"
        onClick={onOpenOffline}
        aria-label="Gérer les audios téléchargés"
        aria-haspopup="dialog"
        aria-expanded={isOpen("offline")}
        className={TOOL_BUTTON}
      >
        <Database size={17} aria-hidden="true" />
        <span className="truncate">Stockage</span>
      </button>
    </div>
  );
}

export default PlayerTools;
