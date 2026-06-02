# ShopTrace — Planning Status

**Last updated:** 2026-06-02  
**Phase:** Planning → about to enter build (P0 spike)  
**Authoritative docs:** `docs/prd.md` (v1.6) · `docs/website-prd.md` · `docs/design-prompts.md` · `docs/consumer-app-prd.md` (parked)  
**Naming:** *ShopTrace* = the product/platform · *AutoLounge* = the pilot/example shop (tenant #1)

---

## Where we are

Planning is essentially complete at the product and architecture level. The PRD has moved through four revisions; all five Section 0 blocking decisions are confirmed, the stack and multi-tenancy model are committed, and the highest-risk feature (mechanic photo flow) has a concrete spike plan. We are at the point where the next sensible action is **code** — specifically the P0 spike and the schema — not more documentation.

---

## Decisions locked

| Decision | Resolution | Where |
|----------|-----------|-------|
| D1 — Bespoke vs SaaS | Bespoke-first, SaaS-aware; `tenant_id` on every table | PRD §0 |
| D2 — Stack | Supabase Cloud for MVP/v1; local edge deferred | PRD §0, §27 |
| D3 — Notifications | ≥1 channel in MVP (PH SMS or copy-to-Messenger) | PRD §0, §14 |
| D4 — Photo discipline | 3–4 required photos gate "mark job done"; skips need a reason | PRD §0, §12.6 |
| D5 — Customer ↔ vehicle | One customer → many vehicles; time-bound `VehicleOwnership` | PRD §0, §11 |
| Multi-tenancy | **RLS-first** — Postgres Row Level Security keyed on `tenant_id` JWT claim | PRD §27.1 |
| Auth | Supabase Auth = single identity source; customer portal token-based | PRD §27.6 |
| **ORM** | **None — Prisma dropped.** Supabase CLI migrations + `supabase gen types` (Drizzle is the only ORM worth considering if ever needed — not Prisma) | PRD §27.1, v1.3 changelog |
| Storage | Supabase Storage (dev) → Cloudflare R2 (prod, zero egress); tenant-prefixed paths + signed URLs | PRD §24.3, §27.1 |
| Hosting | **Vercel** (Next.js apps + Vite PWA static); host-aware middleware for tenant resolution. Docker+Caddy scoped to deferred local-edge only | PRD §27.1 |
| Domains | Default `{shop}.shoptrace.app` auto at signup; **custom domain = paid add-on** (Vercel Domains API / Cloudflare for SaaS) | PRD §33.8 |
| Product naming | **ShopTrace** = platform; AutoLounge = pilot/example shop | PRD header, §1 |
| Booking + customer media | Added as **P2** (booking ≠ walk-in queue; customer media kept separate from shop proof) | PRD §9.6, §9.7 |
| Consumer maintenance tracker | **Separate product + separate backend, parked.** *Garage by ShopTrace* (Expo/RN); integrated via ShopTrace partner API; build after pilot | PRD §34, `consumer-app-prd.md` |
| Mechanic capture | **Native camera** (`<input capture>`), device-agnostic (tablet *or* phone) | PRD §12.12 |
| Network reliability | **Pure cloud, zero setup is the default**; APs and local photo relay are optional add-ons; full edge deferred | PRD §27.4 |
| Onboarding/KISS | Minimal sign-up + skippable wizard + seeded defaults + per-tenant theming + feature toggles | PRD §33 |

---

## Build gates — what must exist before app code

| Gate | Status | Notes |
|------|--------|-------|
| Multi-tenancy model decided | ✅ Done | RLS-first |
| Auth approach resolved | ✅ Done | Supabase Auth + JWT claims |
| ORM/tooling decided | ✅ Done | Supabase CLI, no Prisma |
| **Database schema (SQL + RLS)** | ⬜ Not started | Section 11 entities → tables + policies. **Next action.** |
| **Screen inventory** | ⬜ Not started | Numbered screens per surface + flow map |
| API / server-action contract | ⬜ Not started | Needed for the app layer, after schema |
| Per-feature acceptance criteria | ⬜ Partial | Only MVP-level metrics (§4) exist so far |

---

## Recommended next actions (in order)

1. **Start the P0 mechanic photo-flow spike (§28).** Highest-risk feature; depends on almost nothing above. Run on the real worst-bay Wi-Fi and on a phone, with native capture. Pass/fail gates the whole approach.
2. **Write the schema as Supabase SQL migrations** — Section 11 entities, with `tenant_id`, enums, indexes, and RLS policy stubs in the same migration history.
3. **Write the screen inventory** — turn the design prompts into a numbered screen list + flow map so the app build has a real spec.
4. **2-week paper-baseline study at AutoLounge (§4.2)** — can run in parallel; sizes the real pain before heavy build.

---

## Still open (not blocking the spike)

**Product**
- First checklist/photo templates to ship (recommend PMS → brakes → diagnostics)
- Approval mechanism legality in PH (typed name + IP + timestamp default; drawn signature optional)
- Do declined recommendations resurface as promo/reminder triggers?

**Business**
- Confirm D1 (bespoke vs SaaS) with pilot evidence
- First pitch emphasis (queue / proof photos / reminders)
- Pricing axis and packaging — after pilot

**Technical**
- PH SMS gateway choice (Semaphore vs Movider)
- Confirm tablet model for the spike
- Backup provider and restore cadence

---

## Revision history of the planning docs

- **v1.0** — merged v1 + v2 PRD; Section 0 decisions confirmed
- **v1.1** — RLS-first multi-tenancy; KISS onboarding/theming/toggles (§33)
- **v1.2** — native camera capture (§12.12); network reliability tiers (§27.4)
- **v1.3** — dropped Prisma in favor of Supabase-native tooling
- **v1.4** — finalized hosting (Vercel); custom-domain add-on (§33.8)
- **v1.5** — renamed product to ShopTrace; booking + customer media (§9.6–9.7); consumer-app seam parked (§34)
- **v1.6** — consumer app spun out to its own PRD + backend (`consumer-app-prd.md`, *Garage by ShopTrace*)
