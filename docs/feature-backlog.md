# ShopTrace — Feature Backlog & Idea Capture

**Purpose.** A running home for ideas raised during design/refinement, so they're not lost and don't bloat the MVP-focused PRD. Items here are **assessed but not committed.** Strong, validated ones graduate into `prd.md` with a real section; the rest wait. Keep the MVP spine (intake → proof → approve → pay → release) protected — most backlog items are P2/P3.

**Status legend:** 💡 idea · 🔎 assessed · ✅ graduated to PRD · ❄️ parked

---

## Theme A — Procedure & Knowledge Library 🔎

**Vision.** Turn ShopTrace from a job *tracker* into a shop's accumulated *expertise*: a library of the shop's own procedures, car-type-aware work, and visual guides mechanics follow — so quality and speed compound over time and new mechanics ramp fast. A defensible, asset-building layer on top of the core loop.

**Priority:** P2/P3 — post-MVP enrichment. Builds on the existing template system (§12.7) and proof-photo capture.

### A1 — Car-type / brand / engine-specific procedures (strongest)
Procedures and checklists that adapt to the vehicle. E.g., diesel PMS auto-includes **EGR/DPF** items; gas gets **spark plugs**; an SUV vs a pickup differ.
- **Architecture:** extend `ChecklistTemplate` / `PhotoTemplate` / `ServiceCatalogItem` with **applicability rules** (fuel type, drivetrain, make, model/year). The system selects the right variant from the vehicle's attributes at job creation.
- **KISS path:** start with the **fuel-type axis** (diesel/gas/hybrid/EV) + body-type — highest value, lowest complexity — before per-model.
- **Why strong:** clean fit, immediate value (no more forgetting diesel-specific steps), reinforces the core checklist.

### A2 — Shop's own procedure library
A knowledge base of how *this shop* does things. Each **Procedure**: ordered steps, tools, parts, cautions, time estimate, linked service + car types.
- **Architecture:** new `Procedure` entity; a procedure can *generate* a job checklist (so it strengthens the core loop, not a silo).
- **Value:** training, consistency, and a real asset for the shop (and the SaaS).

### A3 — Visual guides for mechanics
Step-by-step **annotated images/diagrams** attached to procedures and checklist items. Mechanic taps "how?" on a step → sees the guide.
- **Synergy:** the proof photos mechanics already capture become source material for guides.
- **KISS:** images + short captions per step; the shop builds the library over time.

### A4 — Ingest existing (casa/OEM) procedures — ⚠️ IP caveat
Scan/upload manufacturer or casa procedure sheets; LLM vision extracts structured, editable steps into the shop's `Procedure` library.
- **Hard rule (IP):** OEM/casa manuals are **copyrighted.** Ingestion is **private to the shop** (their own internal reference) and **never pooled or shared across tenants.** Do not build a cross-tenant OEM-procedure database — that's an IP liability.
- **Tech:** Claude vision/tool-use to turn photos/PDFs → structured steps, with human confirm before save.

### A5 — Car figures + per-car-type collection — ⚠️ asset-burden caveat
Visual car representations and a "collection/library" the shop builds up per car type.
- **Trap to avoid:** commissioning figures per model = thousands of assets. Don't.
- **KISS path:**
  - **Generic type silhouettes** (sedan/SUV/pickup/hatch/van/motorcycle) for *functional* uses: vehicle selection and a **tap-to-mark damage/inspection map** (genuinely useful, standard in inspection apps).
  - The **"collection"** is built from the shop's *own* accumulated work per car type (real photos + procedures) — doubles as a portfolio/credibility asset (ties to works gallery §8.4) and gives the collectible/pride feel without per-model art.

### Theme A — open questions
- Per-tenant only, or an *opt-in* shared library of **shop-authored** (not OEM) procedures across the SaaS later? (Shop-authored content could be shared with consent; OEM content cannot.)
- Do visual guides appear customer-side ever (e.g., "here's how we did it"), or strictly internal?
- How much does A1 lean on a vehicle-attributes dataset (decoding make/model → fuel type/drivetrain)?

---

## Theme B — Visual Bay, Car Status & Layout Planner (Queue Board UX) 🔎

**Vision.** Make the admin queue board feel like a live shop floor: cars and bays reflect their current job status visually, progress within a bay is obvious at a glance, and transitions between bays feel intentional and trackable — not just a status tag on a card. At the rich end, an owner can lay out their actual shop floor and watch cars flow through it.

**Priority:** the **logical bay model** (which bay, status, capability) is **P2**; the **spatial layout planner (B5)** and **animated floor (B7)** are **P3 delight — KISS-gated and strictly optional** (see the logical-vs-spatial principle below). Builds on the queue board (Brief 1 / §9) and the car silhouettes from A5.

> **Cross-checked against an external (ChatGPT) bay-planner feature list, 2026-06-04.** ~70% already lived here (B1–B4, A5 silhouettes, §12.7 checklists, A1 vehicle-matching, §33 onboarding). The net-new it contributed — a Sims-style **layout planner**, a richer **operational floor viz**, and **per-bay service/vehicle capability** — is folded in as B5–B7 below, with KISS phasing and the privacy line preserved.

### B1 — Bay map & occupancy display (strongest) 🔎
A visual representation of the shop's bays — slots on a floor plan or a simple lane grid — each showing which car is currently in it and at what job status.
- **Architecture:** new `Bay` entity (or `bay_id` field on `WorkOrder`); shop owner defines bays at onboarding (name + type: inspection / lift / wash / detail / waiting). WO assignment to a bay is optional in MVP, required for this feature.
- **KISS path:** start with a **list/lane view** (no literal floor plan) showing each bay as a column: car silhouette, plate, job status badge, mechanic avatar, time-in-bay. The floor plan (drag-to-position) is P3.
- **Why strong:** makes "who's in what bay" instantly visible without hunting through a job list. Operationally useful in a real shop (advisor shouts across the floor less).

### B2 — Per-bay job progress bar 🔎
Within a bay, a progress bar shows how far the job has advanced: checklist items completed / total, plus required-photo count done.
- **Data source:** `ChecklistItem` completion + `ProofPhoto` count — already tracked in core. No new data model needed; just aggregation and display.
- **Display:** progress bar + "X / Y items · Z photos" label on the bay card. Amber when photo gate is not yet met; green when the mechanic can mark done.
- **KISS:** compute on read (no stored progress field); a materialized view or realtime subscription on checklist item updates drives the display.

### B3 — Bay transition indicator 🔎
When a car moves from one bay to another (e.g., inspection bay → lift bay → wash bay), the transition is shown as a short animated indicator and logged.
- **Architecture:** `BayAssignment` join with `assigned_at` / `released_at` timestamps. Multiple assignments per WO = the car's physical journey through the shop.
- **Display options:**
  - A **"moving"** state on the car's card (spinner/arrow) between release from one bay and assignment to the next, with elapsed-in-transit time.
  - A timeline strip on the WO detail showing bay-to-bay movement with timestamps.
- **KISS path:** the "moving" state is just the window between `released_at` on bay A and `assigned_at` on bay B — no special status needed. A `bay_history` view derives the timeline.

### B4 — Car silhouette status coloring 🔎
The generic car silhouette (from A5) color-shifts to match job status — e.g., grey (waiting), amber (in progress), green (done / ready for pickup), red (blocked / waiting on approval).
- **Synergy:** reuses A5 silhouettes; status color is driven by `WorkOrder.status` already in the data model.
- **KISS:** CSS fill on an inline SVG silhouette, swapped by status class. One silhouette set per body type; color is the only variant. No per-model art.
- **Caveat:** color alone is not accessible — pair with a status badge or icon for contrast.

### B5 — Bay layout planner (Sims-style spatial editor) — ⚠️ KISS-gated, P3
A top-down / isometric-lite editor where the owner arranges their real shop floor: drag bay modules from a left tray onto a snap-grid; move / rotate / duplicate / delete / multi-select; **group into colored zones** (Repair / Paint / Wash & Detail / Diagnostics / Ungrouped) with editable names + colors; 1-row / 2-row toggle; undo/redo, zoom, side inspector, floating selection toolbar. White background, subtle grid, **soft rounded modules sitting directly on the grid** (no floor tiles/borders), generic rounded cars.
- **Bay module types** (from the source list): two-post lift · four-post lift · no-lift · paint booth · detailing pad · diagnostics · wash · tire · alignment · EV · custom.
- **⚠️ Not MVP, and not early P2.** This is essentially a mini design tool — building it first burns the simplicity budget the spine needs. **Onboarding MVP needs only a bay *count* + name/type list, fully skippable ("add later")** — which the source list itself supports (Skip for now / Add later). The spatial editor is a **credibility/delight layer (P3)**.
- **Backend:** extends `Bay` with geometry (`x`, `y`, `rotation`, `row`); new `BayGroup`/`Zone` (name, color); `BayLayout` per shop (grid config). **All nullable** — a shop that never opens the planner still has a fully working logical bay model.

### B6 — Per-bay service & vehicle-type capability 🔎 (P2)
Each bay declares which **services** it supports and which **vehicle types** it fits, so jobs route/validate to the right bay; per-bay equipment, capacity, active/inactive.
- **Backend:** `Bay.services[]` (→ `ServiceCatalogItem`), `Bay.vehicle_types[]`, `equipment`, `capacity`, `active`. Reuses **A1** (car-type applicability) + the service catalog (§15.7); **vehicle-type matching + generic fallback = our A5 silhouettes** (swappable, fallback-to-generic when no exact match). Checklists-per-service / per-vehicle = §12.7 + A1 (the source's SOP builder is our existing template system).

### B7 — Operational queue visualization (live shop floor) 🔎 (P2 logical / P3 animated)
The "live shop" view: a queue lane with an approach ramp + **gate/barrier**, waiting cars lined up behind it, a **"Next Up"** car past the gate, cars driving forward into active bays; bay occupancy (on-lift, wash, paint, diagnostics); a **shop-overview panel** (bay-status counts, utilization %, group legend). Status labels: In Bay · Waiting · Next Up · Available · Repair · Paint · Wash & Detail.
- **Builds on B1–B4** and ties capacity (Theme N). The **logical** version (which bay, status, counts, utilization) is the P2 win; the **animated spatial** version (drive-forward, ramp, gate) is P3 polish on top.

> **Principle — logical model vs spatial layout (decide once).** Separate **(a) the logical bay model** — which bay a job is in, its status + capability (needed for ops; cheap; P2) — from **(b) the spatial layout** — x/y/rotation/zones for the isometric view (additive delight; P3). Build (a) first; (b) is a visual layer on top that must **never block core flow**. A shop that ignores the planner still gets a working lane/list board.

> **Privacy reaffirm (roadmap C9).** Spatial bay occupancy — *where a specific car physically sits* — is **staff-only**. The customer portal, lounge display (Theme O), and public queue show **status without location**. The operational floor viz never leaks "the where."

### Theme B — open questions
- Does the shop configure its own bay layout (number + type), or does ShopTrace provide a fixed default? (Recommend: configurable, seeded with a sensible default at onboarding.)
- Is bay assignment mandatory (every WO must be in a bay) or optional (bays are a richer feature some shops use, some don't)? (Recommend: optional — feature-toggle, absence degrades gracefully to current card-based queue.)
- Does the mechanic app show the bay map too, or is it strictly the advisor's view?
- How do multi-lift bays work? (Two cars on the same lift is physically impossible; one lift = one bay slot.)
- **Onboarding weight:** keep bay setup **skippable** (MVP = bay count; planner = later), matching the source's Skip/Add-later — don't let a layout editor gate "first work order."
- **Art-direction reconciliation (decided 2026-06-04):** *keep both directions open* — run Prompt A's automotive/forensic explorations AND the soft premium-SaaS/Sims planner track, compare from real outputs before committing. Guardrail: both must share the same **design-token structure** so the winner (or a "soft-planner / distinctive-elsewhere" split) is a cheap retheme, not a rebuild (see `visual-identity-brief.md`).

---

## Theme C — Retention & Lifecycle Engine 🔎

**Vision.** Turn every released job into the start of the next one. ShopTrace already knows the vehicle, mileage, service done, and customer contact — so it can actively bring people back instead of waiting. This is the single biggest revenue multiplier in the backlog.

**Priority:** P2 — first enrichment after the core loop is live. PMS reminders already have a seam (`Reminder` entity, §11.1; PMS reminders, §14).

### C1 — PMS / return-visit reminders (strongest revenue lever) 🔎
After release, schedule a reminder at the right interval (mileage- or date-based) and send it on the customer's channel. "Paparating na ang next oil change ng inyong Vios — book na tayo."
- **Backend:** `Reminder` already exists. Extend with `due_basis` (date | mileage), `due_date`, `due_mileage`, `service_type`, `status` (scheduled/sent/snoozed/converted/dismissed), `channel`, `template_id`, `sent_at`, `converted_work_order_id`. Driven by **pg_cron** (already committed, §27) scanning due reminders.
- **Interval source:** derive default intervals per service type from `ServiceCatalogItem`; allow per-job override at release.

### C2 — Customer satisfaction survey (CSAT) 🔎
One link after release: star tap + optional short comment. Positive → optionally surfaces on the public page (with consent); negative → owner-only alert.
- **Backend:** new `Survey` (linked to `WorkOrder`, `Customer`): `rating` (1–5), `comment`, `submitted_at`, `is_public_consented`, `responded_by`/`response` (shop can reply). RLS tenant-scoped; public read only when consented + approved.
- **Loop:** low ratings create an `ActionCenter` item (§35) for owner follow-up.

### C3 — Re-engagement / win-back campaigns 🔎
Filtered list ("no visit in 4+ months", "declined recommendation last visit") → opt-in broadcast with a seasonal hook (rainy-season brakes, Holy Week road-trip check).
- **Backend:** new `Campaign` (name, audience filter JSON, channel, template, schedule, status) + `CampaignRecipient` (customer, sent_at, opened_at, converted_work_order_id). Reuses `EventLog` for opens/conversions.
- **Caveat:** strictly opt-in + frequency-capped + DPA-compliant (consent flags already on `Customer`).

### C4 — Warranty tracking 🔎
Log warranty period per installed part/service; if the same vehicle returns for the same issue inside the window, auto-flag it.
- **Backend:** `Warranty` (linked to `WorkOrder` + `LineItem`/part + `Vehicle`): `covers` (part/service ref), `duration_days`, `duration_km`, `start_date`, `start_mileage`, `expires_at`, `void_reason`. On new intake, match open warranties for that vehicle+issue → surface to advisor.

### C5 — Declined-recommendation resurfacing 🔎
A recommendation the customer declined becomes a future nudge ("last visit we flagged your brake pads — still want us to check?").
- **Backend:** reuse `Issue` (declined state) + `Reminder`; a declined `Approval` schedules a soft follow-up. (Already an open question in planning-status.md — this is its home.)

---

## Theme D — Trust & Documentation 🔎

**Vision.** Productize the proof. ShopTrace's whole promise is transparency; these features turn that proof into documents and signals customers can hold, show, and trust.

**Priority:** P2. Builds directly on intake/proof photos already in the MVP.

### D1 — Digital pre-work inspection report 🔎
On arrival, capture the car's incoming state (existing scratches, fluid levels, tire wear) → branded PDF to the customer: "here's what we found before we touched your car." Kills the "they scratched it / they added problems" dispute dead.
- **Backend:** new `Inspection` (linked to `WorkOrder`/`Vehicle`): structured items (area, condition, note, photos), `generated_pdf_url`, `sent_at`, `acknowledged_at`. Reuses the photo pipeline + tap-to-mark damage map (A5). PDF rendered server-side, branded via per-tenant theme (§33).

### D2 — Parts authenticity proof 🔎
A checklist photo step for the new part's box/label *before* install — answers "paano malaman kung peke" without the customer asking.
- **Backend:** no new entity — a `PhotoTemplate` step type `part_authenticity` tied to a `LineItem`. Surfaces in the proof gallery with a distinct label.

### D3 — Staff profiles on the customer portal 🔎
"Your mechanic today: Kuya Jun, 8 yrs experience." Personalizes the proof, builds trust.
- **Backend:** extend the user/staff record with `display_name`, `photo_url`, `years_experience`, `specialties`, `show_on_portal` flag. Portal read is token-scoped (§13.2).

### D4 — Insurance claim documentation package 🔎
One-tap export of all photos + job order + parts list + timestamps, formatted for an insurance adjuster. High-value jobs (flood, collision); the documentation is always the customer's nightmare.
- **Backend:** an export job that assembles existing `Photo` + `WorkOrder` + `LineItem` + `AuditLog` data into a branded PDF/zip. No new entity; a server route + `EventLog` event.

### D5 — Portable service history (glovebox QR / resale record) 🔎
A QR the customer prints for the glovebox → read-only, stripped-down service history. Major trust signal at resale ("nasa ShopTrace lahat ng records").
- **Backend:** a signed, revocable share token per vehicle (`VehicleShareGrant`: token, scope, expires_at, revoked_at). Read route returns sanitized history (no internal notes, no payment proofs — same exclusions as the partner API, `integration-api.md`). Aligns with the consumer-app grant model.

---

## Theme E — Philippine Lifecycle Hooks 🔎

**Vision.** ShopTrace remembers the PH-specific things the customer forgets. Pure local differentiation; cheap to build because the data is already there (plate, mileage, dates).

**Priority:** P2. Mostly reminder + small-field additions.

### E1 — LTO registration reminder 🔎
Registration month derives from the plate's last digit. Remind the month before; if the shop does emissions, drive the appointment.
- **Backend:** compute from `Vehicle.plate`; store `registration_month`, `registration_last_renewed`. Schedules a `Reminder` (reuses C1 infra).

### E2 — Emissions test record 🔎
Pass/fail + certificate number + expiry per vehicle; reminds on renewal.
- **Backend:** `EmissionTest` (vehicle, result, cert_no, tested_at, expires_at) → feeds E1's reminder.

### E3 — Number-coding awareness 🔎
On release/booking: "plate ends in 3 — coding Wednesday; pick up Tue or Thu." Tiny detail, big "they remembered for me" feel.
- **Backend:** pure derivation from `Vehicle.plate` + a per-tenant coding-scheme config (schemes vary by LGU). No stored state; display-time helper.

### E4 — Lube sticker / next-service card 🔎
After oil change, generate a branded digital sticker ("next change: [date] or [km]") to save to phone or print. Universal old-school habit, never runs out of sticker stock.
- **Backend:** rendered from the `Reminder`/service data + per-tenant theme; no new entity.

---

## Theme F — Operations Depth 🔎

**Vision.** Solve the daily back-office pains that make a shop *stay* on ShopTrace once the customer-facing wow has landed.

**Priority:** P2/P3. Some (inventory, fleet) are larger builds — graduate carefully.

### F1 — Inventory / parts stock (P2, larger) 🔎
Track shelf stock, deduct on parts-used logging, flag low stock. The #1 operational pain: job ready, part missing.
- **Backend:** `InventoryItem` (name, brand, sku, qty_on_hand, reorder_point, unit_cost, location) + `StockMovement` (item, delta, reason: purchase/consumption/adjustment, work_order_id, created_by, at). The MVP "parts autocomplete list" (§11.3) is the explicit upgrade seam — `InventoryItem` supersedes it cleanly.

### F2 — Fleet / corporate accounts (P2, high-value) 🔎
Company vehicles under one billing account: consolidated monthly billing, account credit, per-vehicle history by account. Low price sensitivity, high loyalty.
- **Backend:** `FleetAccount` (org-customer, billing terms, credit_limit, balance) + link `Vehicle`/`WorkOrder` → `fleet_account_id`. Reuses partial-payment/credit-release model (§16.8). Mirrors the `Organization` pattern but on the customer side.

### F3 — End-of-day cash / sales report 🔎
Auto summary to the owner: jobs done, cash/GCash/bank collected, outstanding, total. Replaces the manual tally.
- **Backend:** aggregation over `Payment` + `WorkOrder` for the day; pg_cron-scheduled email; reuses `EventLog`. No new entity.

### F4 — Quick QR intake for returning vehicles 🔎
Vehicle/job card carries a QR; scan → intake pre-filled with vehicle + customer + last service. 2 min → 20 sec for returning customers.
- **Backend:** signed vehicle token (shares the `VehicleShareGrant`/token infra from D5) resolved to a pre-filled intake; ties to find-or-create (§11.2).

### F5 — Job templates / saved service bundles 🔎
"Always PMS + tire rotation + car wash" saved as a named bundle → 3-tap intake. Great for common combos and fleet standard scope.
- **Backend:** `ServiceBundle` (name, items[] referencing `ServiceCatalogItem` + checklist/photo templates). Generates the WO + checklists on apply.

### F6 — Mechanic voice-to-text issue logging 🔎
Hold-to-speak issue description via the device's **native** speech API (no cloud cost, works offline) — beats one-finger typing with greasy hands.
- **Backend:** none — client-side Web Speech API writes into the existing `Issue.description`. Pairs with Brief 5.

---

## Theme G — Customer Relationship & Communication 🔎  ⭐ (don't lock it behind the app)

**Vision.** The app is the **proof and the memory**; the *relationship* breathes through whatever channel the customer already uses. Never force a portal login to talk to the shop, never trap the proof, never replace the humans — facilitate them. This is the cultural heart of a PH shop: the *suki* relationship.

> **No parked app required — this rides MVP channels.** Customer communication does **not** depend on the parked native consumer app (*Garage by ShopTrace*, §34 / `consumer-app-prd.md`). It rides the MVP channels: **SMS** (Semaphore/Movider), **copy-to-Messenger** (§14.5), the **no-install web tracking portal** (§13), and the shop's **real phone/Messenger/Viber** (G7). Two different "customer-side" things: the *web portal* ships in MVP and is how the shop and customer interact; the *native app* is a separate consumer product and is **never** the shop's communication channel. Most of Theme G works in MVP today; G1 (reply-by-channel) is the one real backend enhancement (inbound webhooks), bounded by Meta's 24h window — so SMS stays the backbone outside it.

**Priority:** P2 — the relationship layer on top of the transparency core. Builds on Threads/Messages (§14.4), Messenger scope (§14.5), and notification reliability (§14.6).

### G1 — Reply-by-channel (no portal required) (strongest) 🔎
When the shop sends a status update by SMS/Messenger, the customer replies *there* and it lands threaded in the Action Center. Portal = proof; conversation = wherever they already are.
- **Backend:** extend `Thread`/`Message` with `channel` (portal/sms/messenger) + `external_ref` for matching inbound. Needs an **inbound webhook** per channel (SMS gateway inbound, Messenger webhook within Meta's 24h window — already scoped in §14.5) → match to a `WorkOrder`/`Thread` by sender + recency. Display channel-agnostically in the Action Center.

### G2 — Personal note on proof (human voice) 🔎
Staff attach a one-line personal message to a proof photo instead of only templated pings.
- **Backend:** a `Message` with an attached `Photo` reference + a `is_personal` flag; sent on the customer's channel. No new entity.

### G3 — Proactive post-repair check-in 🔎
A "kumusta ang takbo?" message a few days after a major repair. Catches comebacks early; feeds CSAT (C2).
- **Backend:** a scheduled `Reminder` of type `checkin` (reuses C1 infra) gated to job category/value; sends on channel.

### G4 — Shareable proof (forward outside the app) 🔎
Customer forwards a before/after or proof photo to family via their own Viber/Messenger. Don't trap proof in the portal — make it word-of-mouth fuel.
- **Backend:** signed, time-boxed, watermark-optional share URLs for *approved customer-visible* photos only (reuses signed-URL infra, §27.1; same exclusions as the partner API). Per-tenant theme on the share card.

### G5 — Suki recognition / loyalty (the PH way) 🔎
Visible suki status + visit count: "ika-10 visit — libre ang car wash." Formalizes the relationship shops already run on — not a generic points engine.
- **Backend:** derive visit count from `WorkOrder` history; `LoyaltyTier`/`LoyaltyReward` config per tenant (threshold → perk); `LoyaltyGrant` when earned. Feature-toggle; off = hidden.

### G6 — Referral program (through normal channels) 🔎
"Pasa mo kami" — shareable referral link; referrer + referee both get a perk. The ask travels by word of mouth; the backend just tracks it.
- **Backend:** `Referral` (referrer_customer, referee_contact, share_token, status: shared/redeemed/rewarded, redeemed_work_order_id). Reward via the loyalty infra (G5).

### G7 — Shop's real contact line, front and center 🔎
Show the shop's actual phone / Messenger / Viber prominently on portal, receipts, reminders — and *encourage* calling. The app facilitates; it never hides the humans.
- **Backend:** per-tenant contact fields (phone, messenger_url, viber, hours) on the shop/branding config (§33); surfaced on every customer surface.

### G8 — Customer memory / preferences (digital suki notebook) 🔎
Internal notes the shop remembers: "prefers fully synthetic," "always requests Kuya Jun," "sensitive about dashboard scratch."
- **Backend:** `CustomerNote` (customer, author, note, pinned, created_at) + structured `preferences` JSON on `Customer`. Internal-only (RLS, never customer-visible, never in partner API).

### G9 — Milestone & thank-you touches 🔎
Service-versary / "1 year with us" / genuine thank-you on release that also seeds the next-service reminder + referral ask.
- **Backend:** scheduled `Reminder` types `milestone`/`thankyou` (reuses C1); thank-you fires on `Release`.

### G10 — Opt-in announcements (sparingly) 🔎
"Sarado kami this Holy Week," "brake-check promo." Keeps the relationship warm between visits without spam.
- **Backend:** reuses `Campaign` (C3) with an `announcement` type; strict opt-in + frequency cap.

### Theme G — open questions
- Inbound Messenger replies are bounded by Meta's 24h window (§14.5) — outside it, fall back to SMS? (Recommend: yes, channel-fallback rule.)
- How aggressive can reminders/announcements be before they feel like spam? (Recommend: global per-customer frequency cap + easy opt-out, DPA-compliant.)
- Does shareable proof (G4) need a watermark/branding to protect the shop's work? (Lean yes — it's free marketing.)

---

## Theme H — Social Proof & Stickiness 🔎

**Vision.** Make the shop's good work visible and the platform invisibly indispensable in their marketing.

**Priority:** P3. Builds on the works gallery (§8.4) and proof photos.

### H1 — Works gallery auto-format for social 🔎
Promote a before/after to the gallery → auto-generate a square, branded crop ready for IG/FB; one-tap share. The shop's socials become a proof feed with ShopTrace invisibly inside every post.
- **Backend:** reuses `Photo` gallery-promotion + image-derivative pipeline (§24.6); adds a branded social-card render (per-tenant theme).

### H2 — Public reviews surfaced from CSAT 🔎
Consented positive `Survey` responses (C2) display on the public page / gallery as authentic, job-linked reviews.
- **Backend:** public read of `Survey` where `is_public_consented` + owner-approved; tenant-scoped.

---

## Theme I — Progressive Disclosure & Plan Tiers (operator) 🔎  (simple by default — NOT gamified)

> **Scope correction.** Feature access is **not** gamified. The operator never "earns" features through a game. Features are either **on by default** (the spine + basics), **available on their plan**, or **revealed when the data they need exists** — all presented *plainly*. Gamification belongs to the **customer experience only** (see Theme G + the Gamification note below), and it never gates features.

**Vision.** A shop signs up and is *running in minutes on good defaults* — the core spine, nothing to configure (§33). Advanced features don't bury the owner in a settings dump; they appear **plainly, when relevant** — either because the shop is on a plan that includes them, or because they now have the data to use them. Simple stays simple; power is one obvious switch away, never a wall.

**Priority:** P2 — extends onboarding + feature toggles (§33).

### How a feature becomes available (two plain gates, no game)
Every non-core feature is **on**, **available (toggle off)**, or **not-on-your-plan** — evaluated server-side:
1. **Plan gate (commercial).** The feature is included in the shop's tier (Theme J). Not on the tier → shown as a plain upgrade option, never a "locked achievement."
2. **Readiness gate (functional).** The feature needs data to work — e.g. price-catalog estimates need a seeded catalog; reviews (C2/H2) need ≥1 released job; multi-branch dashboards (§36) need >1 shop; bay map (Theme B) needs bays defined. Until then it's shown as "add X to use this," stated plainly.
3. **Always-on core.** The spine (intake → proof → approve → pay → release) is on for everyone, every tier, never gated.

- **Backend:** `FeatureDefinition` (key, category: core / plan / readiness, `min_plan`, `prerequisites` JSON, default_state) + `FeatureState` per tenant (key, state: on / available / not_on_plan, enabled_at). State is a **pure function** of plan + tenant data — not hand-set, so it can't drift. Reuses the per-tenant toggle from §33.

### I2 — Setup checklist (plain, not a score-to-grind) 🔎
The re-openable setup checklist (§33): logo, services, catalog, first WO, first tracking link, invite staff. It's a **helpful "what's left" list**, not a points/badge game — completing items just makes the shop more capable (and satisfies readiness gates above).
- **Backend:** `SetupTask` definitions + computed completion off existing data. Read-time aggregate; no stored game state.

### I3 — Plain "you can now use X" hints 🔎
When a readiness gate is satisfied (e.g., first job released → reviews become usable), surface **one** quiet, contextual hint — informational, dismissible, frequency-capped. Not a reward animation, not points.
- **Backend:** eligibility change emits `feature_became_available`; at most one hint at a time, same anti-spam discipline as process-layer L2.

### Theme I — open questions
- **Readiness: hard block or soft warn?** *Lean: block only where the feature is genuinely broken without the data (estimates need a catalog); soft-warn everything else so power users aren't handcuffed.*
- **Power-user "show everything on my plan" mode?** *Lean: yes — readiness hints are a convenience, not a cage.*
- **Plan line:** which features sit in which tier → resolved by **Theme J**.

> **Gamification note (where it actually lives).** Per the product decision, **gamification = the *customer* experience, not operator feature-gating.** It means the customer-facing surfaces feel alive and rewarding rather than bland: the **suki loyalty** ladder (G5), milestone/anniversary delight (G9), referral perks (G6), a tracking portal that celebrates progress and the finished job (Brief 6/8), and shareable proof to be proud of (G4). All of it is about *relationship warmth and delight* — **never** about locking a customer out of anything. One light `Milestone`/`LoyaltyGrant` engine powers these customer moments (backend already noted under G5/G6/G9).

---

## Theme J — Commercialization & Sales Model 🔎  ⭐ (self-serve, no sales calls)

**Vision.** A shop can discover, try, and pay for ShopTrace **without ever talking to a salesperson** — sign up, run real work, upgrade in-app. Product-led, low-touch, built for a one-person shop to adopt on a Tuesday night.

**Priority:** P1 to *decide* (shapes Theme I tiers + onboarding §33); P2 to *build* billing.

### J1 — Subscription, not one-time (the core recommendation) 🔎
**Recommendation: recurring subscription, not a one-time license.** ShopTrace is cloud SaaS with **permanently recurring costs** that a single payment can't cover:
- **Storage grows forever** — proof photos are the product's promise and are kept long-term (R2; process-layer L7/P31). A one-time fee + forever-growing storage = guaranteed loss.
- **SMS is a hard per-message cost** (Semaphore/Movider) — unbounded under a flat one-time fee.
- **Hosting, pg_cron jobs, support, and ongoing updates** (BIR posture changes, features) are continuous.
- **Value is continuous** — reminders (C1) actively bring revenue back *every month*; subscription aligns price with that recurring value.
- **One-time only fits** local/desktop software with no server costs — not this product.

**PH-friendly framing** (Filipino SMB wariness of "walang katapusang bayad"):
- **Annual prepay at a discount** — feels closer to one-time, smooths cash flow, lifts retention.
- **Optional one-time *setup* fee** for white-glove onboarding/data import is fine — but the *platform* is subscription. (Most shops self-serve and won't need it.)

### J2 — Tiers (Basic → Pro → Business) 🔎
Tier by **value/capability**, not per-seat (per-seat punishes a shop for hiring — bad fit for variable PH staff). Per-**shop** flat price.
- **Basic** — the always-on spine + essentials: intake/queue, work orders, proof photos, customer tracking portal, ≥1 notification channel, basic history. Gets a shop fully running.
- **Pro** — the growth layer: service price catalog + estimates/approvals, PMS reminders & campaigns (C1/C3), CSAT/reviews (C2/H2), works gallery + social cards (H1), suki loyalty (G5), analytics/reports.
- **Business / Multi-branch** — org dashboards (§36), multiple shops, fleet accounts (F2), advanced controls.
- **Add-ons (any tier):** custom domain (§33.8, already paid), extra SMS credits (J3), white-glove onboarding.
- **Backend:** `Plan` (key, price, interval, included feature keys, limits) + `Subscription` per tenant (plan, status, current_period, cancel_at). `min_plan` on `FeatureDefinition` (Theme I) reads from here — one source of truth for what a tier unlocks.

### J2a — First-pass tier sheet (draft — react to this) 🔎

> **Design rule that decides every placement:** *Basic makes you **transparent** (the trust wow that earns adoption); Pro makes you **grow** (automation + money tools); Business runs you **at scale** (multi-branch).* The whole transparency loop must be **fully usable in Basic** — a crippled Basic kills the self-serve adoption motion. Pro is what a hooked shop *wants*, not what an unhooked shop *needs*.

| Capability | Basic | Pro | Business | Ref |
|---|:--:|:--:|:--:|---|
| Queue board & intake funnel | ✅ | ✅ | ✅ | §9 |
| Work orders (create → release) | ✅ | ✅ | ✅ | §10 |
| Mechanic app: checklist + required proof photos | ✅ | ✅ | ✅ | §12 |
| Customer tracking portal (status + proof) | ✅ | ✅ | ✅ | §13 |
| Per-WO customer messaging thread | ✅ | ✅ | ✅ | §14.4 |
| 1 notification channel (SMS / copy-to-Messenger) | ✅ | ✅ | ✅ | §14 |
| Payments + proof verify + release (incl. partial/utang) | ✅ | ✅ | ✅ | §16 |
| Branding/theming + default `{shop}.shoptrace.app` | ✅ | ✅ | ✅ | §33 |
| Global search · audit log · history | ✅ | ✅ | ✅ | §20/§23 |
| Found-issue approval loop (approve / decline / ask) | ✅ | ✅ | ✅ | §15 — *spine, not Pro (C1)* |
| Service price **catalog** (reusable price book) | — | ✅ | ✅ | §15.7 |
| Pre-work estimate approval (repair path) | — | ✅ | ✅ | §15.6 |
| PMS / return-visit reminders | — | ✅ | ✅ | C1 |
| Re-engagement / win-back campaigns | — | ✅ | ✅ | C3 |
| CSAT surveys + public reviews | — | ✅ | ✅ | C2/H2 |
| Works gallery + social-ready cards | — | ✅ | ✅ | §8.4/H1 |
| Suki loyalty + referrals (customer gamification) | — | ✅ | ✅ | G5/G6 |
| Customer memory / preferences · milestone touches | — | ✅ | ✅ | G8/G9 |
| Digital pre-work inspection report | — | ✅ | ✅ | D1 |
| Warranty tracking | — | ✅ | ✅ | C4 |
| PH lifecycle hooks (LTO reg, emissions, coding, lube sticker) | — | ✅ | ✅ | E1–E4 |
| Reply-by-channel (inbound threaded) | — | ✅ | ✅ | G1 |
| Reports & analytics (single shop) | — | ✅ | ✅ | §20 |
| Visual bay/car status board | — | ✅ | ✅ | Theme B |
| Service bundles · EOD cash report | — | ✅ | ✅ | F5/F3 |
| Booking + customer-supplied media | — | ✅ | ✅ | §9.6/9.7 |
| Portable service-history QR · insurance doc package | — | ✅ | ✅ | D5/D4 |
| Multi-shop org dashboards + benchmarking | — | — | ✅ | §36 |
| Multiple shops under one org | — | — | ✅ | §11/§36 |
| Fleet / corporate accounts | — | — | ✅ | F2 |
| Inventory / parts stock | — | — | ✅ | F1 |
| Advanced controls (maker-checker thresholds, deep audit) | — | — | ✅ | §21.3 |
| **Add-ons (any tier):** custom domain · extra SMS credits · white-glove onboarding/import · partner API (consumer app) | ➕ | ➕ | ➕ | §33.8/J3 |

**Debatable placements (flag for your call):**
- **PMS reminders in Pro, not Basic.** They're the revenue magic *and* the clearest upgrade driver. Lean: Pro — but if reminders prove to be the #1 adoption hook in the pilot, consider a capped version in Basic (e.g., N reminders/month) to bait the upgrade. *Open.*
- **Digital inspection report (D1)** could anchor Basic instead — it's pure transparency (the Basic theme) and a killer trust feature. Lean: keep Pro for now (it's setup-heavier), revisit.
- **Partner API / consumer-app integration** — add-on vs Business-only? Lean: add-on once the consumer app ships (parked).

### J3 — SMS metered separately (protect the margin) 🔎
SMS is a pass-through variable cost — **meter it regardless of tier** so heavy senders don't sink the unit economics (process-layer P6).
- **Model:** each tier includes an SMS credit allotment; beyond it, the shop tops up a `SmsCredit` balance. **Transactional always sends; marketing pauses at zero credits.** Low-balance alert.
- **Backend:** `SmsCredit` ledger (tenant, balance, top-ups, consumption per send) — ties to the notification engine (L2).

### J4 — Free trial / freemium path 🔎
Lowest-friction adoption for a PLG motion: a time-boxed **free trial** of Pro (so they feel the magic), then settle to Basic or upgrade. A perpetual **free tier** (capped jobs/month or limited history) is an alternative — decide which.
- **Backend:** `Subscription.status` covers `trialing`; trial = a dated Pro grant. Reuses the same plan machinery.

### Theme J — open questions
- **Trial vs freemium?** Time-boxed Pro trial (urgency, simpler) vs a forever-free capped tier (wider top-of-funnel, more infra cost). *Lean: trial first — cheaper to run, and a shop that won't pay after feeling the value probably won't convert from free either.*
- **Price points & the exact tier line** — needs pilot evidence (AutoLounge) before numbers are set; this is the open "pricing axis & packaging" item in planning-status.md.
- **Payment rails for collecting the subscription** — GCash / card / bank in PH; a billing provider that supports recurring PH payments (e.g. a local gateway) — separate from the customer-facing static GCash QR (which is for *their* customers paying *them*).
- **One-time *perpetual* option at all?** *Lean: no for cloud; if a shop truly wants to "own" it, that's the deferred local-edge deployment (§27.4), priced as its own thing.*

---

## Theme K — Insurance & LOA Jobs 🔎  (PH-specific, high-value, different money flow)

**Vision.** Accredited shops do a large share of revenue on **insurance claims**, and that flow is fundamentally different: the **payer is the insurer, not the car owner**; the approver is an **adjuster**, not the customer; hidden damage needs **supplemental approval**; and the customer only pays the **deductible/participation**. The current model assumes customer-funded, customer-approved jobs — this theme generalizes it.

**Priority:** P2 — large addressable revenue for accredited shops; significant flow divergence (assess carefully before committing).

> **⚠️ Money-sensitive & posture-bound — keep DEFERRED (P2/P3), not MVP.** Highest flow-divergence + money-risk for the least early validation. **BIR rule (inherits §16.7): ShopTrace never issues an OR/SI.** For insurance it produces a **Statement of Account** to the insurer (stamped *"NOT an Official Receipt"*); the OR the insurer needs is issued by the shop through their **own** BIR-registered channel, and ShopTrace stores only the **OR reference**. SoA ≠ OR → not a BIR trigger, no CAS accreditation. **Bug de-risking:** every total is a *draft* until human-verified; deterministic tested math; price snapshots (P23); immutable audit; nothing auto-transmitted to insurers/BIR; the shop's books remain authoritative — ShopTrace is *not* the accounting system. Insurer amounts are shown as **receivables**, never as recognized revenue, in any export.

### K1 — Payer abstraction (who funds the job) 🔎
A work order's funding source isn't always the owner.
- **Backend:** `WorkOrder.payer_type` (customer / insurer / fleet / warranty / internal). Generalizes billing, approval routing, and release rules. Fleet (F2) and warranty (C4) reuse the same seam.

### K2 — Insurance claim + LOA tracking 🔎
Capture the claim and the Letter of Authority that authorizes the work and the amount.
- **Backend:** `InsuranceClaim` (insurer, policy_no, claim_no, loa_ref, approved_amount, deductible, participation, adjuster_contact, status). Links to the WO; the LOA amount becomes the approved ceiling.

### K3 — Adjuster as approver + supplemental estimates 🔎
Approvals route to the **insurer/adjuster**, not the owner; hidden damage found mid-repair triggers a **supplemental** estimate for adjuster sign-off (work pauses on the affected line).
- **Backend:** `Approval.approver_type` (customer / adjuster); a supplemental estimate is a child estimate against the same claim. Reuses the partial-approval rule (P2).

### K4 — Deductible collection + parts choice 🔎
Customer pays only the deductible/participation; insurer pays the rest. Parts choice (casa/OEM vs aftermarket) is often dictated by policy.
- **Backend:** split the bill — `Payment` from customer (deductible) vs receivable from insurer (aging, Layer 5/P22). Parts source/grade recorded (ties Theme L4).

### Theme K — open questions
- **Who is "the customer" on the tracking portal for an insurance job** — the owner still watches their car, but approvals are the adjuster's. Likely: owner gets status/proof; adjuster gets a separate approval link.
- Deductible timing — collected at release, or before work starts?
- Insurer receivables can age for months — needs the aging/dunning model (P22) tuned for B2B terms.

---

## Theme L — Parts Sourcing, Sublet & Customer-Supplied Parts 🔎  (PH reality)

**Vision.** Real jobs stall and branch on **parts**: the part isn't in stock and must be ordered; the customer **brought their own part** (extremely common in PH); or the work is **sublet** to an outside specialist (machine shop, upholstery, aircon, auto-electrical). The model needs to represent all three without breaking history or billing.

**Priority:** P2. L1 (customer-supplied) and L2 (procurement) are near-term realistic; L3 (sublet) follows.

> **⚠️ BYO-parts risk & method.** A customer-supplied part = **₱0 line (no sale → no BIR angle)**, labor billed normally. Liability is the real risk: the shop must not be on the hook for a part it didn't sell. Method: **recorded warranty waiver** (typed/portal, audited), **photo the part at receipt** (condition + identity, inverse of D2), and the shop's **right to decline install** with a documented disclaimer. Counterfeit/wrong-part safety is covered by the receipt photo + disclaimer. Bill labels it clearly: *"customer-supplied — no parts warranty."*

### L1 — Customer-supplied parts ("BYO parts") 🔎
Customer brings the part; shop bills labor only — but is **not liable** for a BYO part's failure.
- **Backend:** `LineItem.source` = `customer_supplied`; price ₱0 but labor still billed; a recorded **warranty-waiver acknowledgment** on BYO parts (protects the shop). Surfaces on the bill clearly ("customer-supplied — no parts warranty").

### L2 — Parts procurement / backorder 🔎
Part not in stock → order from a supplier → **job waits on parts** (a real blocker with an ETA) → customer notified of the delay.
- **Backend:** `PartsOrder` (supplier, line_item, eta, status: ordered/received/cancelled); WO blocker reason `waiting_on_parts`; ETA change triggers a customer status update (channel layer).

### L3 — Sublet / outside work 🔎
Part of the job is sent to an external vendor (machining, upholstery, aircon, electrical). Track vendor, cost, markup, turnaround; the job is **blocked on sublet** meanwhile.
- **Backend:** `SubletJob` (vendor, description, cost, markup, status, eta); WO blocker reason `waiting_on_sublet`; vendor managed list per tenant.

### L4 — Parts sourcing options & transparency 🔎
Offer the customer a **choice** — casa/OEM vs aftermarket vs surplus — with price + warranty trade-off shown. Turns a markup into a transparent decision.
- **Backend:** alternative `LineItem` options grouped as a choice the customer/advisor selects; ties to estimates (§15) and the price catalog (§15.7).

### Theme L — open questions
- BYO-part warranty waiver — typed acknowledgment in the portal, or paper? (Lean: portal ack, audited.)
- Is parts markup ever shown to the customer, or only the final price? (Shop-config; default hide markup, show final.)
- Sublet vendors — a managed directory per shop, or free-text? (Lean: managed list, grows over time.)

---

## Theme M — Labor, Mechanic Productivity & Commission (porsiyento) 🔎  (PH pay model)

**Vision.** Many PH shops pay mechanics by **commission ("porsiyento")** or flat-rate hours, not just salary. The system already knows who did what — so it can compute labor, earnings, and (carefully) productivity, turning payroll from a notebook guess into a byproduct of the work.

**Priority:** P2/P3. High value for owners; commission models vary wildly, so config flexibility is the hard part.

### M1 — Labor time / flat-rate capture 🔎
Per-job, per-mechanic labor: either clocked (start/stop) or **flat-rate book time** per service.
- **Backend:** `LaborEntry` (work_order, mechanic, hours or start/stop, rate_basis). Feeds billing labor lines and commission.

### M2 — Commission / porsiyento computation 🔎
Per-mechanic earnings from the jobs they did; a payout report per period.
- **Backend:** `CommissionRule` per tenant (basis: % of labor / per-job / per-flat-hour; rate). Payout = aggregate over `LaborEntry` × rule. Owner-only.

### M3 — Multi-mechanic credit split 🔎
Two mechanics on one job split the labor credit/commission.
- **Backend:** multiple `LaborEntry` rows per WO with a contribution share; commission divides accordingly.

### M4 — Mechanic productivity & quality (sensitive) 🔎
Jobs/day, avg time, **comeback rate per mechanic** (quality). Powerful but morale-sensitive.
- **Guardrail:** owner-only; frame as coaching, not surveillance; never customer-visible. Comeback attribution must be fair (ties P3 comeback linking).

### M5 — Skill-based assignment 🔎
Route diesel/EV/electrical jobs to mechanics with the matching skill.
- **Backend:** `MechanicSkill` tags; assignment suggests qualified mechanics (ties Theme A1 car-type procedures).

### Theme M — open questions
- Commission basis varies hugely shop-to-shop — needs a flexible rule config, not a hard-coded formula. How flexible before it's overengineered?
- Productivity metrics: surface to the mechanic themselves (self-improvement) or strictly owner-only? (Lean: owner-only first.)
- Does labor commission interact with the bill (customer sees labor) vs internal payout (customer never sees)? Keep strictly separate.

---

## Theme N — Capacity-Aware Scheduling & Honest Wait 🔎  (makes the live queue real)

**Vision.** The public **live wait band** and **booking** (§9, `website-prd.md`) are only credible with a real **capacity model** behind them — bays × mechanics × typical job time. Otherwise the wait is a guess and booking overbooks. This is the engine that makes "is it worth going now?" honest.

**Priority:** P2. Booking is already P2 (§9.6); this gives it a spine.

### N1 — Capacity model 🔎
Throughput = available bays × mechanics × avg job duration; current open load → an honest wait band.
- **Backend:** `BusinessHours` + `Capacity` config (bays, concurrent jobs); wait band derived from open `WorkOrder`s vs capacity. Reuses Theme B bays if defined.

### N2 — Capacity-constrained appointment slots 🔎
Bookable slots that **can't overbook** — a booking reserves capacity.
- **Backend:** `Slot`/`Appointment` (slot, service_type est. duration, status: booked/confirmed/arrived/no_show/cancelled); slot availability = capacity − reserved.

### N3 — No-show handling + appointment reminders 🔎
Remind before the slot; track no-shows; grace then release the slot.
- **Backend:** scheduled reminder (Layer 3) before slot; `Appointment.status` lifecycle; no-show rate per customer (gentle).

### N4 — Triage / express lanes 🔎
Quick jobs (oil change) shouldn't sit behind a 2-day engine job. Express vs full-service lanes; emergency/VIP priority.
- **Backend:** `WorkOrder.lane`/`priority`; capacity can reserve express slots. Surfaces on the queue board (Theme B).

### N5 — "Best time to visit" from history 🔎
Historical load patterns → recommend low-traffic windows on the public queue page.
- **Backend:** aggregate historical `WorkOrder` arrival/throughput by hour/day; powers the website "best time" hint.

### Theme N — open questions
- **Cold start:** avg job time is unknown before history exists — seed with service-type defaults, refine over time. Acceptable?
- Walk-in vs booked capacity split — reserve some capacity for walk-ins (PH norm) vs fully bookable?
- Manual override of the public wait band when the owner knows better (e.g., a mechanic called in sick)?

---

## Theme O — Waiting-Lounge Display (the 4th surface) 🔎  ⭐

**Vision.** A glanceable TV/screen in the waiting lounge that lets customers *physically present* watch their car's progress at a glance — like an airport arrivals board or a clinic "now serving" screen. It's a **new surface** beside admin / customer portal / mechanic app, and its defining constraint is that it's **semi-public**: other customers, walk-ins, and anyone in the lounge can see it. So it is a **deliberately reduced, privacy-filtered projection** of the queue board — never the board itself.

**Priority:** P2 — high-delight, reinforces the transparency promise in the room where anxiety lives. Reuses the queue/WO data + Realtime; the work is the **privacy projection** and the ambient UX.

### The core question: what may a customer let *other* customers see?
Default to the **least-identifying thing that still lets the owner recognize their own car.** The board must be useless to a stranger and instantly clear to the owner.

**Show (safe, glanceable):**
- A **non-identifying handle** — recommend a **claim ticket code** (e.g. `A-14`), issued at intake and printed on the job card / sent by SMS. Zero PII, recognizable only to its owner.
- **Status stage** (Received → In progress → Final check → **Ready**) and/or a **progress %**.
- A big, celebratory **"READY FOR PICKUP"** state — the main payoff (the airport "now boarding" moment).
- *Optional, shop-toggle:* assigned **mechanic first name** (personal touch + accountability) and an **ETA band**.

**Hide (sensitive — never on a shared screen):**
- Full name, full plate, phone — identity/theft-targeting risk.
- The **bill / price** — wealth signal, embarrassment.
- The **specific issue / diagnosis** — "your brakes are shot" is private.
- The **physical location / bay** — *the "where"* you flagged: revealing where a specific car sits is a security risk (someone could walk to it). Theme B's bay detail stays on the **admin** board only.

**Identifier granularity is a per-tenant choice**, defaulting to the most private:
1. Claim code `A-14` (default, zero PII) →
2. Car only: `Silver Vios` (no plate) →
3. First name + last initial: `Juan D.` →
4. Masked plate: `ABC ••12`.
Plus a **per-customer opt-out**: their car shows as a generic "in service" with code only, or is hidden entirely (shop's choice).

### O1 — Lounge display surface (read-only, Realtime) 🔎
A locked-down kiosk view that auto-refreshes as statuses change.
- **Backend:** a server-side **lounge projection** that strips each WO to the allowed fields only — the full board is *never* sent to the device (defense in depth: a stolen/snooped lounge TV only ever held the filtered view). A dedicated **display token / kiosk session** scoped to the tenant, read-only, no admin reachability, auto-reconnect. Realtime subscription drives tile updates.
- **Backend entities:** `WorkOrder.claim_code` (short, per-day, human-friendly); `LoungeDisplayConfig` per tenant (identifier granularity, show-mechanic, show-eta, show-progress, idle-mode content); `Customer.lounge_optout` (or `WorkOrder.lounge_visible`).

### O2 — "Ready for pickup" emphasis 🔎
The one state that earns the screen its keep — a car flipping to **Ready** animates/highlights so the owner notices from across the lounge (optional chime).

### O3 — Idle / ambient mode 🔎
When the lounge is empty or to fill space: shop branding, today's promos, the works gallery (H1), hours, Wi-Fi password, safety notes — a brand moment, not a blank screen.

### Theme O — open questions
- **Default identifier:** claim code (most private) vs car make/model/color (most *recognizable* without a ticket). *Lean: claim code default, shop can switch to car description.*
- **Consent model:** opt-out (on by default, customer can hide) vs opt-in (off by default)? *Lean: opt-out with the privacy-safe claim-code default — low risk, high utility; offer a visible "hide me" path.*
- **Relationship to the public web queue (§9 / website):** the lounge screen is the *on-premises, near-real-time* cousin of the public *remote* wait page — share the projection logic, differ on freshness + identifier (the web page is fully public → even more reduced).
- Multiple screens / orientation (portrait wall-mount vs landscape TV) — a UI concern for the brief.

---

## Theme P — Diagnosis Trust & Transparency (the drop-off trust problem) 🔎  ⭐

**Vision.** The deepest fear in auto repair — in PH especially — is *"niloloko ako: gumagawa sila ng sira para may palitan."* (the mechanic invents work / over-recommends parts to upsell). This is **the** problem ShopTrace exists to solve. Win the **found-issue / recommend-replacement moment** with *proof rituals + human accountability*, and use AI **only to amplify that transparency — never to sit in judgment of the mechanic, never to gate the flow.**

**Priority:** the proof rituals (PT1–PT6) are **high-value, P2/P3**, mostly already seeded (Issue capture §12.8 / Brief 5, D1 inspection, D3 staff, Brief 7 approvals). The AI augmentations (PT7–PT11) are **P3, opt-in, guardrailed.** *(Items use `PT#` to avoid clashing with process-gap `P#`.)*

### The proof rituals (no AI needed — cheaper, more reliable, on-thesis)
- **PT1 — Show, don't tell.** A recommendation isn't valid without a photo/short video of the *actual* part on *this* car (plate/context in frame), in situ, before/after. Extends `Issue` (§12.8) + Brief 5. This alone defeats most distrust.
- **PT2 — Return/show the old part ("balik ang lumang piyesa").** Log *old part offered/returned* + a photo of the removed part. A powerful, culturally-rooted PH trust ritual — digitize and reinforce it.
- **PT3 — Measurement vs spec (objective, not opinion).** Capture the number against the standard: pad 2mm vs 3mm threshold, tread vs 1.6mm legal limit, battery voltage, DTC code. Objective anchors beat "trust me."
- **PT4 — Standardized inspection (no cherry-picking).** A consistent multi-point inspection (ties D1) so findings look *systematic*, not invented per customer — "we check these points every time."
- **PT5 — History trend on findings.** "Last visit pads 5mm → now 3mm." The car's own history makes a recommendation credible and non-arbitrary.
- **PT6 — Named mechanic + safe, easy decline.** Staff profile (D3) on the finding; declining is one tap and non-pushy (Brief 7), with "ask a question" / second-opinion. Trust grows when *declining is easy*.

### AI — the careful part
> **Hard rule (the answer to "AI fact-checker?"): NO AI judge, NO AI gate.** Do **not** build an AI that tells the customer whether the mechanic is right/wrong, or that must approve a finding before it proceeds. Why it's complex *and* risky:
> 1. **Liability** — a wrong AI "confirm" (says a bad brake is fine) is a safety/legal exposure; a wrong AI "reject" undermines a correct mechanic and creates disputes.
> 2. **A photo can't actually verify reality** — internal wear, intermittent electrical faults, noises, drivability symptoms aren't visible; vision models give *false confidence* / hallucinate.
> 3. **Adversarial + gameable** — an AI gatekeeper makes mechanics (our **highest reversion risk**, KISS) photograph to satisfy a bot, not the customer; they'll resent being graded by a machine.
> 4. **Off-thesis** — we build trust through *human accountability + proof*, not "trust the robot over your mechanic."

**Safe AI uses (all P3, optional, advisor/owner-reviewed, never authoritative, never blocking):**
- **PT7 — Customer explainer (translation, not judgment).** Turn the mechanic's terse finding + photo into plain Taglish the customer understands ("manipis na ang brake pad ninyo, 2mm na lang"). It *explains the shop's finding*, never contradicts it; advisor reviews before send.
- **PT8 — Mechanic evidence-coach (private, pre-customer).** Nudge the *evidence*, not the *diagnosis*: "marked urgent but no photo / no recommended action — add one?" Improves proof quality; not a truth oracle; not a hard gate.
- **PT9 — Owner anomaly signal (audit, not customer).** Pattern-level, **owner-only**, morale-sensitive (like M4): "mechanic X recommends part Y at 3× shop average → review." Never customer-facing, never blocks a job; framed as coaching.
- **PT10 — Reference anchoring.** Surface a *general* service interval/standard to contextualize a finding ("typical replacement ~X km / Y mm"). Sourced facts, not AI opinion. ⚠️ Respect the OEM IP caveat (A4) — general specs only, never pooled copyrighted manuals.
- **PT11 — Diagnosis aid for the mechanic (decision support).** From symptoms/DTCs, AI *suggests* likely causes to help (esp. junior) mechanics. Human decides; never shown to the customer as "the AI agrees."

### Theme P — open questions
- Does PT2 (return old part) need a customer acknowledgment ("old part returned/declined")? (Lean: yes, one tap, audited.)
- PT7 customer explainer: always advisor-reviewed before send, or auto-send for low-severity? (Lean: always reviewed at first; the trust cost of a bad auto-explanation is high.)
- PT9 anomaly signal: surface to the mechanic themselves (self-correct) or strictly owner-only? (Lean: owner-only first.)
- **Backend notes:** `Issue` gains measurement fields (`value`, `unit`, `threshold`, `dtc_code`) + `old_part_returned` flag + removed-part photo; AI outputs are stored as **editable drafts/suggestions**, flagged AI-generated, never as the authoritative finding.

---

## Persona Refinements & Journey Gaps 🔎

**Purpose.** A finer-grained sweep than the themes above — per persona, split into **Major** (real capability), **Polish** (small UX win on an existing feature), **Nice-to-have** (delight add-on), and **Journey gaps** (a step in a real flow we don't yet handle). Most are P2/P3. Codes are referenceable (e.g. `MEC-J2`).

### Mechanic (in the bay)
**Major**
- `MEC-1` Parts request from the bay — "I need this part" routes to advisor/parts (ties L2) without leaving the job.
- `MEC-2` Escalate / request help from a senior mechanic; reassign or co-assign a job (ties MEC-J4).
- `MEC-3` Job pause/resume with a reason (waiting on parts / customer / lift / sublet) — feeds blocker states + honest wait (Theme N).

**Polish**
- `MEC-4` Big "next required step" focus mode; required photos unmistakable (already a Brief-4 ask — track here).
- `MEC-5` Haptic/sound confirmation on capture (gloves, dim bay); in-app flashlight toggle.
- `MEC-6` Taglish quick-note presets + per-checklist-item voice note (extends F6).
- `MEC-7` "Reference look" photo for a step before starting (ties Theme A3 visual guides).

**Nice-to-have**
- `MEC-8` Quick reference: torque specs / fluid capacities per vehicle (ties Theme A1).
- `MEC-9` Flag a missing/broken shop tool → owner sees (small ops signal).
- `MEC-10` Personal "my work today" recap (jobs done, photos taken) — pride, not surveillance.

**Journey gaps**
- `MEC-J1` Working several jobs at once (real) — fast context-switch between active jobs.
- `MEC-J2` End-of-shift handoff — a half-done job passed to the next shift with state + notes.
- `MEC-J3` Assigned a job that isn't really theirs — decline/reassign path.
- `MEC-J4` Can't complete (needs senior/specialist) — explicit escalation, job keeps moving.

### Advisor / Front desk
**Major**
- `ADV-1` Clone / re-quote last job for a returning customer (intake in seconds; ties F4/F5).
- `ADV-2` Bulk queue actions (assign mechanic, send update, change lane) for a busy board.
- `ADV-3` Internal staff notes / shift-handover log on the shop (not the WO) — who's covering what.

**Polish**
- `ADV-4` Command palette / keyboard shortcuts for power users on the desktop board.
- `ADV-5` Click-to-call that logs the call against the WO (ties G7); one-tap "send gate pass."
- `ADV-6` Saved queue views/filters (by mechanic, by lane, by overdue).

**Nice-to-have**
- `ADV-7` Sound/desktop alert on new Pending Intake (don't miss a walk-in/inquiry).
- `ADV-8` "Today at a glance" strip (jobs in, due out, money to collect).

**Journey gaps**
- `ADV-J1` Multiple advisors — who *owns* a job (claim/assignment) to avoid double-handling.
- `ADV-J2` Covering for an absent advisor — handover without losing context.
- `ADV-J3` Handling an angry/walk-in escalation while running the board — triage/priority bump.
- `ADV-J4` Role-collapse: the advisor is *also* the mechanic and owner (solo shop) — one-person mode (ties OWN-J1).

### Owner / Manager
**Major**
- `OWN-1` Receivables & cash-flow dashboard — outstanding/utang + insurer aging (ties P22, K).
- `OWN-2` Targets vs actuals (revenue/jobs goals) with simple progress.
- `OWN-3` Anomaly/trust alerts — unusual discount, void/refund, after-hours access, force-release (fraud/trust; ties audit L9).
- `OWN-4` Export to accountant (CSV/Excel) — **export, never issue** (BIR-safe, §16.7); the bridge to their bookkeeper.

**Polish**
- `OWN-5` Morning briefing (AM digest) to complement the EOD report (F3).
- `OWN-6` Owner PWA / mobile oversight — approvals + numbers on the go.
- `OWN-7` Per-staff scoped permissions fine-tuning (who can discount, refund, release).

**Nice-to-have**
- `OWN-8` Benchmark vs own past periods ("this month vs last") even for single shop.
- `OWN-9` Shareable owner snapshot (a clean monthly summary they can keep).

**Journey gaps**
- `OWN-J1` Solo owner = advisor + mechanic + cashier — collapsed-role UX that isn't overwhelming.
- `OWN-J2` Remote oversight while traveling — approvals, alerts, no on-site presence.
- `OWN-J3` Opening a new branch — clone settings/catalog/templates from an existing shop (ties §36).
- `OWN-J4` Offboarding staff — revoke access + reassign their open jobs + preserve audit (ties P-gaps).
- `OWN-J5` Owner override / break-glass with reason, always audited (ties P17).

### Customer
**Major**
- `CUS-1` Self-service booking (ties Theme N) — pick a slot from the portal/website.
- `CUS-2` Multi-vehicle view — one customer, all their cars + each one's history (ties D5/§11).
- `CUS-3` Request additional work mid-job from the portal (customer-initiated upsell → advisor prices it).
- `CUS-4` Formal dispute/complaint path — a structured "I have an issue with this" that the owner sees (ties SYS-2).

**Polish**
- `CUS-5` Progress %, estimated completion / countdown, and a celebratory "done & released" state.
- `CUS-6` Channel preference for "notify me when ready" (SMS vs Messenger); EN/Taglish toggle.
- `CUS-7` Save shop to home screen (PWA); add next-service to phone calendar.

**Nice-to-have**
- `CUS-8` Kudos to a specific mechanic ("salamat Kuya Jun!") — ties staff profiles (D3) + morale.
- `CUS-9` Rate aspects (cleanliness, communication, value), not just stars (richer CSAT, ties C2).
- `CUS-10` Payment history / saved GCash references for the customer's own record.

**Journey gaps**
- `CUS-J1` The customer who never opens the link (low digital literacy / no smartphone) — call fallback + advisor-assisted mode that still logs proof.
- `CUS-J2` Assisted/elderly mode — advisor walks them through approval in person, captured properly.
- `CUS-J3` Ownership transfer / sold the car — history survives, prior-owner PII governed (ties D5, P26).
- `CUS-J4` After-hours pickup — release flow when staff aren't present (ties P38).
- `CUS-J5` Someone other than the owner drops off / picks up (ties P38 release auth).

### Cross-cutting / System
**Major**
- `SYS-1` Internal staff notifications — new approval received, new customer message, job assigned, intake waiting (the staff-side of the channel engine, L2).
- `SYS-2` Comeback/complaint & QC workflow — final-check role + structured comeback handling (ties P3 + M4 quality).
- `SYS-3` Data export / account portability — the shop owns and can take its data (trust + DPA).

**Polish**
- `SYS-4` Proof-photo annotation/markup (draw to point at the issue) + before/after slider (ties §10.5, §13).
- `SYS-5` Tags/labels on work orders (e.g., "warranty", "fleet", "VIP", "comeback") for filtering + reporting.
- `SYS-6` Scheduled report emails + custom date ranges (ties §20).

**Nice-to-have**
- `SYS-7` Walk-around video inspection (short clip at intake) — modern trust signal (extends D1).
- `SYS-8` In-app changelog / "what's new" so shops discover features without a sales touch (ties Theme I hints).

**Journey gaps**
- `SYS-J1` Notification a customer truly can't receive (bad number, no Messenger) — detect + fall back to a call task for the advisor.
- `SYS-J2` Concurrent edit — two staff edit the same WO at once (last-write-wins vs lock vs merge).
- `SYS-J3` Partial outage — gateway down (SMS/Messenger) — queue + retry + visible "delivery delayed" rather than silent loss (ties L2/P8).

---

## Running Idea Log

Newest first. Drop quick ideas here; I'll assess and slot them into a theme.

- _(add ideas as they come — "i'll keep giving my ideas")_

---

## Graduation Checklist (idea → PRD)

Before an item moves into `prd.md`:
1. Core MVP validated (don't expand an unproven base).
2. Clear user + job-to-be-done + KISS scope.
3. Fits the data model / template system without a rewrite.
4. No legal/IP/privacy blocker (see A4).
5. Assigned a priority (P2/P3) and a PRD home section.
