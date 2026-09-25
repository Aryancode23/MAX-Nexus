// Small set of genuinely reusable processing operations — extracted here
// so Fix My File and Document Pack Builder call the same code rather than
// each having their own copy of, say, "binary-search JPEG quality to hit
// a target size."

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Read a File into a base64 data: URL instead of a blob: object URL.
 * Use this (not URL.createObjectURL) for any image that will later be
 * captured by html2canvas — html2canvas's DOM-clone step does not
 * reliably re-resolve blob: URLs (they're scoped to the document that
 * created them), so images silently drop out of the exported PDF/PNG
 * even though they render fine on screen. data: URLs are self-contained
 * strings with no such scoping issue, at the cost of a slightly larger
 * value held in state.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Resize (contain, no upscaling beyond source) and optionally crop-to-exact-size, then compress to fit maxSizeKB via binary-search JPEG quality. */
export async function resizeAndCompressImage(
  file: File,
  opts: { widthPx?: number; heightPx?: number; maxSizeKB?: number; format?: "jpeg" | "png" }
): Promise<Blob> {
  const img = await loadImage(URL.createObjectURL(file));
  const targetW = opts.widthPx ?? img.width;
  const targetH = opts.heightPx ?? img.height;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, targetW, targetH);

  // Cover-fit into the exact target box (matches how Passport Photo / Signature Resizer behave).
  const scale = Math.max(targetW / img.width, targetH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  ctx.drawImage(img, (targetW - drawW) / 2, (targetH - drawH) / 2, drawW, drawH);

  const mime = opts.format === "png" ? "image/png" : "image/jpeg";

  if (!opts.maxSizeKB || mime === "image/png") {
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mime, 0.9));
  }

  let low = 0.05, high = 0.95, best: Blob | null = null;
  for (let i = 0; i < 8; i++) {
    const mid = (low + high) / 2;
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mime, mid));
    if (blob.size / 1024 <= opts.maxSizeKB) { best = blob; low = mid; } else { high = mid; }
  }
  return best ?? new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mime, 0.05));
}

/** Converts an image file into a single-page PDF (bytes), sized to fit the image on an A4 page. */
export async function imageFileToPdfBytes(file: File): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const img = await loadImage(URL.createObjectURL(file));
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  const jpgBytes = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)).then((b) => b.arrayBuffer());

  const pdf = await PDFDocument.create();
  const jpg = await pdf.embedJpg(jpgBytes);
  const pageW = 595, pageH = 842;
  const page = pdf.addPage([pageW, pageH]);
  const scale = Math.min((pageW - 40) / jpg.width, (pageH - 40) / jpg.height);
  const w = jpg.width * scale, h = jpg.height * scale;
  page.drawImage(jpg, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
  return pdf.save();
}

export function humanSize(bytesOrKB: number, isKB = false): string {
  const kb = isKB ? bytesOrKB : bytesOrKB / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${Math.round(kb)} KB`;
}
