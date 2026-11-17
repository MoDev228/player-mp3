function AyahDisplay({ isLoading, error, ayah, ayahCount, onRetry, textEdition }) {
  const isArabic = textEdition?.language === "ar";
  return (
    <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/70 px-4 py-5 sm:px-5 sm:py-6">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement de la sourate…</p>
      ) : error ? (
        <div role="alert" className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button type="button" onClick={onRetry} className="mt-3 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            Réessayer
          </button>
        </div>
      ) : ayah ? (
        <div className="my-auto w-full text-center">
          <p
            lang={textEdition?.language ?? "ar"}
            dir={textEdition?.dir ?? "rtl"}
            className={isArabic
              ? "text-xl leading-[2.2] sm:text-2xl lg:text-3xl"
              : "text-lg leading-relaxed sm:text-xl lg:text-2xl"}
          >
            {(ayah.text ?? "").replace(/^\uFEFF/, "")}
          </p>
          <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground">
            Verset {ayah.numberInSurah} <span aria-hidden="true">·</span> {ayahCount} versets
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default AyahDisplay;
