export interface BackgroundPreset {
  id: string;
  name: string;
  css: string; // solid hex, or "linear-gradient(Ndeg, #hex, #hex)" — both fully supported by the export renderer
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: "white", name: "White", css: "#ffffff" },
  { id: "light-gray", name: "Light Gray", css: "#f3f4f6" },
  { id: "navy", name: "Navy", css: "#0f172a" },
  { id: "charcoal", name: "Charcoal", css: "#111827" },
  { id: "royal-blue", name: "Royal Blue", css: "#1d4ed8" },
  { id: "emerald", name: "Emerald", css: "#059669" },
  { id: "crimson", name: "Crimson", css: "#b91c1c" },
  { id: "amber", name: "Amber", css: "#d97706" },
  { id: "blue-indigo", name: "Blue → Indigo", css: "linear-gradient(135deg, #2563eb, #4f46e5)" },
  { id: "purple-pink", name: "Purple → Pink", css: "linear-gradient(135deg, #7c3aed, #ec4899)" },
  { id: "teal-cyan", name: "Teal → Cyan", css: "linear-gradient(135deg, #0f766e, #0891b2)" },
  { id: "orange-red", name: "Orange → Red", css: "linear-gradient(135deg, #f97316, #dc2626)" },
  { id: "gold-black", name: "Gold → Black", css: "linear-gradient(135deg, #d4af37, #1f2937)" },
  { id: "green-lime", name: "Green → Lime", css: "linear-gradient(135deg, #15803d, #65a30d)" },
  { id: "slate-fade", name: "Slate Fade", css: "linear-gradient(180deg, #f8fafc, #cbd5e1)" },
  { id: "midnight", name: "Midnight", css: "linear-gradient(160deg, #1e293b, #0f172a)" },
];
