import { normalizeSettings } from "@/lib/quranEditions";

const API_BASE_URL = "https://api.alquran.cloud/v1";
const API_CACHE_NAME = "quran-api-v2";

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

function isSurahResponse(response) {
  return (
    response?.code === 200 &&
    Array.isArray(response.data?.ayahs) &&
    response.data.ayahs.length > 0
  );
}

function mergeAyahs(audioAyahs, textAyahs) {
  if (audioAyahs.length !== textAyahs.length) {
    throw new Error("Les éditions audio et texte n’ont pas le même nombre de versets.");
  }

  const textsByNumber = new Map(
    textAyahs.map((ayah) => [ayah.numberInSurah, ayah.text]),
  );

  return audioAyahs.map((audioAyah) => {
    const text = textsByNumber.get(audioAyah.numberInSurah);

    if (typeof text !== "string") {
      throw new Error("Un verset texte est manquant.");
    }

    return {
      ...audioAyah,
      text: text.replace(/^\uFEFF/, ""),
    };
  });
}

/**
 * Récupère une sourate en fusionnant une édition audio et une édition texte.
 * @param {number} surahNumber - Numéro de la sourate, de 1 à 114.
 * @param {{ audioEdition: string, textEdition: string }} settings - Éditions choisies.
 * @returns {Promise<object>} Les données de la sourate.
 */
export async function getSurah(surahNumber, settings) {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Le numéro de sourate doit être compris entre 1 et 114.");
  }

  const { audioEdition, textEdition } = normalizeSettings(settings);

  const [audioResult, textResult] = await Promise.all([
    getJson(
      `${API_BASE_URL}/surah/${surahNumber}/${audioEdition}`,
      isSurahResponse,
    ),
    getJson(
      `${API_BASE_URL}/surah/${surahNumber}/${textEdition}`,
      isSurahResponse,
    ),
  ]);

  return {
    ...audioResult.data,
    ayahs: mergeAyahs(audioResult.data.ayahs, textResult.data.ayahs),
  };
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
