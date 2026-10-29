import { useCallback, useEffect, useRef, useState } from "react";

const PLAY_ERROR_MESSAGE = "Impossible de lire cet audio. Réessaie.";

export function useAudioPlayer(currentAyah, moveAyah, ayahIndex, ayahCount, surahNumber, repeatMode, isShuffle, resumePosition = 0) {
  const audioRef = useRef(null);
  const hasStartedRef = useRef(false);
  const [audioError, setAudioError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loadedAudioSource, setLoadedAudioSource] = useState(null);
  const resumePositionRef = useRef(resumePosition);

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentAyah?.audio) return;
    if (audio.paused) {
      hasStartedRef.current = true;
      try {
        if (audio.error) audio.load();
        await audio.play();
      }
      catch { setAudioError(PLAY_ERROR_MESSAGE); }
    } else audio.pause();
  }, [currentAyah?.audio]);

  const handleSeek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(time, 0), audio.duration);
    setCurrentTime(audio.currentTime);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    resumePositionRef.current = resumePosition;
    if (!audio || !currentAyah?.audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setLoadedAudioSource(null);
    setAudioError("");
    if (hasStartedRef.current) audio.play().catch(() => setAudioError(PLAY_ERROR_MESSAGE));
  }, [currentAyah?.audio, resumePosition]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  const handleEnded = useCallback(() => {
    if (repeatMode === "one") {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
      return;
    }
    if (isShuffle || ayahIndex < ayahCount - 1 || repeatMode === "all" || surahNumber < 114) moveAyah(1);
    else setIsPlaying(false);
  }, [repeatMode, isShuffle, ayahIndex, ayahCount, surahNumber, moveAyah]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
    setLoadedAudioSource(currentAyah?.audio ?? null);

    if (resumePositionRef.current > 0) {
      audio.currentTime = Math.min(resumePositionRef.current, Number.isFinite(audio.duration) ? audio.duration : resumePositionRef.current);
      setCurrentTime(audio.currentTime);
      resumePositionRef.current = 0;
    }
  };

  const audioProps = {
    ref: audioRef,
    src: currentAyah?.audio,
    preload: "none",
    onPlay: () => { hasStartedRef.current = true; setIsPlaying(true); setAudioError(""); },
    onPause: () => {
      setIsPlaying(false);
      setCurrentTime(audioRef.current?.currentTime || 0);
    },
    onLoadedMetadata: handleLoadedMetadata,
    onDurationChange: () => setDuration(audioRef.current?.duration || 0),
    onTimeUpdate: () => setCurrentTime(audioRef.current?.currentTime || 0),
    onError: () => { if (currentAyah?.audio) { setIsPlaying(false); setAudioError("Erreur de chargement de l’audio."); } },
    onEnded: handleEnded,
  };

  return {
    audioProps,
    audioError,
    isPlaying,
    isAudioReady: Boolean(currentAyah?.audio && loadedAudioSource === currentAyah.audio),
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    handlePlayPause,
    handleSeek,
  };
}
