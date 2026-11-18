import { useCallback, useEffect, useRef, useState } from "react";
import { useQuranLibrary } from "@/hooks/useQuranLibrary";
import { useAudioCache } from "@/hooks/useAudioCache";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlayerKeyboardShortcuts } from "@/hooks/usePlayerKeyboardShortcuts";
import { useSleepTimer } from "@/hooks/useSleepTimer";
import {
  findBookmark,
  readBookmarks,
  removeBookmark,
  saveBookmarks,
  toggleBookmark,
} from "@/lib/bookmarkStorage";
import { readSavedPlayback, savePlayback } from "@/lib/playbackStorage";
import ThemeToggle from "@/components/ThemeToggle";
import { getTextEdition } from "@/lib/quranEditions";
import AudioControls from "./AudioControls";
import AudioCacheStatus from "./AudioCacheStatus";
import AyahDisplay from "./AyahDisplay";
import BookmarkDialog from "./BookmarkDialog";
import DownloadButton from "./DownloadButton";
import OfflineManagerDialog from "./OfflineManagerDialog";
import PlayerHeader from "./PlayerHeader";
import PlayerTools from "./PlayerTools";
import ProgressBar from "./ProgressBar";
import SettingsButton from "./SettingsButton";
import SleepTimerDialog from "./SleepTimerDialog";
import SurahList from "./SurahList";
import SurahListButton from "./SurahListButton";
import VerseSearchDialog from "./VerseSearchDialog";

function PlayerCard({ theme, onToggleTheme, settings }) {
  const { audioEdition, textEdition, bilingual } = settings;
  const textEditionConfig = getTextEdition(textEdition);
  const [savedPlayback] = useState(readSavedPlayback);
  const [surahNumber, setSurahNumber] = useState(() => savedPlayback?.surahNumber ?? 1);
  const [ayahIndex, setAyahIndex] = useState(() => savedPlayback?.ayahIndex ?? 0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [showSurahList, setShowSurahList] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [loopRange, setLoopRange] = useState(null);
  const [cacheRevision, setCacheRevision] = useState(0);
  const pauseRef = useRef(null);

  const sleepTimer = useSleepTimer(() => pauseRef.current?.());
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
    cacheRevision,
  );
  const { status: audioCacheStatus, downloadSurah, isOnline } = audioCache;

  const currentSurah = surahs.find((surah) => surah.number === surahNumber);
  const surahAyahCount = ayahs.length > 0 ? ayahs.length : (currentSurah?.numberOfAyahs ?? 0);
  const safeAyahIndex = Math.min(Math.max(ayahIndex, 0), Math.max(surahAyahCount - 1, 0));
  const settingsKey = `${audioEdition}|${textEdition}`;
  const activeLoopRange = loopRange?.surahNumber === surahNumber
    && loopRange?.settingsKey === settingsKey
    ? loopRange
    : null;
  const loopState = !activeLoopRange ? "off" : activeLoopRange.end === null ? "start" : "active";

  const moveAyah = useCallback((direction) => {
    if (!ayahs.length) return;

    if (activeLoopRange?.end !== null && activeLoopRange?.end !== undefined) {
      setAyahIndex((current) => {
        const index = Math.min(Math.max(current, 0), ayahs.length - 1);
        if (direction > 0) return index >= activeLoopRange.end ? activeLoopRange.start : index + 1;
        return index <= activeLoopRange.start ? activeLoopRange.end : index - 1;
      });
      return;
    }

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
  }, [activeLoopRange, ayahs.length, isShuffle, repeatMode, safeAyahIndex, surahNumber]);

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
    {
      stopAtEnd: sleepTimer.stopAtEnd,
      onStopAtEnd: sleepTimer.cancel,
      initialPlaybackRate: savedPlayback?.playbackRate,
    },
  );
  const { audioProps, audioError, isPlaying, currentTime, duration, buffered, handlePlayPause, retryPlayback, handleSeek, isAudioReady, playbackRate, setPlaybackRate } = player;
  usePlayerKeyboardShortcuts({ handlePlayPause, moveAyah });

  useEffect(() => {
    pauseRef.current = player.pause;
  }, [player.pause]);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    if (!isAudioReady) return;
    savePlayback({
      surahNumber,
      ayahIndex: safeAyahIndex,
      currentTime,
      audioEdition,
      textEdition,
      playbackRate,
    });
  }, [audioEdition, currentTime, isAudioReady, playbackRate, safeAyahIndex, surahNumber, textEdition]);

  function selectSurah(number) {
    setAyahIndex(0);
    setSurahNumber(number);
    setShowSurahList(false);
  }

  function goToAyah(targetSurahNumber, targetAyahIndex) {
    setSurahNumber(targetSurahNumber);
    setAyahIndex(targetAyahIndex);
    setOpenDialog(null);
  }

  function handleToggleLoop() {
    if (!activeLoopRange) {
      setLoopRange({ surahNumber, settingsKey, start: safeAyahIndex, end: null });
    } else if (activeLoopRange.end === null) {
      setLoopRange(safeAyahIndex > activeLoopRange.start
        ? { ...activeLoopRange, end: safeAyahIndex }
        : null);
    } else {
      setLoopRange(null);
    }
  }

  async function handleDownload() {
    await downloadSurah();
    setCacheRevision((revision) => revision + 1);
  }

  function handleCacheDeleted() {
    setCacheRevision((revision) => revision + 1);
  }

  const bookmarked = Boolean(findBookmark(bookmarks, surahNumber, safeAyahIndex));
  const showArabic = Boolean(bilingual) && textEditionConfig.language !== "ar";

  const headerActions = (
    <>
      <DownloadButton
        status={audioCacheStatus}
        surahNumber={surahNumber}
        isOnline={isOnline}
        onDownload={handleDownload}
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
            showArabic={showArabic}
            bookmarked={bookmarked}
            onToggleBookmark={() => setBookmarks((current) => toggleBookmark(current, surahNumber, safeAyahIndex))}
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
              isShuffle={isShuffle}
              onToggleShuffle={() => setIsShuffle((value) => !value)}
              repeatMode={repeatMode}
              onToggleRepeat={() => setRepeatMode((mode) => mode === "off" ? "all" : mode === "all" ? "one" : "off")}
              playbackRate={playbackRate}
              onPlaybackRateChange={setPlaybackRate}
            />
            <PlayerTools
              openDialog={openDialog}
              onOpenSearch={() => setOpenDialog("search")}
              onOpenBookmarks={() => setOpenDialog("bookmarks")}
              onOpenOffline={() => setOpenDialog("offline")}
              loopState={loopState}
              onToggleLoop={handleToggleLoop}
              sleepLabel={sleepTimer.label}
              onOpenSleep={() => setOpenDialog("sleep")}
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
        <VerseSearchDialog
          open={openDialog === "search"}
          onClose={() => setOpenDialog(null)}
          ayahs={ayahs}
          surahName={currentSurah?.englishName ?? `Sourate ${surahNumber}`}
          onSelect={(index) => goToAyah(surahNumber, index)}
        />
        <BookmarkDialog
          open={openDialog === "bookmarks"}
          onClose={() => setOpenDialog(null)}
          bookmarks={bookmarks}
          currentSurahNumber={surahNumber}
          currentAyahIndex={safeAyahIndex}
          onSelect={goToAyah}
          onRemove={(targetSurah, targetAyahIndex) => setBookmarks((current) =>
            removeBookmark(current, targetSurah, targetAyahIndex))}
        />
        <SleepTimerDialog
          open={openDialog === "sleep"}
          onClose={() => setOpenDialog(null)}
          isActive={sleepTimer.isActive}
          label={sleepTimer.label}
          onStartMinutes={sleepTimer.startMinutes}
          onStartAtEnd={sleepTimer.startAtEnd}
          onCancel={sleepTimer.cancel}
        />
        <OfflineManagerDialog
          open={openDialog === "offline"}
          onClose={() => setOpenDialog(null)}
          audioEdition={audioEdition}
          revision={cacheRevision}
          onDeleted={handleCacheDeleted}
        />
      </article>
    </section>
  );
}

export default PlayerCard;
