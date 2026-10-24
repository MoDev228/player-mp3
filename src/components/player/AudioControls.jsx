import {
  ListMusic,
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
  onToggleSurahList,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  isMuted,
  onToggleMute,
}) {
  return (
    <div className="audio_btn flex flex-col items-center justify-between gap-3">
      <div className="flex justify-between items-center gap-6 ">
        <button
          type="button"
          aria-label="Afficher la liste des sourates"
          onClick={onToggleSurahList}
          className="absolute top-[20px] left-[20px] cursor-pointer"
        >
          <ListMusic />
        </button>

        <button
          type="button"
          aria-label="Lecture aléatoire"
          onClick={onToggleShuffle}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted ${isShuffle ? "text-primary" : ""}`}
        >
          <Shuffle size={18} />
        </button>

        <button
          type="button"
          aria-label="Verset précédent"
          onClick={onPrevious}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <SkipBack />
        </button>

        <button
          type="button"
          aria-label={isPlaying ? "Mettre en pause" : "Lire"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>

        <button
          type="button"
          aria-label="Verset suivant"
          onClick={onNext}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <SkipForward />
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
          onClick={onToggleRepeat}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted ${repeatMode !== "off" ? "text-primary" : ""}`}
        >
          {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
        </button>
      </div>

      <div className="flex items-center gap-2 w-full my-4">
        <button
          type="button"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
          onClick={onToggleMute}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={18} />
          ) : (
            <Volume2 size={18} />
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
          className="w-full cursor-pointer accent-primary"
        />
      </div>
    </div>
  );
}

export default AudioControls;
