import { Bookmark, BookmarkCheck } from "lucide-react";

function AyahDisplay({
  isLoading,
  error,
  ayah,
  ayahCount,
  onRetry,
  textEdition,
  showArabic = false,
  bookmarked = false,
  onToggleBookmark,
}) {
  const isArabic = textEdition?.language === "ar";
  const arabicText = showArabic ? String(ayah?.arabicText ?? "").replace(/^\uFEFF/, "") : "";

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
          {arabicText && (
            <p
              lang="ar"
              dir="rtl"
              className="mb-3 text-xl leading-[2.2] sm:text-2xl lg:text-3xl"
            >
              {arabicText}
            </p>
          )}
          <p
            lang={textEdition?.language ?? "ar"}
            dir={textEdition?.dir ?? "rtl"}
            className={isArabic
              ? "text-xl leading-[2.2] sm:text-2xl lg:text-3xl"
              : `ayah-text leading-relaxed ${arabicText ? "text-base sm:text-lg lg:text-xl" : "text-lg sm:text-xl lg:text-2xl"}`}
          >
            {(ayah.text ?? "").replace(/^\uFEFF/, "")}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              Verset {ayah.numberInSurah} <span aria-hidden="true">·</span> {ayahCount} versets
            </p>
            {onToggleBookmark && (
              <button
                type="button"
                onClick={onToggleBookmark}
                aria-label={bookmarked ? "Retirer ce verset des signets" : "Ajouter ce verset aux signets"}
                aria-pressed={bookmarked}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${bookmarked ? "text-primary" : ""}`}
              >
                {bookmarked ? <BookmarkCheck size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AyahDisplay;
