import { X } from "lucide-react";

function SurahList({ surahs, currentSurahNumber, onSelectSurah, onClose }) {
  return (
    <div className="absolute top-0 right-0 z-10 mb-3 h-[70%] w-full overflow-x-hidden rounded-xl border bg-background shadow-lg">
      <div className="sticky top-0 left-0 right-0 w-full bg-background">
        <div className="flex items-center justify-between p-3">
          <div>
            <h3 className="font-semibold">Les sourates du Coran</h3>
            <p className="text-sm text-muted-foreground">
              {surahs.length} sourates disponibles
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la liste"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <ul className="space-y-1 p-3">
        {surahs.map((surah) => (
          <li key={surah.number}>
            <button
              type="button"
              onClick={() => onSelectSurah(surah.number)}
              aria-current={
                surah.number === currentSurahNumber ? "true" : undefined
              }
              className={`w-full rounded-lg border-b px-3 py-2 text-left transition-colors hover:bg-muted ${
                surah.number === currentSurahNumber
                  ? "bg-muted font-semibold"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="block truncate">
                    {surah.number}. {surah.englishName}
                  </span>

                  <span className="block text-sm text-muted-foreground">
                    {surah.numberOfAyahs} versets
                  </span>
                </div>

                <span lang="ar" dir="rtl" className="shrink-0 text-lg">
                  {surah.name}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SurahList;
