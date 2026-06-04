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
