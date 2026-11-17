import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

function SurahList({ open, surahs, currentSurahNumber, onSelectSurah, onClose, isLoading, error, onRetry }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto h-[min(75dvh,32rem)] w-[calc(100%-1rem)] max-w-md overflow-hidden rounded-xl border border-border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/40"
    >
      <div className="sticky top-0 z-10 w-full border-b border-border bg-background">
        <div className="flex items-center justify-between p-3">
          <div>
            <h3 id={titleId} className="font-semibold">Les sourates du Coran</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Chargement…" : `${surahs.length} sourates disponibles`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la liste"
            autoFocus
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="h-[calc(100%-4.5rem)] overflow-x-hidden overflow-y-auto">
        {error ? (
          <div className="p-4 text-center" role="alert">
            <p className="text-sm text-destructive">{error}</p>
            <button type="button" onClick={onRetry} className="mt-3 rounded-lg border px-3 py-2 text-sm hover:bg-muted">Réessayer</button>
          </div>
        ) : isLoading ? (
          <p className="p-4 text-center text-sm text-muted-foreground" role="status">Chargement des sourates…</p>
        ) : (
          <ul className="space-y-1 p-3">
            {surahs.map((surah) => (
              <li key={surah.number}>
                <button
                  type="button"
                  onClick={() => onSelectSurah(surah.number)}
                  aria-current={surah.number === currentSurahNumber ? "true" : undefined}
                  className={`w-full rounded-lg border-b px-3 py-2 text-left transition-colors hover:bg-muted ${
                    surah.number === currentSurahNumber ? "bg-muted font-semibold" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block truncate">
                        {surah.number}. {surah.englishName}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {surah.numberOfAyahs} versets
                      </span>
                    </div>

                    <span lang="ar" dir="rtl" className="shrink-0 text-lg">
                      {surah.name}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}

export default SurahList;
