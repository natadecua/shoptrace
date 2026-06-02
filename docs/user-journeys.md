# ShopTrace — User Journeys & Gap Register

**Version:** 0.1  
**Date:** 2026-06-02  
**Purpose:** Map every actor's end-to-end journey to surface missing transitions, dead-ends, and undefined states — *before* building. Each journey ends with the gaps it exposes. Section 9 consolidates all gaps into a register with severity and where to fix.

**Scope:** ShopTrace (shop platform). The Garage consumer-app journey is included only at the seam (Journey 7). See `docs/consumer-app-prd.md` for that product's internal journeys.

---

## Legend

- ✅ Covered in the PRD (section noted)
- ⚠️ Partially covered — flow has an undefined step
- ❌ Gap — not defined anywhere

---

## Journey 1 — Shop Owner: Sign-up → Go-Live

1. Sign up (email + shop name) ✅ §33.2
2. First-run wizard: basics → branding → services → team → done ✅ §33.3
3. **Import existing customers / vehicles / history** ❌ — no import flow; real shops don't start empty
4. Pick a feature preset (Simple / Standard / Full) ✅ §33.6
5. Create first real work order ✅ §33.3
6. **Invite staff → staff accept → first login → set PIN** ⚠️ §27.6 names the invite, but the accept→first-login→PIN-setup steps aren't defined
7. **Train staff / parallel-run with paper** ❌ — no go-live/transition guidance (do they run paper + ShopTrace together for a week?)
8. Go live ✅ (implicit)

**Gaps exposed:** data import (G1), staff invite-accept flow (G2), go-live/parallel-run transition (G3).

---

## Journey 2 — Customer: Discover → Released → Return

The spine journey. Three entry paths converge, then one lifecycle.

**Entry (one of):**
- **Walk-in** → staff create WO ✅ §10.2
- **Website/Messenger inquiry** → "pending inquiry" created ⚠️ §8.3 — but **conversion of pending inquiry → work order is undefined** (who triages, where it lives, how it's accepted/declined)
- **Booking** → confirmed booking pre-creates a draft WO ⚠️ §9.6 — booking→WO is sketched; the **day-of check-in** (booking becomes active queue entry) isn't

**Lifecycle:**
1. Customer is notified with tracking link ✅ §14.1 — but **if the link is never opened, nothing follows up** ⚠️ (escalation exists only for approvals, §14.2)
2. Customer opens portal, sees status/checklist/photos ✅ §13
3. **(Repair path) Initial estimate sent → customer approves before work begins** ❌ — only *added-issue* approval is defined (§15); the *up-front* estimate-approval gate is a missing journey
4. Mechanic works; customer watches progress ✅ §13.3
5. Issue found → customer notified → **Approve / Decline / Ask a question** ✅/⚠️ §13.3 — "Ask a question" has **no defined destination** (see Journey 3, G4)
6. If customer declines added work → **does original work still proceed? deposit? bay?** ⚠️ §18.4 has states, no actor flow
7. Final bill shown ✅ §13.3
8. Payment: cash / GCash / transfer; upload proof + reference ✅ §13.3
9. **Partial payment or "pay later" (utang) release** ❌ — only full-payment release is modeled
10. Admin verifies → vehicle released → customer notified ✅ §16.2, §14
11. Release sign-off ✅ §13.3
12. PMS reminder queued ✅ §17 → (later) reminder received → customer returns → **returning-customer recognition at intake** ⚠️ §11.2 dedups, but the *recognition UX* ("welcome back, here are your 2 vehicles") isn't a defined flow

**Gaps exposed:** inquiry→WO conversion (G5), booking check-in (G6), tracking-link non-open follow-up (G7), up-front estimate approval (G8), customer messaging destination (G4), decline-continuation (G9), partial/credit release (G10), returning-customer recognition (G11).

---

## Journey 3 — Service Advisor / Admin: Daily Operations

1. Open shop → set status (open/busy) ✅ §9.5
2. **Triage pending inquiries & bookings into the queue** ❌ §8.3/§9.6 produce them; triage flow missing (G5)
3. Intake walk-in → search/recognize customer & vehicle → create WO ✅/⚠️ §10.2, §11.2 (recognition UX, G11)
4. Assign mechanic(s) ✅ §9.5, §12.10
5. **Action center: see everything needing attention** ❌ — approvals waiting, payments to verify, **customer questions**, reminders due, escalations. No unified to-do surface (G12)
6. Review mechanic photos → approve customer-visible ✅ §10.5, design prompt 7
7. Prepare estimate (up-front or added) ✅ §15.1 — but up-front approval gate (G8)
8. Send approval request → **handle "Ask a question" replies** ❌ — no messaging inbox (G4)
9. Approval times out → escalation flag → **act on it** ⚠️ §14.2 flags it; the *resolution actions* (call, approve-on-behalf, hold) are listed but not a flow
10. Prepare final bill (apply deposit/discount/promo) ✅ §15, §16
11. Verify payment (reference + confirm) ✅ §16.2
12. Release vehicle → capture release sign-off ✅ §13.3
13. **Notification failed to send (SMS bounce)** ❌ — no failure path / retry / fallback-to-Messenger prompt (G13)

**Gaps exposed:** inquiry/booking triage (G5), action center (G12), customer messaging (G4), notification-failure handling (G13), escalation resolution flow (G14).

---

## Journey 4 — Mechanic: Job Execution

1. See assigned jobs today ✅ §12.2
2. Start job → checklist + required photos ✅ §12.3–12.6
3. **Native camera capture** ✅ §12.12
4. Find new issue → fill issue form → submit for admin review ✅ §12.8
5. Job blocked waiting for approval → **what does the mechanic do / see while waiting?** ⚠️ §12.4 has a "Waiting for approval" state; the *resume* trigger (admin approved → mechanic notified to continue) isn't defined
6. **Offline: capture continues, queue syncs on reconnect** ✅ §27.2 — but the *mechanic-facing* offline journey (what they see, the "N not synced" indicator, reconnect moment) isn't a defined screen flow ⚠️
7. **Shift handoff / overnight job / job passed to another mechanic** ❌ — multi-mechanic is modeled (§12.10) but the *handoff moment* (who owns it now, what transfers) isn't (G15)
8. Mark job done (gated on required photos) ✅ §12.6

**Gaps exposed:** approval→resume trigger (G16), mechanic offline UX flow (G17), shift/job handoff (G15).

---

## Journey 5 — Cashier / Accounting: Payments

1. See payments pending verification ✅/⚠️ (needs the action center, G12)
2. Verify payment (reference + confirm against record) ✅ §16.2
3. Record official receipt / invoice reference ✅ §16.7
4. **Refund** → manager approval → record reason/amount ✅ §16.4 (cross-role handoff to manager — flow is named, not detailed) ⚠️
5. **Partial / credit settlement** ❌ — no flow (G10)
6. Export payment reports ✅ §20.2

**Gaps exposed:** partial/credit (G10), refund cross-role handoff detail (G18).

---

## Journey 6 — Owner / Manager: Oversight

1. Action center / dashboard ❌ (G12)
2. Approve high-value discounts & refunds ✅ §21.2 — approval *request→decision* handoff not detailed ⚠️
3. Review reports ✅ §20 (note data-foundation caveats)
4. Manage promos, templates, users, settings ✅ §33, §12.7, §21
5. Review rework rate / quality signals ✅ §18.1, §20.1

**Gaps exposed:** action center (G12), approval-request routing (G19).

---

## Journey 7 — Cross-Product Seam: Customer → Garage App

1. Customer gets a **shop-issued OTP / claim link** (on job order or with tracking link) ⚠️ — the claim-issuance point exists in concept (§34.2) but isn't placed in any shop-side screen/flow yet
2. Customer installs Garage, claims vehicle via plate + OTP ✅ consumer-app §9
3. Garage pulls verified service history via **partner API** ⚠️ — API contract not yet written (G20)
4. Ownership transfer → consumer sees only their period ✅ §18.6, consumer §9

**Gaps exposed:** claim-issuance placement in shop UI (G21), partner API contract (G20).

---

## Journey 8 — Edge & Exception Journeys (states exist, flows don't)

§18 defines the *states*; these need *actor flows*:

- **No-show** (booked customer doesn't arrive) → who clears it, when, re-notify? ⚠️ §18.3
- **Cancellation** (customer cancels) → bay freed, deposit refund/forfeit, record kept ⚠️ §18.4
- **Abandoned / non-payment vehicle** → escalation contact log, storage fees, final notice ⚠️ §18.2
- **Rework / warranty comeback** → link to original WO, billable-or-not decision ⚠️ §18.1
- **One customer, two vehicles in the shop simultaneously** ❌ — not addressed (G22)

**Gaps exposed:** edge-state actor flows (G23, bundle), simultaneous multi-vehicle (G22).

---

## 9. Consolidated Gap Register

| ID | Gap | Severity | Where to fix |
|----|-----|----------|--------------|
| **G4** | **Two-way customer ↔ shop messaging** (inbox, who-answers, staff notification) — assumed by "Ask a question" and "message shop" | **High** | New PRD section + screen |
| **G5** | **Inquiry → work order conversion** / triage of pending inquiries | **High** | §8.3 + §10 |
| **G8** | **Up-front estimate-approval-before-work** journey (repair path), distinct from added-issue approval | **High** | §15 (new subflow) |
| **G12** | **Admin/owner action center** — unified "what needs me now" | **High** | New PRD section |
| **G1** | **Data import / migration** at onboarding (existing customers/vehicles/history) | **High** | §33 |
| **G10** | **Partial payment / credit ("utang") release** (PH reality) | **High** | §16 |
| **G20** | **Partner API contract** (ShopTrace ↔ Garage) — single source of truth | High | New `integration-api.md` |
| **G6** | Booking **day-of check-in** (booking → active queue) | Medium | §9.6 |
| **G7** | Tracking-link **non-open follow-up** | Medium | §14 |
| **G9** | **Decline-continuation** (declined added work → does original proceed?) | Medium | §18.4 |
| **G11** | **Returning-customer recognition UX** at intake | Medium | §10.2 / §11.2 |
| **G13** | **Notification send-failure** handling (SMS bounce → fallback) | Medium | §14 |
| **G14** | **Escalation resolution** flow (act on a timed-out approval) | Medium | §14.2 |
| **G15** | **Mechanic shift handoff / overnight job** ownership transfer | Medium | §12.10 |
| **G16** | **Approval → resume** trigger (mechanic told to continue) | Medium | §12 / §15 |
| **G17** | **Mechanic offline UX** flow (indicator, reconnect moment) | Medium | §12.11 / §27.2 |
| **G2** | **Staff invite → accept → first-login → PIN** flow | Medium | §27.6 / §33 |
| **G21** | **Claim-link issuance** placed in a shop-side screen | Medium | §34.2 + screen inventory |
| **G22** | **One customer, two vehicles** in the shop at once | Low | §10 / §11 |
| **G23** | **Edge-state actor flows** (no-show / cancel / abandoned / rework) | Low–Med | §18 |
| **G3** | **Go-live / parallel-run** transition guidance | Low | §33 / ops doc |
| **G18/19** | **Cross-role approval routing** (refund/discount request→decision) | Low | §21 |

### Artifact gaps (not flows, but build blockers — already known)

| Gap | Note |
|-----|------|
| **Screen inventory** | Numbered screens per surface + flow map — the journeys above are the raw material for it |
| **Schema (Supabase SQL + RLS)** | §11 entities → real tables + policies |
| **API / server-action contract** | App-layer endpoints; overlaps G20 |
| **Per-feature acceptance criteria** | Only MVP-level metrics (§4) exist |

---

## 10. Recommended Order to Close Gaps

1. **High-severity flow gaps first** (G4 messaging, G5 inquiry→WO, G8 up-front approval, G12 action center, G1 import, G10 partial/credit) — these change screens and the data model, so resolve before the schema is frozen.
2. **Write the screen inventory** using these journeys as the source — it will absorb most Medium gaps by forcing each transition onto a screen.
3. **Write the schema** (now informed by G4/G5/G8/G10 which add entities: `Message/Thread`, `Inquiry` lifecycle, `Estimate` approval state, partial-payment modeling).
4. **Write the partner API contract** (G20) as a shared doc.
5. **Per-feature acceptance criteria** alongside the screen inventory.
6. Edge-state actor flows (G23) and ops/go-live guidance (G3) can follow.

> **Key point:** several High gaps (messaging, inquiry→WO, up-front approval, partial payment) **add entities to the data model.** That's why they must be closed *before* the schema is written — otherwise the schema is rework.
