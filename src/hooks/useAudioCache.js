import { useEffect, useRef, useState } from "react";
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

export function useAudioCache(ayahs, loadedSurahNumber, surahNumber) {
  const [status, setStatus] = useState(null);
  const jobRef = useRef(0);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (loadedSurahNumber !== surahNumber || !ayahs.length) return;

    const audioUrls = [...new Set(ayahs.map((ayah) => ayah.audio).filter(Boolean))];
    const jobId = ++jobRef.current;

    if (!isOnline) {
      return;
    }

    if (!audioUrls.length) {
      return;
    }

    let cancelled = false;
    let nextIndex = 0;
    let completed = 0;
    let failed = 0;
    const controller = new AbortController();
    async function cacheAudio() {
      try {
        const hasServiceWorker = await waitForServiceWorkerControl();
        if (!hasServiceWorker) throw new Error("Le cache hors connexion n’est pas disponible.");

        const audioCache = await caches.open("quran-audio-fr");
        if (!cancelled && jobRef.current === jobId) {
          setStatus({ surahNumber, state: "downloading", completed: 0, total: audioUrls.length });
        }
        async function downloadNext() {
          while (!cancelled && nextIndex < audioUrls.length) {
            const url = audioUrls[nextIndex++];
            try {
              if (!(await audioCache.match(url))) {
                await fetch(url, { mode: "no-cors", signal: controller.signal });
              }
              if (!(await audioCache.match(url))) failed += 1;
            } catch {
              failed += 1;
            }

            completed += 1;
            if (!cancelled && jobRef.current === jobId) {
              setStatus({ surahNumber, state: "downloading", completed, total: audioUrls.length });
            }
          }
        }

        await Promise.all(Array.from({ length: Math.min(4, audioUrls.length) }, downloadNext));
      } catch {
        failed = audioUrls.length;
      }

      if (!cancelled && jobRef.current === jobId) {
        setStatus({
          surahNumber,
          state: failed === 0 ? "ready" : failed === audioUrls.length ? "unavailable" : "partial",
          completed: audioUrls.length - failed,
          total: audioUrls.length,
        });
      }
    }

    cacheAudio();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [ayahs, isOnline, loadedSurahNumber, surahNumber]);

  if (loadedSurahNumber === surahNumber && ayahs.length && !isOnline) {
    return { surahNumber, state: "offline", completed: 0, total: ayahs.filter((ayah) => ayah.audio).length };
  }
  if (loadedSurahNumber === surahNumber && ayahs.length && !ayahs.some((ayah) => ayah.audio)) {
    return { surahNumber, state: "unavailable", completed: 0, total: 0 };
  }

  return status;
}
