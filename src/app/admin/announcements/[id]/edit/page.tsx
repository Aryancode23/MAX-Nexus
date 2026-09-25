import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAnnouncementByIdForAdmin } from "@/lib/announcements-data";
import { AnnouncementForm } from "../../AnnouncementForm";
import { updateAnnouncement } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const { data: item } = await getAnnouncementByIdForAdmin(params.id);
  if (!item) notFound();
  return (
    <div>
      <Link href="/admin/announcements" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit announcement</h1>
      <div className="mt-6">
        <AnnouncementForm
          action={async (_s, fd) => updateAnnouncement(params.id, fd)}
          submitLabel="Save changes"
          initialValues={{ title: item.title, body: item.body, type: item.type, link_tool_slug: item.link_tool_slug, priority: item.priority, status: item.status, publish_at: item.publish_at?.slice(0, 16) }}
        />
      </div>
    </div>
  );
}
