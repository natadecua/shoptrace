# AutoLounge Service Hub — Claude Design Prompts

Use these prompts with Claude or any AI design tool (Canva AI, v0, Figma AI, etc.) to generate UI mockups for each major surface. Each prompt is self-contained and includes context, layout direction, and component detail.

---

## Prompt 1 — Admin Queue Board (Desktop)

Design a **dark-mode auto shop operations dashboard** called "AutoLounge Service Hub." This is the main screen that front-desk staff and managers look at all day.

**Layout:** Full-width desktop. Left sidebar for navigation, main area split into a kanban-style job queue.

**Sidebar navigation items:**
- Queue Board (active)
- Work Orders
- Customers & Vehicles
- PMS Reminders
- Reports
- Settings

**Main area — Kanban columns (left to right):**
1. **Queued** — vehicles waiting, shows count badge
2. **In Progress** — actively being worked on
3. **Waiting Approval** — orange warning badge, "awaiting customer" flag if overdue
4. **Ready for Release** — green badge
5. **Released Today** — muted column

**Each job card shows:**
- Vehicle: e.g., "2019 Toyota Fortuner · ABC 1234"
- Customer name
- Service type tag (e.g., "PMS", "Brake Service", "Diagnostics") — color-coded
- Mechanic avatar/initials
- Time in current status (e.g., "2h 14m")
- Priority indicator (high priority = red left border)
- Photo count: "8/10 photos"
- Approval badge if waiting (pulsing orange dot)

**Top bar:**
- Shop status toggle: Open / Busy / Near Closing / Closed — with current estimated wait band (e.g., "Busy · Est. 1.5–2 hrs")
- Queue pause button
- "Add Vehicle" primary button
- Search bar
- Notification bell

**Color palette:** Dark navy background (#0f172a), card background (#1e293b), accent orange (#f97316) for attention states, green (#22c55e) for ready/released, white text. Tailwind CSS design system, shadcn/ui component style.

**Feel:** Professional, high information density but not cluttered. Similar feel to Linear or GitHub Projects but for a physical shop floor.

---

## Prompt 2 — Work Order Creation Form (Desktop / Admin)

Design a **work order creation modal or full-page form** for an auto shop management system called AutoLounge Service Hub. Dark mode, desktop.

**Form title:** "New Work Order"

**Left column — Customer & Vehicle:**
- Customer search field with autocomplete (shows existing customers by name or phone)
- "New Customer" inline option if not found
- Customer name, contact number fields
- Vehicle search (by plate number — primary) with autocomplete
- "New Vehicle" inline option
- Vehicle fields: Make, Model, Year, Plate Number, VIN (optional)
- Mileage at intake (required, numeric)
- Fuel level selector (E — ¼ — ½ — ¾ — F) as a visual gauge
- Existing damage notes (text area with a small note: "document scratches, dents before work begins")
- Intake photo upload area (drag-drop or camera capture)

**Right column — Job Details:**
- Service type selector (dropdown with icons): PMS/Change Oil, Brake Service, Diagnostics, General Repair, Suspension, Battery, Tires/Mags, Mods/Upgrades, Detailing, Other
- Customer complaint/request (text area, required)
- Initial notes (text area, optional)
- Priority selector: Normal / High / Urgent (with color indicators)
- Assign mechanic (avatar list, multiple select for multi-mechanic jobs)
- Intake source: Walk-in / Messenger / Phone / Website / Repeat Customer — radio/pill selector
- Estimated completion time (date/time picker, optional)
- Customer waiting: Yes / No / Leaving vehicle — toggle
- Consent checkboxes: "May send service reminders" and "May send promos" (separate, per DPA)

**Bottom:**
- "Create Work Order & Print" secondary button
- "Create Work Order & Send Tracking Link" primary button

**Style:** Card-based layout, clear section dividers, shadcn/ui Form components, Tailwind. Required fields marked with a subtle asterisk. Orange accent for primary actions.

---

## Prompt 3 — Mechanic Tablet Checklist App (Mobile/Tablet)

Design a **mobile-first PWA screen** for a mechanic working on a vehicle job in an auto shop. This is shown on an affordable Android tablet (10-inch screen). The mechanic may have grease on their hands.

**Screen: PMS Job In Progress**

**Top bar:**
- Back arrow
- Work order number (e.g., "WO-2024-0347")
- Vehicle info: "2018 Honda Civic · XYZ 5678"
- Mechanic name: "Carlo R."

**Job header card:**
- Service type badge: "PMS / Change Oil" (orange)
- Mileage: "87,450 km"
- Customer concern: "Regular change oil, check tires"
- Status badge: "In Progress"

**Photo progress bar:**
"Required photos: 3 of 4 done" — thick progress bar, orange fill, large text

**Checklist (scrollable):**
Each checklist item is a large touch target (minimum 64px height):
- Green checkmark circle + strikethrough text = Done
- Empty circle + bold text = Pending
- Orange warning icon = Needs Attention
- Grey diagonal slash = Not Applicable

Show a few done items and a few pending items mixed. Include:
- ✓ Odometer photo — Done — small thumbnail preview of the photo
- ✓ Engine bay before — Done
- ○ Oil draining — **[Required] Take Photo** button (large, orange camera icon)
- ○ New oil + filter — **[Required] Take Photo** button
- ○ Air filter check — Take Photo (optional — grey button)
- ○ Fluid levels — Take Photo (optional)
- △ Brake pad check — Needs attention (tapped open to show sub-note: "Front pads at 20%")

**Sticky bottom bar:**
- "Add Issue Found" button (left, outlined)
- "Mark Job Done" button (right, primary orange — disabled/greyed out because 1 required photo is missing, with tooltip "1 required photo remaining")

**Style:** Very large text and buttons. High contrast. Minimal chrome. Camera icon should be instantly obvious. Orange for required actions. Dark mode. No tiny UI elements — mechanics will tap this with dirty thumbs.

---

## Prompt 4 — Mechanic Photo Capture Screen (Mobile/Tablet)

Design a **camera capture screen** for the mechanic app. The mechanic has tapped "Take Photo" on a required checklist step.

**Full-screen layout:**

**Top overlay:**
- Back/cancel (X) — top left
- Step name in large white text on a dark overlay at the top: "Step 4 of 10 — Oil Draining"
- Required badge: "REQUIRED" in orange pill

**Camera viewfinder:** Full screen, live camera preview

**Guide overlay (faint):**
- Dashed rectangle guide in the center with label: "Position the oil drain pan in frame"

**Bottom control bar (dark gradient overlay):**
- Left: thumbnail of last photo taken (tappable to review)
- Center: large circular shutter button (white, 72px, with subtle shadow)
- Right: flip camera icon

**Below shutter area:**
- Small label: "Photo will be linked to this job automatically"
- Upload status for previous photo (if uploading): "Photo 3 uploading… 60%" with a subtle progress bar

**If upload fails:** Red banner slides up — "Upload failed · Tap to retry" with a retry button

**Style:** Black background with camera content. Minimal UI to maximize viewfinder space. Everything is large and finger-friendly. No text smaller than 16px.

---

## Prompt 5 — Customer Tracking Portal (Mobile)

Design a **mobile web customer-facing tracking page** for an auto shop. This is a private link the customer opens on their phone — no app install required. Light mode.

**Screen: Job In Progress — Waiting for Approval**

**Top:**
- Shop logo and name: "AutoLounge Service Hub"
- Tagline: "Your vehicle is in good hands."

**Job summary card:**
- Vehicle: "2019 Toyota Fortuner · ABC 1234"
- Service: "PMS / Change Oil"
- Work order: "WO-2024-0347"
- Status badge: "Waiting for Your Approval" (orange)

**Status timeline (vertical step indicator):**
Steps listed vertically with connecting line:
- ✓ Received — Jun 2, 8:30 AM
- ✓ For Inspection — Jun 2, 9:05 AM
- ✓ Inspection Complete — Jun 2, 9:47 AM
- ▶ **Waiting for Your Approval** — Action needed (pulsing orange dot)
- ○ In Progress
- ○ Final Checking
- ○ Ready for Release

**Issue Found — Action Required card (prominent, orange border):**
Title: "Front Brake Pads Need Replacement"
Description: "During inspection, our mechanic found that your front brake pads are worn down to about 20%. For your safety, we recommend replacing them now while the vehicle is already in our shop."
Photo thumbnail (brake pad close-up photo)
Recommended action: "Replace front brake pads and rotors"
Additional cost: **₱ 3,800**

**Action buttons:**
- "Approve (+₱3,800)" — large primary orange button
- "Decline for now" — outlined button
- "Ask a question" — text link

**Proof photos section:**
Title: "Service Photos"
2-column photo grid showing approved photos:
- "Before — Engine bay"
- "Odometer: 87,450 km"
- "Oil drain" (with timestamp watermark)
- "New filter installed"

**Style:** Clean, trustworthy, white/light grey background. Orange (#f97316) for action items. Rounded cards with subtle shadows. Nunito or Inter font. Very readable on a phone screen. Must feel like a professional service, not a system printout.

---

## Prompt 6 — Customer Tracking Portal — Payment Screen (Mobile)

Design a **mobile web payment screen** within the customer tracking portal. The job is complete and the customer is ready to pay.

**Top:**
- Status badge: "Ready for Release ✓" (green)
- Vehicle: "2019 Toyota Fortuner · ABC 1234"

**Final Bill card:**
White card, clean line items:
```
PMS / Change Oil          ₱ 1,200
  └ Castrol Magnatec 10W-40 × 4L  ₱   800
Brake Pad Replacement     ₱ 2,400
  └ Brembo Front Pads × 1 set     ₱ 1,400
                         ————————
Subtotal                  ₱ 5,800
Deposit applied          −₱   500
Regular customer (5%)    −₱   265
                         ————————
TOTAL DUE                 ₱ 5,035
```

**Payment instructions section:**
Title: "How would you like to pay?"

Payment option tabs: Cash · GCash · Bank Transfer

**GCash tab (active):**
- GCash QR code image (centered)
- GCash number: 09XX-XXX-XXXX
- Account name: AutoLounge Service Hub
- Amount to send: **₱ 5,035**

**Upload proof section:**
- "Done paying? Upload your proof of payment"
- Large dashed upload area: camera icon + "Take a screenshot photo" text
- Reference number input field: "Enter GCash reference number"
- "Submit Payment" primary button

**Small note at bottom:** "Our staff will verify your payment and contact you when your vehicle is ready for release."

**Style:** Light mode, clean financial layout. Green accent for the positive "ready" status. Orange for CTAs. Trust signals: shop name, clear amounts, human-language instructions. No jargon.

---

## Prompt 7 — Admin Photo Review Screen (Desktop)

Design a **photo review screen** for admin staff to approve mechanic photos before they are visible to the customer. Desktop, dark mode.

**Layout:** 2-column. Left = work order sidebar, Right = photo review area.

**Left sidebar:**
- Work order: "WO-2024-0347"
- Vehicle: "2018 Honda Civic · XYZ 5678"
- Mechanic: "Carlo R."
- Service: "Brake Service"
- Status: "Final Checking"
- Checklist progress: "10/10 items done"
- Photo count: "12 photos taken"

**Right area — Photo Review:**

**Top bar:**
- "Photo Review" heading
- "12 photos — 8 pending review"
- "Approve All" button (primary, orange) and "Send to Customer" button (green)

**Photo grid (3 columns):**
Each photo card:
- Large photo thumbnail
- Step label: "Step 3 — Brake pad removed"
- Timestamp: "Jun 2, 10:23 AM"
- Mechanic: "Carlo R."
- Visibility toggle: "Internal" (grey) ↔ "Customer Visible" (orange/green) — with clear toggle UI
- Individual Approve / Hide buttons

Show a mix of states:
- Some already approved (green "Visible to Customer" badge)
- Some pending (orange "Pending Review" badge)
- One with "Internal only" flag (red/grey "Hidden from Customer")

**Below the grid:**
"Gallery eligible photos" section — show 2 beauty shots with a "Promote to Works Gallery" button on each (requires separate customer consent)

**Style:** Dark mode. Photo-heavy layout, card-based. Orange toggles for visibility control. Clear visual distinction between internal and customer-visible states. Feels like a content moderation tool, not just a gallery.

---

## Prompt 8 — Public Queue Page (Mobile)

Design a **public-facing queue status page** for an auto shop that customers check before visiting. Mobile-first, light mode. This page requires no login.

**Header:**
- Shop logo and name: "AutoLounge Service Hub"
- Address + "Get Directions" link
- Operating hours: "Open · Mon–Sat 8:00 AM – 6:00 PM"

**Queue status card (hero, prominent):**

Large status indicator:
🔴 **BUSY**

Below:
"Several vehicles ahead"
"Est. wait: 1.5 – 2 hours"
"Best time to visit: after 3:00 PM"

Small text at bottom of card: "Updated 4 minutes ago"

**Service lanes:**
Two cards side by side:
- **Quick Services (PMS/Oil)** — "2 ahead · ~45 min"
- **Major Repairs** — "3 ahead · ~2–3 hrs"

**"Message Before Visiting" CTA section:**
Prominent button: "Message Us on Messenger" (Facebook Messenger blue)
Sub-text: "Ask about your specific service or reserve a slot for tomorrow"

**Recent updates / transparency strip:**
Small activity feed:
- "A vehicle was released 12 min ago"
- "2 vehicles currently being serviced"
- "Shop accepted 8 vehicles today"

**About the shop section:**
- Short description
- Service icons (PMS, Brakes, Diagnostics, Mods, etc.)
- "See all services" link
- Map thumbnail

**Footer:**
Phone number · Messenger link · Instagram link

**Style:** Clean, minimal, mobile-optimized. Large readable status. Green/orange/red for status bands. Feels like checking a restaurant wait time, not a corporate website. Trustworthy and real-time feeling (with the "updated N min ago" label).

---

## Prompt 9 — PMS Reminder Queue (Desktop / Admin)

Design a **PMS reminder management screen** for admin staff. Desktop, dark mode.

**Layout:** Table-based with action sidepanel.

**Page title:** "PMS Reminders Due"
**Filter tabs:** All Due · Overdue · Due This Week · Due This Month · Sent

**Table columns:**
- Customer name (linked)
- Vehicle (make/model/year · plate)
- Last PMS date
- Last mileage
- Due date (color-coded: red = overdue, orange = this week, grey = this month)
- Due mileage
- Status (Pending / Sent / Snoozed)
- Last contacted
- Actions

**Each row action:**
- "Copy Messenger Message" button (copy icon)
- "Copy SMS Message" button
- "Mark as Sent" dropdown
- "Snooze" (3 days / 1 week / 2 weeks)

**Right panel (when row selected):**
Shows the pre-written reminder message in both English and Taglish:

**English template:**
> "Hi [Customer Name]! This is AutoLounge. Your [Vehicle] is due for a PMS / change oil. Based on your last visit ([Date], [Mileage] km), we recommend coming in around [Due Date] or before [Due Mileage] km. Come visit us at [Address]. See you soon!"

**Taglish template:**
> "Hi [Customer Name]! Ito po si AutoLounge. Pwede na po mag-PMS ang inyong [Vehicle]. Noong [Date], [Mileage] km na ang nakalagay. Preperably po bago mag-[Due Mileage] km o bago mag-[Due Date]. Abangan na po kayo namin dito sa [Address]. Salamat!"

"Copy Message" buttons for both.

**Summary strip at top:**
- "47 reminders due this month"
- "12 overdue"
- "23 sent this month"

**Style:** Table-heavy but with clear hierarchy. Red/orange urgency indicators. Copy-to-clipboard is the primary action — it should feel extremely fast to scan the list and fire off reminders.

---

## Prompt 10 — Owner/Manager Reports Dashboard (Desktop)

Design a **reports and analytics dashboard** for the shop owner or manager. Desktop, dark mode.

**Layout:** Top KPI strip + chart area + recent activity.

**Page title:** "Reports — June 2024"
**Date range picker** in top-right.

**Top KPI strip (4 cards):**
1. **Total Jobs This Month** — 124 completed / 8 in progress — up 12% vs last month
2. **Revenue This Month** — ₱ 186,500 — bar indicator vs monthly target
3. **Pending Payments** — ₱ 14,200 — 3 jobs — orange warning
4. **PMS Reminders Sent** — 34 of 47 due — "13 still pending" in orange

**Charts section (2 columns):**

Left — **Jobs by Service Type** (donut chart):
- PMS / Change Oil: 41%
- Brake Service: 18%
- Diagnostics: 14%
- Mods/Upgrades: 12%
- Other: 15%

Right — **Weekly job volume** (bar chart, last 4 weeks):
- Bars colored by completion rate (green = released, orange = in progress, grey = cancelled)

**Bottom section — Recent reports table:**
- Work Orders (last 30 days) — CSV · PDF buttons
- Payment Summary — CSV button
- PMS Due Customers — CSV button
- Declined Recommendations — CSV button

**Right sidebar — Activity feed:**
- Most recent status changes across all active jobs
- Pending approval alerts (orange)
- Unpaid jobs (red)
- "3 jobs waiting for customer approval — view all" action link

**Style:** Data-rich but scannable. KPI cards with trend arrows. muted dark background with sharp white data labels. Green/orange/red semantic colors. Chart colors should be distinct but not harsh. Feels like a real ops dashboard, not a toy.
