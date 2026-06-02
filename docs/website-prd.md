# ShopTrace — Public Website PRD

> *ShopTrace* is the platform. This spec describes the **public-website surface** that each shop tenant gets. *AutoLounge* is used as the example shop throughout.

**Version:** 1.0  
**Date:** 2026-06-02  
**Status:** Authoritative  
**Parent document:** `docs/prd.md` (Section 8)

---

## 1. Purpose

The public website is not the core product. It is the shop's front door — the place customers land before they decide to visit, and the place they return to check the queue, look up a service, or browse the gallery. Done well, it makes the shop feel credible and professional before a single car pulls in.

The website must:
1. Tell a first-time visitor what this shop does and why it is worth visiting.
2. Let an existing customer check the queue or send an inquiry.
3. Funnel pre-service customers into the admin dashboard as a pending inquiry.
4. Showcase the shop's work to drive walk-ins and repeat business.

---

## 2. Pages

| Page | URL | Priority |
|------|-----|----------|
| Home | `/` | P0 |
| Queue / Availability | `/queue` | P0 |
| Services (index) | `/services` | P0 |
| Service detail | `/services/[slug]` | P1 |
| Works gallery | `/gallery` | P1 |
| Pre-service inquiry | `/inquiry` | P1 |
| Auto supply catalog | `/supplies` | P2 |
| About / Contact | `/about` | P1 |
| Customer tracking portal | `/track/[token]` | P0 — separate app |

---

## 3. Design System

### 3.1 Brand Identity

The website should feel like a shop that is:
- **Competent and trustworthy** — not just good vibes; they know what they're doing.
- **Modern but not cold** — approachable for the everyday car owner, exciting for the enthusiast.
- **Distinctly Filipino** — not a copy of a Western shop website; comfortable with Taglish content.

### 3.2 Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary brand | Deep orange / amber | `#f97316` (Tailwind orange-500) |
| Primary dark | Charcoal / near-black | `#0f172a` (Tailwind slate-900) |
| Surface dark | Dark navy card | `#1e293b` (Tailwind slate-800) |
| Surface light | Off-white | `#f8fafc` (Tailwind slate-50) |
| Accent | Bright amber | `#fbbf24` (Tailwind amber-400) |
| Text primary (dark bg) | White | `#ffffff` |
| Text secondary (dark bg) | Muted slate | `#94a3b8` (Tailwind slate-400) |
| Text primary (light bg) | Dark slate | `#0f172a` |
| Success | Green | `#22c55e` (Tailwind green-500) |
| Warning | Orange | `#f97316` |
| Danger | Red | `#ef4444` (Tailwind red-500) |

**Usage rule:** The homepage hero and queue tracker use the dark palette. Service detail pages and the inquiry form use the light palette for readability. Gallery is dark. The overall feel is "dark automotive brand" with light content surfaces.

### 3.3 Typography

| Use | Font | Weight | Size |
|-----|------|--------|------|
| Headlines (hero, section) | Inter or Geist | 700–900 | 48–72px |
| Sub-headlines | Inter | 600 | 24–32px |
| Body text | Inter | 400 | 16px |
| Small / meta | Inter | 400 | 13–14px |
| Service badges / tags | Inter | 600 | 12px uppercase |
| Monospace (WO numbers) | Geist Mono or JetBrains Mono | 400 | 14px |

### 3.4 Visual Language

- **Photography-forward.** Real shop photos beat illustrations. Use actual AutoLounge photos wherever possible — engine bays, lifted cars, mechanics at work, finished mods.
- **Grid-based layouts.** 12-column desktop grid, 4-column tablet, 1-column mobile.
- **Rounded cards.** 8–12px border radius throughout. Subtle drop shadows on cards.
- **Orange accents on dark.** CTA buttons, tags, and highlights use orange on the dark palette.
- **Line dividers sparingly.** Use section spacing rather than horizontal rules.
- **Animated but restrained.** Subtle entrance animations on scroll (opacity + translateY). No heavy parallax or motion sickness-inducing effects.

### 3.5 Component Library

- **Tailwind CSS** for styling
- **shadcn/ui** for interactive components (buttons, forms, dialogs, tabs)
- Custom components built for: service cards, photo gallery grid, queue status indicator, vehicle intake form

---

## 4. Home Page (`/`)

### 4.1 Hero Section

**Layout:** Full-viewport-height section. Dark background. Real shop photography as background (vehicle being lifted, engine work, or beauty shot of a finished build). Orange overlay gradient at the bottom for text contrast.

**Content:**
```
[Tag pill] "Quezon City's Trusted Auto Shop"

Headline (2 lines, 64–72px bold):
  "Your car is in
  good hands."

Sub-headline (18px, muted):
  "Transparent service, real proof photos, and live job tracking
  for every vehicle we touch."

CTA buttons (side by side):
  [Check Queue →]    (primary, orange)
  [Book a Service]   (outlined, white)

Trust bar below CTAs:
  500+ satisfied customers  ·  Real-time job tracking  ·  Proof photos every job
```

**Background photography:** Full-bleed mechanic/shop photo, dark overlay (40–50% opacity), shop logo top-left.

### 4.2 Queue Teaser Section

**Layout:** Dark card, full-width, immediately below the hero.

**Content:**
```
LEFT SIDE:
  Current Queue Status
  [BIG STATUS BADGE] e.g., "🟡 MODERATE"
  "3–4 vehicles ahead · Est. ~1 hour wait"
  Updated 8 minutes ago

  [Check Full Queue →]

RIGHT SIDE:
  Quick service (PMS/Oil)  — 1 ahead · ~30 min
  Major repair             — 2 ahead · ~2 hrs
```

This teaser converts browsers into visitors by answering "is it worth going now?"

### 4.3 Why AutoLounge Section

**Layout:** 3-column feature grid on desktop, stacked on mobile.

**Headline:** "Not just an oil change. A documented record."

**Feature cards (3):**

1. **Live Job Tracking**
   Icon: map pin or live signal
   "Get a private tracking link the moment your vehicle enters our queue. See every status update in real time."

2. **Proof Photos, Every Job**
   Icon: camera or shield check
   "Every service is documented with photos — intake, process, and final result. See exactly what was done, not just what was billed."

3. **PMS Reminders**
   Icon: calendar or bell
   "We keep track of your mileage and service history so you never miss a scheduled maintenance — and we send a reminder before it's due."

### 4.4 Featured Services Section

**Layout:** Horizontal scroll on mobile, 3×2 grid on desktop.

**Headline:** "What we do"

**Service cards (6 featured):**

Each card:
- Dark card with a relevant automotive photo background
- Service name in bold white
- One-line description
- "Learn more →" link

Services to feature:
- PMS / Change Oil
- Brake Service
- Diagnostics
- Suspension / Underchassis
- Mods & Upgrades
- Battery & Electrical

**Below grid:** "See all 11 services →" link

### 4.5 Recent Work / Gallery Teaser

**Layout:** Full-width masonry grid, 3–4 photos. Dark section.

**Headline:** "Proof of work"

**Sub-headline:** "Every job we complete gets documented. Here's a sample from our recent work."

**Photo grid:**
- 3–4 recent gallery photos (mix of before/after, beauty shots, mods)
- Each photo has a service type tag overlay (e.g., "Suspension", "Mods", "PMS")
- Hover state: slight scale + overlay with "View job"

**CTA:** "See the full gallery →"

### 4.6 Social Proof / Trust Section

**Layout:** Light background section, breaks the dark pattern.

**Content:**
- Customer testimonials (2–3 short quotes) — "I could track my car the whole time it was in the shop. Never had to call once." — *Ken M., Toyota Fortuner owner*
- Star rating display if available
- Counter stats: "500+ jobs completed · 4.9 star average · 3 mechanics on staff"

### 4.7 Pre-Service CTA Section

**Layout:** Dark background, centered. Full-width.

**Headline:** "Ready to bring in your car?"

**Sub-headline:** "Tell us your concern and we'll prepare before you arrive."

**CTA buttons:**
- [Send an Inquiry] (primary, orange)
- [Check the Queue] (outlined)

### 4.8 Footer

**Columns:**
1. **Shop info:** Logo, tagline, address, Google Maps link, phone, Messenger link
2. **Services:** PMS · Brakes · Diagnostics · Suspension · Mods · Battery · Tires · All services →
3. **Customer:** Track your vehicle · Send inquiry · Check queue
4. **Hours:** Monday–Saturday 8:00 AM – 6:00 PM · Sunday Closed

**Bottom bar:** © 2024 AutoLounge · Privacy Policy · Terms

---

## 5. Queue / Availability Page (`/queue`)

### 5.1 Purpose

The single most useful page for a potential walk-in. Answers: *Is it worth going right now?*

### 5.2 Layout

**Full-page, mobile-first.** Most users will check this on their phone before driving to the shop.

### 5.3 Status Hero

Large card, takes up most of the screen above the fold:

```
┌─────────────────────────────────┐
│  AutoLounge is...               │
│                                 │
│  🔴  BUSY                       │  (large, 48px)
│                                 │
│  Several vehicles ahead         │
│  Est. wait: 1.5 – 2 hours       │
│                                 │
│  Best time to visit:            │
│  After 3:00 PM today            │
│                                 │
│  Updated 6 minutes ago          │
└─────────────────────────────────┘
```

Status bands and their colors:
- **Light** — Green `#22c55e` — "1–2 vehicles · under 30 min"
- **Moderate** — Amber `#fbbf24` — "3–4 vehicles · ~1 hour"
- **Busy** — Orange `#f97316` — "5+ vehicles · 1.5–2+ hours"
- **Near Closing** — Orange dimmed — "Accepting limited vehicles"
- **Closed** — Slate grey — "Opens Monday 8:00 AM"
- **Status may be outdated** — Grey banner — shown when no update in > 30 min during open hours

### 5.4 Service Lane Cards

Two side-by-side cards below the hero:

```
┌──────────────┐  ┌──────────────┐
│ Quick Service│  │ Major Repair │
│  PMS · Oil   │  │  Repair · Mod│
│              │  │              │
│ 2 ahead      │  │ 3 ahead      │
│ ~45 min      │  │ ~2–3 hrs     │
└──────────────┘  └──────────────┘
```

### 5.5 CTA Section

```
Planning to visit?

[Message Us on Messenger] (primary — Messenger blue #0084FF)
[Call Us: 0917-XXX-XXXX] (outlined)

"Tell us your service and we'll prepare your bay."
```

### 5.6 Recent Activity (Optional, adds freshness signal)

Small muted feed:
- "A vehicle was released 18 min ago"
- "Currently serving 2 vehicles"
- "Shop accepted 6 vehicles today"

---

## 6. Services Index Page (`/services`)

### 6.1 Layout

Clean grid of service category cards. Light background.

**Headline:** "What we offer"
**Sub-headline:** "From quick oil changes to full modifications — we document and track every job."

### 6.2 Service Category Cards (11 cards)

Each card:
- Service category icon (custom SVG or from Lucide/Heroicons)
- Service name
- One-line description
- "Starting at ₱ X" or "Ask for quote"
- "See details →"

**Cards:**

| Service | Icon | One-liner |
|---------|------|-----------|
| PMS / Change Oil | oil drop | "Regular preventive maintenance to keep your engine healthy" |
| Diagnostics | scan tool / OBD | "Full OBD scan and electrical diagnostics with documented scan results" |
| General Repair | wrench | "Engine, transmission, and drivetrain repair by experienced technicians" |
| Brake Service | brake disc | "Pads, rotors, calipers, and brake fluid — checked and documented" |
| Suspension / Underchassis | car with springs | "Shocks, struts, bushings, ball joints, and full underchassis inspection" |
| Battery | battery | "Testing, replacement, and terminal cleaning with before/after photos" |
| Tires / Mags | wheel | "Mounting, balancing, rotation, and alignment checks" |
| Accessories | plug | "Dashcams, audio, lighting, and comfort accessories installed professionally" |
| Mods & Upgrades | lightning bolt | "Performance and aesthetic upgrades with beauty shots for your record" |
| Auto Supply | shopping bag | "Parts and supplies — inquire about fitment for your specific vehicle" |
| Detailing & Cleaning | sparkles | "Interior and exterior detailing packages" |

---

## 7. Service Detail Page (`/services/[slug]`)

### 7.1 Layout

**Hero:** Service name headline + photo background (relevant service photo)

**Body sections:**

**What this service is**
2–3 paragraph plain-language explanation of the service. No jargon. Written for the car owner, not the mechanic.

**When you need it**
Bullet list. Example for PMS:
- Every 5,000–10,000 km depending on your vehicle and oil type
- Every 3–6 months even if you haven't hit the mileage
- If you notice reduced engine performance or the oil warning light comes on

**What to prepare / bring**
- Your vehicle registration (or just your plate number is fine)
- Mileage reading
- Any specific concerns you want us to check

**Estimated duration**
"A typical PMS takes 45–90 minutes. We'll give you an estimated completion time when you check in."

**Starting price**
"PMS / Change Oil starts at ₱ 800, depending on oil type and vehicle. Ask us for a quote for your specific car."

**Proof photos for this service**
Photo strip showing 3–4 example photos from a real completed job (from the works gallery). Caption: "This is what your service record will look like."

**Call to action**
[Check queue before visiting] [Send an inquiry] [Message us on Messenger]

---

## 8. Works Gallery (`/gallery`)

### 8.1 Purpose

Show real completed work. Build credibility. Drive customer excitement. Give enthusiasts a reason to choose this shop over a cheaper alternative.

### 8.2 Layout

**Filters bar (horizontal scroll on mobile):**
All · PMS Work · Brake & Suspension · Mods & Upgrades · Detailing · Diagnostics · Customer Builds

**Photo grid:**
Masonry grid (2 columns on mobile, 3 on tablet, 4 on desktop).

**Each gallery card:**
- Photo (auto-cropped to square)
- On hover/tap: overlay with service type tag + short caption
- Tap to open lightbox

**Lightbox:**
- Full-size photo
- Caption: vehicle (make/model), service type, brief note
- Navigation arrows (prev/next within same job)
- "Book a similar service →" CTA
- For before/after jobs: side-by-side or swipe comparison

### 8.3 Content Guidelines

Content approved for gallery (Section 8.4 of main PRD):
- Beauty shots of finished mods/upgrades
- Before/after comparisons
- Completed PMS documentation (engine bay cleaned, filter replaced)
- Customer builds (with consent)
- Close-up part replacement photos
- Underchassis work

Not for gallery:
- Photos with other customers' faces or plates
- Internal/diagnostic-only photos
- Failed work or rejected parts (these stay in internal records)

---

## 9. Pre-Service Inquiry Form (`/inquiry`)

### 9.1 Purpose

A structured intake form customers fill out before visiting or messaging. Output is (a) a Messenger-ready message and (b) a pending inquiry in the admin dashboard.

### 9.2 Layout

Two-column on desktop, single-column on mobile.

**Page headline:** "Tell us about your vehicle"
**Sub-headline:** "Fill this out and we'll have everything ready when you arrive — or we'll message you back."

### 9.3 Form Fields

**Your info**
- Name (required)
- Contact number (required)
- Preferred contact method: Messenger / SMS / Call

**Your vehicle**
- Vehicle brand (dropdown: Toyota, Honda, Mitsubishi, Ford, Hyundai, Isuzu, Nissan, Suzuki, Kia, Other)
- Model (text)
- Year (dropdown: 2000–2025)
- Plate number (optional)
- Mileage (numeric)

**Service needed**
- Service type (multi-select pills): PMS/Change Oil · Brakes · Diagnostics · Suspension · Battery · Tires · Mods · Accessories · General Repair · Detailing · Other
- Describe your concern (text area) — "What are you noticing? What do you want checked?"
- Preferred visit date (date picker — next 7 days only in MVP)
- Preferred time: Morning (8–12) · Afternoon (12–4) · Late afternoon (4–6)

**Consents**
- ☑ I agree to be contacted by AutoLounge regarding this inquiry
- ☐ Send me reminders when my next PMS is due (optional)
- ☐ Send me promos and announcements (optional)

### 9.4 Output Screen

After submit:

**Success card:**
```
Thanks, [Name]! We've received your inquiry.

[Inquiry summary box — clean formatted summary of their inputs]

We'll message you on [Messenger/SMS] within [response time].

📋 Your Messenger-ready message:
[Pre-written text the customer can copy and paste into AutoLounge's Messenger]

"Hi AutoLounge! Ako po si [Name]. Gusto ko pong mag-PMS ng aking 
2019 Toyota Fortuner (ABC 1234). Kasalukuyang [Mileage] km na po. 
Pwede po ba bukas ng umaga? Salamat!"

[Copy Message] button

[Check queue to plan your visit →]
```

---

## 10. Auto Supply Catalog (`/supplies`)

### 10.1 Purpose

Lightweight catalog. Not e-commerce. Helps customers confirm the shop stocks a part or brand before visiting. Inquiries go to the admin dashboard.

### 10.2 Layout

**Filter sidebar:** Category (Oils · Filters · Brakes · Batteries · Tires · Accessories · Fluids) + Brand filter

**Product cards:**
- Product name
- Brand
- Part type / category
- Fitment notes (e.g., "Compatible with most 4-cylinder engines" or "Ask for specific fitment")
- Availability: In Stock · Ask for availability · Order on request
- [Ask Availability] button → opens inquiry mini-form (name, phone, vehicle, confirm product)

**No pricing on the website** — pricing is quoted directly to avoid outdated price complaints.

---

## 11. About / Contact (`/about`)

### 11.1 Sections

**Our story**
2–3 paragraph origin story of AutoLounge. Why the shop exists. What makes it different. Personal, not corporate.

**Meet the team** (optional)
Photo cards for owner and lead mechanics. Name, role, short bio. Builds trust.

**The AutoLounge experience**
Mention the lounge area (if applicable): billiards, café, comfortable waiting area while your car is being serviced. This is a differentiator from a typical street-side shop.

**How we work**
3-step visual:
1. **Drop off or walk in** — We create your work order and send you a tracking link
2. **We document everything** — Proof photos, checklist, and transparent updates
3. **Approve, pay, pick up** — See the final bill before you arrive; release when you're ready

**Contact details**
- Address with embedded Google Map
- Phone number (tap to call)
- Messenger link
- Operating hours table
- Parking notes if applicable

**Instagram / Social gallery embed** (last 6 Instagram posts)

---

## 12. Navigation Structure

### 12.1 Desktop Nav

```
[Logo]   Services   Gallery   Queue   Supplies   About        [Track Your Vehicle]  [Check Queue]
```

- "Track Your Vehicle" = outlined link button, always visible
- "Check Queue" = orange CTA button, always visible
- Active page underlined

### 12.2 Mobile Nav

Hamburger menu. Top bar always shows:
- Logo (left)
- Queue status badge (center — small pill showing current status band, e.g., 🟡 Moderate)
- "Track" icon (right) and hamburger (right)

Menu items (full-screen overlay or slide-in):
- Home
- Services
- Queue / Wait Time
- Gallery
- Inquiry
- About & Contact
- Track Your Vehicle (with link icon)

### 12.3 Sticky Behavior

On scroll down:
- Desktop: Navbar becomes solid dark background (was transparent on hero)
- Mobile: Sticky top bar with queue badge stays visible at all times

---

## 13. SEO and Metadata

### 13.1 Priority Pages

| Page | Title tag | Meta description |
|------|-----------|-----------------|
| Home | AutoLounge — Auto Shop with Live Job Tracking | Transparent car service with real-time tracking, proof photos, and PMS reminders. Visit us in [City]. |
| Queue | Is AutoLounge Busy Right Now? — Live Queue Status | Check the current wait time at AutoLounge before you visit. Updated in real time. |
| Services | Auto Shop Services — PMS, Brakes, Diagnostics & More | See all services offered by AutoLounge: change oil, brake service, diagnostics, mods, and more. |
| Gallery | Work Gallery — AutoLounge Proof Photos | Browse completed jobs at AutoLounge: before/after photos, mods, PMS documentation, and more. |

### 13.2 Local SEO

- Address and phone in schema.org LocalBusiness markup
- Google Business Profile consistency (same NAP: name, address, phone)
- City-specific keywords in headings and copy (not keyword-stuffed)

---

## 14. Performance Requirements

- **First Contentful Paint:** < 1.5 s on 4G mobile
- **Largest Contentful Paint:** < 2.5 s
- **No layout shift** on font or image load (reserve space for images)
- **Queue page:** Updates without full page reload (polling or WebSocket for status band)
- **Images:** All gallery images lazy-loaded, compressed (WebP), served from CDN (Cloudflare R2 or similar)
- **Core Web Vitals:** Green on all three (LCP, FID/INP, CLS)

---

## 15. Responsive Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | 375–767px | 1 column, stacked sections |
| Tablet | 768–1199px | 2-column grids, sidebar collapses |
| Desktop | 1200px+ | Full 3–4 column grids, fixed sidebar nav |

All interactive elements ≥ 44px tap target on mobile.

---

## 16. Copy Tone of Voice

- **Confident, not arrogant.** The shop knows what it's doing; it does not need to oversell.
- **Clear, not corporate.** Short sentences. Plain words. A car owner should understand every sentence without a dictionary.
- **Taglish-comfortable.** Customer testimonials and social content can be in Taglish. Service descriptions default to English with common Filipino phrases where appropriate.
- **Proof-oriented.** Repeat the "proof photos," "documented," and "transparent" language across multiple pages — it is the core brand promise.
- **Local and real.** Mention the city, the real team, the real lounge. Avoid generic stock-photo-and-boilerplate tone.

---

## 17. Content to Prepare Before Launch

| Asset | Owner | Priority |
|-------|-------|----------|
| Shop photography (facade, interior, lounge, mechanics at work) | AutoLounge | P0 |
| 10–20 gallery photos (completed jobs, before/after) | AutoLounge | P0 |
| Service descriptions (copy for each of the 11 services) | AutoLounge + writer | P0 |
| Logo (SVG, white and color versions) | Designer | P0 |
| Contact details (address, phone, hours, Messenger link) | AutoLounge | P0 |
| Team photos (owner, head mechanic) | AutoLounge | P1 |
| Customer testimonials (2–4 short quotes with permission) | AutoLounge | P1 |
| Shop story (About page copy) | AutoLounge + writer | P1 |
| Instagram account for social embed | AutoLounge | P2 |
| Starter price ranges for each service | AutoLounge | P1 |

---

## 18. MVP vs Full Website Scope

### MVP Website (launch with the product)

- Home page
- Queue page (live status from the same system)
- Services index page
- Pre-service inquiry form
- About/Contact page
- Navigation + footer

### Full Website (within 3 months of launch)

- Service detail pages for all 11 categories
- Works gallery with filters
- Auto supply catalog

### Future

- Blog / educational content (SEO)
- Customer login portal entry point
- Loyalty/promo page
- Multi-language (Filipino)
