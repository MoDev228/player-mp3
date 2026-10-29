const STORAGE_KEY = "quran-player-playback-v1";

export function readSavedPlayback() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Number.isInteger(saved.surahNumber) || saved.surahNumber < 1 || saved.surahNumber > 114) return null;
    if (!Number.isInteger(saved.ayahIndex) || saved.ayahIndex < 0 || saved.ayahIndex > 6235) return null;
    if (!Number.isFinite(saved.currentTime) || saved.currentTime < 0) return null;
    return saved;
  } catch {
    return null;
  }
}

export function savePlayback(playback) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playback));
  } catch {
    // The player can continue if storage is unavailable or full.
  }
}
