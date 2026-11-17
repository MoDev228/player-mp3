export const AUDIO_CACHE_NAME = "quran-audio-fr-v2";
const LEGACY_AUDIO_CACHE_NAME = "quran-audio-fr";

export async function getAudioCache() {
  if (!("caches" in globalThis)) return null;
  try {
    return await caches.open(AUDIO_CACHE_NAME);
  } catch {
    return null;
  }
}

export async function removeLegacyAudioCache() {
  if (!("caches" in globalThis)) return;
  try {
    await caches.delete(LEGACY_AUDIO_CACHE_NAME);
  } catch {
    // The legacy cache is only a storage cleanup; playback must continue.
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
export async function cacheFullAudio(url) {
  const response = await fetch(withCacheBust(url, "dl"), {
    mode: "no-cors",
    cache: "no-store",
  });

  if (response.type !== "opaque" && !response.ok) {
    throw new Error(`Téléchargement audio échoué : ${response.status}`);
  }

  const cache = await getAudioCache();
  if (!cache) throw new Error("Cache Storage indisponible.");

  await cache.put(url, response);
  if (!(await cache.match(url))) throw new Error("Audio non enregistré dans le cache.");
}

export async function isAudioCached(url) {
  const cache = await getAudioCache();
  if (!cache) return false;
  return Boolean(await cache.match(url).catch(() => undefined));
}

export async function removeCachedAudio(url) {
  const cache = await getAudioCache();
  if (!cache) return;
  try {
    await cache.delete(url);
  } catch {
    // A failed cleanup must not prevent a network retry.
  }
}
