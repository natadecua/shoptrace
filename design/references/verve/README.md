# Light-mode reference: "verve"

The **verve** real estate dashboard is ShopTrace's reference for **light mode**.
This folder holds the reference screenshots; the design rules derived from it are
in the repo-root [`DESIGN.md`](../../../DESIGN.md) under section 3 (Color) →
"Light mode (reference)".

> Add the reference screenshots here as image files (the dashboard shot and the
> brand/style board). They were shared in chat; drop the PNGs into this folder so
> the visual reference is durable in the repo.

## What to take from it

- **Green-led, airy, soft.** Near-white page, white cards, pastel stat cards,
  generous whitespace.
- **Palette** (verve brand):
  - `NORDIC` `#19322F` — headings, primary text, logo
  - `MOSQUE` `#006655` — primary green: prices, identity, active/selected
  - `HINT OF GREEN` `#D9ECC8` — pale green card fill
  - `CLEAR DAY` `#EEF6F6` — near-white page background
  - pale blue `~#D6EAF2` — second pastel stat card
- **Type:** verve uses SF Pro Display. ShopTrace keeps **Geist** (Apple-adjacent);
  the editorial feel carries over, no font change.
- **Depth:** light mode uses gentle soft shadows for card separation (vs the
  dark mode's hairline-only rule).

## Open question before building light mode

Dark mode locks **orange** `#F54E00` as the single CTA accent. verve is green-led.
Recommendation: keep orange as the one cross-mode CTA accent and use MOSQUE green
as light mode's identity/secondary. Confirm before implementing.
