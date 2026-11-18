import { useEffect } from "react";

export function usePlayerKeyboardShortcuts({ handlePlayPause, moveAyah }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || event.repeat) return;
      if (event.target instanceof HTMLElement) {
        const interactive = event.target.closest("input, textarea, select, button, a[href], [contenteditable='true'], [role='slider'], [role='dialog'], [role='textbox'], dialog[open]");
        if (event.target.isContentEditable || interactive) return;
      }
      if (event.code === "Space") { event.preventDefault(); handlePlayPause(); }
      if (event.code === "ArrowRight") { event.preventDefault(); moveAyah(1); }
      if (event.code === "ArrowLeft") { event.preventDefault(); moveAyah(-1); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePlayPause, moveAyah]);
}
