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

## Phase 6 additions — bigger deploy than usual, read this fully

This phase adds real architecture, not just tools — there's one new required setup step (a service role key)
and one new optional one (a storage bucket). Both are explained below.

**Safety work you asked about directly:**
- **Rate-limited login**: 5 failed attempts locks that email out for 15 minutes. The tracking table
  (`login_attempts`) has zero public API access — nothing in the browser can read or reset it, only
  server-side code can, using a new privileged connection (see below).
- **Immutable Activity Log** (`/admin/activity`): every add/edit/delete/enable/disable/sign-in/sign-out across
  Tools, Categories, Guides, FAQs, Announcements and Media is now recorded — who, what, when. Nothing in the
  public API can write to or erase this log; only trusted server code can.
- **New privileged server connection**: `src/lib/supabase/admin.ts` uses your Supabase **service_role** key
  (bypasses Row Level Security) for exactly these two things above. It is never imported into anything that
  runs in the browser. This requires a **new environment variable** — see Step 0 below.
- **Media upload validation**: file type allowlist (PNG/JPEG/WebP/SVG only), 5 MB size cap, sanitized filenames
  — enforced in code, not just implied.

**New admin sections** (all with the same two-layer security as Tools/Categories — middleware + database RLS):
- **Guides** (`/guides`, admin at `/admin/guides`) — publishable how-to content linked to tools
- **FAQs** (`/faq`, admin at `/admin/faqs`) — categorized, filterable
- **Announcements** (homepage "What's New", admin at `/admin/announcements`) — with scheduling support
- **Media Library** (`/admin/media`) — real file uploads to Supabase Storage, not a fake file list

**3 new tools**: Invoice Generator (line items, tax, PDF export), Bulk Image Processor (resize/compress many
images → one ZIP), CSV Viewer & PDF Export.

---

## Step 0 — Get your service role key (new, required)

1. Supabase Dashboard → **Project Settings** → **API**.
2. Copy the **`service_role`** secret key (NOT the `anon` key you already have).
3. You'll add this as `SUPABASE_SERVICE_ROLE_KEY` in Vercel's environment variables in Step 3 below.

**This key must never be exposed to the browser.** It's only ever read in server-only files
(`src/lib/supabase/admin.ts`) — never add the `NEXT_PUBLIC_` prefix to it, and never import that file into
anything marked `"use client"`.

## Step 1 — Run the new SQL (required)

In Supabase **SQL Editor**, run `supabase/phase6-schema.sql` (in addition to the `schema.sql` and `seed.sql`
you've already run in earlier phases — this is a new file, not a replacement).

## Step 2 — Create the media storage bucket (optional, only if you'll use Media Library)

1. Supabase Dashboard → **Storage** → **New bucket**.
2. Name it exactly `media`, and mark it **Public**.
3. The storage policies for it are already included at the bottom of `phase6-schema.sql` (section 7) — if you
   ran that file after creating the bucket, you're done. If you ran the SQL file first, just re-run section 7
   of it now that the bucket exists.

If you skip this step, every other new feature still works — only the Media Library upload will show an error
telling you the bucket doesn't exist yet, until you set it up.

## Step 3 — Deploy

Same as before — replace your repo contents, push, and in **Vercel → Project Settings → Environment Variables**,
add the one new variable:

| Name | Value |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | the service_role key from Step 0 |

(Your existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` stay as they are.)

## Phase 7 additions

**One new required SQL file, no new secrets this time:**
- Run `supabase/phase7-schema.sql` in the SQL Editor (after schema.sql, seed.sql, and phase6-schema.sql). It adds
  `tool_usage_counts` — an aggregate counter table with zero public API access (same locked-down pattern as
  `login_attempts` and `activity_log`), plus a Postgres function that increments it atomically so concurrent
  visits can never race and lose a count.

**Two-factor authentication for admin login** (`/admin/security`):
- Any admin can enable TOTP (Google Authenticator, Authy, 1Password, etc.) — scan a QR code, confirm with a
  6-digit code, done. Once enabled, sign-in becomes a two-step form: password, then the code.
- Enforced in two places, not one: the login action won't grant a full session without the code, **and**
  `middleware.ts` independently checks the session's assurance level on every `/admin/*` request — so even an
  old session from before 2FA was turned on gets bounced back to complete it. Belt and suspenders.
- **A real bug this fixed, not shipped**: `middleware.ts` was checking for `role IN ('admin', 'super_admin')`
  only, while the login action allowed `editor`/`support` roles in too — meaning an editor or support account
  could log in successfully and then get immediately bounced by the very next page load. Both now agree.

**Tool Usage Analytics** (`/admin/analytics`): real per-tool open counts, recorded via that atomic counter —
no per-visitor tracking, no fake historical charts, just an honest running total per tool.

**1 new tool**: OCR Studio — extracts editable text from a photo or scan using an open-source OCR engine
(Tesseract), entirely in the browser. Slower than a paid API and works best on clear, well-lit text, but
genuinely free and processes nothing on a server.

---

## Deploying this phase

1. Run `supabase/phase7-schema.sql` in Supabase SQL Editor (new file — schema only, no new tool rows needed for
   the analytics/security parts, though the seed.sql tail below adds the OCR Studio tool row).
2. Re-run `supabase/seed.sql` (safe, adds only the new OCR Studio row).
3. Push and redeploy as usual — no new environment variables this time.
4. Once live, go to `/admin/security` on your own account to turn on two-factor authentication if you want it —
   it's opt-in per admin account, not forced.

## Phase 8 additions

**No new SQL, no new environment variables** — this phase is entirely SEO, PWA, and accessibility work in the
codebase itself.

**One real gap this fixed**: `sitemap.ts` had listed tools and static pages since Phase 1, but never guides —
every guide you've published has been invisible to Google this whole time. Fixed, plus FAQs are now on the
sitemap too.

**SEO structured data (JSON-LD)**:
- Tool pages → `SoftwareApplication` schema (no fabricated rating — only real fields)
- Guide pages → `Article` schema
- FAQ page → `FAQPage` schema (this is what gets you the expandable Q&A dropdowns directly in Google results)

**Open Graph / Twitter card images** — every tool and guide now generates its own share-preview image on the
fly (name + description, on-brand), instead of link previews showing nothing. There's also one important
one-time step: **update `SITE_URL` in `src/lib/site.ts`** to your real domain once you have one — it feeds the
sitemap, robots.txt, and every image/link's absolute URL. Leaving it as the placeholder won't break anything,
but share previews and canonical URLs will point at the wrong domain until you set it.

**PWA**: real manifest + generated icon set (192/512/maskable/apple-touch), so the site is genuinely
installable on phone and desktop. A service worker (`public/sw.js`) opportunistically caches static assets and
shows a real offline page (`/offline`) for failed navigations — it does **not** claim every tool works fully
offline after one visit, since most of this app's content is database-driven; that would be the "no fake
functionality" rule broken to look more impressive than it is.

**Accessibility pass**: a "Skip to main content" link for keyboard users, a proper `<main>` landmark, Space-key
support on every upload drop zone (previously Enter-only), and `aria-label`s added to the icon-only buttons
that were missing them (media delete, several copy buttons).

## Phase 9 additions

**One new required SQL file:** run `supabase/phase9-schema.sql` (settings table, admin visibility into user
profiles, templates table). No new environment variables.

**Settings actually does something now**: `/admin/settings` edits site name, contact info, and default SEO
text — and it's wired into the real output: page metadata, the navbar brand name, the footer, and the contact
page all read from it. Previously "Settings" was just a sidebar placeholder; now changing a value there changes
what visitors see, without a code change or redeploy.

**Users** (`/admin/users`): view every registered account, change roles, and ban/unban (a real Supabase Auth
action via the service-role client — not a fake status flag). You can't change your own role or ban your own
account from this page, on purpose — that's a self-lockout guard, not a limitation.

**Template Library** (`/admin/templates`, public gallery at `/templates`): a real content catalog — but it's
worth being precise about scope. It lets you showcase template previews (upload an image via Media Library,
name it, link it to a tool) and admins can add/edit/publish/delete entries. **It does not** dynamically change
what Resume Builder, ID Card Maker, or any other tool actually renders — those templates stay code-defined.
Template Library is a catalog and a signpost ("here's what's possible, click through to the tool"), not a
template engine. Said plainly so it's not mistaken for more than it is.

**Teacher/Student Toolkit — 5 new tools**: Question Paper Maker (sectioned exam papers with marks), MCQ
Generator (quiz sheet + separate answer key), Attendance Sheet Generator (student × day grid), Class Timetable
Maker (editable period/day grid), and Student/Employee ID Card Maker (photo, name, ID number, printable card
layout with 1–3 copies per page).

**A real bug this phase would have shipped if not caught by the build**: two admin actions
(`updateSettings`, `toggleUserBan`) had return types that didn't match what `useFormState` / a plain form
`action` prop expects in TypeScript's strict mode — the build's type-checking step caught both before they ever
reached you, exactly what running a real `npm run build` is for.

## Phase 10 additions — the biggest single phase yet

**One new required SQL file:** run `supabase/phase10-schema.sql` (Fix My File presets + Document Pack
templates, both admin-manageable from day one). Re-run `seed.sql` too — it now seeds 2 new tools, 7 starter
presets, and all 12 Document Pack templates. No new environment variables.

This phase is a genuine architectural shift, not more tools for their own sake — it's the product direction
from "many independent tools" toward "workflows that connect them," and three new pieces make that real:

**Requirement Validation Engine** (`src/lib/validation-engine.ts`) — one shared PASS/FAIL checker for
dimensions, format, file size, page count, page size, and orientation. Fix My File and Document Pack Builder
both call into this rather than each having their own copy of the same checks — exactly the "don't hardcode
validation separately in every tool" principle from the spec.

**Fix My File** (`/tools/fix-my-file`) — the flagship "I don't know which tool I need" tool. Pick a preset
(Passport Photo, Email Attachment, etc. — all admin-editable) or enter custom requirements, upload a file, and
it shows exactly what passes and fails, then lets you apply exactly the fixes needed:
- **Photo mode**: resize, crop, convert, and compress to hit a target size — fully automatic, one click.
- **PDF mode**: page trimming (you choose which pages to keep, never auto-truncated silently), compression
  (Light/Medium/Strong, with a clear note that it rasterizes and removes selectable text), and A4
  normalization — each is its own explicit step you trigger, never applied without you seeing what it does
  first, per the spec's "never silently destroy quality" requirement.
- Deterministic throughout — no AI API anywhere in this tool.

**Document Pack Builder** (`/tools/document-pack-builder`) — pick one of 12 templates (Job Application, College
Admission, Passport Preparation, Loan Documentation, and 8 more), get a required/optional document checklist,
upload and process each file inline (compress images, convert to PDF), reorder them, then generate both a
single merged PDF and a ZIP of the numbered individual files. All 12 templates carry the disclaimer language
the spec asked for — "commonly required," never "official requirements."

**Homepage task-first search** — a real "What are you trying to do?" box in the hero, deterministically matching
against tools and Document Pack templates (same keyword-matching the Ctrl+K palette already used), with a
"Did you mean?" list when a query matches more than one thing. No AI API.

**Two honest scope boundaries, stated plainly:**
- The Document Pack Builder's per-file "quick actions" cover compress and convert-to-PDF — rotate wasn't
  built. If you need to rotate a scanned page, use PDF Watermark's sibling tool, PDF Page Extractor, or fix it
  before uploading; adding real rotate support is a small, well-scoped follow-up rather than something faked
  here.
- The task-first search box lives on the homepage only — Ctrl+K (the navbar command palette) still searches
  tools only, not Document Pack templates. Extending it is straightforward but wasn't done in this pass to keep
  the diff reviewable.

## Phase 11 additions

**One new required SQL file:** run `supabase/phase11-schema.sql`. **One new optional-but-recommended
environment variable:** `CRON_SECRET` (a random string you generate — see `.env.example` for exactly what it's
for and how to set it in both places).

**The pause problem, actually fixed in code this time.** `vercel.json` now defines a Cron Job that pings
`/api/cron/keep-alive` every 3 days, which runs a real Supabase query. Free-tier Supabase projects auto-pause
after 7 days of zero API activity — this keeps that from ever happening again, automatically, for free. No more
manually remembering to check in on the project.

**Failed Search tracking** (`/admin/search-insights`) — every "What are you trying to do?" search that matches
nothing gets logged (debounced, so it's not spamming on every keystroke) and shown ranked by frequency. This
replaces guessing at what tool to add next with a direct, evidence-based list from real visitors.

**Feedback** (`/feedback` public form, `/admin/feedback` review) — a public write-only suggestion box: anyone
can submit a tool suggestion or bug report, only admins can read submissions. Mark items new/reviewed/resolved.

**Homepage restructure** — Fix My File and Document Pack Builder now get a prominent feature-card section right
below the hero search, before the tool grid. They're the site's actual differentiators; they were previously
just two tiles among 58 in a browsable list.

**Real user accounts** (`/account/login`, `/account/signup`, `/account`) — separate from admin login entirely,
optional, and nobody is required to sign up to use any tool. What it actually does: Favorites and Recently Used
sync to your account instead of being trapped in one browser's `localStorage`, so they follow you across
devices. Signing up or logging in automatically migrates whatever's already in that browser's local storage
into the account, once. Anonymous visitors keep working exactly as before — nothing changed for them.

**A deliberate scope boundary, stated plainly:** regular user accounts do not have the rate-limiting or 2FA the
admin login has (Phase 6/7) — that level of hardening exists for admin because a compromised admin account can
change the whole site; a regular account can only affect that one person's own favorites list, a much lower
stakes target. Adding rate-limiting here later is straightforward if it's ever needed.

## Post-Phase-11 addition — Employee ID Card Studio

A genuinely different tool from the existing simple ID Card Maker (Phase 6), not a duplicate: **portrait**
orientation, **17 ready-made templates** (gradients, diagonal splits, dot grids, stripes, wave patterns, hex
texture — not just flat colors), and every image — employee photo, employee signature, organization logo,
institution seal/authorizing signature — is independently **draggable anywhere on the card** with its own size
slider. Exports as a real 54mm × 85.6mm print-ready PDF, 1–3 copies per page. No new SQL needed — templates are
defined in code (`src/components/tools/idcard/cardTemplates.ts`), same pattern as Resume Builder's templates.
Just re-run `seed.sql` to add its tool row.

## Phase 12 additions — the agreed scope, all six items

No new SQL, no new environment variables — this phase is entirely new functionality and fixes within the
existing codebase.

**PDF Fill & Sign** (`/tools/pdf-fill-sign`) — the biggest addition. Auto-detects whether a PDF has real
fillable form fields:
- **If it does**: lists every field, lets you type/check values, fills them properly via `pdf-lib` (text stays
  crisp and selectable), then flattens so the filled values render correctly in any viewer.
- **If it doesn't** (the common case — scanned forms, flat PDFs): drag text anywhere on the page and type into
  it inline; draw or upload a signature and drag it into place. Only pages you actually touch get rebuilt as
  high-quality images — untouched pages stay as the original vector content, so you don't lose quality
  document-wide for one signature on one page.
- Multi-page navigation, entirely browser-side, no AI.

**Hindi OCR support** — OCR Studio now has a language selector (English / Hindi / mixed English+Hindi), using
Tesseract's Hindi model. Given the audience this was built for, this is arguably higher-leverage than any new
tool would have been.

**Mobile camera capture wiring** — every upload spot where someone is realistically photographing a physical
document or their own face (Passport Photo Maker, Signature Resizer, OCR Studio, Background Remover, Photo
Cropper, Aadhaar Print Formatter, Resume Builder's photo, Image to PDF, both ID card tools, Document Pack
Builder's per-document uploads) now hints mobile browsers to open the camera directly instead of the gallery
picker. Small change, real difference for a mobile-first audience — `FileDropZone` gained an optional `capture`
prop that thirteen tools now use.

**Ctrl+K now searches Document Pack templates too** — previously only tools were searchable from the command
palette; Document Pack templates were only reachable from the homepage's task-search box. Both search surfaces
now cover both.

**Data-driven navigation audit tooling** — `/admin/analytics` now has a "Least opened active tools" section:
every active tool ranked by real open count, lowest first. This is deliberately a tool for *you* to make the
call, not an automated pruning system — a new tool at zero opens for a week means nothing; the same tool at
zero for months is worth a second look. No tool was removed or hidden as part of this phase; this just makes
that decision easy to make with real evidence next time it's worth revisiting.

**Bundle-size housekeeping** — audited: every heavy library (Tesseract, html2canvas, pdfjs-dist, jsPDF, JSZip,
JsBarcode, papaparse, pdf-lib, qrcode) was already being dynamically imported inside handlers rather than
statically at the top of files, so nothing was bloating the shared bundle unnecessarily. Nothing to fix here —
worth confirming rather than assuming, though.

## Phase 13 additions

**One new required SQL file:** run `supabase/phase13-schema.sql` (rate limiting table, Document Pack progress
table). No new environment variables.

**1. Database ⇄ Code Sync Check** (`/admin/sync-check`) — directly built because of the Employee ID Card Studio
"Coming soon" issue: it compares every tool row in the database against every component actually registered in
code, and flags mismatches in both directions. This would have caught that exact issue in seconds instead of a
multi-message debugging session. Underneath it: `TOOL_COMPONENTS` was extracted out of the tool page into
`src/lib/registered-tools.ts` as a genuine single source of truth — both the public tool page and this
diagnostic page now read the exact same map, so there's no second list that could quietly drift out of sync
with the first. Each entry uses `next/dynamic` rather than a static import, so a tool's actual code still only
loads when someone opens that specific tool.

**2. Rate limiting on the public write surfaces that didn't have it** — the Feedback form (5 submissions/hour
per IP), account signup (5/hour per IP), and account login (5 failed attempts/15 min per email, same shape as
the admin login lockout from Phase 6). These were open to scripted spam before this phase; now they're not.

**3. SEO landing pages for all 12 Document Pack templates** (`/document-packs` index +
`/document-packs/[slug]`) — each with its own crawlable URL, real HowTo structured data (steps = the required
documents), and a "Start this Document Pack" button into the existing builder. Previously all 12 lived behind
one client-side picker at a single URL, invisible to search engines.

**4. Document Pack progress saved for logged-in users** — stated honestly rather than oversold: what's actually
persisted is the *checklist state* (which slots were filled, with what filename, in what order), not the file
bytes themselves. Come back later and your checklist is restored with a clear note on what to re-upload — this
is real, useful continuity, but it is not full cross-device file storage. Building that properly (uploading
every file to Supabase Storage per user, with quota and cleanup handling) is a meaningfully bigger undertaking
and was deliberately left for a future pass rather than implied here.

**One honest miss, not swept under the rug:** the `next/dynamic` conversion for the sync-check page (see #1)
was a real attempt at reducing that page's JS bundle size, but it didn't fully work — `/admin/sync-check` still
reports ~210KB First Load JS in the build output, higher than comparable simple admin pages (~88KB), for
reasons that would need deeper Next.js bundler investigation to fully resolve. It's one auth-gated admin page,
not anything a regular visitor loads, so it's a low-priority follow-up rather than something worth blocking
this phase on — but it's not fixed, and this README says so rather than implying otherwise.

## Post-Phase-13 fix — camera capture regression

Phase 12's mobile camera wiring had a real bug: `capture="environment"` on the *only* file input in several
tools meant those inputs forced the camera open directly, with no way to pick an existing photo, PDF, or
document from the file system — a genuine regression, not a preference. Fixed properly:
- `FileDropZone` no longer ever forces capture on its main input. An optional `allowCamera` prop now adds a
  clearly labeled, separate **"Or take a photo instead"** button next to the normal upload area — camera is
  always an addition, never a replacement.
- The handful of compact raw `<input type="file">` spots (Resume Builder's photo, the simple ID Card Maker,
  Document Pack Builder's per-document slots, Employee ID Card Studio's image slots) had the forced `capture`
  attribute removed entirely, restoring the normal OS file picker (which itself still offers a camera option on
  most phones — this was never a full loss of camera access, just a full loss of the alternative).

## Phase 14 — ID Card Designer Pro

A genuinely new visual editor (`/tools/id-card-designer-pro`), shipped **alongside** the existing simple ID Card
Maker and Employee ID Card Studio, not replacing either — neither of those was touched, and both still work
exactly as before. No new SQL, no new environment variables.

**Architecture, matching what the spec asked for specifically:**
- A real template JSON schema (`schema.ts`) — templates are data, never hardcoded into UI components.
- Every element (text, image, shape) is independently positioned, sized, and styled in millimeters — the same
  coordinate system used for both the on-screen editor and export, so there's no separate "editor math."
- **Export renders directly from element data through a real Canvas2D renderer** (`renderCardCanvas.ts`) at full
  print resolution — this is explicitly *not* a screenshot of the low-res editor DOM, per the spec's own
  requirement.

**What's real and working — verified with a clean production build:**
Corner-handle resize on every element (not just a slider) · true drag-to-move · independent color/font/weight/
size/italic/alignment per text element · custom HEX color on every element · 8 genuinely different templates
(Corporate Blue, Minimal Corporate, Dark Professional, School/Education, Security Staff, Creative Gradient,
Two-Tone Modern, and a true Blank/Custom canvas) · shapes (rectangle/circle/line) with fill and corner radius ·
image elements with circle/rect crop-shape and border · layers panel with reorder/lock/hide/duplicate/delete ·
full undo/redo with keyboard shortcuts (Ctrl+Z/Shift+Z/D, Delete, arrow-key nudging) · placeholder/custom data
fields with a separate Data Mode entry form · front + back card sides · PNG/JPG/high-res PDF export · a
print sheet with 1-3 copies and cut guides · autosave-and-restore draft via localStorage, with no data ever sent
to a server.

**What's honestly NOT in this pass — said plainly, not silently dropped:**
- **Object alignment tools & snap-to-grid** — text-internal alignment (left/center/right) works; aligning one
  element to another, or snapping to a grid, doesn't yet.
- **Live auto-fit preview** — auto-fit shrinking is implemented and works correctly in the exported file; the
  on-screen editor doesn't yet visually shrink text live while you type, so what you see while editing can
  differ slightly from the export until you check the export.
- **Overflow warnings, safe-area/bleed guides, zoom controls, multi-select** — none built yet.
- **QR code and barcode elements** — the schema and renderer support a `qrcode` element type, but no UI button
  generates one yet, so this isn't usable in practice today.
- **In-editor custom card dimensions** — still set by the chosen template and not yet editable after that point (background, unlike dimensions, is now editable — see below).
- **Named "My Templates" library and template duplication** — only a single autosaved draft restores; there's
  no list of multiple saved custom templates yet.
- **Bulk CSV generation** and **Admin template management** — both explicitly deferred; templates are
  code-defined for now, the same pattern Resume Builder's templates already use elsewhere in this project.
- **Mobile layout** is functional but not the dedicated stacked/tabbed mobile experience the spec describes —
  it works down to tablet width reasonably well, phone-width editing is cramped.

This is a real, substantial upgrade — not the same shallow "add a few color pickers" the spec warned against —
but it's not all 50 checklist items, and this list exists so that's never in question.

**Background is now editable, not fixed by the template** — a new "BG" tab sits alongside Properties and
Layers: 16 curated "Our Picks" presets (click to apply), a solid color picker, a custom two-color gradient
builder with adjustable angle, and image-upload backgrounds. One deliberate correctness choice: the picks list
only includes solid colors and simple 2-color gradients — not the fancier dot-grid/stripe/hex-texture patterns
used elsewhere in the app, because the export renderer can't yet faithfully reproduce those as Canvas2D, and a
preset that looks right in the editor but wrong in the downloaded PDF would be worse than not offering it.

## Phase 15 — tools page grouped by category

Pure UI/code change — no new SQL, no new environment variables.

`/tools` (the "All" view) previously showed every tool in one mixed grid, in whatever order they were seeded —
a photo tool could sit right next to a PDF tool next to a calculator. It now shows each category as its own
section — Photo & Image tools together, then PDF tools together, then Utilities, and so on — in the order
categories are configured in `/admin/categories`. Clicking a specific category pill still works exactly as
before (jumps straight to, and filters to, just that one category); "All" is what changed.

## Post-Phase-15 fixes — a real drag/resize bug, plus real upgrades to both ID card tools

**The bug, explained plainly:** dragging and resizing in ID Card Designer Pro used React's per-element pointer
capture. That approach breaks down when the cursor moves faster than the small element itself, or lands on a
nested child node — capture goes to the wrong target and only part of the movement registers, which is exactly
"moves a little, not to where I actually dragged." Fixed by switching to window-level pointermove/pointerup
listeners (attached only during an active drag/resize) — the standard, robust pattern for this, used by
production drag-and-drop libraries for the same reason.

**The same bug existed in the shared `DraggableElement` component** — used by Employee ID Card Studio's four
image slots *and* PDF Fill & Sign's signature placement — and was actually worse there: `onPointerLeave` was
ending the drag the instant the cursor left the small element's bounds. Fixed once at the shared component, so
both tools are corrected without touching their own code.

**ID Card Designer Pro**: added a Portrait/Landscape switch in the toolbar. Honest caveat, stated in the UI
itself: switching orientation swaps the card's own width/height, but existing elements keep their exact
position — repositioning a few elements after switching may be needed, rather than a magic auto-reflow.

**Employee ID Card Studio**: three real additions — per-field text size sliders (organization name, employee
name, designation/ID, valid-till, each independently adjustable), a custom background section (the same 16
safe presets from Designer Pro, plus a live color picker), and a Portrait/Landscape toggle.

## What's actually working right now (61 tools total, plus 2 flagship multi-step features)

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
