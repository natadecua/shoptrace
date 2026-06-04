# ShopTrace — Visual Identity & Asset Brief

Two paste-ready prompts to **start the UI from a distinctive visual language**, not a generic template:
- **Prompt A — Design Language & Visual Identity Exploration** (fonts, color, shape, texture, motion, proof treatment).
- **Prompt B — Asset Kit** (what to generate to start building, with a manifest).

Hand a design agent **Prompt A first**; once a direction is chosen, run **Prompt B** to produce assets in that direction. Both are self-contained — you can paste them alone.

> **Critical framing for both:** ShopTrace is **multi-tenant** — *each shop brings its own logo + accent color*, applied via theme tokens. So the design language must be **brand-agnostic chrome that flexes per tenant**, not one fixed brand. ShopTrace's *own* identity lives on the marketing site and the app chrome; tenant surfaces adopt the tenant's brand. Design the *system*, not a single skin.

---

## Prompt A — Design Language & Visual Identity Exploration

```
You are a senior product/brand designer. Define a DISTINCTIVE VISUAL LANGUAGE
for ShopTrace — not screens yet, the underlying identity: type, color, shape,
material, motion, and how it frames photographic proof. I want an opinionated
point of view, not a safe template.

THE PRODUCT
ShopTrace makes a Philippine auto shop radically transparent: customers open a
private link and watch live status + real PROOF PHOTOS of work on their car;
staff run queues, work orders, approvals, payments, history; owners trust the
numbers. The whole promise is "see what's really happening to your car."

WHO IT SERVES (four environments, one language):
- Service advisor — dense desktop, all day, high glance-frequency, needs speed.
- Mechanic — tablet/phone in a greasy, dim or sun-glared garage bay, weak Wi-Fi,
  gloved hands, camera-first, minimal typing.
- Owner/cashier — oversight, money, reports; trust in the numbers matters.
- Customer — mobile web, no app, opened anxious about their car and the bill;
  reads English and Taglish (Tagalog-English).

BRAND FEEL: competent and trustworthy, modern but warm, distinctly Filipino
(Taglish-comfortable), and proof/transparency-forward. Avoid sterile-enterprise
and avoid toy-cute.

REJECT — do NOT hand me the generic SaaS look:
- Default Inter/Geist/Roboto + electric-blue (#3B82F6) + uniformly 8px-rounded
  white cards + soft drop shadows.
- The "AI startup" purple gradient, the Linear/Vercel clone, Material/Bootstrap
  defaults, emoji-as-icons, 3D blob illustrations, corporate-handshake art.
- Anything that could belong to any B2B dashboard. If it's inoffensive and
  forgettable, you've failed.

SEEDS TO MINE (choose, combine, or reject — don't do all, don't caricature):
automotive instrumentation and gauges; the precision/forensic clarity of a
service manual or inspection report; garage and Filipino vernacular signage
(jeepney/hand-painted craft — reference its confidence, not its kitsch);
evidence/proof as an aesthetic (timestamps, labels, before/after); the contrast
between a gritty workshop and a calm, reassuring customer experience.

DELIVER 2–3 NAMED DIRECTIONS. Each direction must include:
1. A one-line DESIGN THESIS and a short rationale (what feeling, why it fits).
2. TYPE SYSTEM — name REAL fonts: a display/character face, a workhorse UI text
   face, and a mono/numeric face (plates, money, gauges need tabular figures).
   Justify each. Must support Filipino diacritics (ñ) and Taglish. Show a type
   scale.
3. COLOR SYSTEM — not just a palette: semantic roles incl. a characterful job-
   status set (don't default to flat stoplight green/amber/red), a confident
   "automotive" staff environment vs a lighter reassuring customer environment,
   and HOW a per-tenant accent (from the shop's logo) injects without breaking
   the system. Note contrast/accessibility.
4. SHAPE & SPACE — radius, density, grid, border vs shadow vs fill language.
5. MATERIAL/TEXTURE — does it use any (grain, paper, metal, gauge faces), or is
   it deliberately flat? Say why.
6. ICONOGRAPHY & MOTION — icon style; motion principles (restrained and
   meaningful: status transitions, capture confirmation, a "ready" moment — never
   decorative motion that slows a mechanic).
7. PHOTO TREATMENT — proof photos are the HERO and are color-rich and messy. Show
   how the UI FRAMES them (labels, stage, timestamp, before/after) without
   fighting them. This is central, not an afterthought.
8. ONE THING IT DELIBERATELY REJECTS (its anti-pattern).

CONSTRAINTS
- Buildable in Tailwind + shadcn/ui, but CUSTOMIZED — show the tokens that move it
  off the defaults (type, radius, color, spacing).
- Must flex per tenant via tokens (accent from a shop's logo) — design the system,
  not one brand.
- Must work across the four environments above: dense staff desktop, high-contrast
  sun-readable mechanic bay, warm trustworthy customer mobile, and a lounge TV
  glanceable from 5+ metres.
- Accessible: real contrast, scalable text.

PROOF OF CONCEPT: render ONE signature screen in each direction so they're
comparable — use the CUSTOMER TRACKING PORTAL (status + proof photos) as the test,
since it carries the brand promise. Then give your recommendation and why.
```

---

## Prompt B — Asset Kit (generate in the chosen direction)

```
We have chosen a visual direction for ShopTrace (attached/above). Produce the
STARTER ASSET KIT in that exact language — tokens, fonts, color, shape, motion —
so we can begin building. ShopTrace is multi-tenant: assets must be BRAND-AGNOSTIC
and theme via tokens (each shop supplies its own logo + accent). Deliver source
(SVG/variable where possible) plus usage notes.

PRODUCE:
1. DESIGN TOKENS — the theming contract as CSS custom properties / Tailwind theme:
   color (incl. per-tenant accent slot + the job-status set), type scale, radius,
   spacing, elevation, motion durations/easings. This is the most important
   deliverable — everything else references it.
2. ICON SET — a coherent set for status, actions, navigation across all surfaces.
   Either a bespoke set or a named base (e.g. Phosphor/Lucide) tuned to the
   direction; show the customization. SVG.
3. JOB-STATUS VISUAL SYSTEM — the tokens + iconography for every state (queued,
   in-progress, waiting-approval, blocked, final-check, ready, released). Color
   alone is not enough — pair shape/icon for accessibility.
4. CAR-TYPE SILHOUETTES — generic, status-colorable SVG silhouettes for
   sedan / SUV / pickup / hatchback / van / motorcycle. Two uses: vehicle
   selection, and a tap-to-mark DAMAGE/INSPECTION MAP. Functional and clean, not
   per-model art.
5. EMPTY / FIRST-RUN ILLUSTRATIONS — a small set in one consistent style for the
   key surfaces (empty queue, no jobs today, no messages, first work order). On-
   brand, not generic stock.
6. PROOF-PHOTO FRAME — the overlay/treatment for captured photos: stage label,
   timestamp, and an optional shop-branded watermark for shareable before/after
   cards. Plus a before/after presentation.
7. AVATAR / PLACEHOLDER system (mechanic, customer, shop).
8. SKELETON / LOADING patterns consistent with the language.
9. LOUNGE-DISPLAY tiles + idle/brand frame (glanceable from across a room).
10. SOCIAL-SHARE CARD template (square before/after, tenant-branded).
11. PRINT TEMPLATES — job order, a billing "Statement of Account" clearly stamped
    "NOT an Official Receipt," and a release/gate pass.
12. SOUND/HAPTIC cues to spec (not build): photo-capture confirm, a "ready for
    pickup" chime.

For each asset: state whether it's GENERATED art, BUILT-in-code, or a TUNED
library, and give the per-tenant theming hook. Keep the kit small enough to start
building the MVP mechanic + advisor + customer surfaces — not exhaustive.
```

---

## Asset manifest (reference — what Prompt B should yield)

| Asset | Where it's used | Make how | Priority |
|---|---|---|---|
| **Design tokens** (theming contract) | Every surface; per-tenant accent | Code (CSS vars / Tailwind theme) | **First — blocks all** |
| Fonts (display / text / mono-numeric) | All | License/self-host; pick in Prompt A | First |
| Icon set (status/action/nav) | All | Tuned library or bespoke SVG | First |
| Job-status visual system | Queue, WO, portal, lounge | Tokens + icons | First |
| Car-type silhouettes (6) | Vehicle select, damage map (A5) | Generated SVG | High |
| Damage/inspection map base | Inspection (D1), issue capture | Generated SVG | Med |
| Empty/first-run illustrations | Queue, jobs, messages, onboarding | Generated, one style | High |
| Proof-photo frame + before/after | Mechanic capture, portal, gallery | Code overlay + spec | **High (the hero)** |
| Avatars/placeholders | Staff, customer, shop | Generated/code | Med |
| Skeleton/loading | All | Code | Med |
| Lounge tiles + idle frame | Theme O | Generated/code | Med (P2 surface) |
| Social-share card (before/after) | H1 gallery share | Template | Low (P3) |
| Print: job order · Statement (NOT an OR) · gate pass | Front desk, release | HTML/print CSS | High (MVP needs job order) |
| Sound/haptic cues | Mechanic capture, lounge "ready" | Spec → source later | Low |

**Theming reality to respect everywhere:** the kit is the brand-agnostic *system*; a tenant's logo + auto-extracted accent color flow through the **tokens** (§33 of `prd.md`). ShopTrace's own marketing brand is a separate, fixed identity — don't conflate the two.

**Pair with:** the **Shared Context** block and the 14 screen briefs in `design-prompts.md` once a direction is locked — Prompt A defines the language, the briefs apply it to screens.
