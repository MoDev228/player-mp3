import { useCallback, useEffect, useState } from "react";
import { getSurah, getSurahs } from "@/services/quranApi";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { DEFAULT_SETTINGS } from "@/lib/quranEditions";

const LOAD_ERROR_MESSAGE = "Impossible de charger cette sourate. Vérifie ta connexion et réessaie.";

export function useQuranLibrary(surahNumber, ayahIndex = 0, settings = DEFAULT_SETTINGS) {
  const isOnline = useOnlineStatus();
  const { audioEdition, textEdition, bilingual } = settings ?? DEFAULT_SETTINGS;
  const [surahs, setSurahs] = useState([]);
  const [surahData, setSurahData] = useState({ key: null, surahNumber: null, audioEdition: null, ayahs: [] });
  const [loadError, setLoadError] = useState({ key: null, message: "" });
  const [surahRequest, setSurahRequest] = useState(0);
  const [surahsLoading, setSurahsLoading] = useState(true);
  const [surahsError, setSurahsError] = useState("");
  const [surahsRequest, setSurahsRequest] = useState(0);

  const currentKey = `${surahNumber}|${audioEdition}|${textEdition}|${Boolean(bilingual)}`;

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
    getSurah(surahNumber, { audioEdition, textEdition, bilingual })
      .then((data) => {
        if (cancelled) return;
        setSurahData({ key: currentKey, surahNumber, audioEdition, ayahs: data.ayahs });
        setLoadError({ key: null, message: "" });
      })
      .catch(() => {
        if (!cancelled) setLoadError({ key: currentKey, message: LOAD_ERROR_MESSAGE });
      });
    return () => { cancelled = true; };
  }, [audioEdition, bilingual, currentKey, isOnline, surahNumber, surahRequest, textEdition]);

  const retrySurah = useCallback(() => {
    setLoadError({ key: null, message: "" });
    setSurahRequest((request) => request + 1);
  }, []);

  const isLoaded = surahData.key === currentKey;
  const keepsAudio = surahData.surahNumber === surahNumber && surahData.audioEdition === audioEdition;
  const isLoading = !isLoaded && loadError.key !== currentKey;
  const error = loadError.key === currentKey ? loadError.message : "";
  const ayahs = surahData.ayahs;
  const safeAyahIndex = ayahs.length > 0
    ? Math.min(Math.max(ayahIndex, 0), ayahs.length - 1)
    : 0;
  const currentAyah = isLoaded || keepsAudio ? ayahs[safeAyahIndex] : undefined;

  return {
    surahs,
    ayahs,
    loadedSurahNumber: surahData.surahNumber,
    loadedAudioEdition: surahData.audioEdition,
    isLoaded,
    isLoading,
    error,
    currentAyah,
    surahsLoading,
    surahsError,
    retrySurahs,
    retrySurah,
  };
}
