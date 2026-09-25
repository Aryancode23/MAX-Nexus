import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPresetByIdForAdmin } from "@/lib/presets-data";
import { PresetForm } from "../../PresetForm";
import { updatePreset } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPresetPage({ params }: { params: { id: string } }) {
  const { data: p } = await getPresetByIdForAdmin(params.id);
  if (!p) notFound();
  return (
    <div>
      <Link href="/admin/presets" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit preset</h1>
      <div className="mt-6">
        <PresetForm
          action={async (_s, fd) => updatePreset(params.id, fd)}
          submitLabel="Save changes"
          initialValues={{ name: p.name, slug: p.slug, file_type: p.file_type, width_px: p.width_px, height_px: p.height_px, formats: p.formats, max_size_kb: p.max_size_kb, max_pages: p.max_pages, page_size: p.page_size, orientation: p.orientation, notes: p.notes, status: p.status, sort_order: p.sort_order }}
        />
      </div>
    </div>
  );
}
