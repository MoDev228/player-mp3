import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
} from "lucide-react";

function AudioControls({
  onPlayPause,
  isPlaying,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  isMuted,
  onToggleMute,
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
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
          aria-pressed={isMuted || volume === 0}
          onClick={onToggleMute}
          className={secondaryButton}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={18} aria-hidden="true" />
          ) : (
            <Volume2 size={18} aria-hidden="true" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(event) => {
            onVolumeChange(Number(event.target.value));
          }}
          aria-label="Régler le volume"
          className="h-1.5 w-full cursor-pointer accent-primary"
        />
      </div>
    </div>
  );
}

export default AudioControls;
