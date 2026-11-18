import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { getTranslationInfo } from "@/services/quranApi";
import {
  AUDIO_EDITIONS,
  DEFAULT_SETTINGS,
  TEXT_EDITIONS,
  getAudioEdition,
  getTextEdition,
  normalizeSettings,
} from "@/lib/quranEditions";

function EditionRadioGroup({ legend, name, editions, value, onChange }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-background/60 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {legend}
      </legend>

      <div className="mt-2 grid gap-2">
        {editions.map((edition) => {
          const inputId = `${name}-${edition.id}`;
          const hintId = `${inputId}-hint`;

          return (
            <label
              key={edition.id}
              htmlFor={inputId}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:bg-muted focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card"
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={edition.id}
                checked={value === edition.id}
                onChange={() => onChange(edition.id)}
                aria-describedby={hintId}
                className="h-4 w-4 shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-card-foreground">
                  {edition.label}
                </span>
                <span id={hintId} className="mt-0.5 block text-xs text-muted-foreground">
                  {edition.hint}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SettingsPage({ theme, onToggleTheme, settings, onSave }) {
  const [draft, setDraft] = useState(() => normalizeSettings(settings));
  const [versions, setVersions] = useState({ audio: null, text: null });

  const audioEdition = getAudioEdition(draft.audioEdition);
  const textEdition = getTextEdition(draft.textEdition);
  const audioCredit = `${audioEdition.label} — ${audioEdition.credit}`;
  const textCredit =
    textEdition.textSource === "alquran"
      ? textEdition.credit
      : textEdition.credit === "QuranEnc.com"
        ? "QuranEnc.com"
        : `${textEdition.credit} — QuranEnc.com`;

  useEffect(() => {
    let active = true;

    const audioKey = audioEdition.translationKey;
    Promise.allSettled([
      audioKey ? getTranslationInfo(audioKey) : Promise.resolve(null),
      getTranslationInfo(textEdition.translationKey, textEdition.textSource),
    ]).then(([audioInfo, textInfo]) => {
      if (!active) return;

      setVersions({
        audio:
          audioInfo.status === "fulfilled" && audioInfo.value
            ? audioInfo.value.version
            : null,
        text:
          textInfo.status === "fulfilled" && textInfo.value
            ? textInfo.value.version
            : null,
      });
    });

    return () => {
      active = false;
    };
  }, [
    audioEdition.translationKey,
    textEdition.textSource,
    textEdition.translationKey,
  ]);

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(normalizeSettings(draft));
    window.location.hash = "#/lecteur";
  }

  function resetDraft() {
    setDraft(normalizeSettings(DEFAULT_SETTINGS));
  }

  return (
    <main className="flex h-[100dvh] w-full justify-center overflow-hidden bg-background sm:items-center sm:p-4">
      <article className="flex h-full w-full flex-col overflow-y-auto bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-card-foreground sm:max-w-3xl sm:rounded-3xl sm:border sm:border-border sm:px-8 sm:py-6 sm:shadow-xl">
        <header className="mb-5">
          <div className="flex items-center justify-between gap-2">
            <a
              href="#/lecteur"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[380px]:px-2"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Retour
            </a>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Préférences
            </p>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>

          <h1
            id="settings-title"
            tabIndex={-1}
            className="mt-3 text-balance text-2xl font-semibold leading-tight outline-none sm:text-3xl"
          >
            Réglages
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Choisissez la récitation à écouter et le texte à afficher.
          </p>
        </header>

        <form onSubmit={handleSubmit} aria-labelledby="settings-title" className="flex flex-1 flex-col gap-4">
          <EditionRadioGroup
            legend="Lecture audio"
            name="audioEdition"
            editions={AUDIO_EDITIONS}
            value={draft.audioEdition}
            onChange={(value) => update("audioEdition", value)}
          />

          <EditionRadioGroup
            legend="Texte affiché"
            name="textEdition"
            editions={TEXT_EDITIONS}
            value={draft.textEdition}
            onChange={(value) => update("textEdition", value)}
          />

          <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetDraft}
              className="min-h-11 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Valeurs par défaut
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform motion-safe:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Enregistrer
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Audio : {audioCredit}{versions.audio ? ` · v${versions.audio}` : ""}
          <br />
          Texte : {textCredit}{versions.text ? ` · v${versions.text}` : ""}
        </p>
      </article>
    </main>
  );
}

export default SettingsPage;
