import Link from "next/link";
import type { CategoryMeta } from "@/lib/tools-registry";

export function Footer({ categories }: { categories: CategoryMeta[] }) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-bold text-text">MAX Nexus</p>
          <p className="mt-1 text-sm text-muted">Developed by Aryan Singh</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-text">Tools</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/tools?category=${c.slug}`} className="hover:text-text">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-text">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/about" className="hover:text-text">About</Link></li>
            <li><Link href="/contact" className="hover:text-text">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-text">Privacy</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-text">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>+91 7979758649</li>
            <li>
              <a
                href="https://www.instagram.com/shabashji/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} MAX Nexus. All rights reserved.
      </div>
    </footer>
  );
}
