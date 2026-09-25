"use client";

import { useEffect, useRef, useState } from "react";
import {
  Undo2, Redo2, Type, Square, Circle, Image as ImageIcon, Trash2, Copy,
  Download, LayoutGrid, Layers as LayersIcon, Settings2, Database, FlipHorizontal, Palette,
} from "lucide-react";
import { Button } from "@/components/Button";
import { CARD_TEMPLATES_V2 } from "./idcardv2/templates";
import { emptyTextElement, emptyShapeElement, emptyImageElement, type CardTemplateV2, type CardElementV2, type CardSide } from "./idcardv2/schema";
import { renderCardSide, type DataValues, type DataImages } from "./idcardv2/renderCardCanvas";
import { EditableElement } from "./idcardv2/EditableElement";
import { PropertyPanel } from "./idcardv2/PropertyPanel";
import { LayersPanel } from "./idcardv2/LayersPanel";
import { BackgroundPanel } from "./idcardv2/BackgroundPanel";
import { useHistory } from "./idcardv2/useHistory";

const PREVIEW_PX_PER_MM = 3.6;
const EXPORT_PX_PER_MM = 12;
const AUTOSAVE_KEY = "max-nexus:idcard-designer-draft";

const DATA_FIELD_LABELS: Record<string, string> = {
  institution_name: "Institution Name", employee_name: "Employee Name", designation: "Designation",
  employee_id: "Employee ID", department: "Department", phone: "Phone", email: "Email",
  valid_till: "Valid Till", blood_group: "Blood Group",
};
const IMAGE_FIELD_KEYS = ["photo", "logo", "signature"];

export function IdCardDesignerTool() {
  const [template, setTemplate] = useState<CardTemplateV2 | null>(null);
  const { state: design, set: setDesign, undo, redo, canUndo, canRedo } = useHistory<CardTemplateV2 | null>(null);
  const [side, setSide] = useState<"front" | "back">("front");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"design" | "data">("design");
  const [rightTab, setRightTab] = useState<"properties" | "layers" | "background">("properties");
  const [dataValues, setDataValues] = useState<DataValues>({});
  const [dataImages, setDataImages] = useState<Record<string, string>>({}); // key -> object URL
  const [loadedImages, setLoadedImages] = useState<DataImages>({});
  const [copies, setCopies] = useState(2);
  const [exporting, setExporting] = useState(false);

  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  // Restore autosaved draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.template && confirm("Restore your unsaved ID card draft from last time?")) {
          setTemplate(saved.template);
          setDesign(saved.template, false);
          setDataValues(saved.dataValues || {});
        }
      }
    } catch { /* ignore corrupt draft */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (design + data, not image blobs — those don't survive reload anyway)
  useEffect(() => {
    if (!design) return;
    const t = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ template: design, dataValues }));
    }, 800);
    return () => clearTimeout(t);
  }, [design, dataValues]);

  // Load actual <img> elements for canvas export whenever dataImages changes
  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        Object.entries(dataImages).map(([key, url]) => new Promise<[string, HTMLImageElement]>((resolve) => {
          const img = new Image();
          img.onload = () => resolve([key, img]);
          img.src = url;
        }))
      );
      setLoadedImages(Object.fromEntries(entries));
    })();
  }, [dataImages]);

  function chooseTemplate(t: CardTemplateV2) {
    setTemplate(t);
    setDesign(JSON.parse(JSON.stringify(t)), false);
    setSelectedId(null);
    setSide("front");
  }

  const currentSide: CardSide | null = design ? (side === "front" ? design.front : design.back ?? design.front) : null;

  function updateSide(patch: Partial<CardSide>, recordHistory = true) {
    setDesign((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (side === "front") next.front = { ...next.front, ...patch };
      else next.back = { ...(next.back ?? next.front), ...patch };
      return next;
    }, recordHistory);
  }

  function updateElement(id: string, patch: Partial<CardElementV2>, recordHistory = true) {
    if (!currentSide) return;
    updateSide({ elements: currentSide.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) }, recordHistory);
  }

  function addElement(el: CardElementV2) {
    if (!currentSide) return;
    const maxZ = Math.max(0, ...currentSide.elements.map((e) => e.zIndex));
    updateSide({ elements: [...currentSide.elements, { ...el, zIndex: maxZ + 1 }] });
    setSelectedId(el.id);
  }

  function deleteElement(id: string) {
    if (!currentSide) return;
    updateSide({ elements: currentSide.elements.filter((e) => e.id !== id) });
    if (selectedId === id) setSelectedId(null);
  }

  function duplicateElement(id: string) {
    if (!currentSide) return;
    const el = currentSide.elements.find((e) => e.id === id);
    if (!el) return;
    const maxZ = Math.max(0, ...currentSide.elements.map((e) => e.zIndex));
    const copy = { ...el, id: crypto.randomUUID(), x: el.x + 3, y: el.y + 3, zIndex: maxZ + 1 };
    updateSide({ elements: [...currentSide.elements, copy] });
    setSelectedId(copy.id);
  }

  function reorderElement(id: string, dir: 1 | -1) {
    if (!currentSide) return;
    updateSide({
      elements: currentSide.elements.map((e) => (e.id === id ? { ...e, zIndex: e.zIndex + dir } : e)),
    });
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const ctrl = e.metaKey || e.ctrlKey;
      if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      else if (ctrl && e.key === "d" && selectedId) { e.preventDefault(); duplicateElement(selectedId); }
      else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) { e.preventDefault(); deleteElement(selectedId); }
      else if (e.key.startsWith("Arrow") && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        updateElement(selectedId, { x: (currentSide?.elements.find((el) => el.id === selectedId)?.x ?? 0) + dx, y: (currentSide?.elements.find((el) => el.id === selectedId)?.y ?? 0) + dy }, false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, currentSide, undo, redo]);

  function onImageFieldUpload(key: string, file: File) {
    const url = URL.createObjectURL(file);
    setDataImages((prev) => ({ ...prev, [key]: url }));
  }

  function onBackgroundImageUpload(file: File) {
    const url = URL.createObjectURL(file);
    setDataImages((prev) => ({ ...prev, __background__: url }));
    updateSide({ background: { ...currentSide!.background, type: "image", imageUrl: url } });
  }

  function addCustomField() {
    const label = prompt("Field label, e.g. \"Blood Group\" or \"Employee Code\":");
    if (!label || !currentSide) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    addElement(emptyTextElement({ content: label, dataKey: key, x: 5, y: 45, width: 40, height: 6, fontSize: 9 }));
  }

  // Collect every dataKey referenced across both sides for the Data Mode form
  const allDataKeys = design
    ? Array.from(new Set([...design.front.elements, ...(design.back?.elements ?? [])].map((e) => e.dataKey).filter(Boolean) as string[]))
    : [];
  const textKeys = allDataKeys.filter((k) => !IMAGE_FIELD_KEYS.includes(k));
  const imageKeys = allDataKeys.filter((k) => IMAGE_FIELD_KEYS.includes(k));

  async function exportImage(format: "png" | "jpeg") {
    if (!design || !currentSide || !exportCanvasRef.current) return;
    renderCardSide(exportCanvasRef.current, currentSide, design.widthMm, design.heightMm, EXPORT_PX_PER_MM, dataValues, loadedImages);
    const url = exportCanvasRef.current.toDataURL(`image/${format}`, 0.95);
    const a = document.createElement("a");
    a.href = url;
    a.download = `id-card-${side}.${format === "jpeg" ? "jpg" : "png"}`;
    a.click();
  }

  async function exportPdf() {
    if (!design || !exportCanvasRef.current) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const marginX = (pageW - design.widthMm) / 2;
      let y = 15;

      const sidesToRender: CardSide[] = design.back ? [design.front, design.back] : [design.front];

      for (let i = 0; i < copies; i++) {
        for (const s of sidesToRender) {
          renderCardSide(exportCanvasRef.current, s, design.widthMm, design.heightMm, EXPORT_PX_PER_MM, dataValues, loadedImages);
          const imgData = exportCanvasRef.current.toDataURL("image/png");
          doc.setLineDashPattern([1.5, 1.5], 0);
          doc.rect(marginX, y, design.widthMm, design.heightMm);
          doc.addImage(imgData, "PNG", marginX, y, design.widthMm, design.heightMm);
          y += design.heightMm + 6;
        }
        y += 6;
      }
      doc.save("id-card.pdf");
    } finally {
      setExporting(false);
    }
  }

  // --- Template picker screen ---
  if (!template || !design) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">Choose a starting template — every color, font, position, and element is fully editable afterward.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CARD_TEMPLATES_V2.map((t) => (
            <button key={t.id} onClick={() => chooseTemplate(t)} className="focus-ring rounded-card border border-border bg-surface p-3 text-left shadow-soft hover:shadow-elevated">
              <div
                className="w-full rounded-control border border-border"
                style={{ aspectRatio: `${t.widthMm} / ${t.heightMm}`, background: t.front.background.type === "gradient" ? t.front.background.value : t.front.background.value }}
              />
              <p className="mt-2 text-xs font-semibold text-text">{t.name}</p>
              <p className="text-[10px] text-muted line-clamp-2">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const selectedElement = currentSide?.elements.find((e) => e.id === selectedId) ?? null;
  const previewW = design.widthMm * PREVIEW_PX_PER_MM;
  const previewH = design.heightMm * PREVIEW_PX_PER_MM;

  return (
    <div className="space-y-4">
      <canvas ref={exportCanvasRef} className="hidden" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => { setTemplate(null); setSelectedId(null); }}>Change template</Button>
          <div className="flex overflow-hidden rounded-control border border-border">
            <button onClick={() => setMode("design")} className={`flex items-center gap-1 px-3 py-1.5 text-xs ${mode === "design" ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}><Settings2 size={12} /> Design</button>
            <button onClick={() => setMode("data")} className={`flex items-center gap-1 px-3 py-1.5 text-xs ${mode === "data" ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}><Database size={12} /> Data</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={undo} disabled={!canUndo}><Undo2 size={14} /></Button>
          <Button size="sm" variant="secondary" onClick={redo} disabled={!canRedo}><Redo2 size={14} /></Button>
          <Button
            size="sm" variant="secondary"
            onClick={() => setDesign((d) => (d ? { ...d, widthMm: d.heightMm, heightMm: d.widthMm } : d))}
            title="Swap between portrait and landscape"
          >
            <FlipHorizontal size={14} /> {design.widthMm > design.heightMm ? "Landscape" : "Portrait"} (switch)
          </Button>
          <Button
            size="sm" variant="secondary"
            onClick={() => setDesign((d) => (d ? { ...d, back: d.back ?? { background: { ...d.front.background }, elements: [] } } : d))}
          >
            <FlipHorizontal size={14} /> {design.back ? "Has back side" : "Add back side"}
          </Button>
          {design.back && (
            <div className="flex overflow-hidden rounded-control border border-border">
              <button onClick={() => setSide("front")} className={`px-3 py-1.5 text-xs ${side === "front" ? "bg-primary text-primary-foreground" : "bg-surface"}`}>Front</button>
              <button onClick={() => setSide("back")} className={`px-3 py-1.5 text-xs ${side === "back" ? "bg-primary text-primary-foreground" : "bg-surface"}`}>Back</button>
            </div>
          )}
        </div>
      </div>

      {mode === "data" ? (
        <div className="grid max-w-lg gap-3">
          {textKeys.map((key) => (
            <label key={key} className="block text-sm">
              {DATA_FIELD_LABELS[key] || key}
              <input value={dataValues[key] || ""} onChange={(e) => setDataValues((v) => ({ ...v, [key]: e.target.value }))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
            </label>
          ))}
          {imageKeys.map((key) => (
            <div key={key}>
              <p className="text-sm capitalize">{key}</p>
              <div className="mt-1 flex items-center gap-3">
                {dataImages[key] && <img src={dataImages[key]} alt="" className="h-14 w-14 rounded-control border border-border object-cover" />}
                <label className="cursor-pointer rounded-control border border-border bg-surface-2 px-3 py-1.5 text-xs hover:bg-surface">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onImageFieldUpload(key, e.target.files[0])} />
                </label>
              </div>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={addCustomField} className="w-fit">+ Add custom field</Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[auto_1fr_260px]">
          <div className="flex flex-row gap-2 lg:flex-col">
            <Button size="sm" variant="secondary" onClick={() => addElement(emptyTextElement())}><Type size={14} /></Button>
            <Button size="sm" variant="secondary" onClick={() => addElement(emptyShapeElement({ shapeType: "rect" }))}><Square size={14} /></Button>
            <Button size="sm" variant="secondary" onClick={() => addElement(emptyShapeElement({ shapeType: "circle", width: 15, height: 15 }))}><Circle size={14} /></Button>
            <label className="focus-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-control border border-border bg-surface-2 hover:bg-surface">
              <ImageIcon size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const url = URL.createObjectURL(file);
                const id = crypto.randomUUID();
                setDataImages((prev) => ({ ...prev, [id]: url }));
                addElement(emptyImageElement({ id }));
              }} />
            </label>
            {selectedId && (
              <>
                <Button size="sm" variant="secondary" onClick={() => duplicateElement(selectedId)}><Copy size={14} /></Button>
                <Button size="sm" variant="secondary" onClick={() => deleteElement(selectedId)}><Trash2 size={14} /></Button>
              </>
            )}
          </div>

          <div className="flex justify-center overflow-auto rounded-card border border-border bg-surface-2 p-6">
            <div
              onPointerDown={() => setSelectedId(null)}
              style={{
                width: previewW, height: previewH, position: "relative", overflow: "hidden",
                ...(currentSide?.background.type === "image"
                  ? { backgroundImage: `url(${currentSide.background.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: currentSide?.background.value }),
              }}
              className="shrink-0 rounded-sm border border-border shadow-soft"
            >
              {currentSide?.elements.slice().sort((a, b) => a.zIndex - b.zIndex).map((el) => (
                <EditableElement
                  key={el.id}
                  element={el}
                  pxPerMm={PREVIEW_PX_PER_MM}
                  data={dataValues}
                  imageUrl={dataImages[el.dataKey || el.id]}
                  selected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={(patch) => updateElement(el.id, patch, false)}
                  onCommit={() => updateElement(el.id, {}, true)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex overflow-hidden rounded-control border border-border">
              <button onClick={() => setRightTab("properties")} className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-xs ${rightTab === "properties" ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}><Settings2 size={12} /> Props</button>
              <button onClick={() => setRightTab("background")} className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-xs ${rightTab === "background" ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}><Palette size={12} /> BG</button>
              <button onClick={() => setRightTab("layers")} className={`flex flex-1 items-center justify-center gap-1 py-1.5 text-xs ${rightTab === "layers" ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}><LayersIcon size={12} /> Layers</button>
            </div>
            {rightTab === "properties" && (
              <PropertyPanel element={selectedElement} onChange={(patch) => selectedId && updateElement(selectedId, patch, false)} onCommit={() => selectedId && updateElement(selectedId, {}, true)} />
            )}
            {rightTab === "background" && currentSide && (
              <BackgroundPanel
                background={currentSide.background}
                onChange={(patch) => updateSide({ background: { ...currentSide.background, ...patch } })}
                onUploadImage={onBackgroundImageUpload}
              />
            )}
            {rightTab === "layers" && (
              <LayersPanel
                elements={currentSide?.elements ?? []}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onToggleLock={(id) => updateElement(id, { locked: !currentSide?.elements.find((e) => e.id === id)?.locked })}
                onToggleHidden={(id) => updateElement(id, { hidden: !currentSide?.elements.find((e) => e.id === id)?.hidden })}
                onDuplicate={duplicateElement}
                onDelete={deleteElement}
                onReorder={reorderElement}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <label className="flex items-center gap-2 text-xs text-muted">
          <LayoutGrid size={14} /> Copies per page
          <select value={copies} onChange={(e) => setCopies(Number(e.target.value))} className="focus-ring rounded-control border border-border bg-surface px-2 py-1 text-xs">
            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
          </select>
        </label>
        <Button size="sm" variant="secondary" onClick={() => exportImage("png")}><Download size={14} /> PNG</Button>
        <Button size="sm" variant="secondary" onClick={() => exportImage("jpeg")}><Download size={14} /> JPG</Button>
        <Button size="sm" onClick={exportPdf} disabled={exporting}><Download size={14} /> {exporting ? "Preparing…" : "Print-ready PDF"}</Button>
      </div>
      <p className="text-xs text-muted">Ctrl+Z / Ctrl+Shift+Z undo/redo · Delete removes the selected element · Ctrl+D duplicates · Arrow keys nudge position. Switching orientation swaps the card's own width/height — existing elements keep their exact position, so you may need to drag a few back into place afterward.</p>
    </div>
  );
}
