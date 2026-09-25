"use server";
import { getPublishedDocumentPacks, getPublishedDocumentPackBySlug } from "./document-packs-data";

// Thin "use server" bridges so the client-side Document Pack Builder tool
// can fetch templates directly (the underlying functions use cookies()
// and can only run server-side).
export async function fetchPublishedDocumentPacks() {
  return getPublishedDocumentPacks();
}
export async function fetchDocumentPackBySlug(slug: string) {
  return getPublishedDocumentPackBySlug(slug);
}
