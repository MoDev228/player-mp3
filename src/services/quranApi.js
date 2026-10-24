const API_BASE_URL = "https://api.alquran.cloud/v1";

const FRENCH_AUDIO_EDITION = "fr.leclerc";

/**
 * Récupère une sourate avec son texte arabe et l'audio verset par verset.
 * @param {number} surahNumber - Numéro de la sourate, de 1 à 114.
 * @returns {Promise<object>} Les données de la sourate.
 */
export async function getSurah(surahNumber) {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Le numéro de sourate doit être compris entre 1 et 114.");
  }

  const response = await fetch(
    `${API_BASE_URL}/surah/${surahNumber}/${FRENCH_AUDIO_EDITION}`,
  );

  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200 || !result.data) {
    throw new Error("Impossible de récupérer les données de la sourate.");
  }

  return result.data;
}

/**
 * Récupère la liste des 114 sourates du Coran.
 * @returns {Promise<Array>} La liste des sourates.
 */
export async function getSurahs() {
  const response = await fetch(`${API_BASE_URL}/surah`);

  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200 || !Array.isArray(result.data)) {
    throw new Error("Impossible de récupérer la liste des sourates.");
  }

  return result.data;
}
