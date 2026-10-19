

function ProgressBar({ currentTime, duration, onSeek }) {
  function formatTime(time) {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function handleProgressClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newTime = percentage * duration;

    onSeek(newTime);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className=" w-full flex justify-between items-center gap-3 my-4">
      <span className="text-xs text-muted-foreground">
        {formatTime(currentTime)}
      </span>

      <div
        className="h-1 flex-1 cursor-pointer rounded-full bg-muted"
        onClick={handleProgressClick}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-xs text-muted-foreground">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export default ProgressBar;
