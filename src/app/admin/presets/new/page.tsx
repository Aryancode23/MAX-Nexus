import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PresetForm } from "../PresetForm";
import { createPreset } from "../actions";

export const dynamic = "force-dynamic";

export default function NewPresetPage() {
  return (
    <div>
      <Link href="/admin/presets" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add preset</h1>
      <div className="mt-6"><PresetForm action={async (_s, fd) => createPreset(fd)} submitLabel="Create preset" /></div>
    </div>
  );
}
