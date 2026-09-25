import { getSettings } from "@/lib/settings-data";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-xl font-bold text-text">Settings</h1>
      <p className="mt-1 text-sm text-muted">These values control the site name, contact info, and default SEO metadata shown across the public site.</p>
      <div className="mt-6"><SettingsForm initial={settings} /></div>
    </div>
  );
}
