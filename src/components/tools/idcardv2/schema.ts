// Coordinate system: everything is in millimeters (mm), matching the
// physical card. This is what lets one renderer serve both the on-screen
// editor (scaled down for display) and high-resolution export (scaled up
// for print) — no separate "editor math" vs "export math".

export type ElementType = "text" | "image" | "shape" | "qrcode";

export interface CardElementV2 {
  id: string;
  type: ElementType;
  x: number; // mm, top-left
  y: number; // mm, top-left
  width: number; // mm
  height: number; // mm
  rotation: number; // degrees
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  /** If set, this element's real content/image comes from the Data Mode value for this key (content/imageUrl then act as the placeholder shown when empty). Unset = free text/image the user placed directly. */
  dataKey?: string;

  // text
  content?: string; // may contain {{placeholder}} tokens
  fontFamily?: string;
  fontSize?: number; // pt
  fontWeight?: number;
  italic?: boolean;
  color?: string;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number;
  opacity?: number;
  autoFit?: boolean;
  minFontSize?: number;
  maxFontSize?: number;

  // image
  imageUrl?: string;
  imageShape?: "rect" | "circle";
  borderColor?: string;
  borderWidth?: number;

  // shape
  shapeType?: "rect" | "circle" | "line";
  fill?: string;
  radius?: number;

  // qrcode
  qrValue?: string;
  qrFg?: string;
  qrBg?: string;
}

export interface CardSide {
  background: {
    type: "color" | "gradient" | "image";
    value: string; // color hex, or CSS gradient string
    imageUrl?: string;
    opacity?: number;
  };
  elements: CardElementV2[];
}

export interface CardTemplateV2 {
  id: string;
  name: string;
  description: string;
  category: string;
  widthMm: number;
  heightMm: number;
  front: CardSide;
  back?: CardSide;
}

export function emptyTextElement(overrides: Partial<CardElementV2> = {}): CardElementV2 {
  return {
    id: crypto.randomUUID(),
    type: "text",
    x: 5, y: 5, width: 40, height: 8,
    rotation: 0, zIndex: 1,
    content: "New Text",
    fontFamily: "Inter, sans-serif",
    fontSize: 12, fontWeight: 500, italic: false,
    color: "#111827", textAlign: "left", letterSpacing: 0, opacity: 1,
    autoFit: false, minFontSize: 8, maxFontSize: 28,
    ...overrides,
  };
}

export function emptyShapeElement(overrides: Partial<CardElementV2> = {}): CardElementV2 {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    x: 5, y: 5, width: 20, height: 20,
    rotation: 0, zIndex: 1,
    shapeType: "rect", fill: "#4f46e5", radius: 0, opacity: 1,
    ...overrides,
  };
}

export function emptyImageElement(overrides: Partial<CardElementV2> = {}): CardElementV2 {
  return {
    id: crypto.randomUUID(),
    type: "image",
    x: 5, y: 5, width: 20, height: 20,
    rotation: 0, zIndex: 1,
    imageShape: "rect", borderWidth: 0, borderColor: "#ffffff", opacity: 1,
    ...overrides,
  };
}
