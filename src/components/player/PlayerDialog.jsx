import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

function PlayerDialog({
  open,
  onClose,
  title,
  children,
  className = "max-w-md",
  focusClose = true,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className={`m-auto flex h-[min(75dvh,32rem)] w-[calc(100%-1rem)] flex-col overflow-hidden rounded-xl border border-border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/40 ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <h2 id={titleId} className="text-base font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          autoFocus={focusClose}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
        {children}
      </div>
    </dialog>
  );
}

export default PlayerDialog;
