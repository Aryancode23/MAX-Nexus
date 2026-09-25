"use client";

import { useRef, useState } from "react";
import { Download, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { ResumePreview } from "./resume/ResumePreview";
import { TEMPLATES, emptyEntry, type ResumeData, type ResumeEntry, type TemplateId } from "./resume/resumeTypes";
import { makeCircularPhoto } from "./resume/photoUtils";

export function ResumeBuilderTool() {
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [data, setData] = useState<ResumeData>({
    name: "", role: "", contact: "", summary: "", skills: "",
    experience: [emptyEntry()], education: [emptyEntry()],
    projects: [], certifications: [], photoDataUrl: null,
  });
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES.find((t) => t.id === templateId)!;

  function set<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function updateEntry(list: "experience" | "education" | "projects" | "certifications", id: string, field: keyof ResumeEntry, value: string) {
    setData((d) => ({ ...d, [list]: d[list].map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));
  }

  async function onPhotoSelected(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const circular = await makeCircularPhoto(reader.result as string);
      set("photoDataUrl", circular);
    };
    reader.readAsDataURL(file);
  }

  async function downloadPdf() {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");

      if (template.atsSafe) {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const marginX = 48;
        const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
        let y = 56;

        doc.setFont("helvetica", "bold"); doc.setFontSize(20);
        doc.text(data.name || "Your Name", marginX, y); y += 22;
        if (data.role) { doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(90); doc.text(data.role, marginX, y); y += 16; }
        if (data.contact) { doc.setFontSize(10); doc.text(data.contact, marginX, y); y += 20; }
        doc.setDrawColor(200); doc.line(marginX, y, marginX + pageWidth, y); y += 20;
        doc.setTextColor(20);

        const section = (title: string) => {
          doc.setFont("helvetica", "bold"); doc.setFontSize(12);
          doc.text(title.toUpperCase(), marginX, y); y += 16;
          doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
        };
        const wrapped = (text: string) => {
          const lines = doc.splitTextToSize(text, pageWidth);
          doc.text(lines, marginX, y); y += lines.length * 13 + 6;
        };
        const pageBreak = () => { if (y > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); y = 56; } };

        if (data.summary) { section("Summary"); wrapped(data.summary); pageBreak(); }

        const exp = data.experience.filter((e) => e.title);
        if (exp.length) {
          section("Experience");
          exp.forEach((e) => {
            doc.setFont("helvetica", "bold"); doc.text(e.title, marginX, y);
            doc.setFont("helvetica", "normal"); doc.text(e.period, marginX + pageWidth - doc.getTextWidth(e.period), y);
            y += 13;
            if (e.subtitle) { doc.setTextColor(90); doc.text(e.subtitle, marginX, y); doc.setTextColor(20); y += 13; }
            if (e.description) wrapped(e.description);
            y += 4; pageBreak();
          });
        }

        const edu = data.education.filter((e) => e.title);
        if (edu.length) {
          section("Education");
          edu.forEach((e) => {
            doc.setFont("helvetica", "bold"); doc.text(e.title, marginX, y);
            doc.setFont("helvetica", "normal"); doc.text(e.period, marginX + pageWidth - doc.getTextWidth(e.period), y);
            y += 13;
            if (e.subtitle) { doc.setTextColor(90); doc.text(e.subtitle, marginX, y); doc.setTextColor(20); y += 13; }
            y += 4; pageBreak();
          });
        }

        const proj = data.projects.filter((e) => e.title);
        if (proj.length) {
          section("Projects");
          proj.forEach((e) => {
            doc.setFont("helvetica", "bold"); doc.text(e.title, marginX, y);
            doc.setFont("helvetica", "normal"); doc.text(e.period, marginX + pageWidth - doc.getTextWidth(e.period), y);
            y += 13;
            if (e.subtitle) { doc.setTextColor(90); doc.text(e.subtitle, marginX, y); doc.setTextColor(20); y += 13; }
            if (e.description) wrapped(e.description);
            y += 4; pageBreak();
          });
        }

        const certs = data.certifications.filter((e) => e.title);
        if (certs.length) {
          section("Certifications");
          certs.forEach((e) => {
            doc.setFont("helvetica", "bold"); doc.text(e.title, marginX, y);
            doc.setFont("helvetica", "normal"); doc.text(e.period, marginX + pageWidth - doc.getTextWidth(e.period), y);
            y += 13;
            if (e.subtitle) { doc.setTextColor(90); doc.text(e.subtitle, marginX, y); doc.setTextColor(20); y += 13; }
            y += 4; pageBreak();
          });
        }

        if (data.skills) { section("Skills"); wrapped(data.skills); }
        doc.save(`${data.name || "resume"}.pdf`);
      } else {
        const html2canvas = (await import("html2canvas")).default;
        const node = previewRef.current;
        if (!node) return;
        const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const ratio = pageWidth / canvas.width;
        const imgHeight = Math.min(canvas.height * ratio, pageHeight);
        doc.addImage(imgData, "JPEG", 0, 0, pageWidth, imgHeight);
        doc.save(`${data.name || "resume"}.pdf`);
      }
    } finally {
      setExporting(false);
    }
  }

  async function downloadCoverLetter() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56;
    const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    let y = 64;

    doc.setFontSize(11);
    doc.text(new Date().toLocaleDateString(), marginX, y); y += 30;
    doc.text("Dear Hiring Manager,", marginX, y); y += 26;

    const skillsLine = data.skills ? ` My background includes ${data.skills}.` : "";
    const body =
      `I am writing to express my interest in the ${data.role || "[Role]"} position.${skillsLine} ${data.summary || ""}\n\n` +
      `I would welcome the opportunity to bring this experience to your team and discuss how I can contribute.\n\n` +
      `Thank you for your time and consideration.`;

    const lines = doc.splitTextToSize(body, pageWidth);
    doc.text(lines, marginX, y); y += lines.length * 15 + 30;

    doc.text("Sincerely,", marginX, y); y += 26;
    doc.text(data.name || "[Your Name]", marginX, y);
    if (data.contact) { y += 14; doc.setFontSize(9); doc.setTextColor(100); doc.text(data.contact, marginX, y); }

    doc.save(`${data.name || "cover-letter"}-cover-letter.pdf`);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-text">Choose a template</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`relative rounded-control border p-2 text-left transition-colors ${
                templateId === t.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:bg-surface-2"
              }`}
            >
              {templateId === t.id && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check size={10} />
                </span>
              )}
              <div className="h-14 w-full rounded-[4px]" style={{ backgroundColor: t.accent + "22", border: `1px solid ${t.accent}55` }} />
              <p className="mt-1.5 text-xs font-medium text-text">{t.name}</p>
              <p className="text-[10px] text-muted">{t.hasPhoto ? "With photo" : "No photo"}</p>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {template.atsSafe
            ? "This template exports with fully selectable, searchable text — the safest choice for online job applications."
            : "This template exports as a high-resolution, single-page image-based PDF — looks exactly like the preview, but text won't be selectable or ATS-parseable."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {template.hasPhoto && (
            <div>
              <p className="text-sm font-medium">Photo</p>
              <div className="mt-2 flex items-center gap-3">
                {data.photoDataUrl && <img src={data.photoDataUrl} alt="" className="h-14 w-14 rounded-full object-cover" />}
                <label className="cursor-pointer rounded-control border border-border bg-surface-2 px-3 py-1.5 text-xs hover:bg-surface">
                  {data.photoDataUrl ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onPhotoSelected(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          )}

          <Field label="Full name" value={data.name} onChange={(v) => set("name", v)} />
          <Field label="Role / title" value={data.role} onChange={(v) => set("role", v)} placeholder="e.g. Computer Operator" />
          <Field label="Contact line" value={data.contact} onChange={(v) => set("contact", v)} placeholder="Phone · Email · City" />
          <TextArea label="Summary" value={data.summary} onChange={(v) => set("summary", v)} rows={3} />
          <TextArea label="Skills (comma separated)" value={data.skills} onChange={(v) => set("skills", v)} rows={2} />

          <EntryList
            title="Experience"
            entries={data.experience}
            onChange={(id, f, v) => updateEntry("experience", id, f, v)}
            onAdd={() => set("experience", [...data.experience, emptyEntry()])}
            onRemove={(id) => set("experience", data.experience.filter((e) => e.id !== id))}
            descriptionLabel="What you did"
          />

          <EntryList
            title="Education"
            entries={data.education}
            onChange={(id, f, v) => updateEntry("education", id, f, v)}
            onAdd={() => set("education", [...data.education, emptyEntry()])}
            onRemove={(id) => set("education", data.education.filter((e) => e.id !== id))}
          />

          <EntryList
            title="Projects"
            entries={data.projects}
            onChange={(id, f, v) => updateEntry("projects", id, f, v)}
            onAdd={() => set("projects", [...data.projects, emptyEntry()])}
            onRemove={(id) => set("projects", data.projects.filter((e) => e.id !== id))}
            descriptionLabel="What it does / your role"
          />

          <EntryList
            title="Certifications"
            entries={data.certifications}
            onChange={(id, f, v) => updateEntry("certifications", id, f, v)}
            onAdd={() => set("certifications", [...data.certifications, emptyEntry()])}
            onRemove={(id) => set("certifications", data.certifications.filter((e) => e.id !== id))}
          />

          <div className="flex gap-3">
            <Button onClick={downloadPdf} disabled={exporting} className="flex-1">
              <Download size={16} /> {exporting ? "Preparing PDF…" : "Download PDF"}
            </Button>
            <Button onClick={downloadCoverLetter} variant="secondary" className="flex-1">
              <Download size={16} /> Cover Letter
            </Button>
          </div>
        </div>

        <div className="overflow-auto rounded-card border border-border bg-surface-2 p-4">
          <div className="mx-auto origin-top scale-[0.55] shadow-soft sm:scale-[0.7] lg:scale-[0.6] xl:scale-[0.7]">
            <ResumePreview ref={previewRef} data={data} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
      />
    </label>
  );
}

function EntryList({
  title, entries, onChange, onAdd, onRemove, descriptionLabel,
}: {
  title: string; entries: ResumeEntry[];
  onChange: (id: string, field: keyof ResumeEntry, value: string) => void;
  onAdd: () => void; onRemove: (id: string) => void;
  descriptionLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <button onClick={onAdd} className="focus-ring flex items-center gap-1 text-xs text-primary">
          <Plus size={14} /> Add
        </button>
      </div>
      <div className="mt-2 space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="rounded-control border border-border p-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Title / Company"
                value={e.title}
                onChange={(ev) => onChange(e.id, "title", ev.target.value)}
                className="focus-ring rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Period, e.g. 2023–2025"
                value={e.period}
                onChange={(ev) => onChange(e.id, "period", ev.target.value)}
                className="focus-ring rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
              />
            </div>
            <input
              placeholder="Subtitle / institution"
              value={e.subtitle}
              onChange={(ev) => onChange(e.id, "subtitle", ev.target.value)}
              className="focus-ring mt-2 w-full rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
            />
            {descriptionLabel && (
              <textarea
                placeholder={descriptionLabel}
                value={e.description}
                onChange={(ev) => onChange(e.id, "description", ev.target.value)}
                rows={2}
                className="focus-ring mt-2 w-full rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
              />
            )}
            <button onClick={() => onRemove(e.id)} className="focus-ring mt-2 flex items-center gap-1 text-xs text-danger">
              <Trash2 size={12} /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
