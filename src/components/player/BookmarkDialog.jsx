import { Trash2 } from "lucide-react";
import { getSurahMetadata } from "@/lib/surahMetadata";
import PlayerDialog from "./PlayerDialog";

function BookmarkDialog({
  open,
  onClose,
  bookmarks,
  currentSurahNumber,
  currentAyahIndex,
  onSelect,
  onRemove,
}) {
  const sorted = [...bookmarks].sort(
    (a, b) => a.surahNumber - b.surahNumber || a.ayahIndex - b.ayahIndex,
  );

  return (
    <PlayerDialog open={open} onClose={onClose} title="Versets enregistrés">
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm leading-relaxed text-muted-foreground">
          Aucun signet pour le moment. Appuie sur « Signet » pour enregistrer le verset en cours.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {sorted.map((bookmark) => {
            const surah = getSurahMetadata(bookmark.surahNumber);
            const isCurrent = bookmark.surahNumber === currentSurahNumber
              && bookmark.ayahIndex === currentAyahIndex;

            return (
              <li key={`${bookmark.surahNumber}-${bookmark.ayahIndex}`} className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(bookmark.surahNumber, bookmark.ayahIndex)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`min-w-0 flex-1 rounded-xl border border-border px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isCurrent ? "bg-muted font-semibold" : ""}`}
                >
                  <span className="block truncate text-sm">
                    {surah?.englishName ?? `Sourate ${bookmark.surahNumber}`}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Verset {bookmark.ayahIndex + 1}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(bookmark.surahNumber, bookmark.ayahIndex)}
                  aria-label={`Supprimer le signet de la sourate ${bookmark.surahNumber}, verset ${bookmark.ayahIndex + 1}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PlayerDialog>
  );
}

export default BookmarkDialog;
