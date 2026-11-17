import { WifiOff } from "lucide-react";

function formatTime(time) {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function ProgressBar({ currentTime, duration, buffered = 0, onSeek, isOnline = true, isLoading = false }) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const safeCurrentTime = Number.isFinite(currentTime) ? Math.min(Math.max(currentTime, 0), safeDuration) : 0;
  const isReady = safeDuration > 0;
  const progress = isReady ? (safeCurrentTime / safeDuration) * 100 : 0;
  const bufferedPercent = Number.isFinite(buffered) ? Math.min(Math.max(buffered, 0), 1) * 100 : 0;
  const loaded = Math.max(progress, bufferedPercent);

  return (
    <div className="w-full py-1">
      <div className="flex items-center gap-2.5">
        <div className="flex w-10 shrink-0 items-center gap-1">
          {!isOnline && (
            <WifiOff
              size={12}
              role="img"
              aria-label="Hors connexion"
              className="shrink-0 text-accent"
            />
          )}
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatTime(safeCurrentTime)}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center">
          <input
            type="range"
            min={0}
            max={isReady ? safeDuration : 1}
            step={0.5}
            value={isReady ? safeCurrentTime : 0}
            disabled={!isReady}
            data-loading={!isReady && isLoading ? "true" : "false"}
            aria-label="Position dans le verset"
            aria-valuetext={
              isReady
                ? `${formatTime(safeCurrentTime)} sur ${formatTime(safeDuration)}`
                : "Audio en cours de chargement"
            }
            onChange={(event) => onSeek(Number(event.target.value))}
            style={{ "--seek-progress": `${progress}%`, "--seek-loaded": `${loaded}%` }}
            className="seek-slider"
          />
        </div>

        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
          {isReady ? `-${formatTime(Math.max(0, safeDuration - safeCurrentTime))}` : "--:--"}
        </span>
      </div>
    </div>
  );
}

export default ProgressBar;
