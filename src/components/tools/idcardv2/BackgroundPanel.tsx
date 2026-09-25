"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { BACKGROUND_PRESETS } from "./backgroundPresets";
import type { CardSide } from "./schema";

export function BackgroundPanel({
  background,
  onChange,
  onUploadImage,
}: {
  background: CardSide["background"];
  onChange: (patch: Partial<CardSide["background"]>) => void;
  onUploadImage: (file: File) => void;
}) {
  const [gradA, setGradA] = useState("#2563eb");
  const [gradB, setGradB] = useState("#4f46e5");
  const [gradAngle, setGradAngle] = useState(135);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase text-muted">Our picks</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {BACKGROUND_PRESETS.map((p) => (
            <button
              key={p.id}
              title={p.name}
              onClick={() => onChange({ type: p.css.startsWith("linear-gradient") ? "gradient" : "color", value: p.css, imageUrl: undefined })}
              className="h-10 rounded-control border border-border hover:ring-2 hover:ring-primary"
              style={{ background: p.css }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase text-muted">Solid color</p>
        <input
          type="color"
          value={background.type === "color" ? background.value : "#ffffff"}
          onChange={(e) => onChange({ type: "color", value: e.target.value, imageUrl: undefined })}
          className="mt-2 h-9 w-full rounded-control border border-border"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase text-muted">Custom gradient</p>
        <div className="mt-2 flex items-center gap-2">
          <input type="color" value={gradA} onChange={(e) => setGradA(e.target.value)} className="h-8 w-10 rounded-control border border-border" />
          <input type="color" value={gradB} onChange={(e) => setGradB(e.target.value)} className="h-8 w-10 rounded-control border border-border" />
          <input type="range" min={0} max={360} value={gradAngle} onChange={(e) => setGradAngle(Number(e.target.value))} className="flex-1" />
        </div>
        <button
          onClick={() => onChange({ type: "gradient", value: `linear-gradient(${gradAngle}deg, ${gradA}, ${gradB})`, imageUrl: undefined })}
          className="mt-2 w-full rounded-control border border-border bg-surface-2 px-3 py-1.5 text-xs hover:bg-surface"
        >
          Apply gradient
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase text-muted">Image background</p>
        <label className="focus-ring mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-border bg-surface-2 px-3 py-2 text-xs text-muted hover:bg-surface">
          <Upload size={12} /> Upload image
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadImage(e.target.files[0])} />
        </label>
        {background.type === "image" && <p className="mt-1 text-[10px] text-muted">Image background applied — upload again to replace it.</p>}
      </div>
    </div>
  );
}
