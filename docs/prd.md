# AutoLounge Service Hub — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-06-02  
**Status:** Authoritative — Section 0 decisions confirmed  
**Source:** Merged from v1 draft + v2 revision  

---

## Section 0: Blocking Decisions — All Confirmed

These decisions were pulled out of "open questions" because they block data model and stack design work. All five are now resolved.

| # | Decision | Resolved Answer |
|---|----------|-----------------|
| D1 | **Bespoke for AutoLounge, or SaaS from day one?** | **Bespoke-first, SaaS-aware.** Build for AutoLounge, but include `tenant_id` on every table from day one so multi-tenancy is a config change, not a rewrite. |
| D2 | **One stack, committed once.** | **MVP and v1 on Supabase Cloud** (Postgres + Auth + Storage + Realtime). Local edge mode is a premium add-on, deferred. This avoids two throwaway rewrites. |
| D3 | **Notifications are MVP, not P3.** | **At least one push channel ships in the MVP** — one-tap "send link / approval request" via a low-cost PH SMS gateway (Semaphore / Movider) or a copy-to-Messenger clipboard action with pre-built EN/Taglish templates. |
| D4 | **Photo discipline policy.** | **Minimum required set of 3–4 photos per service template gates "mark job done."** Everything beyond that is optional. Required-photo skips must include an explicit reason; they are never silent. |
| D5 | **Customer ↔ vehicle relationship.** | **One customer → many vehicles. Ownership is time-bound** via a `VehicleOwnership` join (from/to dates). History survives a sale. Prior-owner PII governed by retention rules. |

---

## 1. Working Product Name

**AutoLounge Service Hub**

Alternatives: ServiceTrack PH · JobProof Auto · GarageFlow PH · AutoProof Hub · LoungeOps

---

## 2. Product Vision

AutoLounge Service Hub is a digital operations and transparency platform for auto shops. It helps shops manage job queues, work orders, mechanic proof photos, customer approvals, payments, vehicle history, PMS reminders, and service reports — while still supporting familiar workflows like walk-ins, Messenger, phone calls, and paper job orders.

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

---

## 11. Data Model

### 11.1 Core Entities

| Entity | Notes |
|--------|-------|
| **Tenant/Shop** | Present from day one (D1). `tenant_id` on every table. |
| **Customer** | Name, contacts, consent flags. |
| **Vehicle** | Make/model/year, plate, VIN if available. |
| **VehicleOwnership** | Links Customer ↔ Vehicle with `from`/`to` dates. History survives a sale (D5). |
| **WorkOrder** | Belongs to one Vehicle (and via ownership at time of service, one Customer). |
| **ChecklistTemplate** | Per service type, editable by admin. Template CRUD is a required feature. |
| **PhotoTemplate** | Required/optional photo steps per service type, ordered. |
| **ChecklistItem** | Step within a template: required/optional flag, photo requirement, order. |
| **JobChecklist** | Instance of a template attached to a work order. |
| **JobChecklistItem** | Mechanic's completion state: pending/done/N-A/needs attention/blocked. Includes skip reason if required item is skipped. |
| **Photo** | Linked to a job and optionally a checklist item. Visibility flag: internal-only vs customer-visible. |
| **Issue** | Discovered during inspection. Linked to work order. Goes through admin review before customer sees it. |
| **Estimate / LineItem** | Labor, parts, supplies, discounts. |
| **Approval** | Linked to issue or estimate. Records customer response, timestamp, IP, typed name. |
| **Payment** | Amount, method, reference number, proof photo, verified by, timestamp. |
| **Deposit** | A payment applied before final billing; reduces the balance on the final bill. |
| **Discount / Promo** | Discount rule, campaign reference. |
| **Reminder** | PMS reminder linked to customer and vehicle. |
| **AuditLog** | All significant state changes (Section 23.1). |

### 11.2 Identity Resolution (Dedup Problem)

Plate and phone are both mutable, so neither is a perfect key.

- On intake, search existing customers/vehicles by plate, then phone, then name, and prompt staff to **link** rather than create a duplicate.
- **Plate is the primary vehicle match key** in practice. If a shop wants reliable vehicle history, plate should be captured at intake even though it is listed as optional. Flag this trade-off to the shop during onboarding.
- Provide an admin **merge tool** for duplicate customers/vehicles — duplicates will happen.

### 11.3 Parts in the MVP (Structured-Lite)

Fully free-text parts break "parts used" history and "revenue by service type" reports. Compromise:

- Parts entered as line items with **name, optional brand, qty, unit price** — structured fields, no stock tracking.
- A lightweight, growing **parts name autocomplete list** (seeded from past entries) keeps naming consistent without building inventory.
- Upgrades cleanly to full inventory in a later phase.

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
- Large buttons — designed for hands with grease and gloves
- Works on affordable Android tablets (tested on target hardware — see Section 28)
- Visible upload status per photo
- Retry failed uploads automatically; surface retry button within 5 seconds of failure
- No silent photo loss
- Clear required vs optional photo indicators
- Works on slow / intermittent Wi-Fi (photos queue and retry automatically)

---

## 13. Customer Tracking Portal

### 13.1 Purpose

A private link to view status, checklist progress, approved proof photos, issues found, estimate, final bill, and payment instructions. No app download required.

### 13.2 Access Model

Link format: `https://track.shopdomain.com/track/{secure-token}`

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
- Messenger API integration if feasible
- Delivery/read status tracking
- Opt-out management

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

The product **does not claim BIR compliance.** It stores a manual OR / sales-invoice / receipt reference number and supports BIR-ready reports for the shop's existing accounting process.

> **Known limitation:** The shop still issues official receipts outside the system, creating a double-entry step. This is an accepted v1 constraint. Flag during onboarding so it is not a surprise.

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
| Photo visibility changed | User, photo ID, old/new visibility |
| Required-photo skip | Mechanic, skip reason, checklist step |
| Template created / edited | User, timestamp |
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

---

## 25. Localization

Many staff and customers are most comfortable in Filipino/Taglish.

- Customer-facing messages, reminder/approval templates, and key UI labels available in **English and Taglish at MVP**
- Customer portal labels, status descriptions, and notification templates in both languages
- Taglish templates for: tracking link notification, approval request, ready-for-release notice, PMS reminder, payment confirmed
- Full multi-language admin UI is later, but customer-facing Taglish materially affects adoption (A1/A4)

---

## 26. SaaS Expansion Direction

The custom AutoLounge system can later evolve into a SaaS for auto shops.

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

---

## 27. Technical Architecture

### 27.1 Committed Stack (per D2)

| Layer | Technology |
|-------|-----------|
| Admin app | Next.js (App Router) |
| Customer portal | Next.js (App Router) |
| Mechanic app | Vite React PWA |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage (dev/MVP) | Supabase Storage |
| Storage (production / scale) | Cloudflare R2 |
| Realtime | Supabase Realtime (queue board, upload status) |
| ORM | Prisma |
| Reports | SQL views on PostgreSQL |
| Styling | Tailwind CSS + shadcn/ui |
| Notifications (MVP) | Semaphore or Movider (PH SMS) + copy-to-Messenger |
| Monitoring | Sentry + uptime monitoring |
| Payments (customer) | Manual in v1 (GCash/bank) — no gateway |
| Payments (SaaS billing) | PayMongo / Xendit (added when SaaS launches) |

**All tables include `tenant_id` from day one.** Tenant isolation enforced at the application layer (Prisma filters every query by `tenant_id`). Row Level Security in Supabase can be added as a secondary defense layer but is not the primary isolation mechanism in v1 (avoids Prisma/RLS complexity during single-tenant development).

### 27.2 Offline Sync Risk

"Caches and syncs when online" hides real complexity:
- Conflict resolution when admin edits a work order while the mechanic is offline
- Photo upload ordering and partial-upload recovery
- Cheap-tablet local storage limits
- Two mechanics editing the same job simultaneously

**Scope offline to photos + checklist-state only** in early phases, with last-write-wins for checklist state and server-side photo deduplication. Defer full offline work-order editing to a later phase.

### 27.3 Customer Portal Uptime

For local-edge deployments, the customer portal exposed via a shop's consumer ISP goes down when the shop's internet goes down. Host the **customer portal in the cloud** even when admin runs locally.

### 27.4 Migration Workflow

Schema migrations via Prisma Migrate:
- `prisma migrate dev` for local development
- `prisma migrate deploy` applied in CI/CD before each deployment
- Local Supabase development via `supabase start` (Docker) so developers have isolated instances and do not share a live database

### 27.5 Authentication Strategy

| Actor | Method |
|-------|--------|
| Owner / Manager / Admin / Cashier | Email + password via Supabase Auth; 2FA on owner/cashier |
| Mechanics on shared tablets | Individual mechanic accounts; tablet stays logged into the mechanic surface; PIN re-auth on each job start |
| New staff onboarding | Email invite link via Supabase Auth invite flow |
| Customer portal | Token-based (no Supabase Auth); optional PIN as second factor (Section 13.2) |

---

## 28. Technical Spike — Mechanic Photo Flow

Build this **first.** It is the highest-risk UX feature.

### 28.1 Scope

One PMS work order on one affordable Android tablet.

### 28.2 Success Criteria

1. Camera opens in under 3 seconds
2. Mechanic captures 8 required PMS photos via in-app capture (not gallery upload)
3. 8 photos upload in under 4 minutes on weak Wi-Fi (throttled to ~1 Mbps in test)
4. Failed upload shows retry button within 5 seconds
5. No photo loss after a simulated connection drop (airplane mode toggle mid-upload)
6. Mechanic completes the entire flow without developer instructions
7. Admin can see per-photo upload status in real time
8. Customer tracking page shows admin-approved photos correctly
9. One short issue video (≤30s) captures and uploads within acceptable time/size — or video is explicitly cut from MVP if result is poor
10. Concurrent upload from two mechanics on the same job completes without conflicts or data loss

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
- Estimate/final bill + deposit support
- Payment proof + verification control
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
- Advanced reports
- Rework/warranty tracking and rework-rate report
- Staff performance reports (only after time-capture exists)

### P3 — Future

- Automated SMS (no staff action)
- Messenger API integration
- Native mechanic app (if PWA fails the spike)
- Full inventory management
- SaaS subscription billing
- Multi-branch support
- Local edge server
- Accounting integrations
- Video proof at scale

---

## 32. Suggested Next Work Sessions

1. ~~Resolve Section 0 decisions (D1–D5)~~ — **Done. See Section 0.**
2. Run the 2-week paper-baseline study (Section 4.2) to size the real pain before building.
3. Build the technical spike (Section 28) — do not start the mechanic app without passing this first.
4. Define the exact MVP screen inventory per surface (count screens, name them, sketch transitions).
5. Design the Prisma schema for Section 11 entities with relationships.
6. Design the PMS and brake checklist/photo templates and the template-management UI.
7. Design the customer tracking portal layout and notification message templates (EN/Taglish).
8. Define queue tracker UI rules and status-band logic (Section 9.2).
9. Define pricing and SaaS packaging — only after pilot evidence.
10. Turn the MVPflow (Section 29.2) into a clickable prototype.

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
- Storage: documented Cloudflare R2 as production target (zero egress) vs Supabase Storage for dev/MVP
- v1 service categories, full status enumerations (13 statuses), and role permission detail restored from v1 draft
