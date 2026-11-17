export const AUDIO_EDITIONS = [
  {
    id: "fr.leclerc",
    language: "fr",
    label: "Français — Youssouf Leclerc",
    hint: "Récitation en français, verset par verset.",
  },
  {
    id: "ar.saoodshuraym",
    language: "ar",
    label: "Arabe — Saʿūd ash-Shuraym",
    hint: "Récitation arabe, verset par verset.",
  },
  {
    id: "ar.shaatree",
    language: "ar",
    label: "Arabe — Abū Bakr ash-Shāṭirī",
    hint: "Récitation arabe, verset par verset.",
  },
];

export const TEXT_EDITIONS = [
  {
    id: "quran-uthmani",
    language: "ar",
    dir: "rtl",
    label: "Arabe — Uthmani",
    hint: "Texte arabe othmanien, de droite à gauche.",
  },
  {
    id: "fr.hamidullah",
    language: "fr",
    dir: "ltr",
    label: "Français — Hamidullah",
    hint: "Traduction française, de gauche à droite.",
  },
];

export const DEFAULT_SETTINGS = {
  audioEdition: "fr.leclerc",
  textEdition: "quran-uthmani",
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
  };
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
