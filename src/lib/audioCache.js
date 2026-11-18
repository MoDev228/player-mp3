import { getAudioCacheName } from "@/lib/quranEditions";
import { SURAH_METADATA } from "@/lib/surahMetadata";

export { getAudioCacheName };

const SURAH_STARTS = new Map([[1, 1]]);

for (let index = 0; index < SURAH_METADATA.length - 1; index += 1) {
  const start = SURAH_STARTS.get(SURAH_METADATA[index].number)
    + SURAH_METADATA[index].numberOfAyahs;
  SURAH_STARTS.set(SURAH_METADATA[index + 1].number, start);
}

function getSurahFromCacheUrl(rawUrl) {
  const url = rawUrl.split("?")[0];
  const quranEncMatch = url.match(/\/data\/audio\/[^/]+\/(\d{3})(\d{3})\.mp3$/);

  if (quranEncMatch) {
    const surahNumber = Number(quranEncMatch[1]);
    return surahNumber >= 1 && surahNumber <= 114 ? surahNumber : null;
  }

  const globalMatch = url.match(/\/quran\/audio\/\d+\/[^/]+\/(\d+)\.mp3$/);
  if (!globalMatch) return null;

  const globalNumber = Number(globalMatch[1]);
  for (let surahNumber = 114; surahNumber >= 1; surahNumber -= 1) {
    if (globalNumber >= SURAH_STARTS.get(surahNumber)) return surahNumber;
  }
  return null;
}

export async function getAudioCache(audioEdition) {
  if (!("caches" in globalThis)) return null;
  try {
    return await caches.open(getAudioCacheName(audioEdition));
  } catch {
    return null;
  }
}

export function withCacheBust(url, prefix) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${prefix}=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Download a whole MP3 and store it under its canonical URL.
 *
 * The audio CDN has no CORS headers, so the response is opaque: its body is
 * unusable from JavaScript. We therefore let the browser keep the opaque
 * response intact in Cache Storage, and we bypass both the service worker and
 * the HTTP cache so a partial `Range` response can never be stored.
 */
export async function cacheFullAudio(url, audioEdition) {
  const response = await fetch(withCacheBust(url, "dl"), {
    mode: "no-cors",
    cache: "no-store",
  });

  if (response.type !== "opaque" && !response.ok) {
    throw new Error(`Téléchargement audio échoué : ${response.status}`);
  }

  const cache = await getAudioCache(audioEdition);
  if (!cache) throw new Error("Cache Storage indisponible.");

  await cache.put(url, response);
  if (!(await cache.match(url))) throw new Error("Audio non enregistré dans le cache.");
}

export async function isAudioCached(url, audioEdition) {
  const cache = await getAudioCache(audioEdition);
  if (!cache) return false;
  return Boolean(await cache.match(url).catch(() => undefined));
}

export async function removeCachedAudio(url, audioEdition) {
  const cache = await getAudioCache(audioEdition);
  if (!cache) return;
  try {
    await cache.delete(url);
  } catch {
    // A failed cleanup must not prevent a network retry.
  }
}

/** Liste les sourates dont au moins un audio est présent dans le cache. */
export async function listCachedSurahs(audioEdition) {
  const cache = await getAudioCache(audioEdition);
  if (!cache) return [];

  const keys = await cache.keys();
  const counts = new Map();

  for (const request of keys) {
    const surahNumber = getSurahFromCacheUrl(request.url);
    if (surahNumber) counts.set(surahNumber, (counts.get(surahNumber) ?? 0) + 1);
  }

  return SURAH_METADATA
    .filter((surah) => counts.has(surah.number))
    .map((surah) => ({
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      numberOfAyahs: surah.numberOfAyahs,
      cached: counts.get(surah.number),
    }))
    .sort((a, b) => a.number - b.number);
}

/** Supprime tous les audios mis en cache d'une sourate. */
export async function deleteCachedSurah(audioEdition, surahNumber) {
  const cache = await getAudioCache(audioEdition);
  if (!cache) return 0;

  const keys = await cache.keys();
  const matches = keys.filter(
    (request) => getSurahFromCacheUrl(request.url) === surahNumber,
  );

  let deleted = 0;
  await Promise.all(matches.map(async (request) => {
    if (await cache.delete(request)) deleted += 1;
  }));
  return deleted;
}

export async function getCacheStorageEstimate() {
  if (!navigator.storage?.estimate) return null;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota };
  } catch {
    return null;
  }
}
