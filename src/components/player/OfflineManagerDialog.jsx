import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import {
  deleteCachedSurah,
  getCacheStorageEstimate,
  listCachedSurahs,
} from "@/lib/audioCache";
import { getAudioEdition } from "@/lib/quranEditions";
import PlayerDialog from "./PlayerDialog";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Mo";
  const megabytes = bytes / (1024 * 1024);
  return megabytes >= 1000
    ? `${(megabytes / 1024).toFixed(1)} Go`
    : `${Math.round(megabytes)} Mo`;
}

function OfflineManagerDialog({ open, onClose, audioEdition, revision, onDeleted }) {
  const [entries, setEntries] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const edition = getAudioEdition(audioEdition);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [surahs, usage] = await Promise.all([
        listCachedSurahs(audioEdition),
        getCacheStorageEstimate(),
      ]);
      setEntries(surahs);
      setEstimate(usage);
    } catch {
      setError("Impossible de lire les audios enregistrés.");
    } finally {
      setIsLoading(false);
    }
  }, [audioEdition]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.all([listCachedSurahs(audioEdition), getCacheStorageEstimate()])
      .then(([surahs, usage]) => {
        if (!active) return;
        setEntries(surahs);
        setEstimate(usage);
        setError("");
      })
      .catch(() => { if (active) setError("Impossible de lire les audios enregistrés."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [audioEdition, open, revision]);

  async function handleDelete(surahNumber) {
    try {
      await deleteCachedSurah(audioEdition, surahNumber);
      onDeleted();
      await refresh();
    } catch {
      setError("Impossible de supprimer ces audios.");
    }
  }

  const cachedAyahs = entries.reduce((total, entry) => total + entry.cached, 0);

  return (
    <PlayerDialog open={open} onClose={onClose} title="Audios téléchargés">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{edition.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {entries.length} sourate{entries.length > 1 ? "s" : ""} · {cachedAyahs} versets en cache
          </p>
          {estimate && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatBytes(estimate.usage)} utilisés sur {formatBytes(estimate.quota)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          aria-label="Actualiser la liste"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw size={15} aria-hidden="true" className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && <p role="alert" className="mb-2 text-sm text-destructive">{error}</p>}

      {isLoading && entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Vérification du cache…</p>
      ) : entries.length === 0 ? (
        <p className="py-6 text-center text-sm leading-relaxed text-muted-foreground">
          Aucun audio téléchargé pour cette récitation. Ouvre une sourate avec Internet puis utilise « Télécharger hors connexion ».
        </p>
      ) : (
        <ul className="space-y-1.5">
          {entries.map((entry) => (
            <li key={entry.number} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {entry.number}. {entry.englishName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entry.cached}/{entry.numberOfAyahs} versets
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(entry.number)}
                aria-label={`Supprimer les audios téléchargés de la sourate ${entry.number}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PlayerDialog>
  );
}

export default OfflineManagerDialog;
