import { useEffect } from "react";

export function usePlayerKeyboardShortcuts({ handlePlayPause, moveAyah, setVolume, setIsMuted }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || event.repeat) return;
      if (event.target instanceof HTMLElement) {
        const interactive = event.target.closest("input, textarea, select, button, a[href], [contenteditable='true'], [role='slider'], [role='dialog'], [role='textbox']");
        if (event.target.isContentEditable || interactive) return;
      }
      if (event.code === "Space") { event.preventDefault(); handlePlayPause(); }
      if (event.code === "ArrowRight") { event.preventDefault(); moveAyah(1); }
      if (event.code === "ArrowLeft") { event.preventDefault(); moveAyah(-1); }
      if (event.code === "ArrowUp") { event.preventDefault(); setVolume((value) => Math.min(1, Math.round((value + 0.1) * 100) / 100)); setIsMuted(false); }
      if (event.code === "ArrowDown") { event.preventDefault(); setVolume((value) => Math.max(0, Math.round((value - 0.1) * 100) / 100)); }
      if (event.key?.toLowerCase() === "m") setIsMuted((muted) => !muted);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePlayPause, moveAyah, setVolume, setIsMuted]);
}
