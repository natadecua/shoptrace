# ShopTrace — Process & Logic Layer (UI-independent)

**Purpose.** Flesh out the **engine** — the processes, rules, jobs, and contracts that exist *regardless of how the UI looks*. UI is still being explored, so this doc deliberately stays at the logic/data/process layer: state machines, gates, channels, background jobs, money math, data integrity, media, audit, and integration. It's where the product's *behavior* is pinned down before pixels.

**How to read this.** Each layer has **Processes** (what the engine does), **Features** (capabilities that live here), and **🕳 Gaps / decisions** (open calls — flagged for collaborative resolution). Gaps are numbered `P#` (process gaps) to extend the existing `G#` register in `user-journeys.md`.

**Relationship to other docs:** `prd.md` = committed spec · `feature-backlog.md` = assessed-not-committed features · this doc = the cross-cutting *mechanics* under both. When a process here graduates, it lands in the relevant `prd.md` section.

---

## Layer 1 — Lifecycle State Machine (the heart)

The work-order and queue statuses (§9.4, §10.3) are only useful if the **transitions** are pinned: which moves are legal, what guards them, and what they trigger. This is pure logic — no UI.

### Processes
- **WO state machine.** Each status has a defined set of legal next-states, **guard conditions** (must be true to transition), and **side effects** (events emitted, notifications queued, timestamps stamped).
- **Gates** (hard guards that block forward motion):
  - **Photo gate** — "mark job done" blocked until the required photo set (3–4 per template, D4) is complete or each skip has a logged reason.
  - **Approval gate** — on the repair path, work that needs sign-off can't proceed until the estimate/issue is approved (§15.6); approved subset only.
  - **Verification gate** — a payment isn't "settled" until proof is verified by an authorized role (§16).
  - **Release gate** — vehicle release blocked unless balance is settled **or** a credit/"utang" release is authorized with a reason (§16.8).
  - **Lock gate** — after release/payment, the WO locks; price/scope edits require a trusted role and are audited (§21.3).
- **Derived states (computed, never stored):** `blocked`, `waiting-on-customer`, `overdue-approval`, `ready-for-pickup`, `in-transit-between-bays` (Theme B) — all functions of stored status + timestamps + child records, so they can't drift.
- **Timestamp discipline.** Every transition stamps a server-side timestamp; these power completion-time, aging, and SLA metrics (Layer 8).

### Features
- Template-driven checklist/photo instantiation at job creation (§12.7).
- Status-change side-effect hooks (emit `EventLog`, queue notification, write `AuditLog`) — one consistent mechanism, not scattered.

### 🕳 Gaps / decisions
- **P1 — Declined pre-work estimate.** Customer declines the upfront quote: does the WO close (`declined`), park for re-quote, or convert to a "diagnostic-only" bill? *Recommend: park as `estimate-declined`, allow re-quote, bill diagnostic fee if shop set one.*
- **P2 — Partial approval.** Customer approves 2 of 3 found issues. Work proceeds on the approved subset; declined issues → resurface later (C5). Confirm the subset rule and that declined items don't block "done."
- **P3 — Comeback / reopen.** Customer returns post-release (warranty or complaint). New linked WO (`parent_work_order_id`) vs reopen the old one? *Recommend: always a new WO linked to the original — keeps history and audit clean, feeds rework-rate (Layer 8).*
- **P4 — Cancellation matrix.** Who can cancel at each stage, and what cleanup (release held photos? void estimate? notify customer?). Needs a per-status cancellation policy.
- **P5 — Abandonment.** Car never picked up / customer ghosts. Aging + lien handling + storage-fee accrual? Define an `abandoned` path and its dunning.
- **P38 — Release authorization (3rd-party pickup).** Who may claim the car? Owner vs an authorized representative (driver, family). Need a release-to-other-than-owner path with ID/authorization capture + a gate pass. Currently `Release` (§11.1) assumes the customer — generalize to "released to whom, authorized by whom."
- **P39 — Key & belongings custody.** Physical key tracking and a **valuables/contents checklist at intake** (visible items in the car). Doubles as a dispute shield ("the watch was there at intake / it wasn't"). New intake-time capture; ties to the inspection report (D1).
- **P43 — Estimate→final variance guard.** If the final bill materially exceeds the approved estimate (beyond a tolerance %), forward motion to release is **gated on re-approval** — enforces the "no surprise bill" trust promise. Define the tolerance (per-tenant config) and the re-approval flow. *This is a trust gate, not just a warning.*

---

## Layer 2 — Notification & Channel Engine

The single most important UI-independent system: getting the right message to the customer on the right channel, and routing replies back in. (§14.4–14.6, Theme G.)

### Processes
- **Notification abstraction.** A notification = `recipient + content(template + variables) + channel + class`. One pipeline; channel is a strategy, not a fork in every feature.
- **Channel resolver.** Picks channel by availability + context + the **fallback rule**: Messenger only inside Meta's 24h window (§14.5) → otherwise SMS → portal thread as the always-available record.
- **Template system.** EN/Taglish templates, variable interpolation, per-tenant override, versioned. Transactional templates ship as defaults; marketing templates per-campaign.
- **Delivery lifecycle.** `queued → sent → delivered → failed`, with gateway callbacks where available and a bounded retry policy.
- **Inbound matching (G1).** Inbound SMS/Messenger matched to an open `Thread`/`WorkOrder` by sender identity + recency window; unmatched inbound → Action Center "unlinked message" for manual attach.
- **Message classes.** **Transactional** (status, approval, ready, payment) vs **Relationship/Marketing** (reminders, campaigns, milestones, announcements). Opt-out kills marketing; transactional still flows.
- **Frequency cap & quiet hours.** Per-customer global cap on marketing sends; no marketing during quiet hours (PH timezone); transactional exempt.
- **Suppression / consent.** DPA opt-out honored at send time; hard suppression list.

### Features
- Pre-built EN/Taglish template library (seeded at onboarding).
- Per-tenant SMS sender ID / Messenger page binding.
- Delivery status visible to advisor (feeds the non-open follow-up, §14.6).

### 🕳 Gaps / decisions
- **P6 — Cost ownership.** SMS costs money. Per-tenant monthly SMS quota/budget? Who pays overage — does the shop top up? *Recommend: per-tenant SMS credit balance + low-balance alert; transactional always sends, marketing pauses at zero.*
- **P7 — Quiet-hours window + timezone.** All PH, but define the window (e.g., 9pm–7am no marketing) and make it per-tenant configurable.
- **P8 — Failure fallback.** SMS hard-fail → auto-fallback to Messenger/portal, or just flag the advisor? *Recommend: flag advisor for transactional (human ensures the car-is-ready message lands); silent drop + log for marketing.*
- **P9 — Inbound identity collision.** Two customers share a phone (family car), or a number changed owners. How does inbound matching disambiguate? Needs a confidence threshold + manual-attach fallback.
- **P10 — Transactional opt-out floor.** Can a customer opt out of *everything* including "your car is ready"? *Recommend: no — transactional is part of the service; only marketing is opt-out-able, stated at intake consent.*
- **P47 — Inbound identity across channels (SMS + Messenger + Viber).** With three channels (incl. Viber, FR1), matching inbound to a thread/customer is harder — a customer may use a different number on Viber than the WO phone. Extends P9 with a cross-channel match-confidence + manual-attach fallback.

---

## Layer 3 — Scheduling & Background Jobs (pg_cron)

Everything time-driven. No UI — it just runs. (pg_cron committed, §27.)

### Processes / jobs
- **Reminder due-scan** — PMS (C1), LTO registration (E1), emissions (E2), milestone/thank-you/check-in (G3/G9). One scanner over the unified `Reminder` table, dispatched by type.
- **Campaign batch send** (C3/G10) — audience resolve → throttled send → record recipients.
- **Approval-timeout escalation** — no customer response in N hours → nudge, then escalate to advisor (§14.6).
- **Payment-pending sweep** — proof uploaded but unverified > N hours → advisor reminder; promised "utang" past due → dunning (Layer 5).
- **Tracking-link non-open follow-up** — link sent but unopened in N hours → re-send / switch channel (§14.6).
- **EOD cash/sales report** (F3) — per-tenant daily rollup → owner.
- **Warranty expiry sweep** (C4) — flag soon-to-expire; close expired.
- **Retention / PII purge** (Layer 6) — enforce DPA retention windows.
- **Offline-orphan cleanup** — stale unsynced media / dangling queue entries.

### 🕳 Gaps / decisions
- **P11 — Idempotency.** Every job must be safe to run twice (cron overlap, retry). Pattern: mark-then-send with a `dispatched_at` claim + unique constraint so a reminder can't double-fire. Confirm this is the standard for all senders.
- **P12 — "Today" boundary.** EOD report and "due today" need a tenant day boundary (PH timezone, configurable cutoff e.g. 6pm vs midnight). Define it once, reuse.
- **P13 — Backfill on downtime.** If cron misses a window (outage), does it backfill missed reminders or skip? *Recommend: backfill transactional/reminders within a grace window; skip stale marketing.*
- **P14 — Per-tenant scheduling load.** One global cron vs per-tenant — at SaaS scale, how to fan out without a thundering herd. (Note for scale; not MVP-blocking.)

---

## Layer 4 — Identity, Access & Trust

RLS, roles, portal tokens, maker-checker, immutable audit. (§21, §23, §27.)

### Processes
- **RLS enforcement.** Every tenant table: `tenant_id = jwt.tenant_id`; plus role-aware policies (mechanic sees only assigned WOs). DB refuses cross-tenant rows regardless of app bugs.
- **Portal token lifecycle.** Customer-portal reads bypass Supabase Auth via a token-validating route (§27.5). Token issuance, scope (one WO vs customer's vehicles), expiry, and revocation are a defined lifecycle.
- **Maker-checker.** Above-threshold discounts / price-or-scope edits require a second trusted approver; both identities logged (§21.3).
- **Immutable audit.** `AuditLog` is insert-only at the RLS level — no edit/delete even by Owner; server-side timestamps (§23.3).
- **Staff lifecycle.** Invite (auto-stamp `tenant_id`) → role assignment → **offboarding** (revoke access, reassign open jobs, preserve their audit trail).

### 🕳 Gaps / decisions
- **P15 — Portal token policy.** Expiry length? Auto-revoke on release, or keep read-access to history forever? One token per WO or a longer-lived per-customer token? *Recommend: per-WO token, long expiry for read-only history, PIN-gated for sensitive actions; revocable.*
- **P16 — Maker-checker thresholds.** Per-tenant configurable amount/percentage that trips the second approver. Who sets it (owner only). What if the shop is solo (owner = only trusted role)? *Recommend: solo-owner can self-approve but it's still logged as an override.*
- **P17 — Break-glass / override logging.** Owner overrides (force-release, force-unlock) — always allowed but always audited with a reason. Confirm the override list.
- **P18 — Customer identity on the portal.** No login beyond a PIN — how is PIN set/reset, and what stops link-sharing abuse? Rate-limit + optional PIN per WO.
- **P42 — Shared-device mechanic sessions.** One tablet shared across mechanics in the bay. Need fast user-switch + per-job PIN (already noted, §27.2) so **who-did-what attribution** stays correct on a shared device — proof photos and labor entries must bind to the *actual* mechanic, not the logged-in device. Define the session/handoff model.
- **P44 — Non-portal approval legality.** Approve via SMS reply ("reply YES") or a Messenger reply, not just the portal — convenient, but the approval must still be **auditable and legally sufficient** (who, when, from which number/account). Define what counts as a valid approval per channel; default remains typed-name + timestamp + IP in the portal (§15).

---

## Layer 5 — Money & Records (BIR-safe)

Billing math and payment workflow — must be exact and BIR-posture-correct (§16). Never issues OR/SI.

### Processes
- **Bill computation order.** line items → subtotal → discounts (approved) → tax (VAT 12% *or* percentage tax per shop setting, §16.9) → total. Deterministic, with defined **rounding** (centavo).
- **Deposit application** — deposits reduce the final-bill balance (§11.1).
- **Partial payment rollup** — multiple `Payment` rows sum against the WO balance; "utang"/credit release authorized with approver + reason (§16.8).
- **Payment-proof verification** — uploaded proof → authorized role verifies → payment counts toward balance. Unverified ≠ paid.
- **Discount handling** — senior/PWD recorded discount; above-threshold needs maker-checker (Layer 4).
- **Record stamping** — every internal financial doc stamped "**NOT an Official Receipt**"; manual OR reference captured if the shop issues one separately (§16.7).

### 🕳 Gaps / decisions
- **P19 — Rounding rule.** Define once: round at line, at tax, or at total? PH practice is total-level peso/centavo rounding. Lock it to avoid 1-centavo disputes.
- **P20 — Refund / void.** Process for a refund or a voided bill after payment: reason, approver, audit, reversing entry (not a delete). Needs definition — currently absent.
- **P21 — Discount stacking.** Senior/PWD **+** promo on the same bill — allowed, and in what order? Legal note: auto-repair generally isn't in the mandated senior-discount list (confirm w/ accountant) — so this is a *recorded courtesy* discount, stackable per shop policy.
- **P22 — Receivables aging.** "Utang" needs an aging view + dunning schedule (Layer 3). Define buckets (0–30/31–60/60+) and the chase cadence.
- **P23 — Price-list versioning.** When `ServiceCatalogItem` prices change, historical bills must keep the price charged at the time. Snapshot line prices onto the WO (don't reference live catalog). Confirm.
- **P40 — Estimate validity / expiry.** Quotes go stale (parts prices move). An estimate should carry a validity window; past it, a re-quote is required before approval. Define default validity (per-tenant) + the re-quote flow. Ties Theme L (parts sourcing) and Theme K3 (insurance supplementals).
- **P41 — Deposit / downpayment policy.** When is a downpayment required (parts order, big-ticket job, BYO-parts labor)? Define trigger rules + amount basis (% of estimate / fixed) so deposits aren't ad-hoc. Reuses `Deposit` (§11.1).
- **P48 — Prepaid / deferred-income posture.** Prepaid packages/plans (Theme R) take money *before* service. Treat as **deferred income**; ShopTrace still issues **no OR** (statement only) — the shop handles the OR externally. Keeps the §16.7 BIR posture.

---

## Layer 6 — Data Integrity & Lifecycle

Dedup, merge, ownership transfer, retention. (§11.2, D5.)

### Processes
- **Find-or-create** — search plate → phone → name; prompt link over duplicate (§11.2).
- **Merge** — admin merges duplicate customers/vehicles; history reconciles to the survivor; merge is audited and (ideally) reversible.
- **Plate-less vehicles** — conduction sticker as alternate key; reconcile to real plate later (§11.2).
- **Ownership transfer** — vehicle sold → `VehicleOwnership` time-bounds; history survives; prior-owner PII governed by retention (D5).
- **Retention / erasure** — DPA-driven windows for declined inquiries, prior-owner PII, inactive customers; **soft-delete** (recoverable) vs **hard-purge** policy.

### 🕳 Gaps / decisions
- **P24 — Merge conflict rules.** When two records disagree (different phone, name spelling), which wins, and is merge undoable? *Recommend: survivor = most-recently-active; keep both contacts; merge reversible via audit for N days.*
- **P25 — Replating.** Plate changes (new plate issued) while it's the primary key. Need a vehicle identity that survives replating — keep history under a stable internal id, plate is just an attribute/alias. Confirm internal `vehicle_id` is canonical (it is) and plate is an indexed alias list.
- **P26 — DPA erasure vs business records.** Customer invokes "right to erasure" but the shop needs the job record for warranty/tax. Resolve: anonymize PII (name/contact) but retain the service/financial record. Define the anonymization scope.
- **P27 — Retention windows.** Set concrete defaults: declined inquiry (?), prior-owner PII after sale (?), inactive-customer marketing data (?). Needs numbers + legal sign-off.

---

## Layer 7 — Media & Proof Integrity

Upload, derivatives, offline sync, proof authenticity. (§12.12, §24, §27.2.)

### Processes
- **Upload pipeline** — client capture (native camera) → storage (tenant-prefixed path) → derivative generation (thumb/medium/full, §24.6) → DB record with capture metadata.
- **Offline queue** — IndexedDB append-only queue → Background Sync → server ack → dequeue. Write-before-confirm; retry on sync/foreground/online (§27.2).
- **Visibility workflow** — every photo `internal` by default; promoted to `customer-visible` only via review (§13/§10.5). Customer never sees unreviewed media.
- **Signed-URL access** — no public bucket; short-lived signed URLs issued post-RLS/token check (§27.1).
- **Proof authenticity** — server-side capture timestamp + who + immutable link to the checklist step; this is the trust spine of the whole product.

### 🕳 Gaps / decisions
- **P28 — Tamper-evidence.** Should proof photos be hash-stamped (and EXIF/capture-time retained) so authenticity is provable in a dispute? *Recommend: store a content hash + server-received timestamp; don't trust client EXIF alone.*
- **P29 — Storage quota.** Per-tenant storage budget + lifecycle (move old full-res to cold storage, keep derivatives hot)? Cost control at scale.
- **P30 — Video handling.** Customer-supplied video + issue clips — size cap, allowed length, transcoding/compression. Define limits or video balloons cost and breaks weak-WiFi upload.
- **P31 — Photo retention.** Keep proof forever (it's the product's promise) vs tiered/cold after N years. Tie to P29 + retention policy.
- **P45 — Brownout / power resilience (PH).** Frequent outages take down the front-desk desktop, lounge TV, and Wi-Fi. The mechanic PWA is already offline-capable; the *advisor* flow assumes power+net. Need a degraded-operation story (mobile-hotspot fallback, brownout-safe sync, graceful reconnect). **Open.**
- **P46 — Advisor/desktop offline scope.** Offline was scoped to mechanic photos/checklist only (§27.2). Decide the minimal advisor offline surface during an outage — at least *view today's jobs* + *capture intake to sync later*.
- **P49 — Customer-supplied media safety.** Inbound customer media (booking/messages) could be inappropriate or malformed. Validate (type/size) + **staff-review before it reaches the portal** (ties Theme S6).

---

## Layer 8 — Search, Reporting & Derived Metrics

UI-independent compute behind dashboards (§20, §36).

### Processes
- **Search index** — Postgres full-text + trigram (fuzzy plate/name) across WOs/customers/vehicles/inquiries; tenant-scoped by RLS.
- **Report aggregation** — revenue, jobs, completion time, rework rate, outstanding balances; single-shop and `org`-level rollup.
- **Rework/comeback detection** — same vehicle + same/related issue within a window → flagged (feeds C4 warranty + quality metrics).
- **Funnel metrics** — from `EventLog`: link_sent → opened → approval_answered → paid → released.

### 🕳 Gaps / decisions
- **P32 — Metric definitions (lock these).** "Completion time" = which timestamps (intake→release vs work-start→done)? "Rework rate" = comeback within how many days for the same issue? "Outstanding" = includes authorized utang or only overdue? Ambiguous metrics erode owner trust — pin exact formulas.
- **P33 — Report freshness.** Live query vs materialized/nightly rollup for heavy dashboards. *Recommend: materialized views refreshed by cron for org-level; live for single-shop today-view.*

---

## Layer 9 — Events, Audit & Compliance (cross-cutting)

Two distinct logs, often confused:
- **`EventLog`** — product analytics / funnel (Layer 8). First-party, not a tracker.
- **`AuditLog`** — who-did-what for trust/forensics; immutable, insert-only (Layer 4).

### 🕳 Gaps / decisions
- **P34 — Event taxonomy freeze.** Lock the event name list early (renaming later breaks funnels). Start from §4.3's list; add `reminder_converted`, `inbound_message_matched`, `payment_verified`, `release_authorized_with_balance`.
- **P35 — Audit coverage list.** Enumerate exactly which actions write `AuditLog` (price/scope change, discount override, force-release, merge, visibility change, role change, deletion attempts). A gap here = an unprovable dispute.

---

## Layer 10 — Integration Layer

Outbound contracts — already specced; noted here as a layer so the engine view is complete.
- **Partner API** (`integration-api.md`) — OAuth2 + per-vehicle grant; sanitized history; HMAC webhooks with retry. Hard exclusions (internal notes, payment proofs, unapproved photos, other customers' data) are enforced *here*, and every share feature in the backlog (D5, F4, G4) must inherit those exclusions.
- **SMS gateway** (Semaphore/Movider) — outbound + inbound webhook (Layer 2).
- **Messenger** (§14.5) — copy-to-Messenger MVP; inbound webhook within 24h window for G1.
- **Payment** — manual proof-upload + verify (no payment-gateway integration in MVP; QR is static GCash).

### 🕳 Gaps / decisions
- **P36 — Webhook reliability.** Inbound webhooks (SMS/Messenger) need signature verification, idempotency keys, and a dead-letter path for unmatched/failed events. Confirm the standard.
- **P37 — Payment gateway later.** Static GCash QR + manual proof is MVP. Is an automated payment-gateway integration (auto-reconcile) a planned P2, or deliberately avoided for BIR/cost reasons? Decision needed.

---

## Open-gap index (this doc)

| # | Layer | One-line | Lean |
|---|-------|----------|------|
| P1 | Lifecycle | Declined estimate path | Park + re-quote + optional diag fee |
| P2 | Lifecycle | Partial approval subset | Proceed on approved; resurface declined |
| P3 | Lifecycle | Comeback → new linked WO | New WO, `parent_work_order_id` |
| P4 | Lifecycle | Cancellation matrix | Per-status policy — **open** |
| P5 | Lifecycle | Abandoned vehicle path | Define dunning/storage — **open** |
| P6 | Channel | SMS cost ownership | Per-tenant credit + low-balance alert |
| P7 | Channel | Quiet hours + tz | 9pm–7am, per-tenant — confirm |
| P8 | Channel | Send failure fallback | Flag advisor (txn) / log (mktg) |
| P9 | Channel | Inbound identity collision | Confidence + manual attach |
| P10 | Channel | Transactional opt-out floor | No opt-out of service messages |
| P11 | Jobs | Idempotent senders | Claim-then-send + unique constraint |
| P12 | Jobs | Tenant "today" boundary | PH tz, configurable cutoff |
| P13 | Jobs | Backfill on downtime | Backfill txn, skip stale mktg |
| P14 | Jobs | Scheduling fan-out at scale | Note for scale |
| P15 | Access | Portal token policy | Per-WO, revocable, PIN-gated |
| P16 | Access | Maker-checker thresholds | Per-tenant; solo self-approve logged |
| P17 | Access | Break-glass override logging | Allowed + audited w/ reason |
| P18 | Access | Portal PIN abuse | Rate-limit + per-WO PIN |
| P19 | Money | Rounding rule | Total-level peso/centavo — confirm |
| P20 | Money | Refund/void process | **Open — needs definition** |
| P21 | Money | Discount stacking | Recorded courtesy, per-shop policy |
| P22 | Money | Receivables aging + dunning | Buckets + cadence — **open** |
| P23 | Money | Price snapshot on bill | Snapshot, don't reference live catalog |
| P24 | Data | Merge conflict rules | Most-recent survivor, reversible |
| P25 | Data | Replating identity | Canonical `vehicle_id`, plate = alias |
| P26 | Data | DPA erasure vs records | Anonymize PII, keep service record |
| P27 | Data | Retention windows | **Open — needs numbers + legal** |
| P28 | Media | Tamper-evidence | Hash + server timestamp |
| P29 | Media | Storage quota/lifecycle | Per-tenant budget — **open** |
| P30 | Media | Video limits/transcoding | Cap length+size — **open** |
| P31 | Media | Photo retention | Forever vs tiered — tie to P29 |
| P32 | Reporting | Metric definitions | Lock exact formulas — **open** |
| P33 | Reporting | Report freshness | Materialized org / live single |
| P34 | Events | Event taxonomy freeze | Lock names early |
| P35 | Audit | Audit coverage list | Enumerate audited actions |
| P36 | Integration | Webhook reliability | Sig + idempotency + dead-letter |
| P37 | Integration | Payment gateway later? | **Decision needed** |
| P38 | Lifecycle | Release auth / 3rd-party pickup | Released-to + authorized-by + gate pass |
| P39 | Lifecycle | Key & belongings custody at intake | Valuables checklist (dispute shield) — **open** |
| P40 | Money | Estimate validity / expiry | Validity window + re-quote |
| P41 | Money | Deposit / downpayment policy | Trigger rules + amount basis — **open** |
| P42 | Access | Shared-device mechanic attribution | Fast switch + per-job PIN binds to real mechanic |
| P43 | Lifecycle | Estimate→final variance guard | Re-approval gate over tolerance % |
| P44 | Access | Non-portal approval legality | Define valid approval per channel |
| P45 | Resilience | Brownout / power resilience (PH) | Degraded mode + hotspot fallback — **open** |
| P46 | Resilience | Advisor/desktop offline scope | At least view-today + capture-intake-to-sync |
| P47 | Channel | Inbound identity across SMS+Messenger+Viber | Extends P9; cross-channel match confidence |
| P48 | Money | Prepaid/deferred-income posture | Deferred income; statement not OR (§16.7) |
| P49 | Media | Customer-supplied media safety | Validate + staff-review before portal |
