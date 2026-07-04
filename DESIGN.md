# ShopTrace · Design System Guide

The locked visual language for the ShopTrace advisor cockpit and customer-facing
surfaces. This is the reference the production Next.js app ports from. The
canonical build is `design/prototype/overview.js` (the "Shop Overview"
synthesis); the shared system lives in `design/prototype/components.js`.

> **Status:** Locked. Changes to tokens, type, radius, depth, or the accent rule
> are design decisions, not ad-hoc tweaks. Update this file when they change.

**Design skills** (vendored in `.agents/skills/`, tracked in `skills-lock.json`):
`emil-design-eng` (animation + UI-polish philosophy), `design-taste-frontend`
(the anti-slop review), plus the `taste-skill` set (`high-end-visual-design`,
`minimalist-ui`, `redesign-existing-projects`, `image-to-code`, etc.). Run the
relevant one when building or reviewing a frontend surface. See §7 for motion.

---

## 1. Philosophy

ShopTrace is a dark-mode operations cockpit for a working auto shop, plus a
transparency layer for customers. The interface is dense with live state but must
read calm, premium, and trustworthy. Three reference languages are layered
deliberately:

- **Rivian** — soft filled charcoal cards, one warm accent, a hero "product"
  (the vehicle), generous breathing room, a bottom utility bar. This is the
  skin and the spatial calm.
- **Reload (editorial / Apple-adjacent)** — Geist as the typeface, airy editorial
  spacing, restraint. This is the polish.
- **The cockpit IA** — full operational richness is non-negotiable: the
  exceptions spine, queue lanes, the open shop floor, and the inspector all stay.
  We borrow Rivian's *look*, never its low-density in-car *posture*.

The hard rule learned the hard way: **a borrowed aesthetic must not smuggle in a
borrowed information density.** Keep the calm surface; keep all the features.

---

## 2. Layout

Three-zone working row under a header, over a bottom utility bar:

```
┌ header: "Shop Overview" + search + New RO (champagne) ────────────┐
├ spine 322px │  open floor (hero, flex)  │ inspector 354px ────────┤
└ bottom utility bar: status pill · nav cluster · revenue pill ─────┘
```

- **Spine (left, 322px):** "Today" — Needs you (exceptions), In queue, Ready,
  Waiting parts. The triage column.
- **Open floor (center, hero):** borderless, seamless floor. Bays are floating
  glass HUDs over a single radial-gradient surface, **not** grid tiles. Vehicles
  are 2.5D iso on iso lifts.
- **Inspector (right, 354px):** the selected bay in full — stage stepper,
  readouts, customer link, remaining checklist, next-best-action.

Outer page padding 30px; inter-zone gap 18px.

---

## 3. Color

**Ink & Champagne.** A near-monochrome charcoal/ink foundation with exactly one
warm-metal accent (champagne) and one scarce alarm. No competing hues. This is
what makes it read elevated and minimal rather than busy. (This replaces the
earlier Rivian gold + orange-CTA + status-pastels scheme.)

Dark-first neutral foundation:

| Token | Hex | Use |
|---|---|---|
| `BG` | `#1A1A1C` | Page background (warm ink) |
| `CARD` | `#232326` | Primary card fill |
| `CARD2` | `#2B2B2E` | Raised inner surface (need cards, link card) |
| `RAISE` | `#343438` | Secondary button fill |
| `INK` | `#F2F1EC` | Primary text (warm white) |
| `SOFT` | `#8E8E88` | Secondary text **and neutral status** |
| `FAINT` | `#62625E` | Labels, tertiary |
| `HAIR` | `rgba(255,255,255,0.05)` | Hairline dividers |

**Accent — the lock (one color):**

| Token | Hex | Meaning |
|---|---|---|
| `CHAMP` | `#C9A86A` | **The single accent.** Carries identity, the primary CTA, the active/selected bay, completed steps, progress fills, prices, and attention (ready/waiting). It repeats freely; that repetition *is* the minimalism. |
| `CHAMPSOFT` | `#DAC093` | Lighter champagne for hover / large soft fills. |
| `ALERT` | `#C46B57` | **Alarm only:** overdue, blocked, unpaid. The only other color on screen. Scarce. |

Rules:
- **One accent, repeated.** Champagne is the whole palette. Do not reintroduce a
  second hue (green/blue/orange) for variety; variety comes from neutral tonal
  weight, not new colors.
- **CTA = champagne fill, dark ink text** (`color:${BG}`), never white. Champagne
  is light; white text on it fails contrast.
- **Status by weight, not hue.** Running states (In Progress, Diagnostic) are
  **neutral grey** (`SOFT`) meaning "nothing needed." Ready / Waiting are
  **champagne** meaning "needs your eye." Overdue / blocked are **ALERT**. Three
  signals, full stop.
- **Alert is scarce.** Terracotta only for true alarm: the OVERDUE pill, a
  blocked-approval risk figure, an overdue vehicle tint.
- **Vehicles stay neutral** grey; overdue tints them toward alert.
- Plates are always the physical artifact: light `#E9E9EC` ground, near-black
  ink, mono. They read as a license plate, not a UI tag.

### Light mode

Light mode carries the same **Ink & Champagne** identity (green is dropped). The
**verve** real estate dashboard remains the reference for *layout, airiness, soft
cards, and spacing* only; its green palette is overridden. Reference screenshots
live in `design/references/verve/`.

| Token | Hex | Use |
|---|---|---|
| `BG` (light) | `#F5F4F0` | Off-white page background |
| `CARD` (light) | `#FFFFFF` | Cards / panels |
| `INK` (light) | `#14140F` | Primary text (warm near-black) |
| `SOFT` (light) | `#8C8C86` | Secondary text / neutral status |
| `CHAMP` | `#C9A86A` | Accent fills (CTA, active, progress). |
| `CHAMP_INK` | `#A8842F` | Deeper champagne for *small text/prices* on white (the `#C9A86A` fill tone fails small-text contrast on light). |
| `ALERT` | `#C46B57` | Alarm only. |

Light-mode notes:
- **Type stays Geist.** verve uses SF Pro Display; Geist is the Apple-adjacent
  equivalent, so the editorial feel carries over. No font change.
- **Surfaces:** white cards on the off-white page, soft rounded corners; a gentle
  soft shadow is the separation device here (vs the dark-mode hairline rule).
- **Stat cards:** verve's paired pastel cards map onto our Completed Deals /
  Total Revenue pattern, but tinted as faint champagne / neutral, not green/blue.
- **Accent question resolved:** champagne is the single cross-mode accent; green
  is not used. Use `CHAMP_INK` where champagne sits as small text on white.

---

## 4. Typography

- **Primary:** Geist Variable (`GeistV`) — premium neo-grotesk, Apple-adjacent.
  Inter Variable (`InterV`) is the fallback. Geist is the lock; Inter is legacy.
- **Mono:** `ui-monospace, SFMono-Regular, Menlo` with `tabular-nums` for all
  data: plates, money, times, counts, percentages, positions.
- Headings carry `letter-spacing:-0.025em`.

Scale (px / weight):

| Role | Size | Weight |
|---|---|---|
| Page H1 | 34 | 500 |
| Inspector vehicle | 23 | 500 |
| Zone H2 | 20 | 500 |
| Body / row title | 13–14 | 500–600 |
| Secondary | 11.5–13 | 400–500 |
| Label (caps) | 10–11 | 600, `letter-spacing:0.08–0.1em`, uppercase |

Weight tops out at 600. No 700/800 display weight except the tiny alarm pills.
The premium feel comes from restraint, not heft.

---

## 5. Radius scale (lock)

The prototype historically drifted across many radii. The locked scale:

| Token | px | Use |
|---|---|---|
| chip | 5 | Plate |
| sm | 9–10 | Square icon tiles, small buttons |
| md | 12–14 | Buttons, glass HUDs, inner cards |
| lg | 16 | Need cards, primary CTA button |
| xl | 18 | Floor surface |
| card | 24 | Outer cards (spine, floor, inspector) |
| util | 20 | Bottom utility bar |
| pill | 999 | Status pills, severity pills |

Round to this set; do not invent intermediate values. Nesting steps down one
level (24 card → 16/14 inner → 12 control).

---

## 6. Depth (Apple rule)

- UI depth is **hairline only** — `1px` `HAIR` borders and faint fills. No drop
  shadows on cards, buttons, or chips.
- **Exactly one** soft drop-shadow exists in the whole interface: the
  product-shadow ellipses under the vehicle on the lift. The vehicle is the
  "product"; it alone gets to float.
- Glass HUDs use `background:rgba(16,16,19,0.62)` + `backdrop-filter:blur(10px)`
  + a `1px` white-6% hairline. They sit over the floor, not in boxes.

---

## 7. Motion & animation

Motion is part of the premium feel, not decoration. The static prototype has
none; this is the spec for the Next.js port.

**Reference libraries (installed / bookmarked):**
- **[designspells.com](https://designspells.com/)** — the pattern library. When a
  surface needs a micro-interaction (a status flip, a card expand, a toast, a
  drag handle, a number tick), pull the closest "spell" as the reference for
  timing and feel rather than inventing one.
- **`emil-design-eng` skill** (`.agents/skills/emil-design-eng`, from
  [animations.dev](https://animations.dev/)) — the philosophy: when to animate,
  easing, spring vs duration, perceived performance, the invisible details.

**Principles (the lock):**
- **Animate state changes, not arrivals.** A job moving Diagnose → Estimate, a
  bay going Ready, an ETA slipping to overdue: these earn motion. Page loads do
  not need entrance choreography.
- **Fast and physical.** UI transitions 150–250ms; springs over linear easing for
  anything that moves spatially (cards, the inspector sliding in, a vehicle
  taking a bay). Use `ease-out` for enters, `ease-in` for exits.
- **Calm, not busy.** One thing moves at a time in a given region. No looping
  ambient animation, no decorative parallax. The floor is calm until something
  actually changes.
- **The accent earns the loudest motion.** The champagne CTA may get a subtle press
  spring; a real alarm (new overdue) may pulse once. Nothing else competes.
- **Respect `prefers-reduced-motion`** — fall back to instant state changes.
- Motion never invents data and never delays the operator: progress bars and ETA
  changes animate to the real value, they do not fake-count for show.

Catalogue specific chosen "spells" here as they are picked, so motion stays a
small curated set, not a grab-bag.

## 8. The shop floor (signature)

- Borderless and seamless: one radial-gradient surface
  (`radial-gradient(130% 90% at 50% 0%,#1B1B1F,#101012 70%)`), bays as a 3-col
  grid of *floating* HUD stacks, not bordered cells.
- Each occupied bay: top glass HUD (status pill + bay label, then plate +
  vehicle), the iso lift+vehicle centered, bottom glass HUD (mechanic avatar +
  first name + lobby flag, ETA, progress bar). A huge 120px bay number sits at
  4% opacity behind everything.
- Selected bay gets a `1.5px` white-45% ring. Overdue bays get a radial red wash
  behind the vehicle.
- Empty bay: faint lift at 50% opacity, "Open · idle" champagne label, and a single
  glass "Assign" CTA.

### Iso vehicle + lift system

- Both the lift and the vehicle are built from **one** iso-box primitive
  `bx(o,x,y,z,w,d,h, top,left,right)` sharing one projection (`K=0.866`). This is
  why they sit in the same space.
- Vehicles are deliberately **low-poly 2.5D** (3/4 angle), three shaded faces per
  volume. They are illustration/data-viz, not icons — hand-built SVG is correct
  here. (Flat side-profile glyphs and hand-drawn curved car paths were both
  rejected.)
- A job-type badge (oil/brake/scan/wrench/check) rides as a flat disc over the
  vehicle, using a Phosphor inner-path. Overdue tints the body red.

**Known ceiling:** low-poly is intentional to match the lifts. Showroom-grade
vehicle art and motion are out of scope for a static prototype.

---

## 9. Iconography

- **Phosphor only** (`@phosphor-icons/core`, raw SVG, `fill="currentColor"`).
  Bold weight auto-used at ≤13px for legibility; regular above.
- **No hand-rolled icon SVGs.** (The iso vehicle/lift are illustrations, not
  icons — they are the one sanctioned exception.)
- Icons are monochrome and inherit text color; they never carry the accent unless
  they sit inside the one champagne CTA.

---

## 10. Components

- **Need card** (spine exception): reason + risk figure in severity color, plate
  + vehicle, then champagne primary (Nudge/Update) + ghost Call. The only place
  the accent appears in the spine.
- **Queue row:** position badge (champagne if wait ≥20m), vehicle + service, wait
  time, and a green "→ Bay NN" hint on the next-up row. No plates in the spine —
  they live in the inspector on tap (avoids truncation).
- **Status pill** (`rivPill`): status text + a small live-status dot, on a faint
  tint. The dot is a *live-state indicator*, permitted here; it is never used as
  ornament elsewhere.
- **Inspector:** stage stepper (done=champagne, current=ink, todo=faint), label +
  value readouts on hairlines, a customer-link card with view state, a
  remaining-checklist with empty radio circles, then the NBA message preview in
  quotes above the champagne "Update customer" CTA + Call / Move ETA.
- **Bottom utility bar:** left status pill, centered icon nav cluster (active tile
  raised), right revenue pill. Numbers in mono.

---

## 11. Copy & numbers

- **Zero em-dashes and en-dashes (— –). Non-negotiable**, especially in
  customer-facing message copy. Use a period, comma, or restructure. The middot
  `·` is fine as a separator; the hyphen `-` is fine.
- Numbers are domain-plausible, never fake-precise marketing figures. Times,
  money (centavos rendered as ₱), ETAs, counts.
- Money is always mono with the ₱ glyph. ShopTrace never issues an OR/SI — copy
  must never imply a BIR Official Receipt.
- Taglish-friendly: customer message templates read like a person, not a system.

---

## 12. Anti-slop locks (audit checklist)

Run before shipping any new screen. Derived from the `design-taste-frontend`
review; the universally-applicable rules apply even though that skill scopes
itself to landing pages.

- [ ] **No em/en dashes** anywhere rendered (run `grep` for `—` and `–`).
- [ ] **One champagne accent**, repeated; no second hue reintroduced. CTA is
      champagne fill + dark ink text.
- [ ] **Red only for true alarm** (overdue/blocked/unpaid).
- [ ] **Radius** rounds to the §5 scale; no invented intermediate values.
- [ ] **One drop-shadow only** (the vehicle product-shadow); all UI depth is
      hairline.
- [ ] **Phosphor icons only**; no hand-rolled icon SVG (iso vehicle excepted).
- [ ] **Status dots are live-state only**, never ornament.
- [ ] **Geist** is the typeface; weight ≤600 except tiny alarm pills.
- [ ] **No fake-precise numbers**; all data domain-plausible.
- [ ] Plates render as the physical artifact (light ground, mono).

---

## 13. Run the prototype

```bash
cd design/prototype
npm install
node overview.js   # the locked synthesis -> index.html
node shot.mjs      # -> shoptrace.png
# (cockpit.js is the earlier dense advisor-cockpit variant)
```

Fonts/icons/Chromium resolve from `node_modules` (CDNs are avoided): Geist +
Inter via `@fontsource-variable/*`, icons via `@phosphor-icons/core`, headless
Chromium via `@sparticuz/chromium`.
