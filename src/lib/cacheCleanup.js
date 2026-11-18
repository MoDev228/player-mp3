const LEGACY_CACHE_NAMES = [
  "quran-audio-fr",
  "quran-audio-fr-v2",
  "quran-api-v1",
  "quran-surah-data",
  // Caches de l’ancien fournisseur AlQuran Cloud.
  "quran-api-v2",
  "quran-surah-data-v2",
  "quran-audio-ar.alafasy-v1",
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
