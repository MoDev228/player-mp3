const STORAGE_KEY = "quran-player-bookmarks-v1";

function isValidBookmark(bookmark) {
  return (
    bookmark &&
    Number.isInteger(bookmark.surahNumber) &&
    bookmark.surahNumber >= 1 &&
    bookmark.surahNumber <= 114 &&
    Number.isInteger(bookmark.ayahIndex) &&
    bookmark.ayahIndex >= 0 &&
    bookmark.ayahIndex <= 6235
  );
}

export function readBookmarks() {
  if (typeof localStorage === "undefined") return [];

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter(isValidBookmark).map((bookmark) => ({
      surahNumber: bookmark.surahNumber,
      ayahIndex: bookmark.ayahIndex,
      createdAt: Number.isFinite(bookmark.createdAt) ? bookmark.createdAt : 0,
    }));
  } catch {
    return [];
  }
}

export function saveBookmarks(bookmarks) {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Les signets restent disponibles pour la session même si le stockage échoue.
  }
}

export function findBookmark(bookmarks, surahNumber, ayahIndex) {
  return bookmarks.find(
    (bookmark) =>
      bookmark.surahNumber === surahNumber && bookmark.ayahIndex === ayahIndex,
  );
}

export function toggleBookmark(bookmarks, surahNumber, ayahIndex) {
  if (findBookmark(bookmarks, surahNumber, ayahIndex)) {
    return bookmarks.filter(
      (bookmark) =>
        bookmark.surahNumber !== surahNumber || bookmark.ayahIndex !== ayahIndex,
    );
  }

  return [
    ...bookmarks,
    { surahNumber, ayahIndex, createdAt: Date.now() },
  ];
}

export function removeBookmark(bookmarks, surahNumber, ayahIndex) {
  return bookmarks.filter(
    (bookmark) =>
      bookmark.surahNumber !== surahNumber || bookmark.ayahIndex !== ayahIndex,
  );
}
