import type { CardSide, CardElementV2 } from "./schema";

export interface DataValues { [key: string]: string; }
export interface DataImages { [key: string]: HTMLImageElement | undefined; }

function resolveText(el: CardElementV2, data: DataValues): string {
  if (el.dataKey) return data[el.dataKey] || el.content || "";
  return el.content || "";
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidthPx: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidthPx && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawText(ctx: CanvasRenderingContext2D, el: CardElementV2, data: DataValues, pxPerMm: number) {
  const text = resolveText(el, data);
  if (!text) return;

  const xPx = el.x * pxPerMm, yPx = el.y * pxPerMm, wPx = el.width * pxPerMm, hPx = el.height * pxPerMm;
  let fontSize = (el.fontSize ?? 12) * (pxPerMm / 3.78);

  ctx.save();
  ctx.translate(xPx + wPx / 2, yPx + hPx / 2);
  ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
  ctx.translate(-wPx / 2, -hPx / 2);
  ctx.globalAlpha = el.opacity ?? 1;

  const weight = el.fontWeight ?? 400;
  const style = el.italic ? "italic" : "normal";
  const family = el.fontFamily || "Inter, sans-serif";

  function setFont(size: number) {
    ctx.font = `${style} ${weight} ${size}px ${family}`;
  }
  setFont(fontSize);

  let lines = wrapText(ctx, text, wPx);

  if (el.autoFit) {
    const minSize = (el.minFontSize ?? 8) * (pxPerMm / 3.78);
    const maxSize = (el.maxFontSize ?? 28) * (pxPerMm / 3.78);
    fontSize = Math.min(fontSize, maxSize);
    setFont(fontSize);
    lines = wrapText(ctx, text, wPx);
    while ((lines.length * fontSize * 1.2 > hPx || lines.some((l) => ctx.measureText(l).width > wPx)) && fontSize > minSize) {
      fontSize -= 1;
      setFont(fontSize);
      lines = wrapText(ctx, text, wPx);
    }
  }

  ctx.fillStyle = el.color || "#111827";
  ctx.textBaseline = "top";
  ctx.textAlign = el.textAlign || "left";
  const alignX = el.textAlign === "center" ? wPx / 2 : el.textAlign === "right" ? wPx : 0;

  lines.forEach((line, i) => {
    ctx.fillText(line, alignX, i * fontSize * 1.2, wPx);
  });

  ctx.restore();
}

function drawShape(ctx: CanvasRenderingContext2D, el: CardElementV2, pxPerMm: number) {
  const xPx = el.x * pxPerMm, yPx = el.y * pxPerMm, wPx = el.width * pxPerMm, hPx = el.height * pxPerMm;
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;
  ctx.fillStyle = el.fill || "#4f46e5";
  if (el.shapeType === "circle") {
    ctx.beginPath();
    ctx.ellipse(xPx + wPx / 2, yPx + hPx / 2, wPx / 2, hPx / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (el.shapeType === "line") {
    ctx.strokeStyle = el.fill || "#111827";
    ctx.lineWidth = Math.max(1, hPx);
    ctx.beginPath();
    ctx.moveTo(xPx, yPx);
    ctx.lineTo(xPx + wPx, yPx);
    ctx.stroke();
  } else {
    const r = (el.radius ?? 0) * pxPerMm;
    ctx.beginPath();
    ctx.roundRect(xPx, yPx, wPx, hPx, r);
    ctx.fill();
  }
  ctx.restore();
}

function drawImage(ctx: CanvasRenderingContext2D, el: CardElementV2, img: HTMLImageElement | undefined, pxPerMm: number) {
  const xPx = el.x * pxPerMm, yPx = el.y * pxPerMm, wPx = el.width * pxPerMm, hPx = el.height * pxPerMm;
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;

  if (el.imageShape === "circle") {
    ctx.beginPath();
    ctx.ellipse(xPx + wPx / 2, yPx + hPx / 2, wPx / 2, hPx / 2, 0, 0, Math.PI * 2);
    ctx.clip();
  }

  if (img) {
    const scale = Math.max(wPx / img.width, hPx / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, xPx + (wPx - dw) / 2, yPx + (hPx - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(xPx, yPx, wPx, hPx);
  }
  ctx.restore();

  if (el.borderWidth) {
    ctx.save();
    ctx.strokeStyle = el.borderColor || "#ffffff";
    ctx.lineWidth = el.borderWidth * pxPerMm;
    if (el.imageShape === "circle") {
      ctx.beginPath();
      ctx.ellipse(xPx + wPx / 2, yPx + hPx / 2, wPx / 2, hPx / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(xPx, yPx, wPx, hPx);
    }
    ctx.restore();
  }
}

function parseGradient(value: string): { colors: string[]; angle: number } | null {
  const match = value.match(/linear-gradient\(([-\d.]+)deg,\s*(.+)\)/);
  if (!match) return null;
  const angle = parseFloat(match[1]);
  const colors = match[2].split(",").map((s) => s.trim().split(" ")[0]);
  return { colors, angle };
}

export function renderCardSide(
  canvas: HTMLCanvasElement,
  side: CardSide,
  widthMm: number,
  heightMm: number,
  pxPerMm: number,
  data: DataValues,
  images: DataImages
) {
  canvas.width = widthMm * pxPerMm;
  canvas.height = heightMm * pxPerMm;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (side.background.type === "color") {
    ctx.fillStyle = side.background.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (side.background.type === "gradient") {
    const parsed = parseGradient(side.background.value);
    if (parsed) {
      const rad = (parsed.angle * Math.PI) / 180;
      const x1 = canvas.width / 2 - (Math.cos(rad) * canvas.width) / 2;
      const y1 = canvas.height / 2 - (Math.sin(rad) * canvas.height) / 2;
      const x2 = canvas.width / 2 + (Math.cos(rad) * canvas.width) / 2;
      const y2 = canvas.height / 2 + (Math.sin(rad) * canvas.height) / 2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      parsed.colors.forEach((c, i) => grad.addColorStop(i / Math.max(1, parsed.colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else if (side.background.type === "image" && images.__background__) {
    ctx.drawImage(images.__background__, 0, 0, canvas.width, canvas.height);
  }

  const sorted = [...side.elements].filter((e) => !e.hidden).sort((a, b) => a.zIndex - b.zIndex);
  for (const el of sorted) {
    if (el.type === "text") drawText(ctx, el, data, pxPerMm);
    else if (el.type === "shape") drawShape(ctx, el, pxPerMm);
    else if (el.type === "image") drawImage(ctx, el, images[el.dataKey || el.id], pxPerMm);
    else if (el.type === "qrcode" && images[el.id]) drawImage(ctx, { ...el, imageShape: "rect" }, images[el.id], pxPerMm);
  }
}
