import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  RotateCcw,
} from "lucide-react";

function formatPlaybackRate(rate) {
  return rate.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

function AudioControls({
  onPlayPause,
  isPlaying,
  onNext,
  onPrevious,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  playbackRate,
  onPlaybackRateChange,
}) {
  const secondaryButton =
    "flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex flex-col gap-2">
      <div className="grid w-full grid-cols-5 items-center justify-items-center">
        <button
          type="button"
          aria-label="Lecture aléatoire"
          aria-pressed={isShuffle}
          onClick={onToggleShuffle}
          className={`${secondaryButton} ${isShuffle ? "text-primary" : ""}`}
        >
          <Shuffle size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Verset précédent"
          onClick={onPrevious}
          className={secondaryButton}
        >
          <SkipBack size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label={isPlaying ? "Mettre en pause" : "Lire"}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--primary)_45%,transparent)] transition-[transform,box-shadow] duration-200 ease-out before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_30%_22%,rgb(255_255_255/0.28),transparent_60%)] before:content-[''] after:absolute after:-inset-1 after:rounded-full after:border after:border-primary/15 after:content-[''] hover:shadow-[0_16px_40px_-12px_color-mix(in_oklab,var(--primary)_55%,transparent)] motion-safe:hover:scale-[1.04] motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <Pause
              size={22}
              aria-hidden="true"
              className="relative z-10 fill-current"
            />
          ) : (
            <Play
              size={22}
              aria-hidden="true"
              className="relative z-10 translate-x-0.5 fill-current"
            />
          )}
        </button>

        <button
          type="button"
          aria-label="Verset suivant"
          onClick={onNext}
          className={secondaryButton}
        >
          <SkipForward size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label={
            repeatMode === "one"
              ? "Répéter un seul"
              : repeatMode === "all"
                ? "Répéter tout"
                : "Pas de répétition"
          }
          aria-pressed={repeatMode !== "off"}
          onClick={onToggleRepeat}
          className={`${secondaryButton} ${repeatMode !== "off" ? "text-primary" : ""}`}
        >
          {repeatMode === "one" ? (
            <Repeat1 size={18} aria-hidden="true" />
          ) : (
            <Repeat size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Réinitialiser la vitesse de lecture à 1×"
          onClick={() => onPlaybackRateChange(1)}
          className={secondaryButton}
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          value={playbackRate}
          onChange={(event) => onPlaybackRateChange(Number(event.target.value))}
          aria-label="Vitesse de lecture"
          aria-valuetext={`${formatPlaybackRate(playbackRate)} fois la vitesse normale`}
          className="h-1.5 w-full cursor-pointer accent-primary"
        />
        <span aria-hidden="true" className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          {formatPlaybackRate(playbackRate)}×
        </span>
      </div>
    </div>
  );
}

export default AudioControls;
