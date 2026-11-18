import {
  getAudioEdition,
  getTextEdition,
  normalizeSettings,
} from "@/lib/quranEditions";
import { getSurahMetadata, SURAH_METADATA } from "@/lib/surahMetadata";

const API_BASE_URL = "https://quranenc.com/api/v1";
const AUDIO_BASE_URL = "https://d.quranenc.com/data/audio";
const ALQURAN_API_BASE_URL = "https://api.alquran.cloud/v1";
const ISLAMIC_AUDIO_BASE_URL = "https://cdn.islamic.network/quran/audio";
const API_CACHE_NAME = "quran-api-v3";

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

function isSuraResponse(response, textField) {
  return (
    Array.isArray(response?.result) &&
    response.result.length > 0 &&
    response.result.every(
      (ayah) =>
        ayah &&
        typeof ayah.arabic_text === "string" &&
        typeof ayah[textField] === "string",
    )
  );
}

function isAlQuranSuraResponse(response) {
  const ayahs = response?.data?.ayahs;

  return (
    response?.code === 200 &&
    Array.isArray(ayahs) &&
    ayahs.length > 0 &&
    ayahs.every(
      (ayah) =>
        ayah &&
        Number.isInteger(Number(ayah.number)) &&
        Number.isInteger(Number(ayah.numberInSurah)) &&
        typeof ayah.text === "string",
    )
  );
}

function isTranslationInfoResponse(response, translationKey) {
  return (
    response?.key === translationKey && typeof response.version === "string"
  );
}

function padAyaNumber(value) {
  return String(value).padStart(3, "0");
}

/**
 * Construit l’URL du MP3 d’un verset pour l’édition audio choisie.
 * Les traductions QuranEnc utilisent le numéro du verset dans la sourate,
 * tandis que les récitations arabes utilisent le numéro global du verset.
 * @param {string} audioEdition - Identifiant interne de l’édition audio.
 * @param {number} surahNumber - Numéro de la sourate.
 * @param {number} ayaNumber - Numéro du verset dans la sourate.
 * @param {number} globalAyaNumber - Numéro global du verset.
 * @returns {string} URL du fichier audio.
 */
export function getAudioUrl(audioEdition, surahNumber, ayaNumber, globalAyaNumber) {
  const edition = getAudioEdition(audioEdition);

  if (edition.audioSource === "alquran") {
    return `${ISLAMIC_AUDIO_BASE_URL}/${edition.bitrate}/${edition.id}/${globalAyaNumber}.mp3`;
  }

  return `${AUDIO_BASE_URL}/${edition.translationKey}/${padAyaNumber(surahNumber)}${padAyaNumber(ayaNumber)}.mp3`;
}

function toPlayerAyah(ayah, surahNumber, audioEdition, textField) {
  const number = Number(ayah.id);
  const numberInSurah = Number(ayah.aya);

  if (!Number.isInteger(number) || !Number.isInteger(numberInSurah)) {
    throw new Error("Les numéros de versets renvoyés par l’API sont invalides.");
  }

  const text = ayah[textField];
  if (typeof text !== "string") {
    throw new Error("Un verset texte est manquant.");
  }

  return {
    number,
    numberInSurah,
    text,
    audio: getAudioUrl(audioEdition, surahNumber, numberInSurah, number),
  };
}

function toPlayerAyahFromAlQuran(ayah, surahNumber, audioEdition) {
  const number = Number(ayah.number);
  const numberInSurah = Number(ayah.numberInSurah);

  return {
    number,
    numberInSurah,
    text: ayah.text,
    audio: getAudioUrl(audioEdition, surahNumber, numberInSurah, number),
  };
}

/**
 * Récupère une sourate dans le format attendu par le lecteur.
 * @param {number} surahNumber - Numéro de la sourate, de 1 à 114.
 * @param {{ audioEdition: string, textEdition: string }} settings - Éditions choisies.
 * @returns {Promise<object>} Les données de la sourate.
 */
export async function getSurah(surahNumber, settings) {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Le numéro de sourate doit être compris entre 1 et 114.");
  }

  const { audioEdition, textEdition } = normalizeSettings(settings);
  const textConfig = getTextEdition(textEdition);
  const metadata = getSurahMetadata(surahNumber);

  if (textConfig.textSource === "alquran") {
    const result = await getJson(
      `${ALQURAN_API_BASE_URL}/surah/${surahNumber}/${encodeURIComponent(textConfig.translationKey)}`,
      isAlQuranSuraResponse,
    );

    return {
      ...metadata,
      ayahs: result.data.ayahs.map((ayah) =>
        toPlayerAyahFromAlQuran(ayah, surahNumber, audioEdition),
      ),
    };
  }

  const textField = textConfig.language === "ar" ? "arabic_text" : "translation";

  const result = await getJson(
    `${API_BASE_URL}/translation/sura/${textConfig.translationKey}/${surahNumber}`,
    (response) => isSuraResponse(response, textField),
  );

  return {
    ...metadata,
    ayahs: result.result.map((ayah) =>
      toPlayerAyah(ayah, surahNumber, audioEdition, textField),
    ),
  };
}

/**
 * Retourne la liste des 114 sourates. Les métadonnées sont embarquées :
 * QuranEnc ne fournit pas d’équivalent à `englishName` ou `revelationType`.
 * @returns {Promise<Array>} La liste des sourates.
 */
export async function getSurahs() {
  return SURAH_METADATA;
}

/**
 * Récupère la version d’une traduction, pour le crédit affiché dans les
 * réglages et le respect des conditions d’attribution de QuranEnc.
 * @param {string} translationKey - Clé de la traduction.
 * @param {string} source - Fournisseur de la traduction (`quranenc` par défaut).
 * @returns {Promise<{ version: string, lastUpdate: number }|null>}
 */
export async function getTranslationInfo(translationKey, source = "quranenc") {
  if (source !== "quranenc") return null;

  const result = await getJson(
    `${API_BASE_URL}/translations/updates?key=${encodeURIComponent(translationKey)}`,
    (response) => isTranslationInfoResponse(response, translationKey),
  );

  return { version: result.version, lastUpdate: result.last_update };
}
