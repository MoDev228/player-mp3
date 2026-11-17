import { ArrowLeft } from "lucide-react";

function PlayerHeader({ surah, leading, actions }) {
  return (
    <header className="mb-4 text-center">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <a
            href="#/"
            aria-label="Retour à l'accueil"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[380px]:w-auto min-[380px]:justify-start min-[380px]:px-2"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hidden min-[380px]:inline">Accueil</span>
          </a>

          {leading}
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>

      <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:block">
        Le Noble Coran
      </p>
      <h1
        tabIndex={-1}
        className="text-lg font-semibold leading-tight outline-none sm:mt-1 sm:text-xl"
      >
        {surah?.englishName ?? "Le Noble Coran"}
      </h1>
      <p
        lang="ar"
        dir="rtl"
        className="mt-0.5 text-base leading-snug text-muted-foreground sm:text-lg"
      >
        {surah?.name ?? "القرآن الكريم"}
      </p>
    </header>
  );
}

export default PlayerHeader;
