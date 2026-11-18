import { useCallback, useEffect, useRef, useState } from "react";
import { removeCachedAudio, withCacheBust } from "@/lib/audioCache";
import { DEFAULT_SETTINGS } from "@/lib/quranEditions";

const PLAY_ERROR_MESSAGE = "Impossible de lire cet audio. Réessaie.";
const LOAD_TIMEOUT_MS = 8000;

function getPlaybackErrorMessage(audio, error) {
  if (!navigator.onLine) return "Cet audio n’est pas disponible hors connexion. Connecte-toi puis télécharge la sourate pour l’écouter.";
  if (error?.name === "NotAllowedError") return "Le navigateur a bloqué la lecture. Appuie de nouveau sur Lire.";
  if (audio?.error?.code === 2) return "La connexion au fichier audio a échoué. Réessaie.";
  if (audio?.error?.code === 3) return "Le fichier audio n’a pas pu être décodé. Réessaie.";
  if (audio?.error?.code === 4) return "Ce format audio n’est pas pris en charge par le navigateur.";
  return PLAY_ERROR_MESSAGE;
}

function waitForPlayable(audio) {
  if (audio.readyState >= 2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let timeoutId;

    function cleanup() {
      window.clearTimeout(timeoutId);
      audio.removeEventListener("loadeddata", handleReady);
      audio.removeEventListener("canplay", handleReady);
      audio.removeEventListener("error", handleError);
    }

    function handleReady() {
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      reject(audio.error ?? new Error("Audio indisponible."));
    }

    audio.addEventListener("loadeddata", handleReady, { once: true });
    audio.addEventListener("canplay", handleReady, { once: true });
    audio.addEventListener("error", handleError, { once: true });
    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Chargement audio trop long."));
    }, LOAD_TIMEOUT_MS);
  });
}

async function attemptPlay(audio, url, { reload = false } = {}) {
  if (reload || audio.currentSrc !== url) {
    audio.src = url;
    audio.load();
  }

  try {
    await audio.play();
    return { ok: true };
  } catch (error) {
    // `load()` can abort the first `play()` promise. Waiting for the media to
    // become playable and calling `play()` again avoids that race.
    if (error?.name === "AbortError") {
      try {
        await waitForPlayable(audio);
        await audio.play();
        return { ok: true };
      } catch (retryError) {
        return { ok: false, error: retryError };
      }
    }

    return { ok: false, error };
  }
}

export function useAudioPlayer(
  currentAyah,
  moveAyah,
  ayahIndex,
  ayahCount,
  surahNumber,
  repeatMode,
  isShuffle,
  resumePosition = 0,
  audioEdition = DEFAULT_SETTINGS.audioEdition,
  { stopAtEnd = false, onStopAtEnd = null } = {},
) {
  const audioRef = useRef(null);
  const hasStartedRef = useRef(false);
  const [audioError, setAudioError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loadedAudioSource, setLoadedAudioSource] = useState(null);
  const resumePositionRef = useRef(resumePosition);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    const source = currentAyah?.audio;
    if (!audio || !source) return;

    hasStartedRef.current = true;
    setAudioError("");

    let result = await attemptPlay(audio, source);

    if (!result.ok) {
      // A corrupt or partial Cache Storage entry can make a media element fail
      // before it ever reaches the network. Drop it, then retry on a URL the
      // service worker's audio route cannot match.
      await removeCachedAudio(source, audioEdition);
      result = await attemptPlay(audio, withCacheBust(source, "retry"), { reload: true });
    }

    if (!result.ok) {
      setAudioError(getPlaybackErrorMessage(audio, result.error));
    }
  }, [audioEdition, currentAyah?.audio]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentAyah?.audio) return;
    if (audio.paused) startPlayback();
    else audio.pause();
  }, [currentAyah?.audio, startPlayback]);

  const retryPlayback = useCallback(() => startPlayback(), [startPlayback]);

  const handleSeek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(time, 0), audio.duration);
    setCurrentTime(audio.currentTime);
  }, []);

  const updateBuffered = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      setBuffered(0);
      return;
    }

    let end = 0;
    for (let index = 0; index < audio.buffered.length; index += 1) {
      end = Math.max(end, audio.buffered.end(index));
    }
    setBuffered(Math.min(end / audio.duration, 1));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    resumePositionRef.current = resumePosition;
    if (!audio || !currentAyah?.audio) return;

    audio.pause();
    if (audio.readyState > 0) {
      try { audio.currentTime = 0; } catch { /* Media not seekable yet. */ }
    }
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setLoadedAudioSource(null);
    setAudioError("");
    if (hasStartedRef.current) startPlayback();
  }, [currentAyah?.audio, resumePosition, startPlayback]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  const handleEnded = useCallback(() => {
    if (stopAtEnd) {
      audioRef.current?.pause();
      setIsPlaying(false);
      onStopAtEnd?.();
      return;
    }
    if (repeatMode === "one") {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
      return;
    }
    if (isShuffle || ayahIndex < ayahCount - 1 || repeatMode === "all" || surahNumber < 114) moveAyah(1);
    else setIsPlaying(false);
  }, [repeatMode, isShuffle, ayahIndex, ayahCount, surahNumber, moveAyah, stopAtEnd, onStopAtEnd]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
    updateBuffered();
    setLoadedAudioSource(currentAyah?.audio ?? null);

    if (resumePositionRef.current > 0) {
      audio.currentTime = Math.min(resumePositionRef.current, Number.isFinite(audio.duration) ? audio.duration : resumePositionRef.current);
      setCurrentTime(audio.currentTime);
      resumePositionRef.current = 0;
    }
  };

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const audioProps = {
    ref: audioRef,
    src: currentAyah?.audio,
    preload: "metadata",
    onPlay: () => { hasStartedRef.current = true; setIsPlaying(true); setAudioError(""); },
    onPause: () => {
      setIsPlaying(false);
      setCurrentTime(audioRef.current?.currentTime || 0);
    },
    onLoadedMetadata: handleLoadedMetadata,
    onDurationChange: () => setDuration(audioRef.current?.duration || 0),
    onTimeUpdate: () => setCurrentTime(audioRef.current?.currentTime || 0),
    onProgress: updateBuffered,
    onError: () => {
      if (currentAyah?.audio && hasStartedRef.current) {
        setIsPlaying(false);
        setAudioError(getPlaybackErrorMessage(audioRef.current, audioRef.current?.error));
      }
    },
    onEnded: handleEnded,
  };

  return {
    audioProps,
    audioError,
    isPlaying,
    isAudioReady: Boolean(currentAyah?.audio && loadedAudioSource === currentAyah.audio),
    currentTime,
    duration,
    buffered,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    handlePlayPause,
    pause,
    retryPlayback,
    handleSeek,
  };
}
