import {
  DEFAULT_SETTINGS,
  isValidAudioEdition,
  isValidTextEdition,
} from "@/lib/quranEditions";

const STORAGE_KEY = "quran-player-playback-v1";

export const DEFAULT_PLAYBACK_RATE = 1;
export const MIN_PLAYBACK_RATE = 0.5;
export const MAX_PLAYBACK_RATE = 2;

export function normalizePlaybackRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return DEFAULT_PLAYBACK_RATE;

  const rounded = Math.round(rate * 100) / 100;
  return Math.min(MAX_PLAYBACK_RATE, Math.max(MIN_PLAYBACK_RATE, rounded));
}

export function readSavedPlayback() {
  if (typeof localStorage === "undefined") return null;

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Number.isInteger(saved.surahNumber) || saved.surahNumber < 1 || saved.surahNumber > 114) return null;
    if (!Number.isInteger(saved.ayahIndex) || saved.ayahIndex < 0 || saved.ayahIndex > 6235) return null;
    if (!Number.isFinite(saved.currentTime) || saved.currentTime < 0) return null;

    return {
      surahNumber: saved.surahNumber,
      ayahIndex: saved.ayahIndex,
      currentTime: saved.currentTime,
      audioEdition: isValidAudioEdition(saved.audioEdition)
        ? saved.audioEdition
        : DEFAULT_SETTINGS.audioEdition,
      textEdition: isValidTextEdition(saved.textEdition)
        ? saved.textEdition
        : DEFAULT_SETTINGS.textEdition,
      playbackRate: normalizePlaybackRate(saved.playbackRate),
    };
  } catch {
    return null;
  }
}

export function savePlayback(playback) {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playback));
  } catch {
    // Le lecteur peut continuer si le stockage est indisponible ou plein.
  }
}
