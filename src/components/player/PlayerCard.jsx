import { useCallback, useEffect, useState } from "react";
import { FiGithub } from "react-icons/fi";
import { useQuranLibrary } from "@/hooks/useQuranLibrary";
import { useAudioCache } from "@/hooks/useAudioCache";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlayerKeyboardShortcuts } from "@/hooks/usePlayerKeyboardShortcuts";
import { readSavedPlayback, savePlayback } from "@/lib/playbackStorage";
import AudioControls from "./AudioControls";
import AudioCacheStatus from "./AudioCacheStatus";
import FloatingDownloadButton from "./FloatingDownloadButton";
import AyahDisplay from "./AyahDisplay";
import PlayerHeader from "./PlayerHeader";
import ProgressBar from "./ProgressBar";
import SurahList from "./SurahList";

function PlayerCard() {
  const [savedPlayback] = useState(readSavedPlayback);
  const [surahNumber, setSurahNumber] = useState(() => savedPlayback?.surahNumber ?? 1);
  const [ayahIndex, setAyahIndex] = useState(() => savedPlayback?.ayahIndex ?? 0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [showSurahList, setShowSurahList] = useState(false);
  const library = useQuranLibrary(surahNumber, ayahIndex);
  const { surahs, ayahs, loadedSurahNumber, currentAyah, isLoading, error, surahsLoading, surahsError, retrySurahs, retrySurah } = library;
  const audioCache = useAudioCache(ayahs, loadedSurahNumber, surahNumber, isLoading);
  const { status: audioCacheStatus, downloadSurah, isOnline } = audioCache;

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

  const resumePosition = savedPlayback?.surahNumber === surahNumber && savedPlayback?.ayahIndex === ayahIndex
    ? savedPlayback.currentTime
    : 0;
  const player = useAudioPlayer(currentAyah, moveAyah, ayahIndex, ayahs.length, surahNumber, repeatMode, isShuffle, resumePosition);
  const { audioProps, audioError, isPlaying, currentTime, duration, volume, setVolume, isMuted, setIsMuted, handlePlayPause, handleSeek, isAudioReady } = player;
  usePlayerKeyboardShortcuts({ handlePlayPause, moveAyah, setVolume, setIsMuted });

  useEffect(() => {
    if (!isAudioReady) return;
    savePlayback({ surahNumber, ayahIndex, currentTime });
  }, [ayahIndex, currentTime, isAudioReady, surahNumber]);

  function selectSurah(number) {
    setAyahIndex(0);
    setSurahNumber(number);
    setShowSurahList(false);
  }

  return (
    <section className="flex min-h-[calc(100svh-2rem)] w-full items-center justify-center p-4 sm:p-6">
      <article className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl">
        <a href="https://github.com/MoDev228" target="_blank" rel="noopener noreferrer"
          aria-label="Ouvrir le profil GitHub du créateur"
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <FiGithub size={18} />
        </a>

        <div className="px-4 pb-6 pt-8 sm:px-8">
          <PlayerHeader surah={surahs.find((surah) => surah.number === surahNumber)} />
          <AyahDisplay isLoading={isLoading} error={error} ayah={currentAyah} ayahCount={ayahs.length} onRetry={retrySurah} />
          <AudioCacheStatus status={audioCacheStatus} surahNumber={surahNumber} />

          {audioError && (
            <div role="alert" className="mt-3 flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-destructive">{audioError}</p>
              <button type="button" onClick={handlePlayPause} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                Réessayer la lecture
              </button>
            </div>
          )}
          <audio {...audioProps} />
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
          <AudioControls
            onPlayPause={handlePlayPause}
            isPlaying={isPlaying}
            onNext={() => moveAyah(1)}
            onPrevious={() => moveAyah(-1)}
            volume={volume}
            onVolumeChange={(value) => { setVolume(value); if (value > 0) setIsMuted(false); }}
            onToggleSurahList={() => setShowSurahList((visible) => !visible)}
            isShuffle={isShuffle}
            onToggleShuffle={() => setIsShuffle((value) => !value)}
            repeatMode={repeatMode}
            onToggleRepeat={() => setRepeatMode((mode) => mode === "off" ? "all" : mode === "all" ? "one" : "off")}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((muted) => !muted)}
          />
        </div>

        {showSurahList && <SurahList surahs={surahs} currentSurahNumber={surahNumber} onSelectSurah={selectSurah} onClose={() => setShowSurahList(false)} isLoading={surahsLoading} error={surahsError} onRetry={retrySurahs} />}
      </article>
      <FloatingDownloadButton status={audioCacheStatus} surahNumber={surahNumber} isOnline={isOnline} onDownload={downloadSurah} />
    </section>
  );
}

export default PlayerCard;
