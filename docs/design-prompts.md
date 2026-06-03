# ShopTrace — Frontend Design Briefs

> *ShopTrace* is the product. *AutoLounge* is the example shop in mockups (each shop's own logo/color themes its surfaces via per-tenant branding).

These are **creative briefs, not specs.** Each one gives you the context, the user, the job-to-be-done, and the features/data that must be present — then hands you the design. You own layout, hierarchy, components, interaction, and visual direction.

**How to use each brief:**
- Propose **2–3 distinct directions** for the surface, then iterate on the strongest.
- Design the **real states**, not just the happy one: empty / first-run, loading, error, offline, and dense/at-capacity.
- Make **deliberate** hierarchy and information-density choices and say *why*.
- Treat the visual notes below as a **starting point you may challenge**, not a mandate.

**What context to give the design agent.**
- For a quick concept, **this file alone is enough** — the Shared Context block below makes each brief self-contained. You can even hand over a single brief plus that block.
- For production-accurate screens, pair the brief with **its one matching PRD section** (table). Don't dump the full PRD or the consumer-app / integration-api / planning-status docs — that's noise for UI work.

| Brief | Pair with (in `prd.md` unless noted) |
|-------|--------------------------------------|
| 1 Queue Board & Intake | §9, §10.6, §10.8, §35 |
| 2 Work Order | §10 (esp. 10.2, 10.7) |
| 3 Action Center | §35, §14.6 |
| 4 Mechanic Checklist | §12 (esp. 12.3–12.6, 12.11–12.13) |
| 5 Issue Found & Scan | §12.8, §12.9 |
| 6 Customer Portal (status/proof) | §13, §19 |
| 7 Approvals & Estimate | §13.3, §15 |
| 8 Bill, Payment & Release | §13.3, §16 |
| 9 Estimate & Billing Builder | §15.7, §16 |
| 10 Photo Review & Messaging | §13/§10.5, §14.4, §8.4 |
| 11 Reports & Multi-Shop | §20, §36 |
| 12 Onboarding & Branding | §33 |
| 13 Public Website & Queue | `website-prd.md`, §9 |

---

## Shared Context (applies to every brief)

**Product.** ShopTrace makes an auto shop transparent: customers see live status + proof photos of work on their car; staff run job queues, work orders, approvals, payments, and history; owners see the numbers. Built for Philippine shops.

**Who uses it.**
- **Service advisor / admin** — runs the front desk on a desktop all day; high volume, needs speed and at-a-glance triage.
- **Mechanic** — works on a tablet or phone in a greasy, dim garage bay with weak Wi-Fi; minimal typing, large targets, camera-first.
- **Owner / cashier** — oversight, money, reports; trust in the numbers matters.
- **Customer** — opens a private link on their phone; no app, no login beyond a PIN; may read Taglish.

**Brand feel.** Competent and trustworthy, modern but warm, distinctly Filipino (Taglish-comfortable), and *proof/transparency-forward* — the product's whole promise is "see what's really happening to your car." Avoid sterile-enterprise and avoid toy-cute.

**Visual starting point (challenge it if you have a better idea).** A confident dark "automotive" feel for the staff/admin surfaces; lighter, reassuring surfaces for customer-facing pages; a warm accent (amber/orange works) for primary actions and attention states; green/amber/red for status. Tailwind + shadcn/ui is the build system, so lean on real, implementable components.

**PH realities to design around.** Weak/intermittent Wi-Fi; affordable Android tablets; GCash / bank transfer / cash; walk-ins and Messenger; Taglish; one person sometimes wearing several role hats.

**Principles.** KISS and progressive disclosure (features are toggleable — design for graceful presence/absence). Faster than paper where it matters. Big touch targets and camera-speed for mechanics. Mobile-first and trust-building for customers. Per-tenant theming (logo + color) on every surface.

---

## Brief 1 — Admin: Queue Board & Intake Funnel

**Platform:** desktop web. **User:** service advisor, all day, high glance-frequency.

**Job to be done.** Let the advisor see the whole shop at a glance and move work forward without hunting — *who's waiting, who's being worked on, who's blocked, who's ready, who needs me.*

**Must surface:**
- Jobs across their lifecycle (queued → in progress → waiting on approval → final check → ready → released), with the vehicle, customer, service type, assigned mechanic(s), time-in-status, priority, and a photo-progress signal.
- A **"Pending Intake"** stream — walk-ins, website/Messenger inquiries, and bookings awaiting triage — that the advisor accepts (→ becomes a work order) or declines.
- Shop status control (open / busy / closed) and the current public wait band.
- Attention cues for blocked / waiting-on-customer / overdue-approval jobs.
- Entry to **global search** and the **action center**.

**Explore.** How to show a busy shop (20+ jobs) without overwhelm; kanban vs lanes vs list vs hybrid; how walk-in vs booked vs online intake visually differ; how "this job is stuck" jumps out. Design the empty (first-day) and at-capacity states.

---

## Brief 2 — Admin: Work Order (create + detail)

**Platform:** desktop web. **User:** advisor creating intake and managing a job end-to-end.

**Job to be done.** Capture a new job fast (recognizing returning customers, not re-keying), then serve as the job's home — everything about it in one place.

**Must support:**
- **Fast intake:** find-or-create customer & vehicle (search by plate/phone/name with returning-customer recognition; handle plate-less/conduction-sticker cars; allow a quick/anonymous walk-in). Capture mileage, service type, complaint, intake photos, priority, source, consent.
- **Job home (detail):** status & timeline, assigned mechanic(s), checklist progress, mechanic photos (with review state), estimate/bill, payment status, the customer message thread, and audit trail.
- One-tap **send tracking link** and **print job order**.
- Respect that pricing/scope edits are gated to trusted roles, and a released job is locked.

**Explore.** Modal vs full-page intake; how much to show on create vs progressively reveal; how the detail view balances "many tabs of data" against a single scannable surface; how returning-customer recognition appears mid-typing.

---

## Brief 3 — Admin: Action Center

**Platform:** desktop web (and a compact view worth considering for mobile). **User:** advisor/owner — the first screen opened each morning.

**Job to be done.** A single "**what needs me right now**" surface so nothing slips: approvals waiting (incl. timed-out escalations), payments to verify, unread customer messages, reminders due, pending intake, outstanding balances to chase, blocked jobs.

**Explore.** Prioritization and grouping (by urgency? by type? by money-at-risk?); how an item is actioned inline vs deep-links to the job; how it feels rewarding to clear it (the "inbox zero" feeling); what it looks like when there's nothing to do. This is a retention surface — make opening it feel useful.

---

## Brief 4 — Mechanic: Job List & Checklist (the highest-risk surface)

**Platform:** tablet/phone PWA, used one-handed with greasy/gloved hands in a dim bay on weak Wi-Fi. **User:** mechanic.

**Job to be done.** Guide the mechanic through a job like a photo checklist — *faster than paper* — with zero confusion about what's required to finish.

**Must support:**
- Today's assigned jobs; start a job; see vehicle, mileage, the customer's concern (incl. any customer-supplied photos/video), the checklist, and required vs optional photos.
- Checklist item states (done / needs-attention / N-A / blocked), a **clear "X of Y required photos done"** gate on finishing, and an explicit reason when a required photo is skipped.
- **"Issue found"** capture (severity, description, photos, recommended action) sent to admin.
- **Offline truth:** always-visible connection state and an **"N not synced"** indicator; per-photo queued/uploading/synced/failed; nothing silently lost.

**Constraints.** Huge touch targets, minimal typing, instant camera, high contrast, legible in sunlight and in a dark bay. The photo step launches the **native camera** (not a custom viewfinder) — design the step screen that shows a reference example before and the result after.

**Explore.** How to make "what's left to finish" unmistakable; how required vs optional reads at a glance; how blocked/waiting-for-approval looks while the mechanic moves on; the offline and failed-upload states. Iterate hard here — this is the make-or-break UX.

---

## Brief 5 — Mechanic: Issue Found & Scan Upload

**Platform:** tablet/phone PWA. **User:** mechanic, mid-job, hands busy.

**Job to be done.** Let a mechanic flag a newly discovered problem (or upload a diagnostic/OBD scan) in seconds, with enough for the advisor to price it and the customer to understand it — without the mechanic typing a paragraph.

**Must support:** severity, short description, photos/short video, recommended action, parts needed; tag media internal-only vs customer-visible; pricing left to the advisor by default.

**Explore.** Minimizing typing (presets, voice, templates); how severity is chosen fast; how the mechanic trusts it was sent. Design for the reality that a thorough issue report is what earns the upsell — but the mechanic won't do it if it's slow.

---

## Brief 6 — Customer: Tracking Portal (status + proof)

**Platform:** mobile web, opened from a private link, no app, optional PIN, possibly in Taglish. **User:** the car owner, anxious about their car and their bill.

**Job to be done.** Answer "**what's happening to my car right now?**" with confidence and proof — and make the shop feel professional and trustworthy.

**Must surface:** the shop's brand; vehicle & job summary; a status timeline; simplified checklist progress; **approved proof photos** by stage (before / during / parts replaced / completed / final); and a way to message the shop.

**Explore.** How to make proof photos the hero without overwhelming; how status feels alive and reassuring (not a cold system log); EN/Taglish; how it reads to someone who has never seen the app and is mildly worried about money. Design the early state (just received) and the rich state (lots of photos).

---

## Brief 7 — Customer: Approvals & Estimate

**Platform:** mobile web. **User:** car owner deciding whether to approve extra work or an upfront repair quote.

**Job to be done.** Present found issues / estimates clearly and *non-alarmingly*, with the proof and the cost, so the customer can confidently **approve, decline, or ask a question** from their phone.

**Must support:** per-issue title, simple explanation, photos, recommended action, added cost; clear running total; approve / decline-for-now / ask-a-question; capture of who approved + when. Also the up-front "approve before we start the repair" case.

**Explore.** Building trust at the moment money is on the line; making "decline" feel safe (not pushy); how multiple issues are reviewed and approved individually vs together; the just-asked-a-question waiting state.

---

## Brief 8 — Customer: Final Bill, Payment & Release

**Platform:** mobile web. **User:** car owner paying and picking up.

**Job to be done.** Show a clear final bill and make paying (GCash / bank / cash) and proving payment effortless — then a clean release sign-off.

**Must support:** itemized bill with deposits applied, discounts, VAT where relevant, balance; payment instructions incl. **GCash QR**; upload proof of payment + reference number; partial/"pay later" where the shop allows; release acknowledgment.

**Explore.** Making the total unambiguous and trust-building; the GCash flow with the least friction; how "submitted, waiting for the shop to verify" reassures; the paid-and-released celebratory end state.

---

## Brief 9 — Admin: Estimate & Billing Builder (with price catalog)

**Platform:** desktop web. **User:** advisor/manager building a quote or final bill.

**Job to be done.** Assemble an accurate estimate/bill in seconds by pulling from a **reusable price catalog** (services + common parts with default prices), not retyping — while keeping price/discount edits within trusted roles.

**Must support:** pick catalog items (editable per job), labor/parts/supplies lines, deposits, discounts (with above-threshold approval and senior/PWD recording), VAT setting, running total; clear separation of estimate vs final bill; the "Not an Official Receipt" reality.

**Explore.** Fast catalog search/add; how overrides that need manager approval are surfaced; keeping a dense financial screen calm and error-resistant.

---

## Brief 10 — Admin: Photo Review & Customer Messaging

**Platform:** desktop web. **User:** advisor controlling what the customer sees and answering questions.

**Job to be done.** Two linked jobs: (a) review mechanic photos and decide customer-visible vs internal before the customer sees them, incl. promoting beauty shots to the works gallery; (b) handle the **two-way message threads** customers start from the portal.

**Must support:** photo grid with visibility toggles and per-step labels; clear internal vs customer-visible states; unread message threads tied to their work order, reply with EN/Taglish templates.

**Explore.** Fast bulk approval vs careful per-photo control; how messaging lives alongside the job without becoming a separate inbox to babysit.

---

## Brief 11 — Owner: Reports & Multi-Shop Dashboard

**Platform:** desktop web. **User:** owner/manager — wants confidence in the numbers, across one or several branches.

**Job to be done.** Show the health of the business — revenue, jobs, completion time, rework rate, payments, outstanding balances — for a single shop and, for multi-branch owners, **across branches with comparison** — in a way the owner *trusts*.

**Must support:** KPI summary; trends; by-service-type and by-branch breakdowns; drill-down to underlying jobs; pending-money callouts. Convey that the numbers are trustworthy because inputs are controlled/audited (without lecturing).

**Explore.** What an owner checks in 10 seconds vs explores deeply; single-shop vs multi-branch views (one design that scales from 1 to N branches); making "you have ₱X uncollected" impossible to miss. Design the single-shop default and the multi-branch benchmarking view.

---

## Brief 12 — Onboarding Wizard & Branding

**Platform:** desktop web. **User:** a shop owner signing up — possibly not very technical — who must reach "first real work order" fast.

**Job to be done.** Get a shop from sign-up to *running on good defaults* in minutes — pick services (which seeds checklists/templates), upload a logo and get instant theming, optionally invite staff and import existing customers — every step skippable.

**Must support:** minimal sign-up; a short, skippable wizard; logo upload with auto-suggested brand color and live preview; service selection; CSV import (map → preview → import); a "you're set, create your first work order" finish; a re-openable setup checklist.

**Explore.** Making it feel effortless and low-commitment (nothing blocks usage); the live branding preview; how skipping still leaves the shop fully usable. Reinforce the "no-brainer to adopt" promise.

---

## Brief 13 — Public Website & Queue Page

**Platform:** responsive web, mobile-first. **User:** a prospective or returning customer deciding whether/when to visit.

**Job to be done.** Make the shop look credible and answer "is it worth going now?" — and funnel people into an inquiry/booking.

**Must support:** shop identity, services, a works gallery (proof), and a **live queue/wait page** showing a status band + estimated wait + "best time to visit," plus a "message us" / inquiry CTA that lands as Pending Intake. (Full content spec in `website-prd.md`.)

**Explore.** A homepage that earns trust in 5 seconds; a queue page that feels live and honest (incl. a "may be outdated" state); the enthusiast-pleasing gallery. Per-tenant brandable.

---

## Cross-Cutting Asks (apply judgment across all briefs)

- **States:** design empty/first-run, loading, error, offline, and dense/at-capacity for each surface — not just the happy path.
- **Theming:** every surface is per-tenant brandable (logo + color). Show how a surface looks under two different shop brands if useful.
- **Localization:** customer-facing surfaces should work in English and Taglish.
- **Accessibility:** sensible contrast and scalable text, especially on the customer portal and the in-bay mechanic app.
- **Feature toggles:** features can be off — show how a surface degrades gracefully when, e.g., proof photos, messaging, or payments are disabled.
- **Iterate:** for the high-risk surfaces (mechanic checklist, customer portal, action center, multi-shop dashboard), bring more than one direction and a short rationale.
