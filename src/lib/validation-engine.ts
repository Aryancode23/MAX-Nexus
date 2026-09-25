// Reusable validation engine — deliberately the ONLY place dimension/size/
// format/page-count PASS-FAIL logic lives. Fix My File, Document Pack
// Builder, and any future tool call into this rather than re-implementing
// checks inline.

export interface Requirement {
  widthPx?: number;
  heightPx?: number;
  formats?: string[]; // e.g. ["jpg", "jpeg"]
  maxSizeKB?: number;
  maxPages?: number;
  pageSize?: "A4" | "A5" | "Letter";
  orientation?: "portrait" | "landscape";
}

export interface FileInspection {
  widthPx?: number;
  heightPx?: number;
  format?: string;
  sizeKB: number;
  pageCount?: number;
  pageSize?: string;
  orientation?: "portrait" | "landscape";
}

export interface CheckResult {
  field: string;
  label: string;
  pass: boolean;
  actual: string;
  required: string;
}

const PAGE_SIZES_PT: Record<string, { w: number; h: number }> = {
  A4: { w: 595, h: 842 },
  A5: { w: 420, h: 595 },
  Letter: { w: 612, h: 792 },
};

export function detectPageSize(widthPt: number, heightPt: number): string {
  const tolerance = 8;
  for (const [name, size] of Object.entries(PAGE_SIZES_PT)) {
    const matchesPortrait = Math.abs(widthPt - size.w) < tolerance && Math.abs(heightPt - size.h) < tolerance;
    const matchesLandscape = Math.abs(widthPt - size.h) < tolerance && Math.abs(heightPt - size.w) < tolerance;
    if (matchesPortrait || matchesLandscape) return name;
  }
  return "Custom";
}

export function validateFile(inspection: FileInspection, requirement: Requirement): CheckResult[] {
  const results: CheckResult[] = [];

  if (requirement.widthPx && requirement.heightPx) {
    const pass = inspection.widthPx === requirement.widthPx && inspection.heightPx === requirement.heightPx;
    results.push({
      field: "dimensions",
      label: "Dimensions",
      pass,
      actual: inspection.widthPx ? `${inspection.widthPx} × ${inspection.heightPx} px` : "Unknown",
      required: `${requirement.widthPx} × ${requirement.heightPx} px`,
    });
  }

  if (requirement.formats && requirement.formats.length > 0) {
    const actualFormat = (inspection.format || "").toLowerCase();
    const pass = requirement.formats.map((f) => f.toLowerCase()).includes(actualFormat);
    results.push({
      field: "format",
      label: "Format",
      pass,
      actual: inspection.format?.toUpperCase() || "Unknown",
      required: requirement.formats.map((f) => f.toUpperCase()).join(" or "),
    });
  }

  if (requirement.maxSizeKB) {
    const pass = inspection.sizeKB <= requirement.maxSizeKB;
    results.push({
      field: "fileSize",
      label: "File size",
      pass,
      actual: `${Math.round(inspection.sizeKB)} KB`,
      required: `≤ ${requirement.maxSizeKB} KB`,
    });
  }

  if (requirement.maxPages) {
    const pass = (inspection.pageCount ?? 0) <= requirement.maxPages;
    results.push({
      field: "pageCount",
      label: "Page count",
      pass,
      actual: `${inspection.pageCount ?? "Unknown"} pages`,
      required: `≤ ${requirement.maxPages} pages`,
    });
  }

  if (requirement.pageSize) {
    const pass = inspection.pageSize === requirement.pageSize;
    results.push({
      field: "pageSize",
      label: "Page size",
      pass,
      actual: inspection.pageSize || "Unknown",
      required: requirement.pageSize,
    });
  }

  if (requirement.orientation) {
    const pass = inspection.orientation === requirement.orientation;
    results.push({
      field: "orientation",
      label: "Orientation",
      pass,
      actual: inspection.orientation || "Unknown",
      required: requirement.orientation,
    });
  }

  return results;
}

export function allPass(results: CheckResult[]): boolean {
  return results.length > 0 && results.every((r) => r.pass);
}

// --- Inspection helpers (browser-only: use Image / pdfjs) ---

export function inspectImageFile(file: File): Promise<FileInspection> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        widthPx: img.width,
        heightPx: img.height,
        format: file.type.split("/")[1] || file.name.split(".").pop(),
        sizeKB: file.size / 1024,
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function inspectPdfFile(file: File): Promise<FileInspection> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const firstPage = await pdf.getPage(1);
  const viewport = firstPage.getViewport({ scale: 1 });
  const pageSize = detectPageSize(viewport.width, viewport.height);
  const orientation: "portrait" | "landscape" = viewport.width > viewport.height ? "landscape" : "portrait";

  return {
    sizeKB: file.size / 1024,
    pageCount: pdf.numPages,
    pageSize,
    orientation,
    format: "pdf",
  };
}
