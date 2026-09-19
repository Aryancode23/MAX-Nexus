import Link from "next/link";
import {
  LayoutDashboard,
  Wrench,
  FolderTree,
  BookOpen,
  Layers,
  HelpCircle,
  Megaphone,
  Image as ImageIcon,
  Users,
  BarChart3,
  History,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "./LogoutButton";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, live: true },
  { href: "/admin/tools", label: "Tools", icon: Wrench, live: true },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, live: true },
  { href: "/admin/guides", label: "Guides", icon: BookOpen, live: false },
  { href: "/admin/templates", label: "Templates", icon: Layers, live: false },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, live: false },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone, live: false },
  { href: "/admin/media", label: "Media", icon: ImageIcon, live: false },
  { href: "/admin/users", label: "Users", icon: Users, live: false },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, live: false },
  { href: "/admin/activity", label: "Activity Log", icon: History, live: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, live: false },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface p-4 md:block">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">Admin</p>
        <nav className="mt-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon, live }) => (
            <Link
              key={href}
              href={live ? href : "#"}
              aria-disabled={!live}
              className={`flex items-center justify-between rounded-control px-3 py-2 text-sm ${
                live ? "text-text hover:bg-surface-2" : "cursor-not-allowed text-muted/60"
              }`}
            >
              <span className="flex items-center gap-2"><Icon size={16} /> {label}</span>
              {!live && <span className="text-[10px] text-muted/60">Soon</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <p className="text-sm text-muted">Signed in as <span className="text-text">{user?.email}</span></p>
          <AdminLogoutButton />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
