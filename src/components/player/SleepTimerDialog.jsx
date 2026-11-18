import PlayerDialog from "./PlayerDialog";

const OPTIONS = [5, 10, 15, 30, 60];

function SleepTimerDialog({
  open,
  onClose,
  onStartMinutes,
  onStartAtEnd,
  onCancel,
  isActive,
  label,
}) {
  function choose(action) {
    action();
    onClose();
  }

  return (
    <PlayerDialog open={open} onClose={onClose} title="Minuteur de sommeil">
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
        La lecture s’arrêtera automatiquement.
      </p>

      {isActive && (
        <p className="mb-3 rounded-xl bg-muted px-3 py-2 text-sm font-medium">
          En cours : {label}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => choose(() => onStartMinutes(minutes))}
            className="min-h-11 rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {minutes} minutes
          </button>
        ))}
        <button
          type="button"
          onClick={() => choose(onStartAtEnd)}
          className="min-h-11 rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Fin du verset
        </button>
      </div>

      {isActive && (
        <button
          type="button"
          onClick={() => choose(onCancel)}
          className="mt-3 min-h-11 w-full rounded-xl border border-destructive/40 px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Annuler le minuteur
        </button>
      )}
    </PlayerDialog>
  );
}

export default SleepTimerDialog;
