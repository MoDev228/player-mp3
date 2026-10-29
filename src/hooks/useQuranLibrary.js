import { useCallback, useEffect, useState } from "react";
import { getSurah, getSurahs } from "@/services/quranApi";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const LOAD_ERROR_MESSAGE = "Impossible de charger cette sourate. Vérifie ta connexion et réessaie.";

export function useQuranLibrary(surahNumber, ayahIndex = 0) {
  const isOnline = useOnlineStatus();
  const [surahs, setSurahs] = useState([]);
  const [ayahs, setAyahs] = useState([]);
  const [loadedSurahNumber, setLoadedSurahNumber] = useState(null);
  const [loadError, setLoadError] = useState({ surahNumber: null, message: "" });
  const [surahRequest, setSurahRequest] = useState(0);
  const [surahsLoading, setSurahsLoading] = useState(true);
  const [surahsError, setSurahsError] = useState("");
  const [surahsRequest, setSurahsRequest] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getSurahs()
      .then((data) => { if (!cancelled) setSurahs(data); })
      .catch(() => { if (!cancelled) setSurahsError("Impossible de charger la liste des sourates. Vérifie ta connexion."); })
      .finally(() => { if (!cancelled) setSurahsLoading(false); });
    return () => { cancelled = true; };
  }, [isOnline, surahsRequest]);

  const retrySurahs = useCallback(() => {
    setSurahsError("");
    setSurahsLoading(true);
    setSurahsRequest((request) => request + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSurah(surahNumber)
      .then((data) => {
        if (cancelled) return;
        setAyahs(data.ayahs);
        setLoadedSurahNumber(surahNumber);
        setLoadError({ surahNumber: null, message: "" });
      })
      .catch(() => {
        if (!cancelled) setLoadError({ surahNumber, message: LOAD_ERROR_MESSAGE });
      });
    return () => { cancelled = true; };
  }, [isOnline, surahNumber, surahRequest]);

  const retrySurah = useCallback(() => {
    setLoadError({ surahNumber: null, message: "" });
    setSurahRequest((request) => request + 1);
  }, []);

  const isLoading = loadedSurahNumber !== surahNumber && loadError.surahNumber !== surahNumber;
  const error = loadError.surahNumber === surahNumber ? loadError.message : "";
  const currentAyah = loadedSurahNumber === surahNumber ? ayahs[ayahIndex] : undefined;

  return { surahs, ayahs, loadedSurahNumber, isLoading, error, currentAyah, surahsLoading, surahsError, retrySurahs, retrySurah };
}
