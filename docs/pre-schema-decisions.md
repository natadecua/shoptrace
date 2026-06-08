# ShopTrace — Pre-Schema Decision Sheet

**What this is.** The single authoritative resolution of every decision that must be settled **before** the schema is written (roadmap §6, which pulls in the §3 "decide before schema" gating gaps and the §5 contradictions). Each item has a **recommended default marked DECIDED**; the handful that are genuine owner judgment calls are flagged **⚑ CONFIRM**. These are mostly cheap columns/enums and one-time definitions — but each is a painful migration if discovered late, so they gate the schema.

**Status:** ✅ LOCKED (owner-confirmed 2026-06-08) · Branch: `claude/autolounge-service-hub-prd-Eccmn`
**Aligns to:** PRD §11 (data model), §27 (multi-tenancy/RLS), §16.7 (BIR). Naming follows the PRD exactly.

---

## 0. Decision index

| # | Decision | Status | Schema seam |
|---|---|---|---|
| A | Estimate/approval split (C1) | ✅ DECIDED | states on `work_order`; catalog gated by plan |
| B1 | Org / tenant / location identity | ✅ DECIDED | `org_id`, `tenant_id`, `location_id` |
| B2 | Canonical `vehicle_id`, plate as alias (P25) | ✅ DECIDED | `vehicle.id` + `plate` + `plate_history` |
| B3 | Comeback = `parent_work_order_id` (P3) | ✅ DECIDED | self-FK on `work_order` |
| B4 | `payer_type` seam (K, C8) | ✅ DECIDED | enum on `work_order` |
| B5 | Customer ↔ vehicle ownership (D5) | ✅ DECIDED | `vehicle_ownership` join |
| B6 | Share/claim tokens (O, C4) | ✅ DECIDED | `share_grant` + `claim_code` |
| C1 | Money type & precision | ✅ DECIDED | integer centavos |
| C2 | Rounding rule (P19) | ✅ DECIDED | per-shop setting, default off |
| C3 | Price snapshot on bill (P23) | ✅ DECIDED | denormalized line columns |
| C4 | Estimate lifecycle states (P1/P2/P43) | ✅ DECIDED | enum + variance flag |
| C5 | Estimate variance re-approval threshold | ✅ DECIDED | >15% **and** >₱500 |
| C6 | Estimate expiry (P40) | ✅ DECIDED | 7 days |
| C7 | Cancellation states (P4) | ✅ DECIDED | status enum + reason |
| C8 | Partial payment / utang | ✅ DECIDED | `payment` rows + balance |
| C9 | BIR posture (§16.7) | ✅ DECIDED | `manual_or_ref`, no OR issuance |
| D1 | Portal token policy (P15) | ✅ DECIDED | `share_grant` token |
| D2 | PIN on money actions | ✅ DECIDED | customer-set `customer.portal_pin_hash` |
| D3 | Staff auth & solo-role (OWN-J1) | ✅ DECIDED | roles = permission sets |
| E1 | Metric definitions (P32) | ✅ DECIDED | defined below |
| E2 | Event taxonomy (P34) | ✅ DECIDED | `domain.verb` snake_case |
| E3 | Audit coverage (P35) | ✅ DECIDED | `audit_event` append-only |
| E4 | Photo tamper-evidence (P28) | ✅ DECIDED | server `captured_at` + hash |
| F1 | DPA erasure (P26) | ✅ DECIDED | anonymize, keep record |
| F2 | Retention windows (P27) | ✅ DECIDED | defaults below |
| F3 | Backup + tested restore (G37) | ✅ DECIDED | **launch blocker** |
| G1 | Tenant "today" boundary (P12) | ✅ DECIDED | `timezone`, default Asia/Manila |
| G2 | Progress mode seam (Theme T) | ✅ DECIDED | `progress_mode` enum |

---

## A. Estimate / approval split (C1) — ✅ DECIDED

The **found-issue approval loop is MVP/Basic spine**, in every tier. The reusable **price catalog** (`service_catalog_item` with stored prices that auto-fill estimates) is the **Pro convenience**, gated by plan/`feature_state`.

- **Schema:** `work_order` carries estimate/approval states regardless of tier. `service_catalog_item` exists for all but price auto-fill is a feature flag. Fixes the tier-sheet wording contradiction.

---

## B. Identity seams

**B1 — Org / tenant / location.** Three levels, all present day one:
- `organization` (`org_id`) — groups one+ shops under one owner. Single-shop org by default.
- `tenant` / shop (`tenant_id`) — **the RLS isolation key.** On every table.
- `location_id` — branch within a tenant (nullable; single-location default). Cheaper than discovering multi-branch later.
- **RLS:** `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid` on every tenant table; `org_id` grants cross-branch **read-only**.

**B2 — Canonical vehicle identity (P25).** `vehicle.id` (UUID) is canonical and permanent. `plate` is a **mutable, indexed alias** (cars get replated). Keep `plate_history` (plate, from, to) so history survives a replate and search still finds old plates.

**B3 — Comebacks (P3).** `work_order.parent_work_order_id` (nullable self-FK). A comeback/redo is a **new** WO linked to its parent — preserves the original's integrity and lets us measure true rework rate.

**B4 — Payer seam (K, C8).** `work_order.payer_type` enum: `customer | insurer | fleet | warranty`, default `customer`. One free column now; insurance/fleet stay **parked** but never require a rewrite. `approval.approver_type` mirrors it.

**B5 — Ownership is time-bound (D5).** One customer → many vehicles via `vehicle_ownership` (customer_id, vehicle_id, from_date, to_date). History survives a sale; prior-owner PII governed by F1/F2 retention.

**B6 — Share / claim tokens (O, C4).** One `share_grant` token infrastructure, typed by use: portal tracking (per-WO), portable history (per-vehicle, D5), lounge `claim_code` (O), QR intake (F4). Don't build four token systems.

---

## C. Billing rules

**C1 — Money type ⚑ CONFIRM.** Store all money as **integer centavos** (`bigint`), never floats. Display formats to ₱#,###.## . *Recommend confirm: integer centavos.* (Avoids every float-rounding bug; standard for money.)

**C2 — Rounding rule (P19) ⚑ CONFIRM.** Line math is exact (centavo). **Default: no implicit rounding.** Optional per-shop setting `round_total_to_peso` (default **OFF**) that rounds the grand total half-up to ₱1.00 for cash convenience. *Recommend confirm: default OFF, available as a toggle.*

**C3 — Price snapshot (P23) — ✅ DECIDED.** Bill/estimate lines store `description`, `unit_price`, `qty`, `line_total` **captured at add-time**. Never reference the live catalog — a later catalog price change must not mutate a historical bill.

**C4 — Estimate lifecycle (P1/P2/P43) — ✅ DECIDED.** `estimate.status` enum: `draft → sent → approved → partially_approved → declined → expired`. A declined estimate **parks** the WO (re-quotable). `partially_approved` records per-line approve/decline. `variance_reapproval_required` boolean trips when the final bill materially exceeds the approved estimate (see C5).

**C5 — Variance re-approval threshold ⚑ CONFIRM.** Final bill needs a fresh customer OK when it exceeds the approved estimate by **more than 15% AND more than ₱500** (both, so tiny jobs aren't gated by the % and big jobs aren't gated by trivial pesos). *Recommend confirm these two numbers.*

**C6 — Estimate expiry (P40) ⚑ CONFIRM.** An unanswered `sent` estimate auto-flags `expired` after **7 days** (still re-sendable). *Recommend confirm: 7 days.*

**C7 — Cancellation states (P4) — ✅ DECIDED.** `work_order.status` includes `cancelled` with required `cancel_reason`. Cancellation allowed pre-release; post-release corrections go through the void/refund flow (P20, P2).

**C8 — Partial payment / utang — ✅ DECIDED.** A bill has many `payment` rows; `amount_paid = sum(payments)`, `balance = total − amount_paid`. Release allowed with an outstanding balance **only** via an explicit, audited "release with balance (utang)" action (owner-permissioned). Receivables aging is P2.

**C9 — BIR posture (§16.7) — ✅ DECIDED.** ShopTrace **never issues an OR/SI.** Printable financial docs are **Statements of Account / billing statements**, stamped **"NOT an Official Receipt — for service-record purposes only."** Store the shop's **`manual_or_ref`** (nullable) when they issue their own OR by hand. No CAS/POS registration in MVP.

---

## D. Auth

**D1 — Portal token policy (P15) — ✅ DECIDED.** Customer portal uses a **per-WO `share_grant` token** (not a customer login), **revocable**, with an expiry. Tracking **read** = token only. Token validated by a server route that scopes the query explicitly — customer reads never touch Supabase Auth/RLS-by-JWT.

**D2 — PIN on money/approval actions — ✅ DECIDED (customer-set, not phone-derived).** Viewing status = token only. **Approving an estimate or confirming payment** additionally requires a **customer-set PIN** — *not* a value derived from the phone number (which would be guessable).
- **Setup:** on the customer's **first money action** via any portal link, they choose a 4–6 digit PIN. It is stored **hashed** on the `customer` record (`customer.portal_pin_hash`, `portal_pin_set_at`) — never plaintext, never phone-derived.
- **Reuse:** the same PIN works across all of that customer's future WOs/links (set once, owned by the customer) — no per-visit re-setup.
- **Recovery:** shop can **reset** the PIN (audited via `audit_event`); a reset clears the hash and forces re-setup on the customer's next money action.
- **Abuse:** rate-limit attempts, lock out after N failures and escalate to the shop.
- **Schema seam:** `customer.portal_pin_hash` (nullable), `customer.portal_pin_set_at`. The `share_grant` token still gates *which* WO is visible; the PIN gates *money actions* and is customer-level.

**D3 — Staff auth & solo-role (OWN-J1) — ✅ DECIDED.** Supabase Auth (email+password; 2FA on owner/cashier). `role` ∈ `owner | manager | advisor | mechanic | cashier` is a **permission set, not a seat** — one user can hold several. The most common PH shop is one person = owner+advisor+mechanic; **the app must never force role-switching friction.** `work_order.owned_by` (advisor) is a cheap field (ADV-J1).

---

## E. Instrumentation (lock day one)

**E1 — Metric definitions (P32) — ✅ DECIDED.**
- **Cycle time** = `released_at − checked_in_at` (per WO).
- **Bay/active time** = sum of in-progress intervals.
- **Approval latency** = `approved_at − estimate_sent_at`.
- **Rework rate** = WOs with a non-null `parent_work_order_id` ÷ total, trailing 30d.
- **Efficiency** = booked/estimated duration ÷ actual.
- **Revenue** = sum of `payment.amount` (cash basis), shop-tz day.
- **Receivables** = sum of open `balance`.

**E2 — Event taxonomy (P34) — ✅ DECIDED.** `domain.verb`, snake_case, e.g. `work_order.created`, `work_order.assigned`, `checklist_item.completed`, `proof_photo.uploaded`, `issue.found`, `estimate.sent`, `estimate.approved`, `estimate.declined`, `bill.created`, `payment.recorded`, `work_order.released`, `notification.sent`, `notification.failed`. Frozen now so analytics/audit don't drift.

**E3 — Audit coverage (P35) — ✅ DECIDED.** Append-only `audit_event` (immutable) on: every WO state transition, all money events, all PII access/edits, photo **skips** (with reason), token issue/revoke, and release-with-balance. `actor_id`, `tenant_id`, `entity`, `action`, `before/after`, `at`.

**E4 — Photo tamper-evidence (P28) — ✅ DECIDED (cheap now).** On upload, the **server** sets `captured_at` and stores a content **hash** + uploader + WO. Cheap to do day one, expensive to retrofit; underpins the trust claim.

---

## F. Compliance (Philippine DPA)

**F1 — Erasure (P26) — ✅ DECIDED.** Erasure **anonymizes PII** (name/phone/email → tombstone) but **keeps the operational & financial record** (BIR/audit integrity). Never hard-delete financial rows. Soft-delete + anonymize.

**F2 — Retention windows (P27) ⚑ CONFIRM.** Proposed defaults:
- Financial records & `audit_event`: **10 years** (BIR alignment).
- Prior-owner PII after `vehicle_ownership.to_date`: purge after **a grace window (default 1 year)**.
- Portal `share_grant` tokens: expire **90 days** post-release.
- Proof media: **3 years** (plan-dependent; storage quota is P29).
*Recommend confirm these four windows.*

**F3 — Backup + tested restore (G37) — ✅ DECIDED · LAUNCH BLOCKER.** Supabase PITR **plus** scheduled logical dumps to R2; a **quarterly tested restore** drill. No launch without a *proven* restore.

---

## G. Ops

**G1 — Tenant "today" boundary (P12) — ✅ DECIDED.** Per-tenant `timezone` column, default **`Asia/Manila`**. All day-bucketing (reports, reminders, "today" queue) is midnight–midnight in shop-local tz. Store timestamps in UTC; bucket in tz.

**G2 — Progress mode seam (Theme T) — ✅ DECIDED.** `work_order.progress_mode` enum: `checklist | timer | stage`, default `checklist`. Leaves the car-wash/detailing archetype as a config change, not a rewrite — mirrors the `tenant_id` discipline.

---

## H. Confirmation log — ALL DECIDED ✅

Owner-confirmed 2026-06-08:

1. **C1** money = integer centavos — ✅ confirmed.
2. **C2** rounding — default **off**, optional per-shop round-total-to-peso — ✅ confirmed.
3. **C5** variance re-approval = **>15% AND >₱500** — ✅ confirmed.
4. **C6** estimate expiry = **7 days** — ✅ confirmed.
5. **D2** PIN on **approve/pay** — ✅ confirmed, **amended**: customer-**set** PIN (hashed, reusable, shop-resettable), *not* phone-derived.
6. **F2** retention windows (10y financial · 1y prior-owner PII grace · 90d tokens · 3y media) — ✅ confirmed.

**The sheet is fully locked. No open pre-schema decisions remain.**

---

## Next, once confirmed
1. Lock this sheet (flip ⚑ → ✅).
2. P0 **mechanic photo-flow spike** (§28) — the make-or-break paper-test surface.
3. Write the **schema** as Supabase migrations (PRD §11 + these seams).
4. **Screen inventory** for MVP surfaces only.
