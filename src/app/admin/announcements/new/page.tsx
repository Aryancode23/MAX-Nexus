import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnnouncementForm } from "../AnnouncementForm";
import { createAnnouncement } from "../actions";

export const dynamic = "force-dynamic";

export default function NewAnnouncementPage() {
  return (
    <div>
      <Link href="/admin/announcements" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add announcement</h1>
      <div className="mt-6"><AnnouncementForm action={async (_s, fd) => createAnnouncement(fd)} submitLabel="Create" /></div>
    </div>
  );
}
