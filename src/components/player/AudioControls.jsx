import {
  ListMusic,
  SkipBack,
  Play,
  Pause,
  SkipForward,
} from "lucide-react";

function AudioControls({
  onPlayPause,
  isPlaying,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  onTogglePoemsList,
}) {
  return (
    <div className="audio_btn flex flex-col items-center justify-between gap-3">
      <div className="flex justify-between items-center gap-10 ">
        <button
          type="button"
          aria-label="Afficher la liste des poèmes"
          onClick={onTogglePoemsList}
          className="absolute top-[10px] left-[10px]"
        >
          <ListMusic />
        </button>

        <button
          type="button"
          aria-label="Poème précédent"
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
          aria-label="Poème suivant"
          onClick={onNext}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <SkipForward />
        </button>
      </div>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        aria-label="Régler le volume"
        className="w-full cursor-pointer accent-primary my-4"
      />
    </div>
  );
}

export default AudioControls;
