# Garage by ShopTrace — Consumer Car App PRD

**Version:** 0.1 (initial draft)  
**Date:** 2026-06-02  
**Status:** Vision draft — separate product, parked until ShopTrace shop MVP is validated  
**Working name:** *Garage by ShopTrace* (alternatives: MyGarage by ShopTrace · ShopTrace Drive · Pit by ShopTrace)  
**Relationship to ShopTrace:** Separate product and separate backend, integrated with ShopTrace via API (see Section 9). ShopTrace PRD Section 34 is the seam.

---

## 1. One-Line Positioning

**Everything about owning your car, and it fills itself in when you visit a ShopTrace shop.**

Not "a maintenance logger." A personal car companion — service history, spending, reminders, fuel economy, documents, and your build — that is *valuable on day one with zero typing* because ShopTrace shops populate it for you, and that *pulls you back daily* through Philippine-specific utility (number coding, fuel prices, document expiry).

---

## 2. The Core Thesis (and the trap to avoid)

### 2.1 Why most car apps die

There is a graveyard of car-maintenance apps. They don't fail on features — they fail because **manual logging is a chore and users quit in week two**, and because there's **no reason to open the app** when you're not logging. The apps that won in adjacent categories (fitness, finance) won by **removing the logging friction** (auto-import) and by having **daily pull** (a number you check often).

### 2.2 The two things that make this one stick

1. **Auto-fill from ShopTrace.** Every service at a ShopTrace shop populates this app's history, cost, mileage, and "next due" reminders with **zero typing.** This is the unfair advantage no standalone car app has. The app is useful before the user logs anything.
2. **Daily-utility hooks.** Philippine-specific features the user checks often (number coding, fuel price changes, document/registration expiry) give a reason to open the app even when nothing is being logged. Retention comes from the hooks; depth comes from the trackers.

Everything else is downstream of these two. If a feature doesn't either (a) reduce logging friction, or (b) give a reason to return, it's probably creep.

---

## 3. Target User

The everyday Filipino car owner — commuter, family-car owner, enthusiast. Owns 1–3 vehicles. Comfortable in Taglish. Has a smartphone, uses GCash, drives in Metro Manila number-coding reality, dreads LTO registration renewal, and notices fuel-price swings.

Secondary: the car enthusiast who wants to document and show off a build.

---

## 4. Product Principles (KISS)

1. **Auto-fill first, manual second.** The best entry is the one the user never makes.
2. **One reason to open it daily.** Always surface something useful on launch (coding status, fuel price, a due reminder).
3. **A thin app on a reused spine.** Reuse ShopTrace's patterns (Supabase, offline-first, reminder engine) — don't reinvent.
4. **Resist the kitchen sink.** A car app wants to become everything. Ship the spine; park the rest.
5. **Logging by talking or snapping.** Natural-language and receipt-photo capture, not forms.
6. **Local-shop realistic.** Works offline at the gas pump; Taglish; PH services and rules.

---

## 5. The Spine (v1 — five pillars)

Everything in the app hangs off these five. Build only these for the first release.

1. **Vehicles** — multi-car profiles (PH families share cars). Each links to a ShopTrace vehicle via verified ownership (Section 9).
2. **Service & spend history** — auto-imported from ShopTrace shops + manual/quick-capture entries. This is the "finance tracker for cars": total cost of ownership, cost-per-km, spend by category.
3. **Reminders engine** — one engine, many trigger types (PMS, registration, insurance, license, wipers, fluids, tires, battery, coding, custom). Interval- or mileage-based.
4. **Fuel log + economy** — km/L and ₱/km. The single most-loved feature in every fuel app.
5. **Quick-capture** — the universal "add anything" button: natural-language text or a receipt photo, parsed into the right row (Section 8).

---

## 6. Feature Set

Organized by purpose. Spine = v1. Hooks and the rest are sequenced in Section 11.

### 6.1 Spine features (v1)

- Multi-vehicle profiles (make/model/year/plate, photo, mileage)
- Auto-imported service history from ShopTrace (read-only records with shop attribution)
- Manual maintenance log (DIY oil change, wipers, etc.)
- Spending dashboard — total cost of ownership, cost/km, by category and by vehicle
- Fuel log → fuel economy (km/L), ₱/km, fill-up history and trends
- Reminders engine with templates (mileage- or date-based)
- Quick-capture (LLM text + receipt photo)

### 6.2 Daily-utility hooks (the retention layer — high priority)

- **Number coding reminder** (Metro Manila UVVRP) — "your plate can't drive tomorrow." Daily relevance → daily opens. Cheap, sticky, distinctive.
- **Fuel price alerts** — PH prices change weekly (announced Tuesdays). "Diesel +₱0.85, gas +₱0.40 effective tomorrow." High want-to-know.
- **Cheapest fuel nearby / station finder** — pairs with price alerts.

### 6.3 Document vault + expiry reminders (underrated, very PH)

- Store **OR/CR (LTO registration)**, **insurance/CPL**, **driver's license**, **emission test** — as photos/PDFs.
- Renewal reminders before expiry (registration renewal is tied to plate-ending month in PH; bake that in).
- This alone can justify the download — people get fined for forgetting these.

### 6.4 RFID / toll balance (see Section 7 for automation)

- Track **Autosweep** and **Easytrip** balances; low-balance reminders.
- Automation is constrained (no public API) — Section 7 details the realistic approach.

### 6.5 Enthusiast / show-off — the Build Sheet

- **Mods & upgrades list** per vehicle (part, brand, date, cost, photo, notes).
- **Shareable build sheet export** — a good-looking image/PDF/link to show off what's been done. Taps the same energy as the ShopTrace works gallery.
- Pull **beauty shots** from ShopTrace mod jobs straight into the build sheet (via the import API).
- Sharing = a generated artifact (image/link), **not** a social network. No community infrastructure in v1.

### 6.6 The sleeper feature — resale-ready history

- An exportable, **shop-verified** service + ownership record that boosts resale value.
- Because ShopTrace records are shop-verified, this is a **trust artifact** a private seller shows a buyer — something no manual app can produce.
- Ties to ShopTrace's `VehicleOwnership` transfer model; gives owners a real reason to keep the record complete.

### 6.7 Quietly useful (low-cost, additive)

- **Warranty tracker** (casa/powertrain expiry).
- **Battery age reminder** (PH heat kills batteries in ~2–3 years).
- **Tire rotation / alignment** reminders (part of the reminder engine).
- Per-vehicle **health score / due-rings** — light gamification (the fitness-app trick that makes maintenance feel rewarding).
- **Parking-spot reminder** (where did I park) — tiny utility hook.

### 6.8 Resist for now (explicit non-goals in v1)

Community/forum, parts marketplace, OBD-dongle live telematics, GPS trip tracking, ride-by-ride mileage for business reimbursement. All tempting, all heavy, none essential to the spine. Parked.

---

## 7. RFID Toll Balance — How to Automate (Honest Version)

The user asked specifically how to automate the balance checker. The honest answer shapes the feature.

### 7.1 The constraint

**Neither Autosweep (SMC tollways) nor Easytrip (MPTC tollways) offers a public API** for third-party balance checking. There is no clean, sanctioned way to pull a user's balance on demand. Anyone promising "automatic balance sync" is doing one of the fragile/risky things below. So we design around the constraint, not pretend it away.

### 7.2 What NOT to do

- **Don't scrape the providers' portals with the user's login** (store their toll-account password, headless-login, screen-scrape). It's fragile, breaks on every site change, is a security liability (storing third-party credentials), and is ToS-hostile.

### 7.3 The realistic automation ladder (best → fallback)

1. **Notification ingestion (Android) — best realistic automation.** With the user's explicit opt-in, an Android **NotificationListenerService** reads the *official toll app's* push notifications (balance-deduction and low-balance alerts) and parses the balance into the app automatically. This is how "expenses-from-notifications" apps work. Requires: the user has the official app installed and notifications on. **Android-only** (iOS cannot do this). This is the headline "automation" we can honestly offer.
2. **Email parsing.** Autosweep/Easytrip send email receipts and low-balance notices. With a Gmail read scope (or a dedicated forwarding address), parse those into balance updates. Cross-platform; depends on the user having email notifications enabled.
3. **SMS parsing (Android).** Provider SMS alerts can be parsed — but Google Play heavily restricts SMS permissions, so this is a weaker, policy-risky option. Treat as secondary.
4. **Predictive reminder + manual quick-log (the always-works fallback).** The user logs a balance when they reload (one tap, or via quick-capture). The app learns their average daily/weekly toll spend and **predicts depletion**: "You reloaded ₱500 twelve days ago and average ~₱45/day — you're likely under ₱100. Tap to check/reload." This works for everyone, even iOS, even without any integration, and is genuinely useful.
5. **One-tap deep link** to the official app / USSD / reload portal — make *checking and reloading* one tap, even when we can't read the number.

### 7.4 Recommendation

Ship **#4 (predictive reminder + quick-log) + #5 (deep link)** in the first version — they always work and require no fragile integration. Add **#1 (notification ingestion, Android)** as the opt-in "auto" upgrade. Frame it honestly: "We'll remind you before you run low and make reloading one tap; on Android, we can read your toll app's alerts to keep your balance current automatically."

> **General principle:** the same pattern (no API → notification/email parse + predictive reminders + deep link) applies to other PH balances (Beep card, e-wallet auto-debits). Build the ingestion + prediction engine once; reuse it.

---

## 8. Quick-Capture (LLM) — Design

The friction-killer. **Frame it as an input method, not a chatbot.**

- **Two inputs:** (a) natural-language text — "filled up 40L for ₱2,400 at Shell" or "changed wiper blades today"; (b) **receipt/photo** — snap a fuel or parts receipt.
- **Stateless structured extraction.** The LLM's only job is to turn the input into a structured row (fuel log, expense, maintenance entry, reminder) via tool-calling against a fixed schema. No memory, no personality, no open-ended chat. Cheapest and simplest thing that works.
- **Always confirm before save.** Show the parsed row for a one-tap confirm/edit. Never silently write guessed data.
- **Start small:** text parse + receipt OCR for fuel and expenses; expand to maintenance and reminders. (Implementation: Claude API with tool use + vision; keep the prompt and tool schema tiny.)
- **Privacy:** parsing runs server-side on the user's own data; no cross-user training; receipts treated as documents (Section 10).

---

## 9. Integration with ShopTrace (the auto-fill wedge)

This is what makes the app valuable on day one. **Separate backend, integrated by API** — exactly the seam in ShopTrace PRD Section 34.

- **Verified vehicle ownership is the link — not raw plate** (plate is guessable/spoofable). An owner claims a vehicle via **plate + a shop-issued OTP / claim link** generated by a ShopTrace shop (e.g., printed on the job order or sent with the tracking link). The claim establishes a verified, time-bound ownership tie to the ShopTrace `Vehicle`.
- **ShopTrace exposes a partner API** that returns the *customer-visible, approved* service records for vehicles the owner has verified — service date, mileage, services performed, parts (structured-lite), costs, and approved photos. Never internal notes or other customers' data.
- **One-directional by default:** the consumer app *reads* shop records and *writes* only the owner's own entries (fuel, DIY logs, documents, mods). It does not write into the shop's records.
- **Ownership transfer (18.6 in ShopTrace):** on sale, the owner sees only their own ownership period; history stays with the vehicle on the ShopTrace side.
- **Why separate backend is correct:** the consumer app's data model is *owner-owned and cross-shop*, the opposite of ShopTrace's *shop-owned multi-tenant* model. Co-locating them would force awkward cross-tenant RLS exceptions and couple two products with very different release cadences and security boundaries. A separate backend + clean API keeps each product simple — and the API integration fully preserves the auto-fill advantage.

---

## 10. Architecture (KISS)

| Layer | Choice | Notes |
|-------|--------|-------|
| Client | **Expo / React Native** (native app) | Native — not PWA — because the RFID **notification listener (Android)**, reliable push notifications, camera/receipt capture, and app-store discovery all need native. This is a deliberate divergence from ShopTrace's mechanic PWA. |
| Backend | **Supabase (its own project)** — Postgres + Auth + Storage | Separate instance from ShopTrace. Owner is the account holder. |
| Offline | Local-first log + sync (same pattern as ShopTrace mechanic app) | You log fuel at a pump with one bar of signal. |
| Reminders | `pg_cron` + Expo push notifications | One engine, many trigger types. |
| LLM capture | Stateless parse endpoint (Claude API, tool use + vision) | Input → structured row. No agent. |
| External data | Scheduled fetch → shared tables (fuel prices, coding rules) | Per-region, not per-user. |
| ShopTrace link | Partner API + verified-ownership claim | Section 9. |
| Payments (later) | Subscription via app stores / PayMongo | If monetized; free utility-led acquisition first. |

### 10.1 Data Model (consumer-owned)

- **User** — account owner (the car owner).
- **Vehicle** — owned by user; optional verified link to a ShopTrace vehicle.
- **OwnershipClaim** — verification record (plate + OTP), status, claimed-at.
- **ServiceRecord** — imported from ShopTrace (read-only mirror/reference), shop-attributed.
- **MaintenanceLog** — user's own (DIY) maintenance entries.
- **FuelLog** — date, odometer, liters, price, station; derives km/L and ₱/km.
- **Expense** — any car spend (categorized); service and fuel roll up here for total cost of ownership.
- **Reminder** — engine; `type` (pms/registration/insurance/license/wiper/fluid/tire/battery/coding/rfid/custom), trigger (date or mileage), status.
- **Document** — vault: OR/CR, insurance, license, emission; with `expires_on`.
- **ModItem** — build sheet entries (part, brand, date, cost, photo, notes).
- **BalanceSnapshot** — toll/RFID (and similar) balances; manual or auto-captured; feeds predictive reminders.
- **External (shared):** `FuelPrice`, `CodingRule`.

---

## 11. MVP & Phasing

### 11.1 Consumer App MVP (after ShopTrace pilot is validated)

The spine + the cheapest high-retention hooks:

- Multi-vehicle profiles
- ShopTrace service-history import (verified ownership claim + read API)
- Reminders engine (PMS, registration, insurance, basic wear items)
- Fuel log + economy
- Quick-capture (text + receipt) for fuel and expenses
- Spending dashboard (cost of ownership, ₱/km)
- **Number coding reminder** + **fuel price alerts** (the two best PH hooks)
- Document vault + expiry reminders

### 11.2 Phase 2

- Build sheet + shareable export (enthusiast hook)
- RFID notification-listener automation (Android) + predictive reminders
- Resale-ready verified history export
- Health score / due-rings gamification
- Cheapest-fuel-nearby finder

### 11.3 Phase 3 / evaluate

- Warranty tracker, battery-age, parking reminder
- Broader balance ingestion (Beep, e-wallet)
- Monetization (subscription for power features; utility stays free for acquisition)

### 11.4 Sequencing note

Two gates from the ShopTrace side must exist first: (1) the **partner API** and (2) the **verified-ownership claim flow**. Until those ship, there is no auto-fill — and without auto-fill this is just another manual car app. So **do not start the consumer app before the ShopTrace integration seam exists and the shop pilot proves demand.**

---

## 12. Privacy & Compliance (PH Data Privacy Act)

This app holds *more* sensitive data than ShopTrace and needs care:

- **Documents** (OR/CR, insurance, license) and **location** (station finder, parking) and **notification/email access** (RFID parsing) are all sensitive. Each is **opt-in, purpose-explained, and revocable.**
- **Notification listener / email scope** require explicit, separate consent with a plain-language explanation of exactly what is read and why; nothing is read until granted.
- **Data minimization:** parse only the toll/fuel info needed from notifications/emails; don't store full message bodies longer than needed.
- **User owns and can export/delete** all their data (DPA data-subject rights).
- **No selling of data.** If aggregate insights (e.g., fuel trends) are ever used, they are anonymized and that use is disclosed.
- **ShopTrace boundary:** the app only ever receives customer-visible, approved records for verified-owned vehicles.

---

## 13. Open Questions

**Product**
1. Final name (*Garage by ShopTrace* vs alternatives).
2. Free vs paid line — which features stay free (utility/acquisition) vs paid (power features)?
3. Is the resale-history export a free trust feature or a premium one?

**Technical**
1. iOS parity for RFID — without notification-listener, iOS relies on email parse + predictive reminders. Acceptable?
2. Fuel-price and coding-rule data source — official feed, partner, or maintained dataset?
3. Receipt OCR accuracy bar before we trust auto-parse vs always-confirm.

**Business**
1. Does the consumer app launch ShopTrace-shops-only (auto-fill works) or also as a standalone manual app (no auto-fill) to seed users before shop density exists?
2. Acquisition: lead with the free PH utilities (coding, fuel prices, document expiry) to pull users, then upsell the tracker depth?

---

## 14. Relationship to ShopTrace — Summary

- **Separate product, separate backend, separate app (Expo/React Native).**
- **Integrated via a ShopTrace partner API + verified vehicle ownership.**
- ShopTrace = shop-owned, multi-tenant, operations. Garage = owner-owned, cross-shop, personal.
- The integration (auto-fill) is the moat; the PH daily hooks are the retention; the trackers are the depth.
- **Parked** until the ShopTrace shop MVP and pilot validate demand and the integration seam (partner API + ownership claim) exists.
