import { useId, useMemo, useState } from "react";
import PlayerDialog from "./PlayerDialog";

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function VerseSearchDialog({ open, onClose, ayahs, surahName, onSelect }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  function handleClose() {
    setQuery("");
    onClose();
  }

  const results = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return ayahs.slice(0, 40);

    const byNumber = /^\d+$/.test(needle);
    const matches = ayahs.filter((ayah) => {
      if (byNumber) return Number(ayah.numberInSurah) === Number(needle);
      return (
        normalize(ayah.text).includes(needle)
        || normalize(ayah.arabicText).includes(needle)
      );
    });

    return matches.slice(0, 100);
  }, [ayahs, query]);

  return (
    <PlayerDialog
      open={open}
      onClose={handleClose}
      title="Rechercher un verset"
      focusClose={false}
    >
      <form onSubmit={(event) => event.preventDefault()} className="space-y-3">
        <div>
          <label htmlFor={inputId} className="block text-sm font-medium">
            Numéro ou texte du verset
          </label>
          <p id={hintId} className="mt-0.5 text-xs text-muted-foreground">
            Dans la sourate {surahName}.
          </p>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby={hintId}
            autoFocus
            className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <p className="text-xs text-muted-foreground" role="status">
          {results.length} résultat{results.length > 1 ? "s" : ""}
        </p>

        {results.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucun verset trouvé.
          </p>
        ) : (
          <ul className="space-y-1">
            {results.map((ayah) => (
              <li key={ayah.numberInSurah}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(ayah.numberInSurah - 1);
                    handleClose();
                  }}
                  className="w-full rounded-xl border border-border px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block text-xs font-semibold text-primary">
                    Verset {ayah.numberInSurah}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug">
                    {String(ayah.text ?? "").replace(/^\uFEFF/, "")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>
    </PlayerDialog>
  );
}

export default VerseSearchDialog;
