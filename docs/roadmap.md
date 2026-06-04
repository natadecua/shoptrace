# ShopTrace — Consolidated Roadmap & Prioritization

**What this is.** A convergence pass over everything we've generated — PRD core, 15 backlog themes (A–O), 44 process gaps (P1–P44), ~60 persona items — into one prioritized, contradiction-checked view. The backlog is a *menu of temptations*; this doc is the discipline that keeps the product shippable and adoptable.

**Legend:** **MVP** = ships first · **P2** = first enrichments · **P3** = later · **Parked** = deliberately deferred. Every non-MVP item must *re-pass the test below* before it's built.

---

## 0. The governing principle: simpler than paper, or it dies

A mechanic's job sheet and an owner's notebook are **stupid-simple and already work.** If ShopTrace is even slightly more hassle than paper for the people *running the shop*, they revert — quietly, permanently. So the test for **every** feature is:

> **Does this make the job simpler than paper for the person doing it — right now, on the worst day, with greasy hands and weak Wi-Fi?** If not, it's not MVP, no matter how clever.

This flips normal prioritization. We don't ship "the most features." We ship **the fewest things that beat paper**, then earn the right to add more. Each backlog theme is guilty until proven simpler.

### Reversion-risk map — where KISS discipline must be most ruthless

| Persona | Their "paper" today | App's job | Reversion risk | KISS discipline |
|---|---|---|---|---|
| **Mechanic** | Tick a job sheet | Be *faster* than ticking paper | **HIGHEST** — they have a working habit | Brutal. Open job → tap → snap → done. Every extra tap is a defection. |
| **Advisor** | Logbook / whiteboard | Faster intake + findability | **HIGH** — also a working habit | Minimal-field intake; recognize returning customers; one-tap actions. |
| **Owner** | Notebook / ledger they can't analyze | Visibility they never had | **LOW** — app gives what paper can't | Even simple numbers win; don't over-build dashboards. |
| **Customer** | *Nothing* (anxiety + phone calls) | Transparency they never had | **LOWEST** — pure upside | Safe to make this rich; this is the *sell*. |

**Conclusion that should steer the whole build:** adoption lives or dies on the **mechanic** and **advisor** surfaces. The customer portal *sells* ShopTrace; the mechanic flow *retains* it. Spend the simplicity budget there. (This is exactly why the §28 mechanic photo-flow spike is P0.)

---

## 1. The MVP line (ruthless)

**MVP = the paper-killer spine + only what the spine needs.** The transparency loop, end to end, simpler than paper:

**intake → assign → mechanic checklist + required proof photos → (found-issue) approve → bill → pay → release**, with a customer tracking link and ≥1 notification channel.

In MVP (from PRD §29, re-affirmed):
- Queue board + fast intake (walk-in + Pending Intake from inquiries).
- Work order home; find-or-create customer/vehicle; plate-less handling.
- Mechanic app: today's jobs, checklist, **required-photo gate**, "issue found." *(The make-or-break surface.)*
- Customer portal: status + approved proof photos + per-WO message thread.
- **Found-issue approval loop** (approve/decline/ask) — this is part of the spine, not a Pro extra (see contradiction C1).
- Bill → payment (proof upload + verify) → release; partial/utang allowed.
- ≥1 notification channel (SMS *or* copy-to-Messenger); EN/Taglish templates.
- Per-tenant branding; default `{shop}.shoptrace.app`; RLS multi-tenancy; immutable audit; global search; basic history; basic reports.

**Explicitly NOT MVP** (so the spine stays simple): price catalog, PMS reminders/campaigns, reviews, gallery, loyalty, inspection reports, booking, bays, insurance, inventory, fleet, labor/commission, lounge display, knowledge library, custom domain. All are P2+ and must each re-pass the paper test.

---

## 2. Theme phasing (A–O)

Themes are *enrichments by design* — none is MVP wholesale. Phasing assumes the MVP spine is live and validated.

| Theme | Phase | Why here / KISS note |
|---|---|---|
| **C** Retention & reminders | **P2 (first)** | Biggest revenue lever; mostly background (low UI hassle). PMS reminders = the clearest upgrade driver. |
| **J** Commercialization & tiers | **P2 (first)** | Needed to *charge*; self-serve. Decide tiers early (informs everything). |
| **I** Progressive disclosure & tiers | **P2** | The mechanism that *keeps it simple* as features grow — directly serves §0. |
| **G** Relationship & communication | **P2** | Much of it rides MVP channels already; G1 reply-by-channel is the real new build. |
| **D1** Digital inspection report | **P2** | High-trust, pure transparency. (Rest of D → P2/P3.) |
| **N** Capacity-aware scheduling + booking | **P2** | Gives the public wait/booking a real spine. Booking only after intake is rock-solid. |
| **B** Visual bay/car status | **P2/P3** | Delightful, but the *list* queue must beat paper first; visuals are gravy. |
| **L1/L2** BYO parts + procurement | **P2** | Real daily flow; L1/L2 realistic. **L3 sublet → P3.** |
| **O** Lounge display | **P2/P3** | High delight, low operator hassle (read-only). After portal proof is mature. |
| **E** PH lifecycle hooks | **P3** | Cheap, charming, but reminder-engine-dependent (needs C first). |
| **A** Procedure/knowledge library | **P3** | Asset-building, not adoption-critical. Big surface; resist early. |
| **F** Ops depth (inventory/fleet/EOD) | **P3** | Inventory & fleet are large; EOD report is a quick P2 win, split it out. |
| **H** Social proof | **P3** | Marketing upside; depends on gallery + CSAT. |
| **M** Labor & commission (porsiyento) | **P3** | High owner value but config-heavy; morale-sensitive. |
| **K** Insurance & LOA | **Parked / deferred** | Money-sensitive, posture-bound, high flow-divergence. Keep the `payer_type` *seam* now; build later. |

---

## 3. Process-gap triage (P1–P44)

Most gaps are Phase-2 design questions. The ones that **must be decided before the schema** (because they're cheap seams now / expensive rewrites later, or they shape the MVP core flow) are the short list:

### 🔴 Decide before schema (gating)
| Gap | Decision needed | Cheap-now seam |
|---|---|---|
| P25 | Canonical `vehicle_id`, plate as indexed alias (survives replating) | Yes — core identity |
| P3 | Comeback = new WO with `parent_work_order_id` | Yes — one column |
| P23 | Snapshot line prices onto the bill (don't reference live catalog) | Yes — billing correctness |
| P1/P2/P43 | Estimate lifecycle: declined / partial-approve / variance-reapproval states | Yes — enum + flag |
| P4 | Cancellation states per status | Yes — enum |
| P15 | Portal token policy (per-WO, revocable, PIN) | Yes — auth core |
| P19 | Rounding rule (total-level peso/centavo) | Yes — billing |
| P32/P34/P35 | Lock metric definitions, event taxonomy, audit-coverage list | Yes — instrument from day one |
| P26/P27 | DPA erasure (anonymize, keep record) + retention windows | Yes — compliance, launch |
| G37 | Backup provider + tested restore | **Launch blocker** |
| P12 | Tenant "today" boundary (PH tz) | Yes — reports/reminders |
| (K) | Add `payer_type` column even though insurance is parked | Yes — free seam |

### 🟡 Phase-2 design (not blocking the schema)
P5 abandonment · P6 SMS cost/credits · P7 quiet hours · P8 send-failure fallback · P9 inbound collision · P10 txn opt-out floor · P11 idempotent senders · P13 backfill · P16 maker-checker thresholds · P17 break-glass · P20 refund/void · P21 discount stacking · P22 receivables aging · P24 merge rules · P28 photo tamper-evidence (do server-timestamp+hash early, cheap) · P29 storage quota · P30 video limits · P31 photo retention · P33 report freshness · P36 webhook reliability · P38 3rd-party release · P39 belongings checklist · P40 estimate expiry · P41 deposit policy · P42 shared-device attribution · P44 non-portal approval.

### ⚪ Scale-only (much later)
P14 scheduling fan-out · P37 payment-gateway integration.

---

## 4. Persona items — almost all deferred

The ~60 persona items are overwhelmingly P2/P3 polish. **Only these few touch MVP** (because they're part of beating paper, or cheap seams):
- `MEC-J1` multi-job context-switch — mechanics *do* juggle; the MVP mechanic app must handle >1 active job cleanly. **MVP.**
- `MEC-J2` shift handoff — a half-done job must survive a shift change. **MVP-light** (state already persists; just don't assume one sitting).
- `ADV-J1` job ownership with multiple advisors — cheap field now. **Seam.**
- `OWN-J1` solo-role collapse (one person = owner+advisor+mechanic) — the *most common* PH shop. The MVP must not force role-switching friction. **MVP design constraint.**
- `CUS-J1` the no-smartphone customer — MVP needs a graceful "advisor-assisted / call fallback" so proof still gets captured. **MVP-light.**
- `SYS-J3` gateway outage = visible retry, never silent message loss. **MVP** (trust).

Everything else (parts-from-bay, command palette, kudos, anomaly alerts, etc.) → P2/P3.

---

## 5. Contradictions & overlaps caught (the point of consolidating)

| # | Issue | Resolution |
|---|---|---|
| **C1** | Tier sheet puts "estimates/approvals" in **Pro**, but the **approval loop is the MVP spine** | **Split:** the *found-issue approval loop* = MVP/Basic; the reusable *price catalog* = Pro convenience. Fix the tier sheet wording. |
| **C2** | Three near-identical "queue/wait" views: public web (§9/website), lounge (O), capacity wait-band (N) | **One projection engine**, three skins (remote-public / on-prem / capacity). Don't build three. |
| **C3** | "Inspection" scattered: D1 report, A5 damage map, SYS-7 walk-around video | **One inspection feature family** sharing the photo+damage-map pipeline. |
| **C4** | Share tokens duplicated: D5 portable history QR, F4 QR intake | **One `VehicleShareGrant`** token infra, two uses. |
| **C5** | Digest duplicated: F3 EOD report, OWN-5 AM briefing | **One report-digest job**, two schedules. |
| **C6** | Campaign duplicated: C3 win-back, G10 announcements | **One `Campaign`** entity, typed. (Already noted.) |
| **C7** | Reminder duplicated: C1/E1/E2/G3/G9 | **One `Reminder`** table, typed. (Already noted.) |
| **C8** | Payer duplicated: K insurer, F2 fleet, C4 warranty | **One `payer_type`** abstraction. |
| **C9** | Theme B shows bay/"where"; Theme O hides "where" | **Reconciled:** bay detail = admin only; lounge/public never show location. |
| **C10** | Gamification: early Theme I gamified feature-gates vs the decision that gamification is customer-only | **Resolved** — Theme I de-gamified; gamification lives in customer loyalty only. |
| **C11** | SMS is both an MVP channel (D3) and a metered cost (J3/P6) | **Reconcile:** MVP ships ≥1 channel with a simple gateway; the *credit/metering* system is P2. |
| **C12** | Possible stale "app-layer filtering / Prisma" language in PRD (pre-v1.3) | **Verify**: ensure only the changelog mentions it; no *normative* section should contradict RLS-first / no-ORM. (Cleanup task.) |

---

## 6. Decisions needed before the schema (the real gate)

Pulling §3 + contradictions into one owner-facing list:
1. **Estimate/approval split (C1)** — confirm approval loop = MVP, catalog = Pro.
2. **Identity seams** — canonical `vehicle_id` + plate alias (P25); `parent_work_order_id` (P3); `payer_type` (K); `claim_code` (O); `org_id` (done).
3. **Billing rules** — price snapshot (P23), rounding (P19), estimate lifecycle states (P1/P2/P43), cancellation states (P4).
4. **Auth** — portal token policy (P15).
5. **Instrumentation locked** — metric defs (P32), event names (P34), audit coverage (P35).
6. **Compliance** — DPA erasure/retention (P26/P27); **backup + tested restore (G37, launch blocker)**.
7. **Ops** — tenant "today" boundary (P12).

These are mostly *cheap columns/enums and one-time definitions* — but each is a painful migration if discovered late. They're the actual prerequisite to writing the schema.

---

## 7. Verdict — are we ready to mine more?

**Breadth is done; depth of *decisions* is the bottleneck.** We have far more captured ideas than the MVP can or should absorb. More mining now adds backlog, not value.

**Recommended next move:** *stop mining, start deciding + building.*
1. Settle the §6 pre-schema decisions (mostly quick confirmations — I can draft recommended defaults for each as one decision sheet).
2. Run the **P0 mechanic photo-flow spike** (§28) — the make-or-break, paper-test surface.
3. Write the **schema** (Section 11 + the §6 seams) as Supabase migrations.
4. Write the **screen inventory** for the MVP surfaces only.

**When to mine again:** after the pilot (AutoLounge) gives real signal — it will tell us which P2 themes actually beat paper in the wild, and that evidence should reorder Section 2 far better than more brainstorming can.

So: I'd say **we're *not* short on ideas to mine — we're ready to converge.** If you'd rather keep mining a specific frontier (e.g., the consumer *Garage* app, or AI-assisted diagnosis), say so and I'll scope just that; otherwise the highest-value thing I can do next is the §6 decision sheet.
