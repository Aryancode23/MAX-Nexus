# MAX Nexus — Phase 1

Developed by Aryan Singh.

This is a working Next.js codebase: a homepage, a tools directory, 6 fully
functional browser-based tools, and a real (not fake) admin login backed by
Supabase. Everything below is written for someone who hasn't used Supabase
or Vercel before.

---

## Phase 3 additions

- **Resume Builder redesign**: 6 real templates (Classic, Minimal, Compact, Modern Sidebar, Creative, Two-Column),
  3 of which support a photo upload. Classic exports as fully selectable/ATS-safe text; the other 5 export as a
  high-resolution rasterized PDF (exact visual match, text not selectable) — the UI tells you which you're getting
  before you download. Added Projects and Certifications sections, plus a one-click Cover Letter export built
  from your resume data.
- **Letter Generator expanded** from 8 to 21 templates across School, College, General, Job, and a new
  Government category (PAN correction request, birth certificate application, self-declaration form). These
  generate application letters only — see the note below on what this deliberately does not do.
- **16 new tools**: Text Case Converter, Percentage Calculator, Age Calculator, Date Calculator, Password
  Generator, UUID Generator, Unit Converter, Remove Extra Spaces, Duplicate Line Remover, PDF Page Extractor,
  PDF Watermark, PDF Splitter, Photo Cropper, Image Format Converter, PIN Code Lookup, IFSC Lookup, and an
  Aadhaar/ID Print Formatter.
- **A boundary worth knowing about**: the Government letter templates and the ID Print Formatter deliberately
  stop short of generating or reformatting actual government-issued IDs (PAN, birth certificate, Aadhaar). The
  letter templates only draft an application a person would submit to the real issuing office; the print
  formatter only re-lays-out a document the user already possesses (e.g. their own downloaded e-Aadhaar PDF)
  into a printable card layout — it doesn't create, verify, or store ID data.

## Phase 4 additions

- **6 banking calculators**: EMI, Simple Interest, Compound Interest, RD, FD, Loan Tenure — real formulas, no
  placeholders (RD uses the standard bank-illustration approximation, clearly labeled as such).
- **Document Checklist Library**: one searchable tool covering 23 checklists across Banking, Aadhaar, PAN, and
  Police/Verification processes, each downloadable as a PDF — instead of building dozens of near-duplicate
  "checklist" tool pages, this consolidates them into structured, filterable content.
- **Letter Generator expanded again**, from 21 to 29 templates, adding a Verification category (lost
  document/mobile/certificate declarations, police complaint, tenant/employee/address verification requests).
- **Official Portals Directory**: verified, direct links to UIDAI, Protean (NSDL)/UTIITSL PAN services, the
  National Cyber Crime Reporting Portal, Digital Police Portal, Passport Seva, and RBI — MAX Nexus never
  submits anything on the user's behalf, it only links to the real official site.
- **A boundary held here too**: none of this generates, verifies, or fakes an actual PAN card, Aadhaar update,
  or police report. Checklists and letters only help someone prepare before they go to (or use) the real
  process; the official-portal links send them to the one place that can actually do it.

## Phase 5 additions

- **Fixed a dead official-portal link**: NSDL's `onlineservices.nsdl.com` no longer resolves after their rebrand
  to Protean — replaced with the correct current URLs (`tinpan.proteantech.in` and `pan.utiitsl.com`), verified
  directly against the Income Tax Department's own page rather than assumed.
- **10 new tools**: Signature Maker (draw + download transparent PNG), JSON Formatter & Validator, Text Diff
  Checker, World Clock, Color Picker & Palette Generator, Barcode Generator, Text to Speech (real browser voices,
  no API cost), PDF to JPG, Image Watermark, Currency Converter (free public rate API, labeled as such).
- **Favorites + Recently Used**: a star on every tool card and tool page saves it to `localStorage`; opening any
  tool quietly logs it under "Continue Where You Left Off" on the homepage. Both sections only appear once
  there's something to show, and recent history has a one-click clear.
- **Category Management** in the admin dashboard (`/admin/categories`) — add, edit, hide, and delete categories
  live, the same pattern as Tool Management, closing the last "SQL-only" gap from Phase 2.
- **A real bug caught by the build, not shipped**: the new category-creation page had no data fetch, so Next.js
  tried to statically pre-render it at build time, which broke passing the save action to the form. Fixed by
  explicitly marking every admin page as dynamically rendered — appropriate anyway, since admin content should
  never be cached.

## What's actually working right now (47 tools total)

- **All tools run in the visitor's browser** — nothing uploaded to a server — except PIN Code Lookup and IFSC
  Lookup, which call free public third-party APIs (India Post and Razorpay) and say so on their pages.
  Tools: Image Resizer, Signature Resizer, Passport Photo Maker, Image → PDF, QR Code Generator, Word Counter,
  PDF Merger, PDF Compressor, PDF Splitter, PDF Page Extractor, PDF Watermark, Image Compressor, Background
  Color Remover, Photo Cropper, Image Format Converter, Resume Builder, Application & Letter Generator (21
  templates), Text Case Converter, Percentage/Age/Date Calculators, Password Generator, UUID Generator, Unit
  Converter, Remove Extra Spaces, Duplicate Line Remover, PIN Code Lookup, IFSC Lookup, and an Aadhaar/ID Print
  Formatter.
- **Admin login** at `/admin/login` — real authentication through Supabase, protected server-side by
  `src/middleware.ts` so it cannot be bypassed by editing anything in the browser.
- **Admin Tool Management** at `/admin/tools` — add, edit, disable/enable, and delete tools live, with no
  redeploy. This is now backed entirely by Supabase (see "How tools work now" below) and every write is
  additionally checked by the database itself (Row Level Security), not just by the page.
- **Admin dashboard** at `/admin` — shows real counts from your database. No fake numbers.
- Everything else in the original spec (Guides, Templates, FAQs, Announcements, paid-plan gating, bulk tools,
  teacher/student workspaces, category management, etc.) is intentionally **not** built yet.

---

## How tools work now (important if you're picking this back up later)

Two things now have to line up for a tool to actually work on the site:

1. **Its metadata lives in Supabase** (`tools` table) — name, description, category, status, badges, SEO. This
   is what `/admin/tools` edits. You can add a tool row here any time, with any status.
2. **Its actual functionality is a React component** in `src/components/tools/`, registered by slug in the
   `TOOL_COMPONENTS` map inside `src/app/tools/[slug]/page.tsx`.

If a tool exists in the database but its slug isn't in that map, visitors correctly see "Coming soon" — adding
a database row alone never fakes working functionality.

---

## Step 1 — Set up Supabase (your database + login system)

1. Go to https://supabase.com/dashboard and open your project.
2. **SQL Editor** → **New query** → paste in `supabase/schema.sql` → **Run**.
   Creates `profiles`, `categories`, `tools`, and the security rules (RLS) that stop normal visitors from
   editing tools or seeing other users' data — and that require `role = 'admin'` or `'editor'` in your own
   `profiles` table before any tool can be added, edited, or deleted, no matter who's asking.
3. **New query** again → paste in `supabase/seed.sql` → **Run**.
   This populates the 4 categories and all 29 tools described above so the site (and `/admin/tools`) isn't
   empty on first load. Safe to skip if you'd rather add everything yourself through the admin panel.
   **If you already ran an earlier version of this file:** running it again is safe — every insert uses
   `on conflict (slug) do nothing`, so existing tools are left untouched and only the new Phase 3 tools get
   added.
4. **Authentication** → **Users** → **Add user** → **Create new user**:
   - Email: `ind23234589@gmail.com`
   - Password: set a fresh one directly in Supabase (don't reuse one shared anywhere in plain text)
5. Back in **SQL Editor**, run:
   ```sql
   update public.profiles set role = 'super_admin' where email = 'ind23234589@gmail.com';
   ```
6. **Project Settings** → **API** — copy the **Project URL** and **anon public** key for Step 3 below.

---

## Step 2 — Push this code to GitHub

```bash
git init
git add .
git commit -m "MAX Nexus - Phase 1"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

(If you already have this repo from before, just commit and push the changes as normal.)

---

## Step 3 — Deploy on Vercel (free)

1. https://vercel.com → **Add New** → **Project** → pick your repo.
2. Before clicking Deploy, add **Environment Variables**:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase Step 1.6 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key from Supabase Step 1.6 |
3. **Deploy**. Every `git push` to `main` after this redeploys automatically.
4. Visit `your-url.vercel.app/admin/tools` and sign in — you should be able to add/edit/disable tools
   immediately and see the change reflected on the public site right away (no redeploy needed).

---

## Local development (optional, if you want to run it on your own PC first)

```bash
npm install
cp .env.example .env.local   # then fill in your real Supabase URL + anon key
npm run dev
```
Visit `http://localhost:3000`.

---

## Project structure

```
src/
  app/                  Pages (Next.js App Router)
    admin/              Admin dashboard (protected by middleware.ts)
      tools/            Live Tool Management: list, add, edit (actions.ts = server actions)
    tools/[slug]/       Every tool's page — metadata from Supabase, component from the map below
  components/           Shared UI (Navbar, Footer, Button, ToolCard...)
  components/tools/     The actual tool implementations (13 of them)
  lib/tools-registry.ts Shared TYPES only now (ToolMeta, CategoryMeta) + client-side search helper
  lib/tools-data.ts     All reads from Supabase — this is what pages actually call
  lib/supabase/         Browser + server Supabase clients
  middleware.ts         Server-side admin route protection — the real security boundary
supabase/schema.sql     Run once in the Supabase SQL editor — tables + RLS policies
supabase/seed.sql       Run once, optional — populates the 4 categories + 13 tools described above
```

## Adding a new tool later

**Metadata only, using an already-built component** (e.g. you rename or re-describe a tool):
Just use `/admin/tools` → Add tool / Edit tool. No code changes needed.

**A genuinely new tool with new functionality:**
1. Build its component in `src/components/tools/`.
2. Register it in the `TOOL_COMPONENTS` map in `src/app/tools/[slug]/page.tsx`.
3. Add its row through `/admin/tools` → Add tool, using the exact same slug.

## What's next (not built yet, by design)

- Category management UI (categories exist in the DB and drive the site, but adding/editing a category still
  requires SQL — the same pattern as Tool Management could be repeated for categories)
- Guides, Templates, FAQs, Announcements (content tables + admin CRUD)
- Real paid/free tool gating (the `plan` column already exists on `profiles`, and tools already have an
  `is_paid` flag editable from `/admin/tools` — wiring an actual payment provider is the remaining piece; you
  said to skip this for now)
- Favorites / Recently Used (localStorage, straightforward to add)
- The remaining tool categories from the original brief (OCR, teacher/student toolkits, business/invoice tools,
  India utilities, bulk/ZIP processing, full PDF page-editor workspace)

Each of these can be built as its own focused pass without touching what's already working.
