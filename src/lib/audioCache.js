import { getAudioCacheName } from "@/lib/quranEditions";

export { getAudioCacheName };

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
