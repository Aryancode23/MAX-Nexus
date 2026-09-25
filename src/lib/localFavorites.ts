const FAVORITES_KEY = "max-nexus:favorites";
const RECENT_KEY = "max-nexus:recent";
const RECENT_LIMIT = 8;

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("max-nexus:storage-changed", { detail: key }));
}

export function getFavorites(): string[] {
  return read(FAVORITES_KEY);
}

export function isFavorite(slug: string): boolean {
  return read(FAVORITES_KEY).includes(slug);
}

export function toggleFavorite(slug: string) {
  const current = read(FAVORITES_KEY);
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  write(FAVORITES_KEY, next);
}

export function getRecent(): string[] {
  return read(RECENT_KEY);
}

export function addRecent(slug: string) {
  const current = read(RECENT_KEY).filter((s) => s !== slug);
  write(RECENT_KEY, [slug, ...current].slice(0, RECENT_LIMIT));
}

export function clearRecent() {
  write(RECENT_KEY, []);
}

export const STORAGE_EVENT = "max-nexus:storage-changed";
