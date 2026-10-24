const API_BASE_URL = "https://api.alquran.cloud/v1";

const FRENCH_AUDIO_EDITION = "fr.leclerc";
const API_CACHE_NAME = "quran-api-v1";

async function getJson(url, isValid) {
  const cache = "caches" in globalThis
    ? await caches.open(API_CACHE_NAME).catch(() => null)
    : null;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const result = await response.json();

    if (!isValid(result)) {
      throw new Error("La réponse de l’API est invalide.");
    }

    if (cache) {
      const cachedResponse = new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put(url, cachedResponse).catch(() => {});
    }

    return result;
  } catch (error) {
    const cachedResponse = await cache?.match(url).catch(() => undefined);

    if (cachedResponse) {
      const cachedResult = await cachedResponse.json();
      if (isValid(cachedResult)) return cachedResult;
    }

    throw error;
  }
}

/**
 * Récupère une sourate avec son texte arabe et l'audio verset par verset.
 * @param {number} surahNumber - Numéro de la sourate, de 1 à 114.
 * @returns {Promise<object>} Les données de la sourate.
 */
export async function getSurah(surahNumber) {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Le numéro de sourate doit être compris entre 1 et 114.");
  }

  const result = await getJson(
    `${API_BASE_URL}/surah/${surahNumber}/${FRENCH_AUDIO_EDITION}`,
    (response) => response.code === 200 && Boolean(response.data?.ayahs),
  );

  return result.data;
}

/**
 * Récupère la liste des 114 sourates du Coran.
 * @returns {Promise<Array>} La liste des sourates.
 */
export async function getSurahs() {
  const result = await getJson(
    `${API_BASE_URL}/surah`,
    (response) => response.code === 200 && Array.isArray(response.data),
  );

  return result.data;
}
