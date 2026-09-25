export interface CardTemplate {
  id: string;
  name: string;
  background: string;
  textColor: "light" | "dark";
}

export const CARD_TEMPLATES: CardTemplate[] = [
  { id: "ocean", name: "Ocean Gradient", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", textColor: "light" },
  { id: "sunset", name: "Sunset", background: "linear-gradient(135deg, #f97316, #db2777)", textColor: "light" },
  { id: "forest", name: "Forest", background: "linear-gradient(160deg, #14532d, #16a34a)", textColor: "light" },
  { id: "navy", name: "Corporate Navy", background: "linear-gradient(180deg, #0f172a, #1e293b)", textColor: "light" },
  { id: "diagonal-split", name: "Diagonal Split", background: "linear-gradient(115deg, #4f46e5 50%, #ffffff 50%)", textColor: "dark" },
  { id: "dot-grid", name: "Dot Grid", background: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1.5px) 0 0/12px 12px, linear-gradient(135deg,#4338ca,#7c3aed)", textColor: "light" },
  { id: "diagonal-stripes", name: "Diagonal Stripes", background: "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #fbbf24 10px, #fbbf24 20px)", textColor: "dark" },
  { id: "wave-duo", name: "Wave Duo", background: "radial-gradient(120% 60% at 50% 0%, #0891b2 40%, transparent 41%), linear-gradient(#075985,#0c4a6e)", textColor: "light" },
  { id: "geo-triangle", name: "Geometric Triangle", background: "linear-gradient(135deg, #7c2d12 0 50%, #ea580c 50% 100%)", textColor: "light" },
  { id: "maroon-texture", name: "Maroon Texture", background: "repeating-linear-gradient(135deg, #7f1d1d, #7f1d1d 8px, #991b1b 8px, #991b1b 16px)", textColor: "light" },
  { id: "teal-pattern", name: "Teal Hex Pattern", background: "repeating-conic-gradient(#0f766e 0% 25%, #14b8a6 0% 50%) 0 0/16px 16px", textColor: "light" },
  { id: "royal-purple", name: "Royal Purple Gradient", background: "linear-gradient(160deg, #581c87, #a855f7)", textColor: "light" },
  { id: "slate-minimal", name: "Slate Minimal", background: "linear-gradient(180deg, #f8fafc, #e2e8f0)", textColor: "dark" },
  { id: "gold-dark", name: "Gold Accent Dark", background: "linear-gradient(135deg, #111827, #1f2937)", textColor: "light" },
  { id: "crimson-wave", name: "Crimson Wave", background: "radial-gradient(120% 50% at 50% 100%, #b91c1c 40%, transparent 41%), linear-gradient(#7f1d1d,#450a0a)", textColor: "light" },
  { id: "emerald-diagonal", name: "Emerald Diagonal", background: "linear-gradient(115deg, #047857 50%, #10b981 50%)", textColor: "light" },
  { id: "sky-dots", name: "Sky Dots", background: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1.5px) 0 0/10px 10px, linear-gradient(#38bdf8,#0284c7)", textColor: "light" },
];
