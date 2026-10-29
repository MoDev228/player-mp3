function AyahDisplay({ isLoading, error, ayah, ayahCount, onRetry }) {
  return (
    <div className="relative flex h-[20rem] w-full items-center justify-center overflow-x-hidden overflow-y-auto rounded-2xl border border-border bg-background/70 px-5 py-6 sm:h-[24rem]">
      {isLoading ? <p className="text-sm text-muted-foreground">Chargement de la sourate…</p>
        : error ? <div role="alert" className="text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button type="button" onClick={onRetry} className="mt-3 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
            Réessayer
          </button>
        </div>
          : ayah ? <div className="my-auto w-full text-center">
            <p lang="ar" dir="rtl" className="text-2xl leading-relaxed sm:text-3xl">{ayah.text.replace(/^\uFEFF/, "")}</p>
            <p className="mt-5 text-xs font-medium tracking-wide text-muted-foreground">
              Verset {ayah.numberInSurah} <span aria-hidden="true">·</span> {ayahCount} versets
            </p>
          </div> : null}
    </div>
  );
}

export default AyahDisplay;
