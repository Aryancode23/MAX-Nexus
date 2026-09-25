"use server";
import { getPublishedPresets } from "./presets-data";

// Thin "use server" bridge so client components can fetch presets directly
// (getPublishedPresets itself uses cookies() and can only run server-side).
export async function fetchPublishedPresets() {
  return getPublishedPresets();
}
