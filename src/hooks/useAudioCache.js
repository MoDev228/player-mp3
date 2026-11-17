import { useCallback, useEffect, useMemo, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { DEFAULT_SETTINGS } from "@/lib/quranEditions";
import {
  cacheFullAudio,
  isAudioCached,
} from "@/lib/audioCache";

function getAudioUrls(ayahs) {
  return [...new Set(ayahs.map((ayah) => ayah.audio).filter(Boolean))];
}

export function useAudioCache(
  ayahs,
  loadedSurahNumber,
  surahNumber,
  isSurahLoading = false,
  audioEdition = DEFAULT_SETTINGS.audioEdition,
) {
  const [status, setStatus] = useState(null);
  const isOnline = useOnlineStatus();
  const audioUrls = useMemo(() => getAudioUrls(ayahs), [ayahs]);

  const matchesCurrent = (value) =>
    value?.surahNumber === surahNumber && value?.audioEdition === audioEdition;

  useEffect(() => {
    if (loadedSurahNumber !== surahNumber || !audioUrls.length) return;

    let cancelled = false;
    async function inspectCache() {
      try {
        const cached = await Promise.all(
          audioUrls.map((url) => isAudioCached(url, audioEdition)),
        );
        if (cancelled) return;

        const cachedCount = cached.filter(Boolean).length;
        const state = cachedCount === audioUrls.length
          ? "ready"
          : cachedCount > 0 ? "partial" : "idle";
        setStatus({ surahNumber, audioEdition, state, completed: cachedCount, total: audioUrls.length });
      } catch {
        if (!cancelled) {
          setStatus({ surahNumber, audioEdition, state: "unavailable", completed: 0, total: audioUrls.length });
        }
      }
    }

    inspectCache();
    return () => { cancelled = true; };
  }, [audioEdition, audioUrls, ayahs.length, loadedSurahNumber, surahNumber]);

  const downloadSurah = useCallback(async () => {
    if (!isOnline || loadedSurahNumber !== surahNumber || !audioUrls.length) return;

    let downloaded = 0;
    let processed = 0;
    let failed = 0;
    let nextIndex = 0;
    setStatus({ surahNumber, audioEdition, state: "downloading", completed: 0, processed: 0, total: audioUrls.length });

    try {
      const cached = await Promise.all(
        audioUrls.map((url) => isAudioCached(url, audioEdition)),
      );
      downloaded = cached.filter(Boolean).length;
      processed = downloaded;
      setStatus({ surahNumber, audioEdition, state: "downloading", completed: downloaded, processed, total: audioUrls.length });

      async function downloadNext() {
        while (nextIndex < audioUrls.length) {
          const index = nextIndex++;
          const url = audioUrls[index];
          if (cached[index]) continue;

          try {
            await cacheFullAudio(url, audioEdition);
            downloaded += 1;
          } catch {
            failed += 1;
          }

          processed += 1;
          setStatus({ surahNumber, audioEdition, state: "downloading", completed: downloaded, processed, total: audioUrls.length });
        }
      }

      await Promise.all(Array.from({ length: Math.min(4, audioUrls.length) }, downloadNext));
      setStatus({
        surahNumber,
        audioEdition,
        state: failed === 0 && downloaded === audioUrls.length ? "ready" : downloaded > 0 ? "partial" : "unavailable",
        completed: downloaded,
        total: audioUrls.length,
      });
    } catch {
      setStatus({
        surahNumber,
        audioEdition,
        state: downloaded > 0 ? "partial" : "unavailable",
        completed: downloaded,
        total: audioUrls.length,
      });
    }
  }, [audioEdition, audioUrls, isOnline, loadedSurahNumber, surahNumber]);

  const currentStatus = matchesCurrent(status) ? status : null;
  const visibleStatus = loadedSurahNumber !== surahNumber && isSurahLoading
    ? { surahNumber, audioEdition, state: "preparing", completed: 0, total: 0 }
    : loadedSurahNumber === surahNumber && !audioUrls.length
    ? { surahNumber, audioEdition, state: "unavailable", completed: 0, total: 0 }
    : currentStatus
      ? currentStatus.state === "idle" && !isOnline
        ? { ...currentStatus, state: "offline" }
        : currentStatus
      : loadedSurahNumber === surahNumber && audioUrls.length
        ? { surahNumber, audioEdition, state: "checking", completed: 0, total: audioUrls.length }
        : null;

  return { status: visibleStatus, downloadSurah, isOnline };
}
