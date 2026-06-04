# ShopTrace — Product Requirements Document

**Version:** 1.8  
**Date:** 2026-06-02  
**Status:** Authoritative — Section 0 decisions confirmed  
**Source:** Merged from v1 draft + v2 revision  
**Naming:** *ShopTrace* is the product/platform. *AutoLounge* is used throughout only as the example/pilot shop (tenant #1).  

---

## Section 0: Blocking Decisions — All Confirmed

These decisions were pulled out of "open questions" because they block data model and stack design work. All five are now resolved.

| # | Decision | Resolved Answer |
|---|----------|-----------------|
| D1 | **Bespoke for the pilot shop (AutoLounge), or SaaS from day one?** | **Bespoke-first, SaaS-aware.** Build ShopTrace for the pilot shop (AutoLounge), but include `tenant_id` on every table from day one so multi-tenancy is a config change, not a rewrite. |
| D2 | **One stack, committed once.** | **MVP and v1 on Supabase Cloud** (Postgres + Auth + Storage + Realtime). Local edge mode is a premium add-on, deferred. This avoids two throwaway rewrites. |
| D3 | **Notifications are MVP, not P3.** | **At least one push channel ships in the MVP** — one-tap "send link / approval request" via a low-cost PH SMS gateway (Semaphore / Movider) or a copy-to-Messenger clipboard action with pre-built EN/Taglish templates. |
| D4 | **Photo discipline policy.** | **Minimum required set of 3–4 photos per service template gates "mark job done."** Everything beyond that is optional. Required-photo skips must include an explicit reason; they are never silent. |
| D5 | **Customer ↔ vehicle relationship.** | **One customer → many vehicles. Ownership is time-bound** via a `VehicleOwnership` join (from/to dates). History survives a sale. Prior-owner PII governed by retention rules. |

---

## 1. Product Name

**ShopTrace** — the platform/product sold to auto shops.

*AutoLounge* is the pilot shop (tenant #1) and is used as the example shop throughout this document. A future consumer-facing product is branded *"[app name] by ShopTrace"* (Section 34).

Earlier working-name candidates (historical): AutoLounge Service Hub · ServiceTrack PH · JobProof Auto · GarageFlow PH · AutoProof Hub · LoungeOps.

---

## 2. Product Vision

ShopTrace is a digital operations and transparency platform for auto shops. It helps shops manage job queues, work orders, mechanic proof photos, customer approvals, payments, vehicle history, PMS reminders, and service reports — while still supporting familiar workflows like walk-ins, Messenger, phone calls, and paper job orders.

The product should make the shop feel more professional to customers without forcing staff and mechanics into a complicated enterprise system.

---

## 3. Core Product Thesis

Auto shops do not only need a website. They need a simple way to show customers what is happening to their vehicle, document work properly, reduce repetitive update requests, and turn every completed job into searchable customer and vehicle history.

The system should answer four questions:

1. **For customers:** What is happening to my car right now?
2. **For mechanics:** What do I need to inspect, photograph, and complete?
3. **For staff/admin:** Which jobs need action, approval, payment, or follow-up?
4. **For owners:** Which customers, vehicles, services, promos, and jobs are producing repeat business?

### 3.1 Assumptions This Thesis Depends On

The thesis is currently a hypothesis, not a proven fact. Before heavy build, validate:

- **A1 — Demand:** Customers actually want live tracking and will open a link, rather than just messaging on Messenger. *(Highest-risk assumption.)*
- **A2 — Pain size:** "Repetitive update requests" cost the shop enough time to justify the product. Quantify it: count update messages per day for two weeks.
- **A3 — Mechanic compliance:** Mechanics will reliably take the required photos under time pressure (see D4).
- **A4 — Channel fit:** A web portal can coexist with Messenger without feeling like an extra step.

If A1 or A3 fail, the product needs rethinking, not more features. These are explicitly what the MVP and technical spike exist to test.

---

## 4. Success Metrics and Validation

### 4.1 Product Success Metrics (MVP)

- **Adoption:** ≥ 60% of customers sent a tracking link open it at least once.
- **Approval loop:** ≥ 50% of "issue found" approvals completed in the portal (vs falling back to Messenger/phone).
- **Update reduction:** Measurable drop in "what's the status of my car?" messages vs two-week pre-launch baseline (target: −30%).
- **Mechanic compliance:** ≥ 90% of completed jobs have the full required photo set.
- **Status accuracy:** Median lag between real-world status change and system status update < 30 minutes during normal operation.

### 4.2 Validation Sequence

1. Run the **photo-flow technical spike** (Section 28) — pass/fail on hardware reliability.
2. Run a **2-week paper-baseline study** at AutoLounge — count update messages and time spent.
3. Pilot the MVP on **real jobs at one shop** for 4 weeks; measure against Section 4.1.
4. Only then decide SaaS packaging (D1) with evidence.

### 4.3 Metrics Instrumentation (new — you can't measure 4.1 without it)

The success metrics in 4.1 are unmeasurable unless the events are captured. Instrument from day one:

- **Event tracking** for the key funnel moments: `tracking_link_sent`, `tracking_link_opened`, `approval_sent`, `approval_answered_in_portal` vs `answered_offline`, `payment_proof_uploaded`, `job_released`, `reminder_sent`. These directly compute adoption, approval-loop, and update-reduction metrics.
- **Status-change timestamps** already feed completion-time and status-accuracy (10.3, 20). 
- **Lightweight, privacy-respecting:** first-party event log in Postgres (not a third-party tracker that leaks PII); Sentry for errors only.
- A small **metrics view/dashboard** so the pilot can be read against 4.1 without manual log-digging.

---

## 5. Target Users

### 5.1 Customer

Walk-in, repeat PMS customer, enthusiast, repair customer, or prospective visitor.

**Goals:**
- Check if the shop has a queue before going
- Track their vehicle while it is being serviced
- See proof photos of completed work
- Understand additional issues found during inspection
- Approve or decline additional work
- See estimate and final cost clearly
- Pay through cash, GCash, bank transfer, or other available method
- Receive PMS reminders or service follow-ups

### 5.2 Front Desk / Service Advisor / Admin Staff

**Goals:**
- Create work orders quickly
- Assign jobs to mechanics
- Print paper job orders if needed
- Update job status
- Review mechanic photos before showing them to customers
- Prepare estimates and final bills
- Send tracking links
- Verify payments
- Schedule PMS reminders
- Export reports for records, accounting, and tracking

### 5.3 Mechanic / Technician

**Goals:**
- See assigned jobs
- Follow a simple checklist
- Take required photos
- Upload scan results
- Add newly discovered issues
- Mark checklist items done, not applicable, or needs attention
- Work fast without excessive typing

### 5.4 Owner / Manager

**Goals:**
- See queue and active jobs
- Monitor job status and mechanic progress
- Track payments and pending approvals
- See PMS reminders and promo opportunities
- Review service history
- Manage discounts and promos
- Export operational and payment reports
- Improve repeat visits and customer trust

> **Small-shop reality:** In many target shops one person is the owner, advisor, and cashier. The role model must allow one user to hold multiple roles, not assume four separate people.

---

## 6. Product Principles

1. **Faster than paper where it matters.** The mechanic workflow must not feel slower than paper — accepting that photos add time, so the required photo set is deliberately minimal (D4).
2. **Paper-friendly, not paper-hostile.** Support printable job orders and signatures.
3. **Customer transparency with staff control.** Customers see proof and progress, but only approved customer-visible information.
4. **No customer app required.** Customers open a private link on their phone.
5. **The portal must be reachable.** Transparency is worthless if the customer is never notified. A notification channel is part of the core loop, not an add-on (D3).
6. **Queue-first visibility.** Help customers decide when to visit and help staff manage walk-ins.
7. **Local-shop realistic.** Fit PH workflows: walk-ins, Messenger, GCash, bank transfer, paper backup, unstable internet, affordable Android tablets, Taglish-speaking users.
8. **Buildable first, expandable later.** Start with job tracking, proof, approvals, notifications, and reminders before full inventory/accounting automation.
9. **Proof you can trust.** If "proof" is the brand promise, the integrity of that proof must be designed for, not assumed (Section 19).
10. **A no-brainer to adopt (KISS).** A shop must be able to sign up and create its first real work order in minutes, with zero configuration, on sensible defaults. Complexity is opt-in: every advanced capability ships behind a toggle that is hidden until switched on, so the app is "stupid simple by default, powerful when you need it" (Section 33).

---

## 7. Product Scope Overview

Seven major surfaces:

1. Public Website / Shop Page
2. Queue and Availability Tracker
3. Admin Work Order System
4. Mechanic Tablet App
5. Customer Tracking Portal
6. Notifications & Communication
7. Retention, Promos, and Reporting Tools

All seven surfaces sit on top of a per-tenant configuration layer (sign-up, onboarding wizard, branding, and feature toggles) that makes the product self-serve and white-label — see Section 33.

---

## 8. Public Website / Shop Page

### 8.1 Purpose

Not the main product, but helps customers understand services, see credibility, and start the right flow.

### 8.2 Key Features

**Shop Identity Page**
- Business name
- Location and address
- Contact details (phone, Messenger, email)
- Operating hours
- Social media links
- Map link (Google Maps / Waze)
- Featured services
- Recent work gallery preview
- Lounge/cafe/billiards experience if relevant

**Services Page**

Service categories:
- PMS / change oil
- Diagnostics
- General repair
- Brake service
- Suspension / underchassis
- Battery
- Tires / mags
- Accessories
- Mods / upgrades
- Auto supply
- Detailing / cleaning (if offered)

Each service page includes:
- What the service is
- When the customer needs it
- What info to prepare
- Estimated duration if known
- Starting price or "message/ask for quote"
- Call to action: check queue, ask inquiry, or create pre-service request

**Works Gallery**
- Filter by service type
- Before/after photos
- Customer builds
- PMS work
- Repairs
- Mods/upgrades
- Auto sports / events
- Customer-visible proof examples

**Auto Supply Catalog** *(MVP is not full e-commerce)*
- Product category listing
- Product name
- Brand
- Fitment notes
- Availability status
- "Ask availability" button
- "Reserve/inquire" button

### 8.3 Pre-Service Intake Form

*(Structured form with a Messenger-message generator, not an AI assistant — avoid over-promising in naming.)*

Customer enters:
- Name
- Contact number
- Vehicle brand/model/year
- Plate number (optional)
- Mileage
- Service needed
- Concern/request
- Preferred visit date/time
- Consent for reminders/promos

Output:
- Draft inquiry summary
- Messenger-ready message the customer can copy
- Pending inquiry created in the admin dashboard

### 8.4 Works Gallery Approval Flow

Before a job photo appears in the public gallery:

1. Mechanic takes "beauty shot" or "finished result" photo during the job
2. Admin reviews and selects photos eligible for gallery promotion
3. Admin obtains or confirms customer consent for gallery use (separate from service proof consent — Section 22)
4. Admin publishes to gallery with service type tags
5. Customer can request removal at any time

---

## 9. Queue and Availability Tracker

### 9.1 Purpose

Customers should know whether the shop is busy before visiting. Staff should see active jobs and walk-ins clearly. This is a headline differentiator — its rules are specified here rather than left open.

### 9.2 Resolved Design Rules

- **Public display granularity:** Show a band (Light / Moderate / Busy / Near closing / Closed), not an exact vehicle count. Bands are more forgiving of staleness and reveal less operational detail to competitors.
- **Wait-time source:** Hybrid. A baseline estimate is calculated from active jobs × per-service-type average duration; staff can manually override with a one-tap "busier/quieter than usual" adjustment. Until enough history exists, seed durations from staff estimates and refine from actuals.
- **Staleness guard:** If no status update has occurred in N minutes during open hours, the public page shows "status may be outdated" rather than a confident wrong number. This protects trust in the feature.
- **Remote join:** Off in MVP. Remote join creates no-show and walk-in-vs-remote ordering problems (Section 18.3). Start with "message before visiting"; add a request-slot flow later if demand is proven.
- **Service-type lanes:** Support a simple split between quick (PMS/oil) and major (repair) so a 20-minute oil change is not stuck behind an all-day rebuild in the wait estimate.

### 9.3 Customer-Facing Queue Page

- Current status band
- Estimated wait time (with staleness guard and "updated N min ago" label)
- Vehicles in queue (as a band, e.g., "Several vehicles ahead")
- Vehicles in service
- Available bays (optional)
- Suggested visit time
- "Message before visiting" CTA

> *Example: Current status: Busy · Several vehicles ahead · Est. wait ~1.5–2 hrs · Best time to visit: after 3:00 PM · (updated 6 min ago)*

### 9.4 Admin Queue Board

**Manage lanes:**
- Walk-ins
- Scheduled jobs
- Ongoing jobs
- Waiting for approval
- Ready for release
- Released jobs

**Full status list (13 states, every change timestamped):**

| # | Status |
|---|--------|
| 1 | New inquiry |
| 2 | Walk-in queued |
| 3 | For inspection |
| 4 | Inspection in progress |
| 5 | Waiting for customer approval |
| 6 | Approved |
| 7 | In progress |
| 8 | Waiting for parts |
| 9 | Final checking |
| 10 | Ready for release |
| 11 | Payment pending |
| 12 | Released |
| 13 | Cancelled |

> Disciplined timestamping on every status change is what makes "average completion time" reports possible. Without it those reports are fiction.

### 9.5 Queue Controls

Admin actions:
- Add vehicle to queue
- Change priority
- Assign mechanic(s)
- Estimate wait time
- Pause intake
- Mark shop busy / open / closed
- Send status link to customer

### 9.6 Appointment Booking (P2)

**Booking is distinct from the walk-in queue.** The queue (9.1–9.5) manages who's in the shop *now*; booking lets a customer reserve a *future* slot. They coexist — a booked appointment simply enters the queue at its scheduled time.

- **Customer-facing booking** from the public site / queue page: pick a service type, see available days/time-bands (not exact minute slots in v1), and request a slot. Configurable per shop: instant-confirm vs request-then-confirm.
- **Capacity model (simple):** slots are bounded by service-type lanes (quick vs major, 9.2) and a per-day cap the shop sets — not a complex resource scheduler. Keep it KISS.
- **No-show / reschedule** handling reuses Section 18.3.
- **Booking → work order:** a confirmed booking pre-creates a draft work order with the customer, vehicle, service type, and any customer-supplied media (9.7) already attached, so intake on the day is one tap.
- **Notifications:** booking confirmation + reminder reuse the Section 14 channels (SMS / copy-to-Messenger) with EN/Taglish templates.
- Gated behind a feature toggle (Section 33.6); off by default so walk-in-only shops aren't burdened.

### 9.7 Customer-Supplied Media & Notes (P2)

Customers can attach their own photos, short videos, and notes describing the problem — either in the pre-service intake form (8.3), during booking (9.6), or via the tracking portal before/early in the job — so the mechanic can pre-check the concern (e.g., a video of the noise, a photo of the leak or warning light).

- Flows onto the work order and is shown to the mechanic **alongside the checklist** as a clearly labelled **"Customer-reported concern"** block.
- **Integrity boundary (important):** customer-supplied media is explicitly tagged **customer-supplied** and is **never** mixed with or presented as shop proof photos (Section 19). Different source, different trust level, different label.
- **Storage & abuse controls:** counts toward the media budget (Section 24) — apply the same compression and the video cap (≤30s / 50MB); basic content/type validation; size limits per upload.
- **Privacy:** covered by intake consent (Section 22); customer media is part of the customer's own record.
- Gated behind a feature toggle (Section 33.6).

---

## 10. Admin Work Order System

### 10.1 Purpose

The operational core. Every job becomes a structured record: customer, vehicle, work requested, checklist, photos, approvals, payments, history.

### 10.2 Work Order Creation

**Required fields:**
- Work order number (auto-generated)
- Date/time created
- Customer (linked record — not free text; see Section 11)
- Vehicle (linked record)
- Mileage at intake
- Service type
- Customer complaint/request
- Initial notes
- Assigned mechanic(s)
- Job priority
- Intake source: walk-in / Messenger / phone / website / repeat customer

**Optional fields:**
- Fuel level
- Existing scratches/damage notes
- Intake photos
- Estimated completion time
- Customer waiting or leaving vehicle
- Reminder consent
- Promo consent

### 10.3 Work Order Statuses

Same 13 statuses as queue (Section 9.4). Every change is timestamped with user and timestamp captured in the audit log.

### 10.4 Printable Job Order

Sections:
- Work order number
- Customer details
- Vehicle details
- Complaint/request
- Service checklist
- Parts/labor notes
- Mechanic notes
- Estimate summary
- Customer authorization signature line
- Release signature line

### 10.5 Service History

Each completed work order joins the customer and vehicle history.

Vehicle history shows:
- PMS dates
- Mileage history
- Oil and parts used
- Repairs done
- Mods/upgrades installed
- Issues found
- Declined recommendations
- Payment records
- Photos/proof
- Next PMS due date or mileage
- Linked rework/warranty visits (Section 18.1)

### 10.6 Intake Funnel — Inquiry & Booking Triage (resolves G5)

Three intake paths converge into one funnel so nothing is lost between "customer reached out" and "work order exists."

- **Sources:** walk-in (staff create directly), website/Messenger **inquiry** (§8.3), and **booking** (§9.6). Inquiries and bookings create an `Inquiry` record, not a work order.
- **Pending Intake lane:** inquiries and unconfirmed bookings appear in a **"Pending Intake"** column on the queue board (§9.4). One place to triage.
- **Triage actions:** **Accept** → converts the inquiry into a work order, pre-filling customer, vehicle, service type, concern, and any customer-supplied media (§9.7); **Decline / spam** → closes it with a reason; **Ask a question** → opens a message thread (§14.4) without yet committing to a WO.
- **Conversion is tracked:** the `Inquiry` links to the `WorkOrder` it became (status `converted`), so source-to-job reporting is possible (which channel produces real jobs).
- **Booking day-of check-in (resolves G6):** on the scheduled day, a confirmed booking is promoted from Pending Intake into the active queue with one tap.

### 10.7 Intake UX Details (resolves G11, G22; new gaps)

- **Returning-customer recognition (G11):** as staff type a plate/phone/name, matches surface inline — "Returning customer: Juan dela Cruz · 2 vehicles." One tap pulls the customer + their vehicles + history, instead of re-keying. Built on the dedup search in 11.2.
- **One customer, two vehicles in the shop at once (G22):** a customer can have multiple concurrent open work orders; the queue and customer view show each vehicle as its own job; tracking links are per work order.
- **Plate-less vehicles (new):** PH new cars use a **conduction sticker** before plates are issued. Capture conduction sticker as an alternate vehicle key when plate is absent; reconcile to the real plate later via the merge tool (11.2).
- **Quick / anonymous walk-in (new):** a minimal work order can be created with just a name and contact for a fast job (e.g., a quick top-up), deferring full customer/vehicle records. Tracking and reminders are optional for these.

### 10.8 Global Search (new gap)

A persistent search across **work orders, customers, vehicles (plate/VIN), and inquiries** is core daily UX — "find that Fortuner from last week" must be one action. Implement with Postgres full-text + trigram (fuzzy plate/name match). Available to all staff roles; results are tenant-scoped by RLS.

---

## 11. Data Model

### 11.1 Core Entities

| Entity | Notes |
|--------|-------|
| **Organization** | Groups one or more `Shop` tenants under one owner/operator. Present from day one (nullable / single-shop org by default) so multi-branch is a config change, not a rewrite — mirrors the `tenant_id` decision (D1). Drives cross-branch dashboards (Section 36). |
| **Tenant/Shop (branch)** | Belongs to one Organization. `tenant_id` on every table; `org_id` for cross-branch grouping. |
| **Customer** | Name, contacts, consent flags. |
| **Vehicle** | Make/model/year, plate, VIN if available. |
| **VehicleOwnership** | Links Customer ↔ Vehicle with `from`/`to` dates. History survives a sale (D5). |
| **Inquiry** | A pre-work-order intake from website/Messenger/booking. Status: new / accepted / declined / converted. Links to the `WorkOrder` it becomes (Section 10.6). |
| **WorkOrder** | Belongs to one Vehicle (and via ownership at time of service, one Customer). Has a `locked` flag (Section 21.3) and a `requires_estimate_approval` flag (Section 15.6). |
| **ChecklistTemplate** | Per service type, editable by admin. Template CRUD is a required feature. |
| **PhotoTemplate** | Required/optional photo steps per service type, ordered. |
| **ChecklistItem** | Step within a template: required/optional flag, photo requirement, order. |
| **JobChecklist** | Instance of a template attached to a work order. |
| **JobChecklistItem** | Mechanic's completion state: pending/done/N-A/needs attention/blocked. Includes skip reason if required item is skipped. |
| **Photo** | Linked to a job and optionally a checklist item. Visibility flag: internal-only vs customer-visible. |
| **Issue** | Discovered during inspection. Linked to work order. Goes through admin review before customer sees it. |
| **Estimate / LineItem** | Labor, parts, supplies, discounts. Estimate has an approval state (Section 15.6). |
| **ServiceCatalogItem** | Per-tenant price-book entry (service/part, default price, category). Estimates pick from these (Section 15.7). |
| **EventLog** | First-party product events for success-metric instrumentation (Section 4.3). Distinct from `AuditLog`. |
| **Approval** | Linked to issue or estimate. Records customer response, timestamp, IP, typed name. |
| **Thread / Message** | A two-way message thread scoped to a `WorkOrder` (Section 14.4). Each message has a direction (customer ↔ shop), author, timestamp, channel. |
| **Payment** | Amount, method, reference number, proof photo, verified by, timestamp. Multiple payments roll up against a work order balance (Section 16.8). |
| **Release** | Records vehicle release: by whom, when, payment status at release, and — if released with an outstanding balance — the authorizing manager and reason (Section 16.8). |
| **Deposit** | A payment applied before final billing; reduces the balance on the final bill. |
| **Discount / Promo** | Discount rule, campaign reference. Above-threshold discounts carry an approver (Section 21.3). |
| **Reminder** | PMS reminder linked to customer and vehicle. |
| **Domain** | Per-tenant hostname(s): the default `{shop}.shoptrace.app` plus any verified custom domain (Section 33.8). Fields: `hostname`, `surface` (portal/public), `verified`, `cert_status`. Drives host-aware tenant resolution. |
| **AuditLog** | All significant state changes, including price/work-scope changes with before→after (Section 23.1). |

### 11.2 Identity Resolution (Dedup Problem)

Plate and phone are both mutable, so neither is a perfect key.

- On intake, search existing customers/vehicles by plate, then phone, then name, and prompt staff to **link** rather than create a duplicate.
- **Plate is the primary vehicle match key** in practice. If a shop wants reliable vehicle history, plate should be captured at intake even though it is listed as optional. Flag this trade-off to the shop during onboarding.
- Provide an admin **merge tool** for duplicate customers/vehicles — duplicates will happen.

### 11.3 Parts in the MVP (Structured-Lite)

Fully free-text parts break "parts used" history and "revenue by service type" reports. Compromise:

- Parts entered as line items with **name, optional brand, qty, unit price** — structured fields, no stock tracking.
- A lightweight, growing **parts name autocomplete list** (seeded from past entries) keeps naming consistent without building inventory.
- Upgrades cleanly to full inventory in a later phase (`InventoryItem` / `StockMovement` — see `feature-backlog.md` Theme F1).

### 11.4 Post-MVP Entities (forward seams — not built in MVP)

These are **not** in the MVP schema, but the core tables should leave clean seams for them so adding them later is additive, not a rewrite. Each is fully specified in `docs/feature-backlog.md`; this table is the index so schema work doesn't paint into a corner.

| Future entity | Backlog home | Seam to preserve in MVP |
|---------------|--------------|--------------------------|
| `Bay` / `BayAssignment` | Theme B | Optional `bay_id` on `WorkOrder`; bay history is a derived view |
| Extended `Reminder` (date/mileage basis, types: PMS/checkin/milestone/thankyou) | Theme C, G | `Reminder` already exists (§11.1) — extend, don't replace |
| `Survey` (CSAT) | Theme C2, H2 | Linked to `WorkOrder` + `Customer` |
| `Campaign` / `CampaignRecipient` | Theme C3, G10 | Audience filters read existing `Customer`/`WorkOrder`; opens via `EventLog` |
| `Warranty` | Theme C4 | Linked to `WorkOrder` + `LineItem` + `Vehicle` |
| `Inspection` | Theme D1 | Reuses `Photo` pipeline + damage-map (A5) |
| `EmissionTest` | Theme E2 | Linked to `Vehicle`; feeds `Reminder` |
| `VehicleShareGrant` (token) | Theme D5, F4 | Same sanitized-history exclusions as the partner API |
| `InventoryItem` / `StockMovement` | Theme F1 | Supersedes the §11.3 autocomplete list |
| `FleetAccount` | Theme F2 | `fleet_account_id` on `Vehicle`/`WorkOrder`; reuses credit-release (§16.8) |
| `ServiceBundle` | Theme F5 | References `ServiceCatalogItem` + templates |
| `LoyaltyTier` / `LoyaltyReward` / `LoyaltyGrant`, `Referral` | Theme G5, G6 | Visit count derived from `WorkOrder` history |
| `CustomerNote` + `Customer.preferences` JSON | Theme G8 | Internal-only (RLS); never customer-visible, never in partner API |
| `FeatureDefinition` / `FeatureState` (per-tenant locked/eligible/on) | Theme I1 | Extends the §33 toggle; eligibility is a pure function of tenant data/plan |
| `Milestone` / `MilestoneGrant` (operator + customer gamification) | Theme I3, G5 | One engine, two audiences; conditions off `EventLog`/`WorkOrder` aggregates |

**Cross-cutting rules these all inherit:** `tenant_id` + RLS on every table; channel/notification work routes through the reliability layer (§14.6); anything customer-shareable obeys the partner-API exclusions (`integration-api.md`); everything is feature-toggleable (§33) and off = hidden, data preserved.

---

## 12. Mechanic Tablet App

### 12.1 Purpose

A fast, guided per-job workflow. Behaves like a photo checklist, not an admin dashboard.

### 12.2 Mechanic Home

- Assigned jobs today
- Vehicle name/model
- Work order number
- Service type
- Current status
- Priority indicator
- Start job button

### 12.3 Job Detail

- Vehicle details
- Mileage at intake
- Customer concern/request
- Service checklist
- Required photos with counter ("3 of 4 required done")
- Notes field
- Scan result upload
- "Issue found" button
- Mark inspection complete
- Mark job done (gated on required photos — D4)

### 12.4 Checklist Item States

- Pending
- Done
- Needs attention
- Not applicable
- Waiting for approval
- Blocked

### 12.5 Required Photo Flow Examples

**PMS / Change Oil (full set):**
1. Vehicle front/intake photo
2. Odometer photo
3. Engine bay before work
4. Oil draining
5. Old oil filter removed
6. New oil and filter used (product shot)
7. Air filter condition
8. Cabin filter condition (if checked)
9. Fluid levels
10. Final engine bay photo

**Brake Service:**
1. Wheel before removal
2. Brake pad thickness measurement
3. Rotor condition
4. Old part removed
5. New part installed
6. Final wheel installed

**Underchassis / Suspension:**
1. Vehicle lifted (full underchassis view)
2. Damaged part close-up
3. Old part removed
4. New part installed
5. Final inspection photo

**Mods / Upgrades:**
1. Before photo
2. Part/accessory photo (product shot)
3. Installation process photo
4. Wiring/mounting close-up (if applicable)
5. Finished result
6. Beauty shot (eligible for works gallery)

**Diagnostics:**
1. Vehicle intake photo
2. Odometer
3. OBD connection photo
4. Scan results (screen capture or photo)
5. Dashboard warning lights (if any)
6. Final engine bay or component close-up

### 12.6 Photo Discipline Policy (resolves D4)

- Each service template defines a **minimum required set (3–4 photos)** that **gates "mark job done."** Everything beyond is optional.
- Required vs optional is visually obvious; the app shows a "3 of 4 required done" counter throughout the job.
- If a mechanic cannot take a required photo, they must choose a **reason** (e.g., "not applicable on this vehicle", "equipment not available") — reason captured in the audit log; skips are explicit, never silent.
- The required set is deliberately minimal to maximize compliance under time pressure.

### 12.7 Checklist & Photo Template Management

Admin/owner can:
- Create, edit, clone, and retire checklist and photo templates per service type
- Set which photos are required vs optional
- Reorder steps
- Define valid skip-reason options

This is a required feature, not an afterthought. Every shop has different workflows, and SaaS requires per-tenant templates.

### 12.8 Issue Found Flow

Fields:
- Issue title
- Severity: low / medium / urgent
- Description
- Photos/videos (optional)
- Recommended action
- Parts needed
- Labor estimate *(default: mechanic flags parts, admin sets price)*
- Customer-visible explanation *(separate from internal description)*
- Internal note (optional, never shown to customer)

Admin reviews and approves before sending to customer.

> **Role note:** Mechanics flag the issue and suggest parts; the advisor/admin sets the price by default. Pricing fields are mechanic-editable only if a shop opts in (Section 21).

### 12.9 Scan Results Upload

Upload types:
- OBD scanner photo
- Diagnostic code list
- Scan tool screenshot/photo
- Dashboard warning light video/photo
- Mechanic explanation (text)

Each tagged as **internal-only** or **customer-visible**.

### 12.10 Multi-Mechanic Job Support

For jobs split across technicians:
- Multiple mechanics can be assigned to a single work order
- Checklist steps can optionally be assigned to a specific mechanic
- Each mechanic sees their assigned steps prominently; can view full list
- Photo uploads are attributed to the uploading mechanic
- Admin sees full progress across all assigned mechanics
- Performance reports split by mechanic contribution

### 12.11 Mechanic UX Requirements

- Camera opens in under 3 seconds
- Minimal typing (large tap targets, presets where possible)
- Large buttons — designed for hands with grease and gloves (a tethered passive stylus per station is a cheap mitigation for greasy/gloved capacitive touch)
- Works on affordable Android tablets (tested on target hardware — see Section 28)
- Visible upload status per photo
- Retry failed uploads automatically; surface retry button within 5 seconds of failure
- No silent photo loss
- Clear required vs optional photo indicators
- Works on slow / intermittent Wi-Fi (photos queue and retry automatically)

### 12.12 Photo Capture Method & Device Strategy

**Capture method (committed): native camera via file input, not a custom viewfinder.** Use `<input type="file" accept="image/*" capture="environment">` to hand capture to the device's native camera app, rather than a custom in-app `getUserMedia` viewfinder. Rationale:

- On affordable Android tablets, `getUserMedia` + canvas capture has worse autofocus, worse low-light, and limited exposure control — and it is the path most likely to fail the Section 28 spike. Garage bays are dark and a chassis underside is the worst case.
- The native camera app gives real autofocus/HDR/low-light handling for free, with less code and far higher reliability.
- The trade-off — no custom guide overlay — is handled by showing a **static reference image** ("take a photo like this") on each checklist step screen instead.

**Photo legibility is the real bar.** The goal is not "a photo uploaded" but "the brake-pad thickness / part number / damage is actually readable." This is a hardware + lighting concern as much as software (Section 28.2).

**Device-agnostic capture.** The capture flow is a PWA and must work on any device — a shared shop tablet *or* a mechanic's own phone — via a "claim job" action (scan the work-order QR / tap the assigned job). Mechanics' phones often have markedly better cameras and are always on hand; the shop chooses its device policy without a code change. Shared-device hygiene (PIN re-auth per job, purge-after-sync) applies regardless (Section 27.2, 27.5).

**Pipeline ordering (no silent loss).** Capture → compress client-side (resize ~1600px long edge, ~0.7 quality; test for crashes on low-RAM tablets) → **write to IndexedDB before the UI confirms capture** → enqueue → upload → remove from queue **only after server ack**. Retry fires on three triggers: Background Sync, app foreground, and the `online` event — never Background Sync alone.

### 12.13 Offline UX & Job Handoff (resolves G17, G15)

- **Offline UX (G17):** the mechanic always sees connection state and a persistent **"N items not yet synced"** indicator; each photo shows queued / uploading / synced / failed. On reconnect, the queue drains automatically with visible progress. The mechanic is never blocked from continuing.
- **Job handoff / overnight job (G15):** a job can be **reassigned** or **shared** to another mechanic (multi-mechanic, 12.10). Handoff records who owns it now; the incoming mechanic sees what's done vs pending and the prior mechanic's photos/notes. Overnight jobs simply persist with their state; an end-of-day view shows jobs carried over.
- **Approval → resume (G16):** when admin approves added work or an estimate, the assigned mechanic gets a "cleared to continue" notification and the step unblocks (15.6).

---

## 13. Customer Tracking Portal

### 13.1 Purpose

A private link to view status, checklist progress, approved proof photos, issues found, estimate, final bill, and payment instructions. No app download required.

### 13.2 Access Model

Link format: `https://{shop}.shoptrace.app/track/{secure-token}` (or the shop's own domain if the custom-domain add-on is enabled — Section 33.8)

Security:
- Random unguessable token (UUID v4 or similar)
- **PIN (last 4 digits of phone number) — strongly recommended on by default**, because the link carries personal data and may be forwarded accidentally
- Rate-limited failed PIN attempts
- Configurable expiry after job release
- Customer sees only approved, customer-visible data

### 13.3 Portal Sections

**Job Summary**
- Shop name and contact
- Work order number
- Vehicle (make/model/year)
- Service type
- Current status
- Estimated completion time (optional)

**Status Timeline**

Displayed as a step indicator:
1. Received
2. For inspection
3. Inspection complete
4. Waiting for approval
5. Approved
6. In progress
7. Final checking
8. Ready for release
9. Released

**Checklist Progress (simplified)**

Customers see a simplified summary, not the full mechanic checklist. Example:
- Odometer recorded — Done
- Oil change — Done
- Filter replacement — Done
- Brake check — Pending
- Final inspection — Pending

**Proof Photos (approved only)**

Categories shown:
- Before (intake)
- During service
- Parts replaced
- Issues found
- Scan results
- Completed work
- Final result

**Issues Found & Approvals**

Each issue shows:
- Issue title
- Customer-facing explanation (not the raw mechanic note)
- Photos
- Recommended action
- Additional cost
- Action buttons

Customer actions:
- **Approve**
- **Decline for now**
- **Ask a question** (opens a message thread)

Approval records: customer typed name + date/time + device/IP + approved/declined items (Section 15.4).

**Estimate**
- Labor items
- Parts items
- Shop supplies
- Discounts
- Estimated total
- Approval status

**Final Bill**
- Final labor
- Final parts
- Discounts/promos
- Deposit applied
- Amount paid
- Balance
- Total due

**Payment Instructions**

Supported v1 methods:
- Cash (collect at release)
- GCash QR code / manual number and name
- Bank transfer details
- Card terminal reference (if applicable)

Customer can:
- Upload proof of payment (screenshot/photo)
- Add reference number
- Send a message to the shop

**Release Sign-Off**

Customer acknowledges:
- Work completed as described
- Final cost shown
- Vehicle released
- Payment status
- Recommendations noted / declined

---

## 14. Notifications & Communication

The approval and tracking loops are worthless if the customer is never notified. This is core functionality, not a Phase 2 add-on.

### 14.1 MVP — At Least One Working Channel

**One-tap "send tracking link"** and **"send approval request"** from the admin work order view, via:

- **Primary: SMS** through a low-cost PH gateway (Semaphore or Movider — confirm pricing and reliability before build)
- **Fallback: Copy-to-Messenger** action that places a prewritten message on the clipboard for the advisor to paste into Messenger manually

Every customer-facing event has a **prebuilt template** in both English and Taglish (editable by admin):

| Event | Recipient | Default Channel |
|-------|-----------|-----------------|
| Tracking link created | Customer | SMS / Copy-Messenger |
| Approval request sent | Customer | SMS / Copy-Messenger |
| Approval timeout warning | Admin | In-app flag on queue board |
| Job status: ready for release | Customer | SMS / Copy-Messenger |
| Payment verified | Customer | SMS / Copy-Messenger |
| PMS reminder due | Admin reminder queue → Customer | Manual copy or SMS |

### 14.2 Approval Timeout / Escalation

An approval request has a state and an age. If unanswered past a configurable window (default: 2 hours):

1. Work order is flagged **"awaiting customer — bay may be blocked"** on the admin queue board
2. Admin is prompted to follow up (call the customer)
3. Admin can manually choose: approve on behalf / decline / hold indefinitely

This directly addresses the real cost of a car occupying a bay while the customer is unreachable.

### 14.3 Phase 2/3

- Automated SMS send (no staff action needed)
- Email reminders
- Messenger integration (scoped — see 14.5)
- Delivery/read status tracking
- Opt-out management

### 14.4 Customer Messaging — Two-Way Threads (resolves G4)

Several features ("Ask a question" on an approval, "message the shop" after payment, inquiry replies) assume a messaging channel. This defines it — deliberately **as a lightweight per-work-order thread, not a standalone chat product.**

- **Scope:** a `Thread` is attached to a `WorkOrder` (or to an `Inquiry` before a WO exists). Messages are `customer ↔ shop`, async, with author/timestamp/channel.
- **Customer side:** sends from the tracking portal ("Ask a question" / "message the shop"). No login — the secure token + PIN already gates the portal (13.2).
- **Staff side:** inbound messages appear on the work order **and** in the Action Center (Section 35) with an unread indicator; staff reply with templates (EN/Taglish). Inbound customer message → staff notification.
- **No real-time chat infra** in v1 — polling/refresh is fine; this is async support, not live chat.
- **Audit & privacy:** messages are part of the WO record; covered by intake consent (Section 22).

### 14.5 Messenger Integration — Scoped (Phase 2)

Full Messenger API integration is **possible but constrained**, so it is scoped, not open-ended. The hard limit is Meta's **24-hour messaging window**: outside 24 hours of the customer's last message to the Page, only a few approved message tags are allowed — cold re-engagement (e.g., PMS reminders months later) is **not** permitted.

- **MVP stays copy-to-Messenger** (clipboard) — zero integration, zero policy risk; staff already work from their Page inbox.
- **Phase 2 = inbound-triggered + click-to-Messenger only:**
  - **Click-to-Messenger** on the website (m.me / plugin) starts an inquiry → lands as **Pending Intake** (Section 10.6).
  - When a customer messages the Page, the 24h window opens → ShopTrace can send the tracking link and replies **within that window** via the API.
- **Never use Messenger for cold PMS reminders → use SMS** (Section 17).
- **Per-tenant setup cost:** each shop connects its own Facebook Page (OAuth, page tokens, Meta app review). Flag this as real, ongoing maintenance before committing.

### 14.6 Notification Reliability (resolves G13, G7)

- **Send-failure handling (G13):** every send has a status (`sent / delivered / failed`). On SMS failure, staff are prompted in the Action Center with a one-tap **fallback to copy-to-Messenger** (or retry). No message silently fails.
- **Tracking-link non-open follow-up (G7):** if a tracking link is unopened after a configurable window and the job needs the customer's attention (e.g., approval pending), it surfaces in the Action Center as "customer hasn't opened link — follow up." This reuses the escalation pattern (14.2) for the link itself, not just approvals.
- **Quiet hours & dedupe:** don't fire reminders/notifications at night; collapse multiple events for one customer into a single message where possible (cost + courtesy).

---

## 15. Estimates, Approvals, and Added Work

### 15.1 Estimate Management

Admin creates an estimate with:
- Parts
- Labor
- Supplies
- Discounts
- Notes
- Validity period

### 15.2 Additional Issue Approval Flow

1. Mechanic adds issue (Section 12.8)
2. Admin reviews issue, adds price and recommendation
3. Customer is **notified** (Section 14.1)
4. Customer approves or declines on the tracking portal
5. If unanswered past the timeout, admin is flagged (Section 14.2)
6. Work order updates automatically based on customer response

### 15.3 Approval States

- Draft
- Sent to customer
- Approved
- Declined
- Expired
- Cancelled by staff

### 15.4 Approval Mechanism

**Default:** Typed customer name + timestamp + IP address. This is defensible for added-work consent in the Philippine context.

**Optional enhancement:** Drawn/digital signature for shops that want stronger evidence (e.g., for high-cost repairs).

Both options record the specific approved and declined items, not just a blanket accept/reject.

### 15.5 Customer-Facing vs Internal Descriptions

Customer-facing issue descriptions must be simple and non-alarming. Internal mechanic notes are never shown to customers automatically. Admin reviews and rewrites before sending.

### 15.6 Pre-Work Estimate Approval (resolves G8)

Two job archetypes need two flows, handled by one mechanism:

- **Quick service (e.g., PMS / change oil):** work proceeds immediately on intake. No up-front approval gate.
- **Estimate-first (repair):** inspect → quote → **customer approves before work begins** → then work. This is the missing journey distinct from the added-issue approval in 15.2.

Design:
- Each work order carries a **`requires_estimate_approval`** flag (set by service type default, overridable at intake).
- When set, the WO cannot move to "In progress" until the estimate's approval state is **Approved** — the mechanic sees a **"Waiting for estimate approval"** block, not the checklist.
- It reuses the *same* `Estimate` + `Approval` objects and the *same* notification/timeout/escalation machinery (14.2) as added-issue approvals — only the trigger point differs (before work vs mid-work).
- **Resume trigger (resolves G16):** on customer approval, the WO advances to "In progress" and the assigned mechanic is notified to begin.

### 15.7 Service Price Catalog (new gap)

Building every estimate from blank line items is slow and inconsistent. A reusable **price book** is both a completeness and an efficiency win:

- A per-tenant **catalog of services and common parts** with default prices (e.g., "PMS labor — ₱400", "Brake pad set (front) — ₱1,400").
- Estimates/bills are assembled by **picking catalog items** (still fully editable per job), not retyping.
- Seeded at onboarding from the selected service types (33.3), grows over time, and feeds the parts autocomplete (11.3).
- Makes "revenue by service type" (20.2) reliable because items are categorized, not free text.

---

## 16. Payments, Deposits, Discounts, and Promos

### 16.1 Payment Tracking

**Fields:**
- Payment method (cash / GCash / bank transfer / card terminal)
- Amount due
- Amount paid
- Balance
- Reference number (**required before marking Paid** — enforcement control)
- Proof of payment image
- Verified by (staff name)
- Verification timestamp
- Payment status

**Payment statuses:**
- Unpaid
- Partially paid
- Proof uploaded
- Paid
- Refunded
- Cancelled

### 16.2 Verification Control

"Admin eyeballs a screenshot" is a weak control for something that gates vehicle release.

- Reference number field is **required before status can be set to Paid** — system enforces this
- Verification is **logged with who verified and when** (audit log, Section 23.1)
- Second-person confirmation can be required for amounts over a configurable threshold
- Proof image is supporting evidence — release should reflect confirmed receipt where possible
- Staff are trained that a screenshot is not proof of receipt; the reference number check against the actual GCash/bank record is

### 16.3 Deposits / Downpayments

Common in PH repair (parts ordered against a downpayment):

- A deposit is a payment applied before final billing
- Appears on the final bill as "deposit applied" and reduces the balance due
- Estimate → deposit → work → final bill is a **first-class flow**, not an afterthought

### 16.4 Refunds

- A refund references the original payment
- Requires manager approval (role permission)
- Records reason and refunded amount
- Partial refunds supported
- Captured in payment reports

### 16.5 Discounts

**Types:**
- Fixed amount
- Percentage
- Free labor
- Free inspection
- Bundle discount
- Manager-approved custom discount
- Promo-based discount

**Fields:**
- Discount name
- Type
- Amount/value
- Reason
- Approved by
- Promo campaign reference

### 16.6 Promo Handling

**Target segments:**
- PMS customers
- Inactive customers (> X months without a visit)
- Brake service customers
- Battery customers
- Mod/upgrade customers
- High-value customers
- First-time customers

**Promo fields:**
- Promo name
- Start/end date
- Eligible services
- Eligible customer segment
- Discount rule
- Usage count
- Active/inactive flag

**MVP promo flow:**
1. Admin creates promo
2. Promo can be applied manually to a work order
3. Promo can generate customer message templates for manual sending

### 16.7 Official Receipts / BIR

**The product is an operations and record-keeping tool, not an accounting/POS system, and it does not issue official receipts.** This is the deliberate line that keeps ShopTrace out of BIR registration scope.

The key distinction: in the Philippines, BIR scope is triggered by **issuing official receipts / sales invoices** (and registering a Computerized Accounting System / POS that generates them) — **not** by keeping operational records. So:

- **ShopTrace never issues an OR/SI.** Its printable financial documents — estimates, **billing statements**, service reports — are *internal* and are clearly stamped **"NOT an Official Receipt — for service-record purposes only."**
- **The shop issues its own BIR-registered OR/SI** through their existing process; ShopTrace **stores the reference** (OR/SI number + date) so history links to the official document without generating it.
- **Service history and proof records are not a BIR concern** — record-keeping is fine; only document *issuance* is regulated. The history database (and the Garage consumer app) are clear of this entirely.
- **BIR-ready exports** (sales summaries by date/method/service) *support* the shop's bookkeeper in filing — they do not replace official books.
- **Future opt-in path:** a shop that later wants integrated OR issuance would register ShopTrace as a CAS/POS with BIR — a deliberate premium path, out of MVP scope.

> **Known limitation:** the shop still issues official receipts outside the system (a double-entry step). Accepted v1 constraint; flag at onboarding.
>
> **Not legal/tax advice.** Each shop should confirm its specific obligations with its accountant / the BIR.

### 16.8 Partial Payment & Credit Release (resolves G10)

PH shops commonly release to trusted customers with a balance ("utang") or accept partial payment. Modeled explicitly:

- **Payments roll up against a work-order balance.** Multiple `Payment` records (deposit, partial, final) net against the total; the balance is always visible.
- **Per-shop release policy:** *require-full-payment-before-release* **or** *allow-release-with-balance*. Default is require-full-payment.
- **Release with an outstanding balance is a controlled action:** it requires a **Manager/Owner authorization**, captures a **reason**, records the outstanding amount on the `Release`, and is **audit-logged** (Section 23.1). The balance remains tracked as receivable and surfaces in reports and the action center until settled.
- Front-desk/cashier alone **cannot** release with a balance unless the shop policy and their role permit it (Section 21.3).

### 16.9 Tax Display & Statutory Discounts (new gap)

Billing statements must reflect PH financial reality (even though ShopTrace doesn't issue the official receipt — 16.7):

- **VAT handling:** a per-shop setting for **VAT-registered (12% VAT)** vs **non-VAT (percentage tax)**. Billing statements show the correct VAT-inclusive/exclusive breakdown so the figures reconcile with the shop's official OR.
- **Senior Citizen / PWD discounts:** if the shop chooses to honor these, model them as a discount type that records the **ID number** and applies the shop's policy. *(Note: the legally **mandated** 20% + VAT-exemption applies to specific establishment types — restaurants, medical, transport, etc. — and auto repair is generally **not** in the mandated list. So treat this as a configurable, recorded discount, not an assumed legal requirement. Confirm with the shop's accountant.)*
- These are recorded for the bookkeeper's BIR filing via exports (20.4), not issued as official tax documents by ShopTrace.

---

## 17. PMS Reminders and Customer Retention

### 17.1 Reminder Logic

Reminders based on any combination of:
- Last PMS date + interval (e.g., every 3 or 6 months)
- Last mileage + next due mileage (e.g., every 5,000 km)
- Fixed reminder date
- Custom note

### 17.2 MVP Flow (Manual-First)

1. System generates a due-reminder queue sorted by urgency
2. Staff selects a reminder and clicks "copy message"
3. Staff sends via Messenger or SMS manually
4. Staff marks reminder as sent (records date and channel)

### 17.3 Reminder Data

| Field | Description |
|-------|-------------|
| Customer | Linked customer record |
| Vehicle | Linked vehicle record |
| Last service date | From last completed work order |
| Last mileage | From last completed work order |
| Due date | Calculated or manually set |
| Due mileage | Calculated or manually set |
| Reminder status | Pending / Sent / Snoozed / Cancelled |
| Last contacted date | Set when staff marks as sent |
| Channel used | Messenger / SMS / phone |
| Template used | Which message template was sent |

### 17.4 Future Automation (Phase 2/3)

- Automated SMS send (no staff action)
- Email reminders
- Messenger API integration if feasible
- Promo campaign attachments to reminders
- Opt-out management and suppression lists

---

## 18. Service Lifecycle Edge Cases

The happy path is well defined in Section 29.2. These are common real-world branches the system must handle.

### 18.1 Rework / Warranty / Comeback

A vehicle returning because a repair did not hold:
- **Must link to the original work order** — tracked as rework/warranty, not a new unrelated job
- Appears in vehicle history with a rework/warranty flag
- Contributes to a **rework-rate report** (quality and liability signal)
- Shop defines whether rework is billable or warranty-covered (configurable per job)

### 18.2 Abandoned Vehicle / Non-Payment

A customer who never pays or never picks up:
- Vehicle enters an **"unclaimed/abandoned"** status after a configurable number of days
- Storage-fee notes field for documenting daily/weekly storage charges
- Documented escalation path: contact log, final notice record
- The system must not silently release the vehicle or lose the record
- Mechanic's lien implications noted in documentation (legal advice required from the shop's counsel)

### 18.3 No-Show / Reschedule

Scheduled jobs and future request-slot flows need:
- **No-show** status with timestamp and notification log reference
- **Reschedule** action that updates the queue position, bay plan, and mechanic schedule

### 18.4 Cancellation & Full Decline

When a customer declines all added work or cancels the job entirely:
- Bay and queue position freed immediately
- Deposit handling defined per shop policy (refund vs forfeit; configurable)
- Cancelled work order retained in history (not deleted)

### 18.5 Multi-Mechanic Jobs

See Section 12.10 for mechanic-side design. Admin view:
- All assigned mechanics visible on the work order
- Per-mechanic checklist progress visible
- Performance reports split by contribution

### 18.6 Vehicle Ownership Transfer

On sale:
- History stays permanently with the vehicle
- Prior owner's personal data governed by retention rules (Section 22)
- New owner sees only their own service period by default
- Shop staff can view full history for service continuity

### 18.7 Edge-Case Actor Flows (resolves G9, G14, G18/19, G23)

§18.1–18.6 define the *states*; these are the *who-does-what* flows that were missing:

- **Decline-continuation (G9):** when a customer declines *added* work, the **original approved work still proceeds** by default; only the declined line items are dropped. The decline is recorded (appears in declined-recommendations history, 20.3) and can become a future reminder/promo trigger.
- **Escalation resolution (G14):** a timed-out approval (14.2) surfaces in the Action Center; the handler chooses **call & approve-on-behalf** (recorded as staff-entered with reason), **decline**, or **hold**. Every choice is audited.
- **Cross-role approval routing (G18/G19):** a discount/refund/price-override above threshold creates an **approval request routed to a Manager/Owner** (Action Center), who approves/rejects with a reason — the request→decision handoff is explicit, not implicit (ties to 21.3).
- **No-show / cancellation / abandoned / rework** each have an owner and a next action: no-show → staff clears + optional re-notify; cancellation → bay freed + deposit per policy; abandoned → contact log + storage-fee notes + final-notice record (never silent release); rework → linked to original WO + billable-or-warranty decision (18.1).

---

## 19. Proof Integrity & Trust

"Proof" is the brand promise. The integrity of that proof must be designed for, not assumed.

- **Capture-time integrity:** Record server-side capture/upload timestamp and, where available, device/EXIF metadata. Tie every photo to the job and checklist step at the moment of upload. Discourage gallery uploads for required photos — prefer in-app capture for the required set.
- **Tamper resistance:** Optional light watermark (shop name + work order number + date) burned into customer-visible proof photos.
- **Mislabeling guard:** Required photos are tied to specific checklist steps, reducing "wrong car / wrong job" mix-ups.
- **Two-way evidence:** Intake photos can support the customer in disputes (e.g., pre-existing damage). Retention period should cover the typical dispute window (suggest 12 months minimum).
- **Background PII caution:** Capture guidance to mechanics to avoid other customers' plates/faces in frame where feasible (ties to Section 22 and data privacy).

---

## 20. Reports and Exports

### 20.1 Operational Reports

- Work orders by date range
- Active jobs
- Completed jobs
- Cancelled jobs
- Jobs by mechanic
- Jobs by service type
- Average completion time *
- Queue/wait-time report
- Rework rate (Section 18.1)

### 20.2 Payment Reports

- Payments by date
- Payments by method
- Unpaid/partial payments
- Discounts given
- Promo usage
- Revenue by service type *
- Deposits held
- Refunds issued

### 20.3 Customer/Vehicle Reports

- Repeat customers
- PMS due customers
- Inactive customers (by configurable threshold)
- Vehicle service history
- Declined recommendations

### 20.4 Exports

- CSV
- Excel-compatible CSV
- PDF job order
- PDF service report
- PDF billing statement
- Field: manual OR / sales-invoice / receipt reference

> **Data-foundation caveats.** Reports marked * depend on inputs that must be disciplined data:
>
> - *Average completion time* requires real-time status timestamping (Section 9.4). If staff update statuses late, this number is wrong.
> - *Revenue by service type* requires the structured-lite parts/line items (Section 11.3), not free text.
> - *Staff performance* requires per-job time capture — **there is no time-tracking feature yet.** Either add lightweight job start/stop capture or drop staff-performance reports from scope until that data exists. Do not promise a report the data cannot support.

---

## 21. Roles and Permissions

### 21.1 Roles

- Owner
- Manager
- Admin / Front Desk
- Mechanic
- Cashier / Accounting
- Customer

**One user may hold multiple roles.** This is a day-one requirement for small-shop reality (Section 5.4).

### 21.2 Permission Matrix

**Owner — Full access:**
- Manage settings, branding, service templates
- View all reports and audit logs
- Manage users and roles
- Approve refunds and high-value discounts
- Access all work orders, payments, history

**Manager:**
- Create/edit/close work orders
- Send and review approvals
- Verify payments; approve refunds up to a configurable threshold
- Apply and approve discounts
- Access all reports
- Manage promotions

**Admin / Front Desk:**
- Create and edit work orders
- Customer communication (send links, copy messages)
- Queue management
- Prepare estimates and final bills
- Apply existing promos
- Verify payments at standard threshold

**Mechanic:**
- Assigned jobs only (own checklist and photos)
- Update checklist item states
- Capture and upload photos (required and optional)
- Report issues (flag + describe; pricing off by default)
- Upload scan results
- Pricing fields: editable only if shop opts in

**Cashier / Accounting:**
- View and record payments
- Verify payments
- Generate billing exports
- Payment reports only

**Customer:**
- Own tracking portal only
- Cannot access any admin, mechanic, or other customer data

**Org Owner / Org Manager (multi-branch):**
- Cross-branch read-only dashboards across the organization's shops (Section 36)
- No edit access to a branch's operations unless they also hold a shop-level role there

### 21.3 Pricing & Work-Order Change Controls (only trusted people)

Owner confidence in the numbers depends on price and work-scope changes being made only by trusted people, and every change being traceable. Four layers:

**1. Role restriction.**
- **Set/edit pricing, line items, and discounts:** Manager / Owner only.
- **Admin / Front Desk** may *prepare* estimates and bills, but a **price override beyond a configurable threshold (or below cost)** requires Manager approval.
- **Mechanics** never set pricing (pricing fields off by default — 12.8).
- **Cashier** records and verifies payments but cannot change prices or line items.

**2. Maker–checker (segregation of duties).** Discounts and price overrides above a configurable amount require a **second trusted approver** (Manager/Owner). Where practical, the person who created a large discount is not the one who verifies the related payment (extends 16.2).

**3. Locking.** When a work order is **released or fully paid, it locks.** Reopening or editing a locked WO (price, line items, or work scope) requires **Manager/Owner + a reason**, and creates an audit entry. Released-with-balance authorizations (16.8) are likewise restricted and logged.

**4. Tamper-evident audit.** Every price, line-item, discount, and work-scope change is logged with **before → after, who, and when** (Section 23.1). This is the deterrent against insider manipulation and the reason the cross-branch dashboards (Section 36) can be trusted.

> These controls are what make the owner dashboards believable: confidence comes from controlled, auditable inputs — not from the charts.

---

## 22. Data Privacy & Compliance

The product collects PII (names, phone numbers, plates, vehicles, visit patterns, photos) and sends promo/reminder messaging. The **Philippine Data Privacy Act (RA 10173, NPC)** applies.

- **Lawful basis & consent:** Explicit, separate consent for (a) service communication and (b) marketing/promos. Consent is logged with a timestamp and is individually revocable.
- **Data subject rights:** Support access, correction, and deletion requests. Define how vehicle history is handled when a customer requests deletion: anonymize the customer record while preserving vehicle service history, or full removal (shop policy decision).
- **Retention:** Define retention periods for PII and media (Section 24). Do not keep forever by default.
- **Token/link security:** Tracking links carry personal data. PIN strongly recommended on by default (Section 13.2). Links expire after job release + configurable grace period. Forwarding risk documented to staff in onboarding.
- **Photo PII:** Proof photos may capture third-party plates or faces in the background. Minimize where feasible; define handling in capture guidance to mechanics (Section 19).
- **Breach process:** Documented incident response plan. For SaaS scale, evaluate NPC Personal Information Controller registration obligations.
- **Vendor data:** SMS gateway and payment vendors process PII — covered by data processing agreements.

---

## 23. Audit Logs and Security

### 23.1 Audit Log Events

| Event | Data Captured |
|-------|---------------|
| Work order created / edited | User, timestamp, fields changed |
| Status change | User, previous status, new status, timestamp |
| Estimate created / changed | User, timestamp, delta |
| Approval sent to customer | User, timestamp, channel |
| Customer approved / declined | Customer name, timestamp, IP, items |
| Payment verified | Staff member, reference number, timestamp |
| Discount applied | User, discount type, amount, reason |
| Refund issued | User, approver, amount, reason |
| **Price / line-item change** | User, work order, field, **before → after**, timestamp |
| **Discount / override above threshold** | Maker, approver, amount, reason, timestamp |
| **Work-scope change** (service/line added or removed) | User, work order, before → after, timestamp |
| **Locked work order reopened** | Manager/Owner, work order, reason, timestamp |
| **Released with outstanding balance** | Authorizing manager, amount, reason, timestamp |
| Photo visibility changed | User, photo ID, old/new visibility |
| Required-photo skip | Mechanic, skip reason, checklist step |
| Template created / edited | User, timestamp |
| Partner API access / claim verified | Partner, grant, vehicle, timestamp |
| User login | User, timestamp, IP |
| Export generated | User, report type, timestamp |

### 23.2 Security Requirements

- Staff login required (email + password via Supabase Auth)
- Role-based permissions enforced at application layer
- **2FA required** for Owner and Cashier/Accounting roles
- Customer portal: secure token + PIN (rate-limited failed attempts)
- Internal photos hidden from customer portal by default; explicit admin approval required to expose
- Payment proof images restricted to Admin/Manager/Cashier roles
- Encrypted backups on schedule (provider TBD — Section 30)
- Documented restore process with tested recovery time
- Password reset and session management flows defined before launch

### 23.3 Audit Log Immutability (new gap)

The trust controls (21.3) and owner dashboards (36.3) are only meaningful if the audit log itself can't be quietly altered.

- The audit log is **append-only** — **no edit or delete, not even by Owner.** Enforced at the database layer (RLS denies update/delete; insert-only), not just the app.
- Entries are **timestamped server-side** (never trust client clocks) and reference the actor's identity.
- Retention: audit entries kept at least as long as the dispute/financial window (align with 22, 24.4).
- Optional later: periodic hash-chaining for stronger tamper-evidence.

---

## 24. Media, Storage & Cost

Proof photos are the product's core asset and its largest cost center. Both were uncosted in v1.

### 24.1 Volume Reality

~8–10 photos/job × ~20 jobs/day × ~1.5 MB (compressed) ≈ **~2.4 GB/month/shop of new uploads, growing indefinitely.**

At a dozen shops that is ~30 GB/month of uploads plus read egress when customers view their portals.

- Local-FS deployments will fill disks on a predictable timeline
- SaaS storage is a direct per-shop COGS line that pricing must account for

### 24.2 Compression

Compress and downscale on capture before upload. Target ≤ 1.5 MB per photo. Full-resolution archival is not necessary for proof purposes; the reduced size also improves upload reliability on weak Wi-Fi.

### 24.3 Storage Provider

**Recommended for production: Cloudflare R2** (zero egress fees). The customer portal repeatedly loads proof photos; egress cost on S3-class storage can significantly exceed storage cost. R2 eliminates egress.

Supabase Storage is acceptable for early development/MVP; migrate to R2 before scaling to multiple shops.

### 24.4 Retention Policy

| Period | Policy |
|--------|--------|
| 0–12 months | Full resolution, hot storage |
| 12–36 months | Compressed/archived, cold storage |
| 36+ months | Thumbnails only, unless active dispute |
| Customer deletion request | Anonymize or remove per Section 22 |

### 24.5 Video

Issue/scan videos massively increase upload time and storage and undermine the weak-Wi-Fi story.

- Cap video at 30 seconds / 50 MB maximum
- Mark as **optional** — never part of the required photo set (D4)
- Test explicitly in the photo spike (Section 28) — spike currently tests 8 photos; add one video test
- If PWA video upload is unreliable, defer video to a later phase

### 24.6 Image Derivatives / Thumbnails (new gap — optimization)

A photo-heavy product must not serve full-resolution images to list views, or both cost and speed suffer.

- **On upload, generate derivatives:** a small **thumbnail** (queue board, history lists) and a **medium** (portal/gallery viewing); keep the full-res as the archival original.
- **Serve the smallest sufficient size**; full-res only on explicit "view original," via short-lived signed URL.
- This is the single biggest lever on R2 egress and on perceived speed for the customer portal and admin history. Pairs with the capture-time compression in 24.2.
- Generate derivatives server-side after upload (or via an image-resizing CDN) — not on the cheap tablet.

---

## 25. Localization

Many staff and customers are most comfortable in Filipino/Taglish.

- Customer-facing messages, reminder/approval templates, and key UI labels available in **English and Taglish at MVP**
- Customer portal labels, status descriptions, and notification templates in both languages
- Taglish templates for: tracking link notification, approval request, ready-for-release notice, PMS reminder, payment confirmed
- Full multi-language admin UI is later, but customer-facing Taglish materially affects adoption (A1/A4)
- **Per-customer language preference (new):** store EN vs Taglish on the customer record; the portal and all messages to that customer honor it. Default Taglish for PH.

---

## 26. SaaS Expansion Direction

ShopTrace is built bespoke-first for the pilot shop but evolves into a full self-serve SaaS for auto shops.

### 26.1 Positioning

A service-transparency and work-order platform for independent auto shops.

**Core promise:** Give every customer a live service record — status, proof photos, approvals, final bill, payment instructions, and PMS reminders.

### 26.2 Product Modes

**Cloud-only (recommended for most shops):**
- No local server required
- Web admin app
- Mechanic PWA
- Customer portal
- Cloud storage + backups

**Cloud + offline mechanic app:**
- Mechanic app caches jobs/photos locally
- Syncs when back online
- See Section 27.2 for complexity warning — this is not trivial to build

**Premium local edge (deferred — not v1):**
- Local mini-PC for large shops or shops with poor internet
- Local queue/work order operations
- Syncs to cloud periodically
- Higher support cost; Cloudflare Tunnel for customer-facing routes

### 26.3 SaaS Pricing Axes (validate after pilot)

- Per branch
- Per active mechanic
- Per work order volume (tiered)
- Setup/onboarding fee (charged separately)
- Local edge mode as premium add-on
- **Custom domain as a paid add-on** (Section 33.8)

---

## 27. Technical Architecture

### 27.1 Committed Stack (per D2)

| Layer | Technology |
|-------|-----------|
| Admin app | Next.js (App Router) |
| Customer portal | Next.js (App Router) |
| Mechanic app | Vite React PWA |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (JWT carries `tenant_id` + `role` claims) |
| Tenant isolation | **Postgres Row Level Security (RLS)** keyed on the JWT `tenant_id` claim — primary mechanism |
| Runtime queries | `supabase-js` (RLS-aware) for app reads/writes |
| Schema & migrations | **Supabase CLI** (`supabase migration new` / `db diff`) — plain versioned SQL; RLS, functions, triggers, cron all in one history |
| Type safety | **`supabase gen types typescript`** — generated types for a fully typed `supabase-js` client |
| Storage (dev/MVP) | Supabase Storage |
| Storage (production / scale) | Cloudflare R2 (tenant-prefixed paths + signed URLs) |
| Realtime | Supabase Realtime (queue board, upload status — RLS-respecting) |
| Reports | SQL views on PostgreSQL |
| Styling | Tailwind CSS + shadcn/ui |
| Background jobs / reminders | `pg_cron` (MVP) → dedicated queue/worker later if volume grows |
| Notifications (MVP) | Semaphore or Movider (PH SMS) + copy-to-Messenger |
| App hosting (cloud) | **Vercel** (Next.js apps) + static hosting for the Vite PWA; host-aware middleware resolves tenant |
| Domains | Default `{shop}.shoptrace.app` (wildcard DNS + cert, auto at signup); **custom domain as a paid add-on** (Section 33.8) |
| Monitoring | Sentry + uptime monitoring |
| Payments (customer) | Manual in v1 (GCash/bank) — no gateway |
| Payments (SaaS billing) | PayMongo / Xendit (added when SaaS launches) |
| Local-edge tier only (deferred) | Docker Compose + Caddy + Cloudflare Tunnel — scoped to the premium local mode, not the cloud default |

**Multi-tenancy model (committed): RLS-first.** All tables include `tenant_id` from day one. Tenant isolation is enforced primarily by **Postgres Row Level Security**, not by application code. The database itself refuses to return another tenant's rows regardless of an application bug — which is the right guarantee for a trust-based product where a single missed filter would be a cross-tenant data leak.

How it fits together:

- **Identity:** Supabase Auth issues the session JWT. Each user's `tenant_id` and `role` are stamped into the JWT as custom claims (set via an auth hook / `app_metadata` on signup). Supabase Auth is the single source of truth for identity — there is no second identity store.
- **No ORM.** We do not use Prisma (or any ORM). Because isolation is RLS-first and queries go through `supabase-js`, an ORM would only ever be a migrations tool — and it cannot express RLS policies, functions, triggers, `pg_cron`, or Realtime config, which would split the schema across two systems. Supabase CLI migrations keep tables *and* all of that in one SQL migration history; `supabase gen types` gives the type safety an ORM would otherwise provide. See the v1.2 → v1.3 changelog note for the full rationale.
- **Policies:** Every tenant-scoped table has an RLS policy of the form `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid`, plus role-aware policies for finer control (e.g., a mechanic can only `select`/`update` work orders they are assigned to). Customer-portal reads do not use Supabase Auth at all — they go through a token-validating server route (Section 13.2, 27.5) that scopes the query explicitly.
- **Queries:** App code reads/writes through `supabase-js`, so RLS is always in force. There is no privileged-role bypass path exposed to request handlers. Admin/back-office jobs that legitimately need to cross tenants (support tooling, cron) use the service role behind a server-only boundary, never in user-facing request paths.
- **Storage:** Photos live under tenant-prefixed paths (`/{tenant_id}/{work_order_id}/...`). R2 has no RLS, so access is gated by issuing short-lived signed URLs from a server route that has already passed the RLS/token check.

This is the elegant, low-effort strong-isolation pattern Supabase is built for, and it scales on a shared schema to hundreds of shops before schema-per-tenant or database-per-tenant would even be a conversation.

### 27.2 Offline Sync Risk

"Caches and syncs when online" hides real complexity:
- Conflict resolution when admin edits a work order while the mechanic is offline
- Photo upload ordering and partial-upload recovery
- Cheap-tablet local storage limits
- Two mechanics editing the same job simultaneously

**Scope offline to photos + checklist-state only** in early phases, with last-write-wins for checklist state and server-side photo deduplication. Defer full offline work-order editing to a later phase. This mirrors the only Odoo surface that works offline (POS): they made the *append-mostly, low-conflict* path offline and kept the editable/financial back-office online-only. We draw the same boundary.

**Offline storage security.** Browser `localStorage`/`IndexedDB` is **plaintext on the device** — it is not an encrypted vault. Isolation comes from same-origin policy and transport (HTTPS) on sync, not from the storage layer. Because the mechanic tablet is shared and may cache customer PII (name, plate, photos), the controls are: cache only what the current job needs, **purge the local cache after a successful sync**, per-job PIN re-auth (Section 27.5), full-disk encryption on the tablets, strict XSS prevention, and an append-only upload queue with a visible "N items not yet synced" indicator so nothing is silently lost. Implement the queue with a service worker + IndexedDB + the Background Sync API.

### 27.3 Customer Portal Uptime

For local-edge deployments, the customer portal exposed via a shop's consumer ISP goes down when the shop's internet goes down. Host the **customer portal in the cloud** even when admin runs locally.

### 27.4 Network Reliability Tiers

There are two distinct network problems people conflate, and they have different fixes:

- **WAN reliability** — the shop's *internet* is down or slow (affects sync to cloud and customer-portal reachability).
- **LAN coverage** — *local Wi-Fi* dead zones, weak signal at the back bay, a cheap office router that can't reach the lifts (affects the tablet reaching anything at all). A car-filled garage is an RF-hostile, metal-heavy environment.

Reliability is offered as escalating tiers. **Most shops need only the default** — modern PH internet is generally reliable enough, so the product ships as a zero-setup cloud app and only adds hardware where a specific shop proves it needs it. This keeps adoption a no-brainer (Principle #10).

| Tier | What it is | Network setup | For whom |
|------|-----------|---------------|----------|
| **Default — Pure cloud** | Cloud-only (Supabase + R2). The PWA offline queue (27.2) is the safety net for occasional blips: photos/checklist state captured during a drop sit in IndexedDB and sync on reconnect — the mechanic is never blocked, nothing is lost. | **None.** Works on the shop's existing internet, no extra hardware. | Most shops |
| **Optional — Better Wi-Fi coverage** | Add access points (UniFi, or cheap mesh like TP-Link Deco) so every bay has signal. ~₱5–15k of hardware. | Light, one-time | Shops with real LAN dead zones |
| **Add-on — Local photo store-and-forward relay** | A cheap LAN device (mini-PC / Raspberry Pi) runs a tiny **one-directional upload relay**: tablets push photos to the *local* device first (always fast, reachable on LAN even when WAN is dead), and it forwards to cloud R2/Supabase when the internet returns. Far simpler than full edge — it is store-and-forward of the single heaviest payload, **not** a DB replica and has **no** bidirectional conflict resolution. | Moderate | Shops with frequent, long internet outages |
| **Premium — Full local edge** | Local Postgres replica, whole app runs offline, bidirectional sync. High complexity and support cost. Deferred (P3, Section 26.2). | Heavy | Large shops / genuinely poor internet, proven need only |

**Key insight:** the PWA offline queue already delivers most of the reliability benefit of a local server *for the capture flow specifically*, with none of the sync complexity. The only real casualty of a long WAN outage is the customer portal being unreachable — and that is a cloud-hosting concern (27.3), not a data-loss one. Do not build down-tier complexity until a real shop's pilot data proves the tier above is insufficient.

### 27.5 Migration Workflow

Schema migrations via the **Supabase CLI** (plain SQL, versioned in `supabase/migrations/`):
- `supabase migration new <name>` to author a migration; `supabase db diff` to capture changes made in Studio
- `supabase db push` applied in CI/CD before each deployment
- `supabase gen types typescript` regenerated on schema change to keep the typed `supabase-js` client in sync
- Local Supabase development via `supabase start` (Docker) so developers have isolated instances and do not share a live database
- One migration history covers everything: tables, RLS policies, functions, triggers, `pg_cron` jobs, and Realtime publications

### 27.6 Authentication Strategy

| Actor | Method |
|-------|--------|
| Owner / Manager / Admin / Cashier | Email + password via Supabase Auth; `tenant_id` + `role` in JWT claims; 2FA on owner/cashier |
| Mechanics on shared tablets | Individual mechanic accounts; tablet stays logged into the mechanic surface; PIN re-auth on each job start; offline cache purged after sync (Section 27.2) |
| New staff onboarding | Email invite link via Supabase Auth invite flow; invited user is auto-stamped with the inviting shop's `tenant_id` |
| Customer portal | Token-based, **no Supabase Auth and no JWT** — a server route validates the token (+ optional PIN, Section 13.2) and scopes every query to that single work order explicitly, since there is no tenant JWT to drive RLS |

> **Auth/identity decision (resolved):** Supabase Auth is the single source of truth for staff identity. RLS reads the JWT claims for tenant isolation. No ORM and no second identity store to keep in sync (Section 27.1).

---

## 28. Technical Spike — Mechanic Photo Flow

Build this **first.** It is the highest-risk UX feature.

### 28.1 Scope

One PMS work order on one affordable Android tablet — **and on a mechanic's own phone**, since capture is device-agnostic (Section 12.12). Run the spike **on the shop's real Wi-Fi at the worst bay** (e.g., under a car at the back), not on office Wi-Fi — testing on good Wi-Fi tells you nothing about the environment that actually breaks this.

### 28.2 Success Criteria

1. Camera opens in under 3 seconds
2. Mechanic captures the required PMS photos via **native camera capture** (`<input capture>`), not a custom in-app viewfinder and not gallery upload (Section 12.12)
3. **Photos are legible** — brake-pad thickness, part numbers, and damage are actually readable, including in poor bay lighting (this is the real bar, not just "a file uploaded")
4. Photos upload in under 4 minutes on weak Wi-Fi (throttled to ~1 Mbps in test)
5. Failed upload shows retry button within 5 seconds; retry fires on reconnect, app-foreground, and `online` event
6. No photo loss after a simulated connection drop (airplane-mode toggle mid-upload) — photo is in IndexedDB before capture is confirmed, removed only after server ack
7. Mechanic completes the entire flow without developer instructions
8. Admin can see per-photo upload status in real time
9. Customer tracking page shows admin-approved photos correctly
10. Client-side compression (resize ~1600px, ~0.7 quality) runs without crashing on the low-RAM target tablet
11. One short issue video (≤30s) captures and uploads within acceptable time/size — or video is explicitly cut from MVP if result is poor
12. Concurrent upload from two mechanics on the same job completes without conflicts or data loss

### 28.3 Failure Decision

If PWA camera/upload reliability is poor on the target tablet, pivot immediately to test a native Android app (Kotlin/Jetpack Compose) or Expo/React Native before committing further to the PWA approach. Do not continue building on a foundation that fails this test.

---

## 29. MVP Definition

### 29.1 Goal

Prove the system can make a real shop job transparent from intake to release — **and that customers actually use it** (Section 4). Both halves of that sentence matter equally.

### 29.2 MVP Flow

1. Admin creates work order; customer and vehicle linked
2. Customer is **notified** with tracking link (SMS or copy-to-Messenger)
3. Mechanic opens tablet checklist
4. Mechanic takes required photos (discipline gate enforced)
5. Mechanic flags newly discovered issue
6. Admin reviews issue, sets price, and sends approval
7. Customer is **notified** and approves/declines on phone
8. If unanswered past timeout, admin is flagged on the queue board
9. Admin adds final bill (deposit applied if applicable)
10. Customer sees payment details on the portal
11. Customer uploads proof of payment
12. Admin verifies payment and records reference number
13. Work order released; customer notified
14. PMS reminder queued for future follow-up

### 29.3 MVP Must-Haves

- Work order creation
- Queue board
- Customer and vehicle records with `VehicleOwnership` link (D5)
- Mechanic checklist
- Required photo upload with discipline gate (D4)
- Issue-found flow with admin review
- Customer tracking link
- At least one notification channel (D3)
- Customer approval with timeout/escalation flag
- Estimate and final bill with deposit support
- Payment proof upload and verification control
- Manual PMS reminder queue
- Basic reports/export
- Printable job order
- Audit log
- Consent capture for DPA compliance
- `tenant_id` on all tables (D1)

### 29.4 MVP Nice-to-Haves

- Public website
- Works gallery (with approval flow)
- Auto supply catalog
- Promo campaigns
- Automated SMS (no-staff-action send)
- Messenger automation
- Full inventory management
- Native mobile app
- Local edge server
- Video proof uploads
- Multi-branch support
- Appointment booking (Section 9.6)
- Customer-supplied media & notes (Section 9.7)

---

## 30. Remaining Open Questions

**Product**
1. First checklist/photo templates to ship — which services, in what order? (Recommend: PMS first, then brakes, then diagnostics.)
2. Approval mechanism legality — is typed name + timestamp + IP sufficient for added-work consent in PH, or is a drawn signature required for liability protection?
3. Should declined recommendations resurface automatically as promo/reminder triggers for future visits?

**Business**
1. Confirm D1 direction (AutoLounge-only vs SaaS from day one) after the 4-week MVP pilot with evidence.
2. First pitch emphasis to other shops: queue tracking, proof photos, or PMS reminders?
3. Pricing axis (per branch / per mechanic / per volume); setup fee structure; local edge pricing.

**Technical**
1. **SMS gateway:** Semaphore vs Movider — confirm pricing, delivery rates, and alphanumeric sender ID support before build.
2. **Tablet model:** Confirm specific model for the photo spike (Section 28).
3. **Backup provider and restore cadence:** rclone to R2 + external drive, or managed Supabase backups? Document restore test schedule.

---

## 31. Feature Priority

### P0 — Validate first (nothing else before this)

- Mechanic photo-checklist spike (Section 28)
- Work order creation
- Customer tracking link
- Notification channel (at least one working)
- Admin photo review
- Customer approval for added issues

### P1 — MVP core

- Queue board
- Intake funnel — inquiry/booking triage → WO (Section 10.6)
- Estimate/final bill + deposit support
- Pre-work estimate approval for repairs (Section 15.6)
- Payment proof + verification control
- Partial payment & credit release controls (Section 16.8)
- Pricing & work-order change controls + audit (Section 21.3)
- Action Center (Section 35)
- Two-way customer messaging (Section 14.4)
- Data import at onboarding (Section 33.9)
- PMS reminder queue
- Printable job order
- Service history
- Basic exports
- Checklist/photo template management
- Audit log
- Consent capture

### P2 — Strong business value

- Promo handling and customer segments
- Works gallery with gallery approval flow
- Auto supply inquiry catalog
- Appointment booking (Section 9.6)
- Customer-supplied media & notes (Section 9.7)
- Custom domain add-on (Section 33.8)
- Advanced reports
- Rework/warranty tracking and rework-rate report
- Staff performance reports (only after time-capture exists)

### P3 — Future

- Automated SMS (no staff action)
- Messenger integration — scoped, inbound-triggered (Section 14.5)
- Native mechanic app (if PWA fails the spike)
- Full inventory management
- SaaS subscription billing
- Multi-branch management & owner dashboards (Section 36; `org_id` seam ships day one, build later)
- Local edge server
- Accounting integrations
- Video proof at scale
- Consumer maintenance tracker — *"by ShopTrace"* (Section 34, parked)

---

## 32. Suggested Next Work Sessions

1. ~~Resolve Section 0 decisions (D1–D5)~~ — **Done. See Section 0.**
2. Run the 2-week paper-baseline study (Section 4.2) to size the real pain before building.
3. Build the technical spike (Section 28) — do not start the mechanic app without passing this first.
4. Define the exact MVP screen inventory per surface (count screens, name them, sketch transitions).
5. Design the schema (Supabase SQL migrations) for Section 11 entities — tables, relationships, and RLS policies together.
6. Design the PMS and brake checklist/photo templates and the template-management UI.
7. Design the customer tracking portal layout and notification message templates (EN/Taglish).
8. Define queue tracker UI rules and status-band logic (Section 9.2).
9. Define pricing and SaaS packaging — only after pilot evidence.
10. Turn the MVPflow (Section 29.2) into a clickable prototype.

---

## 33. Onboarding, Branding & Feature Configuration

This section makes Product Principle #10 concrete. The product must feel like a no-brainer: a shop signs up and is *running* in minutes on good defaults, brands it as their own, and switches on advanced features only when they want them. Every capability is multi-tenant config (a row scoped by `tenant_id`, enforced by RLS — Section 27.1).

### 33.1 Design Philosophy — Three Rules

1. **Works in 5 minutes, configure later.** Nothing in setup blocks a shop from creating its first real work order. Every wizard step is skippable with "Set up later."
2. **Sensible defaults over choices.** The shop never starts from a blank slate. Services, checklist/photo templates, notification copy, queue bands, and roles all ship pre-filled with good defaults the shop can edit — not design from scratch.
3. **Progressive disclosure.** The app is stupid-simple by default. Advanced features are hidden entirely (not greyed out, not cluttering menus) until toggled on. Turning a feature off removes its UI completely.

### 33.2 Sign-Up

Minimal friction to get an account:

- Email + password (or magic link) + shop name. That's it.
- Account creation provisions the tenant: a `Tenant` row, the first user as **Owner**, the JWT stamped with the new `tenant_id`, and the default seed data (33.4) created in one transaction.
- No credit card, no plan selection at sign-up (billing is a later, separate step for the SaaS phase).

### 33.3 First-Run Onboarding Wizard

A short, skippable wizard. Each step writes immediately, so a shop that quits halfway still keeps what it entered.

| Step | What it asks | What it does | Skippable? |
|------|-------------|--------------|-----------|
| 1. Shop basics | Name, address, phone, hours | Pre-filled with sensible defaults (e.g., Mon–Sat 8–6) | Yes |
| 2. Branding | Upload logo, pick a brand color | Logo stored per-tenant; brand color **auto-extracted from the logo** as a suggestion (editable). Instantly themes the whole app + customer portal (33.5) | Yes — falls back to the default ShopTrace theme |
| 3. Your services | Checkbox the services you offer (the 11 categories, Section 8.2) | **Seeds the matching default checklist + photo templates** for each selected service (33.4). This is the key "ready to use" moment | Yes — defaults to PMS + General Repair |
| 4. Your team | Invite mechanics/staff by email (optional) | Sends Supabase Auth invites auto-stamped with this `tenant_id`; assigns roles | Yes — owner can work solo and invite later |
| 5. Done | — | Lands on the queue board with a **"Create your first work order"** prompt and a deletable sample work order to explore | — |

The wizard is re-openable any time from Settings, and a persistent (dismissible) setup checklist tracks completion ("Add your logo · Pick your services · Invite your team") so shops can finish at their own pace.

### 33.4 Ready-to-Use Defaults (the "just works" layer)

Created automatically at sign-up / service selection so the shop never configures from zero:

- **Checklist + photo templates** per selected service (PMS, brakes, diagnostics, etc.) using the examples in Section 12.5 — including the required-photo set (D4). Editable later via template management (Section 12.7).
- **Notification templates** in English + Taglish, pre-filled (Section 14.1, 25).
- **Queue status bands** with default thresholds (Section 9.2).
- **Roles** with the default permission matrix (Section 21.2).
- **A sample work order** to click through and then delete.

### 33.5 Branding / White-Label (per tenant)

Each shop's brand is applied across every surface so it feels like *their* app, not ShopTrace's — which is also the foundation of the SaaS white-label story.

- **Inputs:** logo (stored per-tenant), primary brand color (picker or auto-derived from logo), optional light/dark preference.
- **Applied to:** admin app header/accent, the **customer tracking portal**, the **printable job order**, notification message headers, and the public website/queue page.
- **Customer-facing priority:** the tracking portal and public pages carry the shop's logo and color prominently — the customer should feel they're looking at *their mechanic's* system.
- Implemented as CSS custom properties driven by a per-tenant theme config row; no rebuild per shop.

### 33.6 Feature Toggles (opt-in complexity)

A **Features** settings page where the shop turns capabilities on/off. The product can run as a dead-simple digital job-order book on day one, then grow. When a feature is **off, its UI is hidden entirely** — menus, buttons, and fields disappear so nothing adds clutter.

| Feature | Default | When off… |
|---------|---------|-----------|
| **Proof photo recorder** (the "image recorder") | On | App becomes a pure work-order + queue + billing tracker with no camera/photo UI anywhere |
| Required-photo enforcement (gate vs optional) | On | Photos allowed but never block "mark job done" |
| Customer tracking portal | On | No tracking links generated; purely internal tool |
| Public queue / availability page | Off | No public page published |
| PMS reminders | On | Reminder queue hidden |
| Estimates & added-work approvals | On | Simple final-bill only, no approval loop |
| Payment proof upload & verification | On | Payment tracked as a simple status only |
| Promos & discounts | Off | Discount/promo UI hidden |
| Auto supply catalog | Off | Catalog pages hidden |
| Works gallery | Off | Gallery hidden |
| Multi-mechanic assignment | Off | Single assignee per job |
| Appointment booking | Off | Walk-in queue only (Section 9.6) |
| Customer-supplied media & notes | Off | Intake is staff-entered only (Section 9.7) |
| Custom domain (paid add-on) | Off | Customer surfaces use the default `{shop}.shoptrace.app` subdomain (Section 33.8) |
| Multi-branch | Off | Single location (P3) |

**Toggle principles:**
- Toggles are per-tenant config, RLS-scoped.
- Turning a feature on reveals its UI and seeds any defaults it needs (e.g., enabling promos creates an empty promo list).
- Turning a feature off **hides** the UI but **preserves data** — re-enabling restores it. Nothing is destroyed by a toggle.
- A few **starter presets** make this one click: e.g., *"Simple"* (work orders + queue + billing only), *"Standard"* (adds photos + tracking + reminders), *"Full"* (everything on). A shop picks a preset in the wizard and fine-tunes later.

### 33.7 Why This Matters for SaaS

Onboarding wizard + per-tenant defaults + theming + feature toggles are exactly what turns the bespoke single-shop build into a self-serve SaaS later (D1) with no rewrite: a new shop self-provisions, brands itself, and dials in complexity — all without engineering involvement.

### 33.8 Custom Domain (Paid Add-On)

White-labeling is only complete when the customer-facing URL is the shop's own. This extends the per-tenant branding (33.5) from logo+color to the domain itself.

**Two levels, by design:**

| Level | URL | Setup | Tier |
|-------|-----|-------|------|
| **Default subdomain** | `{shop-slug}.shoptrace.app` | **Automatic at signup** — wildcard DNS (`*.shoptrace.app`) + wildcard TLS cert; zero shop effort | Included |
| **Custom domain** | `shopname.com` / `track.shopname.com` | Shop points a CNAME at the platform; cert auto-provisioned | **Paid add-on** |

**Which surfaces get the custom domain:** the **customer-facing ones** — the tracking portal and the public website/queue page (that's what the shop's customers see). The admin app stays on the platform domain (`app.shoptrace.app`); shops don't need to brand their internal tool.

**How it works technically:**
- **Tenant resolution is host-aware from day one.** Host-aware middleware reads the incoming `Host` header → looks up the `Domain` record (Section 11.1) → resolves the tenant and its theme. Building this for the default subdomain means custom domains are a lookup addition, not a refactor.
- **Cert automation:** on Vercel, use the **Vercel Domains API** to add the hostname and auto-issue/renew the cert. At larger scale (hundreds+ of custom domains) or if hosting moves off Vercel, **Cloudflare for SaaS (Custom Hostnames)** is the purpose-built alternative — both automate per-hostname certs.
- **Self-serve onboarding for the add-on:** (1) shop enters their domain in Settings → (2) platform shows the exact DNS record to add → (3) shop adds it at their registrar → (4) platform auto-verifies ownership (TXT/CNAME) and provisions the cert → (5) domain goes live. Status surfaced as `Pending DNS → Verifying → Live`.
- **Abuse/safety:** domain-ownership verification before activation; guard against dangling-CNAME takeover; certs logged.

**Why it's an add-on, not core:** it carries real per-domain cost and support surface, and most shops are happy on the free subdomain. It's a natural upsell for established shops that want their brand front-and-center — and it's a feature toggle + `Domain` row like everything else, so enabling it is config, not engineering.

### 33.9 Data Import at Onboarding (resolves G1)

A real shop has an existing customer/vehicle list; starting from zero blocks go-live. Keep it KISS:

- **CSV import for customers and vehicles** in the wizard (or later from Settings): upload → map columns → preview → import. Dedupe on import via the identity-resolution rules (11.2).
- **Quick-add historical service** — a fast form to backfill the few key past services per vehicle (date, mileage, service, cost) so history and PMS-due reminders work from day one.
- **No ETL pipeline.** CSV in, mapped, deduped. (Logbook-photo import via the LLM is a *later* idea — parked.)
- **Parallel-run guidance (resolves G3):** onboarding recommends running ShopTrace alongside paper for the first 1–2 weeks before retiring the paper flow.

---

## 34. Consumer Maintenance Tracker — Future Product (Parked)

**Status: parked.** Documented as a deliberate future direction with the integration seam designed now, but **nothing is built until the shop MVP and pilot are validated.** This protects focus while keeping the upgrade path open.

> **Full spec:** see `docs/consumer-app-prd.md` (*Garage by ShopTrace*). This section is only the seam from ShopTrace's side.

**Vision:** a separate consumer-facing product — *"[app name] by ShopTrace"* — a car owner's companion: service history, fuel economy, spending, document vault, reminders, and a show-off build sheet, that **auto-fills when the owner visits a ShopTrace shop.**

### 34.1 Why It's a Separate Product *and Separate Backend*

The two products have **opposite ownership models**, and conflating them breaks the security model:

- **ShopTrace is shop-owned and multi-tenant** — the *shop* is the tenant; RLS isolates shops from each other.
- **The consumer app is car-owner-owned and inherently cross-tenant** — one owner's vehicle history spans *many* shops, deliberately crossing the tenant boundary RLS exists to enforce.

Co-locating them in one database would force awkward cross-tenant RLS exceptions and couple two products with very different security boundaries and release cadences. So the consumer app is built as **its own product with its own backend**, integrated to ShopTrace via a partner API — which fully preserves the auto-fill advantage. It is *not* a tab inside ShopTrace.

### 34.2 The Integration Seam (design now, build later)

So the future product is cheap to add, ShopTrace is built with these seams from early on:

- **Owner-centric identity, separate from shop staff identity.** A car owner is not a shop tenant user.
- **Verified vehicle ownership is the link — not raw plate.** Plate is guessable/spoofable, so a consumer claims a vehicle via **plate + a shop-issued OTP / claim link** (the data model is ready: `Vehicle`, plate-as-match-key, and time-bound `VehicleOwnership`, Section 11). This also respects ownership transfer (18.6): a consumer sees only their own ownership period.
- **A clean partner API** exposes the *customer-visible, approved* records for vehicles an owner has verified. The separate-backend consumer app consumes this API; ShopTrace's job is to expose and secure it. **Contract:** `docs/integration-api.md`.
- **Cross-shop read scoping:** the API returns approved customer-visible records across any ShopTrace shop the owner has visited; it never returns internal notes, other customers' data, or unverified vehicles.
- **Two ShopTrace-side build gates** for the consumer app to exist: (1) the **partner API** and (2) the **verified-ownership claim flow** (shop-issued OTP / claim link). Until both ship, there is no auto-fill.

### 34.3 Strategic Upside (why it's worth the seam)

It's a **growth flywheel and moat:** more shops on ShopTrace → richer cross-shop history available to owners → more consumer adoption → owners pressure their shops to join ShopTrace → more shops. The consumer app turns ShopTrace's shop network into a defensible network effect. That payoff is exactly why we design the seam early even though we build the app late.

### 34.4 Phasing

- **Phase A (cheap, within ShopTrace, optional later):** upgrade the per-job tracking token into a *persistent customer account scoped to one shop* — a customer sees all their visits to that shop. No cross-tenant complexity; validates demand for persistence.
- **Phase B (the parked product):** the cross-shop, owner-centric *"by ShopTrace"* app on the consumer-identity layer + API above. Built only after pilot evidence and Phase A signal.

---

## 35. Action Center (resolves G12)

A single per-role **"what needs me right now"** surface, so work doesn't fall through the cracks. It is an **aggregation over existing data** — no new entities — which is why it's cheap and high-value.

Surfaces, filtered by role:

- **Pending intake** — inquiries/bookings awaiting triage (10.6)
- **Approvals waiting** — estimates/issues sent, not yet answered (incl. timed-out escalations, 14.2)
- **Payments to verify** — proof uploaded, awaiting verification (16.2)
- **Customer messages** — unread inbound threads (14.4)
- **Reminders due** — PMS/registration/etc. ready to send (17)
- **Outstanding balances** — released-with-balance receivables to follow up (16.8)
- **Blocked jobs** — waiting for parts / waiting for approval / awaiting customer

Each item is actionable (deep-links to the work order/thread) and clears when handled. This is the screen owners and advisors open first each day; it is also what makes the escalation/timeout machinery (14.2) actually get acted on.

---

## 36. Multi-Shop Management & Owner Dashboards

For owners/operators running more than one branch — and to give any owner **confidence in the numbers**.

### 36.1 Organization Layer

- **`Organization` groups one or more `Shop` (branch) tenants** under one owner/operator.
- **`tenant_id` (shop) stays the isolation key; `org_id` is the grouping** for cross-branch reads. Seeded from day one (single-shop org by default), so multi-branch is a config change, not a rewrite — mirrors D1.
- **Org roles** (Org Owner / Org Manager) get **read-only** consolidated dashboards across branches; they do not edit a branch's operations unless they also hold a shop-level role there. RLS grants cross-branch *read* on `org_id`, never cross-branch write.

### 36.2 Consolidated Dashboards

- Revenue, jobs, average completion time, **rework rate**, payments, discounts — **by branch**, with **branch-vs-branch benchmarking**.
- Mechanic/staff performance across branches (only where the underlying time-capture exists — 20.4 caveat).
- Drill-down from any aggregate to the underlying work orders.

### 36.3 Why the Numbers Can Be Trusted

Confidence in cross-branch stats does **not** come from the charts. It comes from controlled, tamper-evident inputs:

1. **Disciplined status timestamps** (10.3, 20 caveats) — so completion/cycle-time figures are real.
2. **Structured-lite line items** (11.3) — so "revenue by service type" isn't free-text guesswork.
3. **Pricing & work-scope change controls + audit trail** (21.3, 23.1) — so prices and work can't be quietly manipulated, and every change is traceable.

The dashboards (Section 36) and the trust controls (Section 21.3) are deliberately one story: an owner trusts the branch comparison because no one untrusted could have altered the inputs without a trace.

### 36.4 Phase

Multi-branch build remains **post-MVP** (P3), but the `Organization`/`org_id` seam ships from day one so it's never a rewrite.

---

## Changelog

### v1 → v2 (internal revision)

- Added Section 0 — pulled five blocking decisions out of open questions with recommended defaults
- Added Section 4 — product success metrics and validation sequence (v1 had none)
- Added Section 11 — data model, identity resolution/dedup, structured-lite parts
- Added Section 14 — notifications & communication; approval timeout/escalation
- Added Section 18 — lifecycle edge cases: rework/warranty, abandoned vehicle, no-show, cancellation, multi-mechanic, ownership transfer
- Added Section 19 — proof integrity & trust
- Added Section 22 — data privacy / PH Data Privacy Act
- Added Section 24 — media storage volume, retention, cost; video flagged
- Added Section 25 — Taglish localization
- Strengthened payments (Section 16) — deposits, refunds, real verification control
- Resolved queue rules (Section 9.2) — granularity, wait-time source, staleness guard, remote-join off, service lanes
- Added reporting data-foundation caveats (Section 20) and template management (Section 12.7)
- Committed one stack (Section 27) and named offline-sync and customer-uptime risks
- Trimmed open questions (Section 30) to only those still genuinely unresolved

### v2 → v1.0 (this document — merge and confirm)

- **D1 confirmed:** Bespoke-first, SaaS-aware — `tenant_id` on all tables from day one
- **D2 confirmed:** Supabase Cloud for MVP/v1; local edge deferred as premium add-on
- **D3 confirmed:** At least one notification channel (SMS or copy-to-Messenger) ships in MVP
- **D4 confirmed:** 3–4 required photos per service template gate "mark job done"; skips require an explicit reason
- **D5 confirmed:** One customer → many vehicles; `VehicleOwnership` join with `from`/`to` dates
- Added Section 8.4 — works gallery approval flow (gallery photo promotion + consent)
- Added Section 12.5 — diagnostics photo flow example
- Added Section 12.10 — multi-mechanic job support (mechanic-side design)
- Added Section 14.3 — notification events table
- Added Section 15.4 — approval mechanism (typed name + IP + timestamp as default; drawn signature optional)
- Added Section 27.4 — migration workflow (Prisma Migrate + local Supabase dev environment)
- Added Section 27.5 — authentication strategy for all actor types including shared mechanic tablets
- Tenant isolation: documented as application-layer (`tenant_id` on all Prisma queries), with RLS as optional secondary defense; avoids Prisma/RLS incompatibility complexity in v1

### v1.0 → v1.1 (architecture commitment + KISS onboarding)

- **Multi-tenancy committed to RLS-first (Option A):** Postgres Row Level Security keyed on a `tenant_id` JWT claim is now the *primary* isolation mechanism, replacing the earlier app-layer-filtering approach. Supabase Auth owns identity; Prisma is migrations-only; runtime queries go through `supabase-js` so RLS is always in force (Section 27.1)
- **Resolved the Supabase-Auth-vs-Prisma identity conflict** — single source of truth for staff identity; customer portal stays token-based with explicit query scoping (Section 27.5)
- **Storage isolation** spelled out — tenant-prefixed R2 paths + signed URLs (Section 27.1)
- **Offline storage security** added to Section 27.2 (browser storage is plaintext; purge-after-sync, PIN re-auth, disk encryption, append-only sync queue) — informed by how Odoo POS scopes its offline surface
- **Added Product Principle #10 (KISS / no-brainer adoption)** — Section 6
- **Added Section 33 — Onboarding, Branding & Feature Configuration:** minimal sign-up, skippable first-run wizard, ready-to-use seeded defaults, per-tenant logo/theme white-labeling, and opt-in feature toggles (including the proof-photo "image recorder" as a togglable module) with Simple/Standard/Full presets
- Storage: documented Cloudflare R2 as production target (zero egress) vs Supabase Storage for dev/MVP
- v1 service categories, full status enumerations (13 statuses), and role permission detail restored from v1 draft

### v1.1 → v1.2 (mechanic capture + network reliability)

- **Added Section 12.12 — Photo Capture Method & Device Strategy:** committed to native camera capture (`<input capture>`) over a custom `getUserMedia` viewfinder; device-agnostic capture (shared tablet *or* mechanic's phone via claim-job); legibility as the real bar; explicit no-silent-loss pipeline ordering
- **Added Section 27.4 — Network Reliability Tiers:** separated WAN vs LAN problems; made **pure cloud (zero network setup) the default** since modern internet is generally reliable, with the PWA offline queue as the safety net; better Wi-Fi (APs) and a local photo store-and-forward relay are optional add-ons; full local edge stays deferred (P3). Renumbered Migration → 27.5, Auth → 27.6
- **Updated Section 28 (spike):** native-capture criterion, photo-legibility criterion, run on real worst-bay Wi-Fi and on a phone, client-side compression crash test
- **Updated Section 12.11:** tethered stylus mitigation for greasy/gloved capacitive touch

### v1.2 → v1.3 (dropped Prisma — Supabase-native tooling)

- **Removed Prisma from the stack.** Rationale: once we committed to RLS-first isolation (queries via `supabase-js`) and Supabase Auth, Prisma's only remaining role was migrations — and it cannot express RLS policies, functions, triggers, `pg_cron`, or Realtime config, which would split the schema across two parallel migration systems. Prisma earns its keep as a *query layer* (Option B), which we did not choose. (If an ORM is ever genuinely wanted, the right one here is Drizzle — SQL-first and RLS-friendly — not Prisma; but it is still not needed.)
- **Replaced with Supabase-native tooling:** Supabase CLI migrations (one SQL history for tables + RLS + functions + cron + Realtime), `supabase gen types typescript` for a typed `supabase-js` client, Supabase Studio for the GUI. Updated Sections 27.1, 27.5, 27.6, and Section 32.
- Net effect: fewer moving parts, no split-brain schema, and the generated types are actually used (Prisma's would have been wasted since queries go through supabase-js).

### v1.3 → v1.4 (final stack: hosting + custom domain add-on)

- **Finalized hosting:** Vercel for the Next.js apps + static hosting for the Vite PWA, with host-aware middleware for tenant resolution. Docker + Caddy + Cloudflare Tunnel are now explicitly scoped to the *deferred local-edge tier only*, not the cloud default (Section 27.1).
- **Added `pg_cron` row** for reminders/background jobs (Section 27.1).
- **Added Section 33.8 — Custom Domain (paid add-on):** default `{shop}.shoptrace.app` subdomain automatic at signup; custom domain (`shopname.com`) as an upsell covering the customer-facing surfaces (tracking portal + public site), with auto-provisioned certs via Vercel Domains API (or Cloudflare for SaaS at scale) and a self-serve DNS-verification flow.
- **Added `Domain` entity** (Section 11.1) and a custom-domain feature toggle (Section 33.6); added custom domain to SaaS pricing axes (Section 26.3).

### v1.4 → v1.5 (rename to ShopTrace + booking, customer media, consumer-app seam)

- **Renamed the product to ShopTrace.** *AutoLounge* is now used only as the example/pilot shop (tenant #1). Updated the title, Sections 1–2, platform domains (`*.shoptrace.app`, `app.shoptrace.app`, tracking-link format), default-theme/white-label self-references, and the SaaS framing. Added a naming note to the header.
- **Added Section 9.6 — Appointment Booking (P2):** distinct from the walk-in queue; simple lane/day-cap capacity; booking pre-creates a draft work order; reuses no-show/reschedule (18.3) and notifications (14). Feature-toggled, off by default.
- **Added Section 9.7 — Customer-Supplied Media & Notes (P2):** customers attach photos/short videos/notes that surface to the mechanic as a labelled "Customer-reported concern," strictly separated from shop proof (19), within the media budget (24). Feature-toggled.
- **Added Section 34 — Consumer Maintenance Tracker (parked future product):** *"[app] by ShopTrace"*. Documented as a *separate* product (opposite ownership model: car-owner-owned and cross-tenant vs shop-owned multi-tenant), with the integration seam designed now — owner identity, verified vehicle ownership (plate + shop-issued OTP) as the link, a clean cross-tenant read API, the growth-flywheel rationale, and A/B phasing. **Build nothing until pilot validated.**
- Added booking, customer media, and custom domain to P2; consumer tracker to P3; booking + customer media to MVP nice-to-haves (Sections 29.4, 31).

### v1.5 → v1.6 (consumer app spun out to its own PRD + backend)

- **Decided the consumer app is a separate product *and* separate backend**, integrated to ShopTrace via a partner API (not co-located in the shop Supabase). Reworked Section 34 accordingly (34.1 rationale, 34.2 partner API + two ShopTrace-side build gates).
- **Added `docs/consumer-app-prd.md`** — full spec for *Garage by ShopTrace*: positioning, retention thesis, the KISS five-pillar spine, PH daily-utility hooks (number coding, fuel prices), document vault with expiry reminders, the enthusiast build-sheet, resale-ready verified history, the LLM quick-capture design, RFID toll-balance automation (the realistic notification-listener + predictive-reminder ladder, given there is no public API), Expo/React Native client choice, consumer-owned data model, MVP/phasing, and DPA privacy handling.

### v1.6 → v1.7 (gap resolutions + multi-shop dashboards + trust controls)

- **Resolved high-priority flow gaps from `user-journeys.md`:** customer two-way messaging as per-WO threads (14.4, G4); intake funnel for inquiry/booking → work order (10.6, G5/G6); pre-work estimate approval for the repair path (15.6, G8/G16); partial-payment & credit ("utang") release with manager authorization (16.8, G10); data import + parallel-run at onboarding (33.9, G1/G3); **Action Center** (Section 35, G12).
- **Added Section 36 — Multi-Shop Management & Owner Dashboards:** `Organization` layer above the shop tenant (`org_id` seeded from day one), read-only cross-branch consolidated dashboards with benchmarking, and an explicit "why the numbers can be trusted" linkage to the trust controls and data-foundation discipline.
- **Added Section 21.3 — Pricing & Work-Order Change Controls:** role restriction, maker–checker for above-threshold discounts/overrides, work-order locking after release/payment, and a tamper-evident before→after audit trail. New audit events in 23.1.
- **New entities:** `Organization`, `Inquiry`, `Thread/Message`, `Release` (Section 11.1); new flags on `WorkOrder`/`Estimate`.
- **Strengthened Section 16.7 (BIR):** reframed as record-keeping-not-receipt-issuing — ShopTrace never issues an OR/SI (stamps internal docs "NOT an Official Receipt"), stores the shop's manual OR reference, history is out of BIR scope; CAS/POS registration is a deliberate later opt-in. Not legal advice.
- **Scoped Messenger integration (14.5):** copy-to-Messenger for MVP; Phase 2 limited to inbound-triggered + click-to-Messenger within Meta's 24h window; never for cold reminders (SMS for those).

### v1.7 → v1.8 (remaining gaps closed + fresh UX/completeness/optimization critique)

- **Closed remaining flow gaps:** notification reliability + tracking-link non-open follow-up (14.6, G7/G13); mechanic offline UX + job handoff (12.13, G15/G17); returning-customer recognition, multi-vehicle, plate-less/conduction-sticker, quick walk-in (10.7, G11/G22); edge-case actor flows incl. decline-continuation, escalation resolution, cross-role approval routing (18.7, G9/G14/G18/G19/G23).
- **New gaps found and resolved (fresh critique):** service price catalog (15.7, G24); audit-log immutability (23.3, G25); image derivatives/thumbnails (24.6, G26); global search (10.8, G27); success-metric instrumentation (4.3, G28); VAT display + senior/PWD discount recording (16.9, G29); per-customer language preference (25, G31).
- **New entities:** `ServiceCatalogItem`, `EventLog` (11.1).
- **Registered but still open** (in `user-journeys.md` G32–G41): empty states, staff real-time alerts, undo/correction, testing+seed data, retention purge job, **backup provider+restore (G37, launch-blocker)**, booking-vs-availability, parts ETA, accessibility, time-zone discipline.
