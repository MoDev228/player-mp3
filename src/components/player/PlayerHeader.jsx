function PlayerHeader({ surah }) {
  return (
    <header className="mb-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Le Noble Coran</p>
      <h1 className="mt-2 text-xl font-semibold">{surah?.englishName ?? "Le Noble Coran"}</h1>
      <p lang="ar" dir="rtl" className="mt-1 text-lg text-muted-foreground">{surah?.name ?? "القرآن الكريم"}</p>
    </header>
  );
}

export default PlayerHeader;
