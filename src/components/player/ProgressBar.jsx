function ProgressBar({ currentTime, duration, onSeek }) {
  function formatTime(time) {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function handleProgressClick(event) {
    if (duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clickPosition = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const percentage = clickPosition / rect.width;
    const newTime = percentage * duration;

    onSeek(newTime);
  }

  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const safeCurrentTime = Number.isFinite(currentTime) ? Math.min(Math.max(currentTime, 0), safeDuration) : 0;
  const progress = safeDuration > 0 ? (safeCurrentTime / safeDuration) * 100 : 0;

  function handleKeyDown(event) {
    if (safeDuration <= 0) return;
    let nextTime = safeCurrentTime;
    if (event.key === "ArrowRight") nextTime += 5;
    else if (event.key === "ArrowLeft") nextTime -= 5;
    else if (event.key === "PageUp") nextTime += 10;
    else if (event.key === "PageDown") nextTime -= 10;
    else if (event.key === "Home") nextTime = 0;
    else if (event.key === "End") nextTime = safeDuration;
    else return;

    event.preventDefault();
    onSeek(Math.min(Math.max(nextTime, 0), safeDuration));
  }

  return (
    <div className=" w-full flex flex-col justify-center items-center gap-3 my-4">
      <div
        className={`w-full h-2 rounded-full bg-muted ${safeDuration > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
        onClick={handleProgressClick}
        role="slider"
        aria-label="Position dans le verset"
        aria-valuemin={0}
        aria-valuemax={safeDuration}
        aria-valuenow={safeCurrentTime}
        aria-valuetext={`${formatTime(safeCurrentTime)} sur ${formatTime(safeDuration)}`}
        aria-disabled={safeDuration <= 0}
        tabIndex={safeDuration > 0 ? 0 : -1}
        onKeyDown={handleKeyDown}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="w-full flex justify-between">
        <span className="text-xs text-muted-foreground">
          {formatTime(safeCurrentTime)}
        </span>

        <span className="text-xs text-muted-foreground">
          -{formatTime(Math.max(0, safeDuration - safeCurrentTime))}
        </span>
      </div>
    </div>
  );
}

export default ProgressBar;
