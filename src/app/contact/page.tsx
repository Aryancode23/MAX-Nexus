import { getSettings } from "@/lib/settings-data";

export const metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-text">Contact</h1>

      <div className="mt-6 space-y-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text">General Contact</p>
          <p className="text-muted">{settings.contact_phone}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text">Developer Support</p>
          <p className="text-muted">{settings.developer_support_phone}</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text">Instagram</p>
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            @shabashji
          </a>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        A contact form will be added here once server-side email handling and spam protection are configured.
      </p>
    </div>
  );
}
