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

## Theme B — Visual Bay & Car Status (Queue Board UX) 🔎

**Vision.** Make the admin queue board feel like a live shop floor: cars and bays reflect their current job status visually, progress within a bay is obvious at a glance, and transitions between bays feel intentional and trackable — not just a status tag on a card.

**Priority:** P2 — post-MVP queue UX enrichment. Requires the core queue loop to be stable and at least one real shop's bay layout as reference. Builds on the queue board (Brief 1 / §9) and the car silhouettes from A5.

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

### Theme B — open questions
- Does the shop configure its own bay layout (number + type), or does ShopTrace provide a fixed default? (Recommend: configurable, seeded with a sensible default at onboarding.)
- Is bay assignment mandatory (every WO must be in a bay) or optional (bays are a richer feature some shops use, some don't)? (Recommend: optional — feature-toggle, absence degrades gracefully to current card-based queue.)
- Does the mechanic app show the bay map too, or is it strictly the advisor's view?
- How do multi-lift bays work? (Two cars on the same lift is physically impossible; one lift = one bay slot.)

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
