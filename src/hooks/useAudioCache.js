import { useCallback, useEffect, useMemo, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

async function waitForServiceWorkerControl() {
  if (!("serviceWorker" in navigator)) return false;

  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) {
    await new Promise((resolve) => {
      const timeout = window.setTimeout(resolve, 5000);
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
    });
  }

  return Boolean(navigator.serviceWorker.controller);
}

function getAudioUrls(ayahs) {
  return [...new Set(ayahs.map((ayah) => ayah.audio).filter(Boolean))];
}

export function useAudioCache(ayahs, loadedSurahNumber, surahNumber, isSurahLoading = false) {
  const [status, setStatus] = useState(null);
  const isOnline = useOnlineStatus();
  const audioUrls = useMemo(() => getAudioUrls(ayahs), [ayahs]);

  useEffect(() => {
    if (loadedSurahNumber !== surahNumber || !ayahs.length) return;

    let cancelled = false;
    async function inspectCache() {
      try {
        const cache = await caches.open("quran-audio-fr");
        const cachedCount = (await Promise.all(audioUrls.map((url) => cache.match(url)))).filter(Boolean).length;
        if (cancelled) return;

        const state = cachedCount === audioUrls.length
          ? "ready"
            : cachedCount > 0 ? "partial" : "idle";
        setStatus({ surahNumber, state, completed: cachedCount, total: audioUrls.length });
      } catch {
        if (!cancelled) setStatus({ surahNumber, state: "unavailable", completed: 0, total: audioUrls.length });
      }
    }

    if (!audioUrls.length) return;

    inspectCache();
    return () => { cancelled = true; };
  }, [audioUrls, ayahs.length, loadedSurahNumber, surahNumber]);

  const downloadSurah = useCallback(async () => {
    if (!isOnline || loadedSurahNumber !== surahNumber || !audioUrls.length) return;

    let downloaded = 0;
    let processed = 0;
    let failed = 0;
    let nextIndex = 0;
    setStatus({ surahNumber, state: "downloading", completed: 0, processed: 0, total: audioUrls.length });

    try {
      const hasServiceWorker = await waitForServiceWorkerControl();
      if (!hasServiceWorker) throw new Error("Le cache hors connexion n’est pas disponible.");

      const cache = await caches.open("quran-audio-fr");
      const alreadyCached = await Promise.all(audioUrls.map((url) => cache.match(url)));
      downloaded = alreadyCached.filter(Boolean).length;
      processed = downloaded;
      setStatus({ surahNumber, state: "downloading", completed: downloaded, processed, total: audioUrls.length });

      async function downloadNext() {
        while (nextIndex < audioUrls.length) {
          const index = nextIndex++;
          const url = audioUrls[index];
          if (alreadyCached[index]) continue;

          try {
            await fetch(url, { mode: "no-cors" });
            if (await cache.match(url)) downloaded += 1;
            else failed += 1;
          } catch {
            failed += 1;
          }

          processed += 1;
          setStatus({ surahNumber, state: "downloading", completed: downloaded, processed, total: audioUrls.length });
        }
      }

      await Promise.all(Array.from({ length: Math.min(4, audioUrls.length) }, downloadNext));
      setStatus({
        surahNumber,
        state: failed === 0 ? "ready" : downloaded > 0 ? "partial" : "unavailable",
        completed: downloaded,
        total: audioUrls.length,
      });
    } catch {
      setStatus({
        surahNumber,
        state: downloaded > 0 ? "partial" : "unavailable",
        completed: downloaded,
        total: audioUrls.length,
      });
    }
  }, [audioUrls, isOnline, loadedSurahNumber, surahNumber]);

  const currentStatus = status?.surahNumber === surahNumber ? status : null;
  const visibleStatus = loadedSurahNumber !== surahNumber && isSurahLoading
    ? { surahNumber, state: "preparing", completed: 0, total: 0 }
    : loadedSurahNumber === surahNumber && !audioUrls.length
    ? { surahNumber, state: "unavailable", completed: 0, total: 0 }
    : currentStatus
      ? currentStatus.state === "idle" && !isOnline
        ? { ...currentStatus, state: "offline" }
        : currentStatus
      : loadedSurahNumber === surahNumber && audioUrls.length
        ? { surahNumber, state: "checking", completed: 0, total: audioUrls.length }
        : null;

  return { status: visibleStatus, downloadSurah, isOnline };
}
