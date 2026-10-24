import { useCallback, useEffect, useRef, useState } from "react";
import { getSurah, getSurahs } from "@/services/quranApi";
import AudioControls from "./AudioControls";
import ProgressBar from "@/components/player/ProgressBar";
import SurahList from "./SurahList";
import { FiGithub } from "react-icons/fi";

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

function PlayerCard() {
  const audioRef = useRef(null);
  const [surahs, setSurahs] = useState([]);
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahs, setAyahs] = useState([]);
  const [ayahIndex, setAyahIndex] = useState(0);
  const [loadedSurahNumber, setLoadedSurahNumber] = useState(null);
  const [loadError, setLoadError] = useState({ surahNumber: null, message: "" });
  const [audioError, setAudioError] = useState("");
  const [audioCacheStatus, setAudioCacheStatus] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasStartedRef = useRef(false);
  const audioCacheJobRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [showSurahList, setShowSurahList] = useState(false);
  const isLoading = loadedSurahNumber !== surahNumber && loadError.surahNumber !== surahNumber;
  const error = loadError.surahNumber === surahNumber ? loadError.message : "";
  const currentAyah = loadedSurahNumber === surahNumber ? ayahs[ayahIndex] : undefined;

  useEffect(() => {
    let cancelled = false;
    getSurahs()
      .then((data) => { if (!cancelled) setSurahs(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSurah(surahNumber)
      .then((data) => { if (!cancelled) { setAyahs(data.ayahs); setLoadedSurahNumber(surahNumber); } })
      .catch(() => { if (!cancelled) setLoadError({ surahNumber, message: "Impossible de charger cette sourate. Vérifie ta connexion et réessaie." }); });
    return () => { cancelled = true; };
  }, [surahNumber]);

  useEffect(() => {
    if (loadedSurahNumber !== surahNumber || !ayahs.length) return;

    const audioUrls = [...new Set(ayahs.map((ayah) => ayah.audio).filter(Boolean))];
    const jobId = ++audioCacheJobRef.current;

    if (!navigator.onLine) {
      setAudioCacheStatus({ surahNumber, state: "offline", completed: 0, total: audioUrls.length });
      return;
    }

    if (!audioUrls.length) {
      setAudioCacheStatus({ surahNumber, state: "unavailable", completed: 0, total: 0 });
      return;
    }

    let cancelled = false;
    let nextIndex = 0;
    let completed = 0;
    let failed = 0;
    const controller = new AbortController();
    setAudioCacheStatus({ surahNumber, state: "downloading", completed: 0, total: audioUrls.length });

    async function cacheAudio() {
      try {
        const hasServiceWorker = await waitForServiceWorkerControl();
        if (!hasServiceWorker) throw new Error("Le cache hors connexion n’est pas disponible.");

        const audioCache = await caches.open("quran-audio-fr");
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
            if (!cancelled && audioCacheJobRef.current === jobId) {
              setAudioCacheStatus({ surahNumber, state: "downloading", completed, total: audioUrls.length });
            }
          }
        }

        await Promise.all(Array.from({ length: Math.min(4, audioUrls.length) }, downloadNext));
      } catch {
        failed = audioUrls.length;
      }

      if (!cancelled && audioCacheJobRef.current === jobId) {
        setAudioCacheStatus({
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
  }, [ayahs, loadedSurahNumber, surahNumber]);

  const moveAyah = useCallback((direction) => {
    if (!ayahs.length) return;
    if (isShuffle && ayahs.length > 1) {
      setAyahIndex((current) => {
        let next = current;
        while (next === current) next = Math.floor(Math.random() * ayahs.length);
        return next;
      });
      return;
    }
    const nextIndex = ayahIndex + direction;
    if (nextIndex >= 0 && nextIndex < ayahs.length) {
      setAyahIndex(nextIndex);
    } else if (repeatMode === "all") {
      setAyahIndex(direction > 0 ? 0 : ayahs.length - 1);
    } else if (direction > 0 && surahNumber < 114) {
      setAyahIndex(0);
      setSurahNumber((number) => number + 1);
    } else if (direction < 0 && surahNumber > 1) {
      setAyahIndex(0);
      setSurahNumber((number) => number - 1);
    }
  }, [ayahs.length, ayahIndex, isShuffle, repeatMode, surahNumber]);

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentAyah?.audio) return;
    if (audio.paused) {
      hasStartedRef.current = true;
      try { await audio.play(); }
      catch { setAudioError("Impossible de lire cet audio. Réessaie."); }
    } else audio.pause();
  }, [currentAyah?.audio]);

  const handleSeek = (time) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(time, 0), audio.duration);
    setCurrentTime(audio.currentTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAyah?.audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setAudioError("");
    if (hasStartedRef.current) audio.play().catch(() => setAudioError("Impossible de lire cet audio. Réessaie."));
  }, [currentAyah?.audio]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || ["INPUT", "TEXTAREA", "BUTTON"].includes(event.target.tagName))) return;
      if (event.code === "Space") { event.preventDefault(); handlePlayPause(); }
      if (event.code === "ArrowRight") { event.preventDefault(); moveAyah(1); }
      if (event.code === "ArrowLeft") { event.preventDefault(); moveAyah(-1); }
      if (event.code === "ArrowUp") { event.preventDefault(); setVolume((value) => Math.min(1, Math.round((value + 0.1) * 100) / 100)); setIsMuted(false); }
      if (event.code === "ArrowDown") { event.preventDefault(); setVolume((value) => Math.max(0, Math.round((value - 0.1) * 100) / 100)); }
      if (event.key.toLowerCase() === "m") setIsMuted((muted) => !muted);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePlayPause, moveAyah]);

  const handleEnded = () => {
    if (repeatMode === "one") {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
      return;
    }
    if (isShuffle || ayahIndex < ayahs.length - 1 || repeatMode === "all" || surahNumber < 114) moveAyah(1);
    else setIsPlaying(false);
  };

  return (
    <section className="w-full min-h-[calc(100svh-2rem)] flex items-center justify-center p-4 sm:p-6">
      <article className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl">
        <a href="https://github.com/MoDev228" target="_blank" rel="noopener noreferrer"
          aria-label="Ouvrir le profil GitHub du créateur"
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <FiGithub size={18} />
        </a>
        <div className="px-4 pb-6 pt-8 sm:px-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Le Noble Coran</p>
            <h1 className="mt-2 text-xl font-semibold">
              {surahs.find((surah) => surah.number === surahNumber)?.englishName ?? `Sourate ${surahNumber}`}
            </h1>
            <p lang="ar" dir="rtl" className="mt-1 text-lg text-muted-foreground">
              {surahs.find((surah) => surah.number === surahNumber)?.name ?? "القرآن الكريم"}
            </p>
          </div>

          <div className="relative flex h-[20rem] w-full items-center justify-center overflow-x-hidden overflow-y-auto rounded-2xl border border-border bg-background/70 px-5 py-6 sm:h-[24rem]">
            {isLoading ? <p className="text-sm text-muted-foreground">Chargement de la sourate…</p>
              : error ? <p role="alert" className="text-center text-sm text-destructive">{error}</p>
                : currentAyah ? <div className="my-auto w-full text-center">
                  <p lang="ar" dir="rtl" className="text-2xl leading-relaxed sm:text-3xl">{currentAyah.text.replace(/^\uFEFF/, "")}</p>
                  <p className="mt-5 text-xs font-medium tracking-wide text-muted-foreground">Verset {currentAyah.numberInSurah} <span aria-hidden="true">·</span> {ayahs.length} versets</p>
                </div> : null}
          </div>

          {audioCacheStatus?.surahNumber === surahNumber && (
            <p className="mt-3 text-center text-xs text-muted-foreground" aria-live="polite">
              {audioCacheStatus.state === "downloading" && `Préparation hors connexion… ${audioCacheStatus.completed}/${audioCacheStatus.total}`}
              {audioCacheStatus.state === "ready" && "Sourate disponible hors connexion"}
              {audioCacheStatus.state === "partial" && `Mise en cache partielle : ${audioCacheStatus.completed}/${audioCacheStatus.total} audios`}
              {audioCacheStatus.state === "offline" && "Hors connexion : les audios déjà mis en cache restent disponibles"}
              {audioCacheStatus.state === "unavailable" && "Audio indisponible pour cette sourate"}
            </p>
          )}

          {audioError && <p role="alert" className="mt-3 text-center text-sm text-destructive">{audioError}</p>}
          <audio ref={audioRef} src={currentAyah?.audio} preload="metadata"
            onPlay={() => { hasStartedRef.current = true; setIsPlaying(true); setAudioError(""); }}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onError={() => { if (currentAyah?.audio) { setIsPlaying(false); setAudioError("Erreur de chargement de l’audio."); } }}
            onEnded={handleEnded} />
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
          <AudioControls onPlayPause={handlePlayPause} isPlaying={isPlaying} onNext={() => moveAyah(1)} onPrevious={() => moveAyah(-1)}
            volume={volume} onVolumeChange={(value) => { setVolume(value); if (value > 0) setIsMuted(false); }}
            onToggleSurahList={() => setShowSurahList((visible) => !visible)} isShuffle={isShuffle}
            onToggleShuffle={() => setIsShuffle((value) => !value)} repeatMode={repeatMode}
            onToggleRepeat={() => setRepeatMode((mode) => mode === "off" ? "all" : mode === "all" ? "one" : "off")}
            isMuted={isMuted} onToggleMute={() => setIsMuted((muted) => !muted)} />
        </div>
        {showSurahList && <SurahList surahs={surahs} currentSurahNumber={surahNumber}
          onSelectSurah={(number) => { setAyahIndex(0); setSurahNumber(number); setShowSurahList(false); }}
          onClose={() => setShowSurahList(false)} />}
      </article>
    </section>
  );
}

export default PlayerCard;
