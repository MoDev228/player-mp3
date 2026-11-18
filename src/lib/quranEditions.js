/**
 * Éditions proposées par l’application.
 *
 * Les identifiants sont internes : ils servent à la fois de clé de cache et de
 * valeur dans les réglages enregistrés. `audioSource` distingue deux fournisseurs :
 * - `quranenc` : traduction lue à voix haute, URL construite depuis `translationKey` ;
 * - `alquran` : récitation arabe servie par le CDN Islamic Network, URL construite
 *   depuis `bitrate` et le numéro global du verset.
 *
 * Les éditions de texte suivent le même principe via `textSource` : `quranenc`
 * (défaut) ou `alquran` pour la traduction Hamidullah lue par Youssouf Leclerc.
 */

export const AUDIO_EDITIONS = [
  {
    id: "french_rashid",
    audioSource: "quranenc",
    translationKey: "french_rashid",
    language: "fr",
    label: "Français — Rachid Maach",
    hint: "Traduction lue en français, verset par verset (QuranEnc).",
    credit: "QuranEnc.com",
  },
  {
    id: "fr.leclerc",
    audioSource: "alquran",
    bitrate: 128,
    language: "fr",
    label: "Français — Youssouf Leclerc",
    hint: "Traduction française lue, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.saoodshuraym",
    audioSource: "alquran",
    bitrate: 64,
    language: "ar",
    label: "Arabe — Saʿūd ash-Shuraym",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.shaatree",
    audioSource: "alquran",
    bitrate: 128,
    language: "ar",
    label: "Arabe — Abū Bakr ash-Shāṭirī",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.husary",
    audioSource: "alquran",
    bitrate: 128,
    language: "ar",
    label: "Arabe — Maḥmūd Khalīl al-Ḥuṣary",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.abdurrahmaansudais",
    audioSource: "alquran",
    bitrate: 192,
    language: "ar",
    label: "Arabe — ʿAbd ar-Raḥmān as-Sudays",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.mahermuaiqly",
    audioSource: "alquran",
    bitrate: 128,
    language: "ar",
    label: "Arabe — Māher al-Muʿayqlī",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.hudhaify",
    audioSource: "alquran",
    bitrate: 128,
    language: "ar",
    label: "Arabe — ʿAlī al-Ḥudhayfī",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.abdullahbasfar",
    audioSource: "alquran",
    bitrate: 192,
    language: "ar",
    label: "Arabe — ʿAbdullāh Baṣfar",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.hanirifai",
    audioSource: "alquran",
    bitrate: 192,
    language: "ar",
    label: "Arabe — Ḥānī ar-Rifāʿī",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.aymanswoaid",
    audioSource: "alquran",
    bitrate: 64,
    language: "ar",
    label: "Arabe — Ayman Suwaid",
    hint: "Récitation arabe, verset par verset.",
    credit: "AlQuran Cloud",
  },
  {
    id: "ar.husarymujawwad",
    audioSource: "alquran",
    bitrate: 128,
    language: "ar",
    label: "Arabe — Maḥmūd Khalīl al-Ḥuṣary (mujawwad)",
    hint: "Récitation arabe mélodique, verset par verset.",
    credit: "AlQuran Cloud",
  },
];

export const TEXT_EDITIONS = [
  {
    id: "arabic-uthmani",
    textSource: "quranenc",
    translationKey: "french_rashid",
    language: "ar",
    dir: "rtl",
    label: "Arabe — Uthmani",
    hint: "Texte arabe othmanien, de droite à gauche.",
    credit: "QuranEnc.com",
  },
  {
    id: "french-rashid",
    textSource: "quranenc",
    translationKey: "french_rashid",
    language: "fr",
    dir: "ltr",
    label: "Français — Rachid Maach",
    hint: "Traduction française, de gauche à droite.",
    credit: "Rachid Maach",
  },
  {
    id: "french-montada",
    textSource: "quranenc",
    translationKey: "french_montada",
    language: "fr",
    dir: "ltr",
    label: "Français — Centre International Nûr",
    hint: "Traduction française, de gauche à droite.",
    credit: "Centre International Nûr",
  },
  {
    id: "french-hamidullah",
    textSource: "alquran",
    translationKey: "fr.hamidullah",
    language: "fr",
    dir: "ltr",
    label: "Français — Youssouf Leclerc (Hamidullah)",
    hint: "Traduction de Mohammed Hamidullah, texte lu par Youssouf Leclerc.",
    credit: "Muhammad Hamidullah — AlQuran Cloud",
  },
];

export const DEFAULT_SETTINGS = {
  audioEdition: "french_rashid",
  textEdition: "arabic-uthmani",
  bilingual: false,
};

export function isValidAudioEdition(id) {
  return AUDIO_EDITIONS.some((edition) => edition.id === id);
}

export function isValidTextEdition(id) {
  return TEXT_EDITIONS.some((edition) => edition.id === id);
}

export function getAudioEdition(id) {
  return AUDIO_EDITIONS.find((edition) => edition.id === id) ?? AUDIO_EDITIONS[0];
}

export function getTextEdition(id) {
  return TEXT_EDITIONS.find((edition) => edition.id === id) ?? TEXT_EDITIONS[0];
}

export function getAudioCacheName(audioEdition) {
  return `quran-audio-${audioEdition}-v1`;
}

export function normalizeSettings(value) {
  const source = value && typeof value === "object" ? value : {};

  return {
    audioEdition: isValidAudioEdition(source.audioEdition)
      ? source.audioEdition
      : DEFAULT_SETTINGS.audioEdition,
    textEdition: isValidTextEdition(source.textEdition)
      ? source.textEdition
      : DEFAULT_SETTINGS.textEdition,
    bilingual: source.bilingual === true,
  };
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
