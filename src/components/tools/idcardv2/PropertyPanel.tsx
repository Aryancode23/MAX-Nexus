"use client";

import type { CardElementV2 } from "./schema";

const FONTS = ["Inter, sans-serif", "Georgia, serif", "'Courier New', monospace", "Arial, sans-serif", "'Times New Roman', serif"];

export function PropertyPanel({
  element,
  onChange,
  onCommit,
}: {
  element: CardElementV2 | null;
  onChange: (patch: Partial<CardElementV2>) => void;
  onCommit: () => void;
}) {
  if (!element) {
    return <p className="text-xs text-muted">Select an element on the card to edit its properties.</p>;
  }

  function num(patch: (v: number) => Partial<CardElementV2>) {
    return (e: React.ChangeEvent<HTMLInputElement>) => onChange(patch(Number(e.target.value)));
  }

  return (
    <div className="space-y-3" onPointerUp={onCommit}>
      <p className="text-xs font-semibold uppercase text-muted">{element.type}</p>

      {element.type === "text" && !element.dataKey && (
        <label className="block text-xs">Text
          <textarea value={element.content || ""} onChange={(e) => onChange({ content: e.target.value })} rows={2} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" />
        </label>
      )}

      {element.type === "text" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs">Font
              <select value={element.fontFamily} onChange={(e) => onChange({ fontFamily: e.target.value })} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs">
                {FONTS.map((f) => <option key={f} value={f}>{f.split(",")[0].replace(/'/g, "")}</option>)}
              </select>
            </label>
            <label className="block text-xs">Size (pt)
              <input type="number" value={element.fontSize} onChange={num((v) => ({ fontSize: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs">Weight
              <select value={element.fontWeight} onChange={(e) => onChange({ fontWeight: Number(e.target.value) })} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs">
                {[300, 400, 500, 600, 700, 800].map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </label>
            <label className="block text-xs">Align
              <select value={element.textAlign} onChange={(e) => onChange({ textAlign: e.target.value as any })} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs">
                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={element.italic} onChange={(e) => onChange({ italic: e.target.checked })} /> Italic</label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={element.autoFit} onChange={(e) => onChange({ autoFit: e.target.checked })} /> Auto-fit text to box
          </label>
          <label className="block text-xs">Color
            <input type="color" value={element.color} onChange={(e) => onChange({ color: e.target.value })} className="mt-1 h-8 w-full rounded-control border border-border" />
          </label>
        </>
      )}

      {element.type === "shape" && (
        <>
          <label className="block text-xs">Fill color
            <input type="color" value={element.fill} onChange={(e) => onChange({ fill: e.target.value })} className="mt-1 h-8 w-full rounded-control border border-border" />
          </label>
          <label className="block text-xs">Shape
            <select value={element.shapeType} onChange={(e) => onChange({ shapeType: e.target.value as any })} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs">
              <option value="rect">Rectangle</option><option value="circle">Circle</option><option value="line">Line</option>
            </select>
          </label>
          {element.shapeType === "rect" && (
            <label className="block text-xs">Corner radius (mm)
              <input type="number" value={element.radius} onChange={num((v) => ({ radius: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" />
            </label>
          )}
        </>
      )}

      {element.type === "image" && (
        <>
          <label className="block text-xs">Shape
            <select value={element.imageShape} onChange={(e) => onChange({ imageShape: e.target.value as any })} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs">
              <option value="rect">Rectangle</option><option value="circle">Circle</option>
            </select>
          </label>
          <label className="block text-xs">Border width (mm)
            <input type="number" step="0.5" value={element.borderWidth} onChange={num((v) => ({ borderWidth: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" />
          </label>
          <label className="block text-xs">Border color
            <input type="color" value={element.borderColor} onChange={(e) => onChange({ borderColor: e.target.value })} className="mt-1 h-8 w-full rounded-control border border-border" />
          </label>
        </>
      )}

      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
        <label className="block text-xs">X (mm)<input type="number" value={Math.round(element.x * 10) / 10} onChange={num((v) => ({ x: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" /></label>
        <label className="block text-xs">Y (mm)<input type="number" value={Math.round(element.y * 10) / 10} onChange={num((v) => ({ y: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" /></label>
        <label className="block text-xs">Width (mm)<input type="number" value={Math.round(element.width * 10) / 10} onChange={num((v) => ({ width: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" /></label>
        <label className="block text-xs">Height (mm)<input type="number" value={Math.round(element.height * 10) / 10} onChange={num((v) => ({ height: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" /></label>
        <label className="block text-xs">Rotation (°)<input type="number" value={element.rotation} onChange={num((v) => ({ rotation: v }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-xs" /></label>
        <label className="block text-xs">Opacity<input type="range" min={0} max={1} step={0.05} value={element.opacity} onChange={num((v) => ({ opacity: v }))} className="mt-2 w-full" /></label>
      </div>
    </div>
  );
}
