export interface ResumeEntry {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

export interface ResumeData {
  name: string;
  role: string;
  contact: string;
  summary: string;
  skills: string;
  experience: ResumeEntry[];
  education: ResumeEntry[];
  projects: ResumeEntry[];
  certifications: ResumeEntry[];
  photoDataUrl: string | null;
}

export function emptyEntry(): ResumeEntry {
  return { id: crypto.randomUUID(), title: "", subtitle: "", period: "", description: "" };
}

export type TemplateId = "classic" | "minimal" | "compact" | "modern" | "creative" | "twocolumn";

export interface TemplateDef {
  id: TemplateId;
  name: string;
  description: string;
  hasPhoto: boolean;
  accent: string;
  atsSafe: boolean; // true = exported as selectable vector text
}

export const TEMPLATES: TemplateDef[] = [
  { id: "classic", name: "Classic", description: "Traditional single column, fully selectable text — safest for ATS", hasPhoto: false, accent: "#1f2937", atsSafe: true },
  { id: "minimal", name: "Minimal", description: "Lots of whitespace, understated accent lines", hasPhoto: false, accent: "#0891b2", atsSafe: false },
  { id: "compact", name: "Compact", description: "Dense layout — fits more experience on one page", hasPhoto: false, accent: "#334155", atsSafe: false },
  { id: "modern", name: "Modern Sidebar", description: "Colored sidebar with photo, clean main column", hasPhoto: true, accent: "#4f46e5", atsSafe: false },
  { id: "creative", name: "Creative", description: "Bold color header band with photo", hasPhoto: true, accent: "#db2777", atsSafe: false },
  { id: "twocolumn", name: "Two-Column", description: "Narrow photo/skills rail beside a wide content column", hasPhoto: true, accent: "#0d9488", atsSafe: false },
];
