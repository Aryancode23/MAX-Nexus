import type { CardTemplateV2, CardElementV2 } from "./schema";

const t = (o: Partial<CardElementV2> & { type: CardElementV2["type"] }): CardElementV2 => ({
  id: crypto.randomUUID(), x: 0, y: 0, width: 20, height: 8, rotation: 0, zIndex: 1, opacity: 1,
  ...o,
} as CardElementV2);

export const CARD_TEMPLATES_V2: CardTemplateV2[] = [
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Clean white card with a blue header band and left-aligned photo.",
    category: "Corporate",
    widthMm: 85.6, heightMm: 54,
    front: {
      background: { type: "color", value: "#ffffff" },
      elements: [
        t({ type: "shape", x: 0, y: 0, width: 85.6, height: 14, shapeType: "rect", fill: "#1d4ed8", zIndex: 1 }),
        t({ type: "text", x: 4, y: 3, width: 60, height: 8, content: "Institution Name", dataKey: "institution_name", fontSize: 11, fontWeight: 700, color: "#ffffff", zIndex: 2 }),
        t({ type: "image", x: 5, y: 18, width: 24, height: 24, imageShape: "circle", borderWidth: 1, borderColor: "#1d4ed8", content: "photo", dataKey: "photo", zIndex: 2 }),
        t({ type: "text", x: 33, y: 20, width: 48, height: 7, content: "Employee Name", dataKey: "employee_name", fontSize: 12, fontWeight: 700, color: "#111827", zIndex: 2 }),
        t({ type: "text", x: 33, y: 27, width: 48, height: 6, content: "Designation", dataKey: "designation", fontSize: 9, fontWeight: 400, color: "#4b5563", zIndex: 2 }),
        t({ type: "text", x: 33, y: 34, width: 48, height: 6, content: "ID: Employee ID", dataKey: "employee_id", fontSize: 8.5, fontWeight: 500, color: "#1d4ed8", zIndex: 2 }),
        t({ type: "text", x: 33, y: 40, width: 48, height: 6, content: "Department", dataKey: "department", fontSize: 8, fontWeight: 400, color: "#6b7280", zIndex: 2 }),
      ],
    },
  },
  {
    id: "minimal-corporate",
    name: "Minimal Corporate",
    description: "Airy whitespace, a single thin accent line, understated typography.",
    category: "Corporate",
    widthMm: 85.6, heightMm: 54,
    front: {
      background: { type: "color", value: "#fafafa" },
      elements: [
        t({ type: "shape", x: 6, y: 6, width: 12, height: 0.6, shapeType: "rect", fill: "#0891b2", zIndex: 2 }),
        t({ type: "text", x: 6, y: 9, width: 60, height: 6, content: "Institution Name", dataKey: "institution_name", fontSize: 9, fontWeight: 600, color: "#0891b2", letterSpacing: 1, zIndex: 2 }),
        t({ type: "image", x: 6, y: 20, width: 20, height: 20, imageShape: "rect", content: "photo", dataKey: "photo", zIndex: 2 }),
        t({ type: "text", x: 30, y: 22, width: 50, height: 7, content: "Employee Name", dataKey: "employee_name", fontSize: 13, fontWeight: 300, color: "#111827", zIndex: 2 }),
        t({ type: "text", x: 30, y: 30, width: 50, height: 6, content: "Designation", dataKey: "designation", fontSize: 9, fontWeight: 400, color: "#6b7280", zIndex: 2 }),
        t({ type: "text", x: 6, y: 46, width: 70, height: 5, content: "Employee ID", dataKey: "employee_id", fontSize: 7.5, fontWeight: 400, color: "#9ca3af", zIndex: 2 }),
      ],
    },
  },
  {
    id: "dark-professional",
    name: "Dark Professional",
    description: "Charcoal background, gold accent text — an executive tone.",
    category: "Executive",
    widthMm: 85.6, heightMm: 54,
    front: {
      background: { type: "color", value: "#111827" },
      elements: [
        t({ type: "text", x: 5, y: 5, width: 60, height: 6, content: "Institution Name", dataKey: "institution_name", fontSize: 9, fontWeight: 600, color: "#d4af37", letterSpacing: 1.5, zIndex: 2 }),
        t({ type: "image", x: 5, y: 16, width: 22, height: 22, imageShape: "circle", borderWidth: 1, borderColor: "#d4af37", content: "photo", dataKey: "photo", zIndex: 2 }),
        t({ type: "text", x: 31, y: 18, width: 50, height: 7, content: "Employee Name", dataKey: "employee_name", fontSize: 12, fontWeight: 700, color: "#ffffff", zIndex: 2 }),
        t({ type: "text", x: 31, y: 25, width: 50, height: 6, content: "Designation", dataKey: "designation", fontSize: 9, fontWeight: 400, color: "#d4af37", zIndex: 2 }),
        t({ type: "text", x: 31, y: 32, width: 50, height: 6, content: "Employee ID", dataKey: "employee_id", fontSize: 8, fontWeight: 400, color: "#9ca3af", zIndex: 2 }),
        t({ type: "shape", x: 0, y: 50, width: 85.6, height: 4, shapeType: "rect", fill: "#d4af37", zIndex: 1 }),
      ],
    },
  },
  {
    id: "school-education",
    name: "School / Education",
    description: "Portrait layout with a green header band, sized for students and staff alike.",
    category: "Education",
    widthMm: 54, heightMm: 85.6,
    front: {
      background: { type: "color", value: "#ffffff" },
      elements: [
        t({ type: "shape", x: 0, y: 0, width: 54, height: 22, shapeType: "rect", fill: "#15803d", zIndex: 1 }),
        t({ type: "text", x: 4, y: 4, width: 46, height: 10, content: "School / Institution Name", dataKey: "institution_name", fontSize: 10, fontWeight: 700, color: "#ffffff", textAlign: "center", zIndex: 2 }),
        t({ type: "image", x: 15, y: 26, width: 24, height: 24, imageShape: "circle", borderWidth: 1.5, borderColor: "#15803d", content: "photo", dataKey: "photo", zIndex: 2 }),
        t({ type: "text", x: 4, y: 54, width: 46, height: 7, content: "Student / Staff Name", dataKey: "employee_name", fontSize: 11, fontWeight: 700, color: "#111827", textAlign: "center", zIndex: 2 }),
        t({ type: "text", x: 4, y: 62, width: 46, height: 6, content: "Class / Designation", dataKey: "designation", fontSize: 8.5, fontWeight: 400, color: "#4b5563", textAlign: "center", zIndex: 2 }),
        t({ type: "text", x: 4, y: 70, width: 46, height: 6, content: "ID Number", dataKey: "employee_id", fontSize: 8, fontWeight: 500, color: "#15803d", textAlign: "center", zIndex: 2 }),
      ],
    },
  },
  {
    id: "security-staff",
    name: "Security Staff",
    description: "Bold, high-contrast red/black band designed to be identifiable at a glance.",
    category: "Security",
    widthMm: 85.6, heightMm: 54,
    front: {
      background: { type: "color", value: "#ffffff" },
      elements: [
        t({ type: "shape", x: 0, y: 0, width: 85.6, height: 54, shapeType: "rect", fill: "#111111", zIndex: 1 }),
        t({ type: "shape", x: 0, y: 0, width: 85.6, height: 12, shapeType: "rect", fill: "#b91c1c", zIndex: 2 }),
        t({ type: "text", x: 4, y: 2.5, width: 60, height: 7, content: "SECURITY STAFF", fontSize: 10, fontWeight: 800, color: "#ffffff", letterSpacing: 1.5, zIndex: 3 }),
        t({ type: "image", x: 5, y: 16, width: 24, height: 24, imageShape: "rect", borderWidth: 1, borderColor: "#b91c1c", content: "photo", dataKey: "photo", zIndex: 3 }),
        t({ type: "text", x: 33, y: 18, width: 48, height: 7, content: "Employee Name", dataKey: "employee_name", fontSize: 12, fontWeight: 700, color: "#ffffff", zIndex: 3 }),
        t({ type: "text", x: 33, y: 26, width: 48, height: 6, content: "Designation", dataKey: "designation", fontSize: 9, fontWeight: 400, color: "#d1d5db", zIndex: 3 }),
        t({ type: "text", x: 33, y: 33, width: 48, height: 6, content: "Employee ID", dataKey: "employee_id", fontSize: 8.5, fontWeight: 600, color: "#b91c1c", zIndex: 3 }),
      ],
    },
  },
  {
    id: "creative-gradient",
    name: "Creative Gradient",
    description: "Vivid diagonal gradient background — portrait, for a more expressive brand.",
    category: "Creative",
    widthMm: 54, heightMm: 85.6,
    front: {
      background: { type: "gradient", value: "linear-gradient(160deg, #7c3aed, #ec4899)" },
      elements: [
        t({ type: "text", x: 4, y: 6, width: 46, height: 6, content: "Institution Name", dataKey: "institution_name", fontSize: 8.5, fontWeight: 600, color: "#ffffff", textAlign: "center", zIndex: 2 }),
        t({ type: "image", x: 14, y: 22, width: 26, height: 26, imageShape: "circle", borderWidth: 2, borderColor: "#ffffff", content: "photo", dataKey: "photo", zIndex: 2 }),
        t({ type: "text", x: 4, y: 54, width: 46, height: 7, content: "Employee Name", dataKey: "employee_name", fontSize: 12, fontWeight: 700, color: "#ffffff", textAlign: "center", zIndex: 2 }),
        t({ type: "text", x: 4, y: 62, width: 46, height: 6, content: "Designation", dataKey: "designation", fontSize: 8.5, fontWeight: 400, color: "#f3e8ff", textAlign: "center", zIndex: 2 }),
        t({ type: "text", x: 4, y: 74, width: 46, height: 6, content: "Employee ID", dataKey: "employee_id", fontSize: 8, fontWeight: 500, color: "#ffffff", textAlign: "center", zIndex: 2 }),
      ],
    },
  },
  {
    id: "two-tone-modern",
    name: "Two-Tone Modern",
    description: "Diagonal split of two colors for a distinctly modern, non-corporate feel.",
    category: "Modern",
    widthMm: 85.6, heightMm: 54,
    front: {
      background: { type: "gradient", value: "linear-gradient(115deg, #0f766e 45%, #ffffff 45%)" },
      elements: [
        t({ type: "text", x: 4, y: 5, width: 40, height: 6, content: "Institution Name", dataKey: "institution_name", fontSize: 8.5, fontWeight: 700, color: "#ffffff", zIndex: 2 }),
        t({ type: "image", x: 4, y: 16, width: 22, height: 22, imageShape: "circle", borderWidth: 1.5, borderColor: "#ffffff", content: "photo", dataKey: "photo", zIndex: 2 }),
        t({ type: "text", x: 42, y: 18, width: 40, height: 7, content: "Employee Name", dataKey: "employee_name", fontSize: 12, fontWeight: 700, color: "#111827", zIndex: 2 }),
        t({ type: "text", x: 42, y: 26, width: 40, height: 6, content: "Designation", dataKey: "designation", fontSize: 9, fontWeight: 400, color: "#374151", zIndex: 2 }),
        t({ type: "text", x: 42, y: 34, width: 40, height: 6, content: "Employee ID", dataKey: "employee_id", fontSize: 8.5, fontWeight: 500, color: "#0f766e", zIndex: 2 }),
      ],
    },
  },
  {
    id: "blank-custom",
    name: "Blank / Custom",
    description: "An empty canvas — start from scratch and build exactly what you want.",
    category: "Custom",
    widthMm: 85.6, heightMm: 54,
    front: { background: { type: "color", value: "#ffffff" }, elements: [] },
  },
];
