import { normalizeSettings } from "@/lib/quranEditions";

const STORAGE_KEY = "quran-player-settings-v1";

export function readSettings() {
  if (typeof localStorage === "undefined") return normalizeSettings(null);

  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return normalizeSettings(null);
  }
}

export function saveSettings(settings) {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
  } catch {
    // Les réglages restent actifs pour la session même si le stockage échoue.
  }
}
