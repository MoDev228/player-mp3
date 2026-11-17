const LEGACY_CACHE_NAMES = [
  "quran-audio-fr",
  "quran-audio-fr-v2",
  "quran-api-v1",
  "quran-surah-data",
];

export async function removeLegacyCaches() {
  if (!("caches" in globalThis)) return;

  await Promise.all(
    LEGACY_CACHE_NAMES.map(async (name) => {
      try {
        await caches.delete(name);
      } catch {
        // Le nettoyage ne doit jamais bloquer le chargement de l'application.
      }
    }),
  );
}
