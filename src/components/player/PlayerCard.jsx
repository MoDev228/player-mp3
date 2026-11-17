import { useCallback, useEffect, useState } from "react";
import { useQuranLibrary } from "@/hooks/useQuranLibrary";
import { useAudioCache } from "@/hooks/useAudioCache";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlayerKeyboardShortcuts } from "@/hooks/usePlayerKeyboardShortcuts";
import { readSavedPlayback, savePlayback } from "@/lib/playbackStorage";
import ThemeToggle from "@/components/ThemeToggle";
import { getTextEdition } from "@/lib/quranEditions";
import AudioControls from "./AudioControls";
import AudioCacheStatus from "./AudioCacheStatus";
import DownloadButton from "./DownloadButton";
import AyahDisplay from "./AyahDisplay";
import PlayerHeader from "./PlayerHeader";
import ProgressBar from "./ProgressBar";
import SettingsButton from "./SettingsButton";
import SurahList from "./SurahList";
import SurahListButton from "./SurahListButton";

function PlayerCard({ theme, onToggleTheme, settings }) {
  const { audioEdition, textEdition } = settings;
  const textEditionConfig = getTextEdition(textEdition);
  const [savedPlayback] = useState(readSavedPlayback);
  const [surahNumber, setSurahNumber] = useState(() => savedPlayback?.surahNumber ?? 1);
  const [ayahIndex, setAyahIndex] = useState(() => savedPlayback?.ayahIndex ?? 0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [showSurahList, setShowSurahList] = useState(false);
  const library = useQuranLibrary(surahNumber, ayahIndex, settings);
  const {
    surahs,
    ayahs,
    loadedSurahNumber,
    loadedAudioEdition,
    currentAyah,
    isLoading,
    error,
    surahsLoading,
    surahsError,
    retrySurahs,
    retrySurah,
  } = library;
  const audioCacheReady = loadedAudioEdition === audioEdition && loadedSurahNumber === surahNumber;
  const audioCache = useAudioCache(
    ayahs,
    audioCacheReady ? surahNumber : null,
    surahNumber,
    isLoading,
    audioEdition,
  );
  const { status: audioCacheStatus, downloadSurah, isOnline } = audioCache;

  const currentSurah = surahs.find((surah) => surah.number === surahNumber);
  const surahAyahCount = ayahs.length > 0 ? ayahs.length : (currentSurah?.numberOfAyahs ?? 0);
  const safeAyahIndex = Math.min(Math.max(ayahIndex, 0), Math.max(surahAyahCount - 1, 0));

  const moveAyah = useCallback((direction) => {
    if (!ayahs.length) return;
    if (isShuffle && ayahs.length > 1) {
      setAyahIndex((current) => {
        let next = Math.min(Math.max(current, 0), ayahs.length - 1);
        while (next === current) next = Math.floor(Math.random() * ayahs.length);
        return next;
      });
      return;
    }

    const nextIndex = safeAyahIndex + direction;
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
  }, [ayahs.length, safeAyahIndex, isShuffle, repeatMode, surahNumber]);

  const canResume = savedPlayback?.audioEdition === audioEdition
    && savedPlayback?.surahNumber === surahNumber
    && savedPlayback?.ayahIndex === safeAyahIndex;
  const resumePosition = canResume ? savedPlayback.currentTime : 0;
  const player = useAudioPlayer(
    currentAyah,
    moveAyah,
    safeAyahIndex,
    ayahs.length,
    surahNumber,
    repeatMode,
    isShuffle,
    resumePosition,
    audioEdition,
  );
  const { audioProps, audioError, isPlaying, currentTime, duration, buffered, volume, setVolume, isMuted, setIsMuted, handlePlayPause, retryPlayback, handleSeek, isAudioReady } = player;
  usePlayerKeyboardShortcuts({ handlePlayPause, moveAyah, setVolume, setIsMuted });

  useEffect(() => {
    if (!isAudioReady) return;
    savePlayback({
      surahNumber,
      ayahIndex: safeAyahIndex,
      currentTime,
      audioEdition,
      textEdition,
    });
  }, [audioEdition, currentTime, isAudioReady, safeAyahIndex, surahNumber, textEdition]);

  function selectSurah(number) {
    setAyahIndex(0);
    setSurahNumber(number);
    setShowSurahList(false);
  }

  const headerActions = (
    <>
      <DownloadButton
        status={audioCacheStatus}
        surahNumber={surahNumber}
        isOnline={isOnline}
        onDownload={downloadSurah}
      />
      <SettingsButton />
      <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
    </>
  );

  return (
    <section className="flex h-[100dvh] w-full justify-center overflow-hidden bg-background sm:p-4">
      <article className="relative flex h-full w-full max-w-none flex-col overflow-hidden border-border bg-card text-card-foreground sm:max-w-3xl sm:rounded-3xl sm:border sm:shadow-xl">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:py-6">
          <PlayerHeader
            surah={currentSurah}
            leading={
              <SurahListButton
                open={showSurahList}
                onClick={() => setShowSurahList((visible) => !visible)}
              />
            }
            actions={headerActions}
          />
          <AyahDisplay
            isLoading={isLoading}
            error={error}
            ayah={currentAyah}
            ayahCount={ayahs.length}
            onRetry={retrySurah}
            textEdition={textEditionConfig}
          />
          <AudioCacheStatus status={audioCacheStatus} surahNumber={surahNumber} />

          {audioError && (
            <div role="alert" className="mt-2 flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-destructive">{audioError}</p>
              <button type="button" onClick={retryPlayback} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                Réessayer la lecture
              </button>
            </div>
          )}
          <audio {...audioProps} />
          <div className="mt-1 shrink-0 sm:mt-2">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              buffered={buffered}
              onSeek={handleSeek}
              isOnline={isOnline}
              isLoading={isLoading}
            />
            <AudioControls
              onPlayPause={handlePlayPause}
              isPlaying={isPlaying}
              onNext={() => moveAyah(1)}
              onPrevious={() => moveAyah(-1)}
              volume={volume}
              onVolumeChange={(value) => { setVolume(value); if (value > 0) setIsMuted(false); }}
              isShuffle={isShuffle}
              onToggleShuffle={() => setIsShuffle((value) => !value)}
              repeatMode={repeatMode}
              onToggleRepeat={() => setRepeatMode((mode) => mode === "off" ? "all" : mode === "all" ? "one" : "off")}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((muted) => !muted)}
            />
          </div>
        </div>

        <SurahList
          open={showSurahList}
          surahs={surahs}
          currentSurahNumber={surahNumber}
          onSelectSurah={selectSurah}
          onClose={() => setShowSurahList(false)}
          isLoading={surahsLoading}
          error={surahsError}
          onRetry={retrySurahs}
        />
      </article>
    </section>
  );
}

export default PlayerCard;
