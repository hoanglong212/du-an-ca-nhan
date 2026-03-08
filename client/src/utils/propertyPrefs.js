const FAVORITE_SLUGS_KEY = "hl_favorite_slugs";
const RECENT_VIEWED_SLUGS_KEY = "hl_recent_viewed_slugs";
const RECENT_VIEWED_LIMIT = 12;
const PREFS_UPDATED_EVENT = "hl:property-prefs-updated";

function readStringArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function writeStringArray(key, values) {
  localStorage.setItem(key, JSON.stringify(values));
  window.dispatchEvent(new CustomEvent(PREFS_UPDATED_EVENT));
}

export function getFavoriteSlugs() {
  return readStringArray(FAVORITE_SLUGS_KEY);
}

export function isFavoriteSlug(slug) {
  if (!slug) return false;
  return getFavoriteSlugs().includes(String(slug));
}

export function toggleFavoriteSlug(slug) {
  const nextSlug = String(slug || "").trim();
  if (!nextSlug) return false;

  const current = getFavoriteSlugs();
  const hasSlug = current.includes(nextSlug);
  const next = hasSlug
    ? current.filter((item) => item !== nextSlug)
    : [nextSlug, ...current];

  writeStringArray(FAVORITE_SLUGS_KEY, next);
  return !hasSlug;
}

export function getRecentViewedSlugs() {
  return readStringArray(RECENT_VIEWED_SLUGS_KEY);
}

export function pushRecentViewedSlug(slug) {
  const nextSlug = String(slug || "").trim();
  if (!nextSlug) return;

  const current = getRecentViewedSlugs();
  const deduped = [nextSlug, ...current.filter((item) => item !== nextSlug)].slice(
    0,
    RECENT_VIEWED_LIMIT,
  );

  writeStringArray(RECENT_VIEWED_SLUGS_KEY, deduped);
}

export function subscribePropertyPrefs(listener) {
  window.addEventListener(PREFS_UPDATED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(PREFS_UPDATED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
