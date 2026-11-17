import {
  DEFAULT_SETTINGS,
  isValidAudioEdition,
  isValidTextEdition,
} from "@/lib/quranEditions";

const STORAGE_KEY = "quran-player-playback-v1";

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
