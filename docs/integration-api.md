# ShopTrace Partner API — Integration Contract

**Version:** 0.1 (draft)  
**Date:** 2026-06-02  
**Status:** Shared contract — single source of truth for the ShopTrace ↔ Garage integration  
**Referenced by:** `docs/prd.md` §34 (ShopTrace side) · `docs/consumer-app-prd.md` §9 (Garage side)

This document defines the API ShopTrace exposes so a consumer app (*Garage by ShopTrace*, or any authorized partner) can read a car owner's **verified, customer-visible** service history across the shops that serviced their vehicle. It is the seam that powers Garage's "auto-fill," with no shared database.

---

## 1. Principles

1. **Read-only for the consumer.** The partner reads shop-produced records; it never writes into a shop's data. (A future booking-request write path is noted in Section 11.)
2. **Owner-consented, per-vehicle.** Access is granted by the owner proving they own a specific vehicle (plate + shop-issued claim code). No claim, no data.
3. **Customer-visible + approved only.** The API returns exactly what the customer could already see in their tracking portal — never internal notes, payment proofs, staff identities beyond the shop, other customers' data, or unapproved photos.
4. **Cross-shop by canonical vehicle.** A vehicle's history is aggregated across every ShopTrace tenant that serviced it, resolved by canonical vehicle identity (plate + VIN), scoped to the owner's ownership period.
5. **Shop autonomy.** A shop can opt out of partner-API exposure (per-tenant setting); default on, because the data is the customer's own and it drives the network flywheel.
6. **KISS.** REST + JSON, OAuth2 client-credentials, cursor pagination, HMAC-signed webhooks. Nothing exotic.

---

## 2. Identity & Ownership Model (how the cross-tenant read stays safe)

- **Partner** — the calling backend (Garage). Holds OAuth2 `client_id` / `client_secret`. Server-to-server only; secrets never ship in the mobile app.
- **Owner** — the car owner (a Garage user). Not a ShopTrace tenant user.
- **Grant** — the consented link: *partner + canonical vehicle + owner identity + ownership period*. Created by a successful ownership claim; revocable by the owner. Every data request is made against a `grant_id`.
- **Canonical vehicle** — ShopTrace links per-tenant `Vehicle` rows that refer to the same physical car (by plate + VIN) into one canonical identity, so history aggregates across shops.

A request returns data only when: the partner token is valid **AND** the `grant_id` is active **AND** the record is `customer_visible` + `approved` **AND** the record falls within the grant's ownership period **AND** the owning shop has not opted out.

---

## 3. Authentication

Two layers, both required on data calls.

**3.1 Partner token (app level)** — OAuth2 client credentials:

```
POST https://api.shoptrace.app/oauth/token
Content-Type: application/json

{ "grant_type": "client_credentials",
  "client_id": "garage_prod_xxx",
  "client_secret": "•••" }

→ 200 { "access_token": "eyJ…", "token_type": "Bearer", "expires_in": 3600 }
```

Send on every request: `Authorization: Bearer <access_token>`.

**3.2 Grant scope (owner level)** — the `grant_id` returned by the claim (Section 4) is included in the path of every data request. The partner token authorizes the *app*; the grant authorizes *which vehicle's data* that app may read.

Optional hardening: mTLS for the partner connection; IP allowlist for the partner backend.

---

## 4. Ownership Claim Handshake (the link)

**Step 1 — Shop issues a claim code.** When a work order is created or released, ShopTrace generates a single-use **claim code** (OTP) bound to the vehicle, the tenant, and the customer's contact. It is surfaced to the customer on the **printed job order** and/or **with the tracking link** (this places G21 — claim-issuance — on a concrete shop surface).

**Step 2 — Owner claims in Garage.** The owner enters **plate + claim code** in Garage. Garage's backend calls:

```
POST /partner/v1/ownership-claims/verify
Authorization: Bearer <partner_token>

{ "plate": "ABC1234",
  "claim_code": "739204",
  "owner_contact": "+639170000000" }    // optional second factor

→ 201 Created
{ "grant_id": "grnt_a1b2c3",
  "status": "active",
  "vehicle": { "id": "veh_canon_123", "make": "Toyota", "model": "Fortuner", "year": 2019, "plate": "ABC1234" },
  "ownership_period": { "from": "2024-01-15", "to": null } }
```

Rules: claim codes are **single-use, expiring, and rate-limited** (same posture as the portal PIN, PRD §13.2). On too many bad attempts → `429`.

**Step 3 — Garage stores `grant_id`** and uses it for all reads. Owner can revoke anytime (Section 7).

---

## 5. Endpoints

Base: `https://api.shoptrace.app/partner/v1`

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ownership-claims/verify` | Verify a claim, create a grant (Section 4) |
| `GET` | `/grants/{grant_id}` | Grant status + vehicle summary |
| `DELETE` | `/grants/{grant_id}` | Owner revokes the grant (Section 7) |
| `GET` | `/grants/{grant_id}/vehicle` | Canonical vehicle profile |
| `GET` | `/grants/{grant_id}/service-records` | List service records (cross-shop, paginated) |
| `GET` | `/grants/{grant_id}/service-records/{record_id}` | Full service record incl. approved photos |
| `GET` | `/grants/{grant_id}/reminders` | Next-due reminders the servicing shop(s) set |
| `POST` | `/webhooks` | Register/manage the partner webhook (Section 8) |

### 5.1 List service records

```
GET /partner/v1/grants/grnt_a1b2c3/service-records?since=2024-01-01&cursor=&limit=20
Authorization: Bearer <partner_token>

→ 200
{ "data": [
    { "id": "rec_001",
      "service_date": "2024-05-12",
      "shop": { "name": "AutoLounge", "city": "Quezon City" },
      "service_types": ["PMS / Change Oil"],
      "mileage_km": 87450,
      "total_amount": { "currency": "PHP", "amount": 1200.00 },
      "photo_count": 6,
      "has_more_detail": true }
  ],
  "page": { "next_cursor": "eyJvZmZzZXQiOjIwfQ", "has_next": true } }
```

### 5.2 Service record detail

```
GET /partner/v1/grants/grnt_a1b2c3/service-records/rec_001

→ 200
{ "id": "rec_001",
  "service_date": "2024-05-12",
  "shop": { "name": "AutoLounge", "city": "Quezon City" },
  "service_types": ["PMS / Change Oil"],
  "mileage_km": 87450,
  "line_items": [
    { "type": "labor", "name": "PMS labor", "qty": 1, "amount": 400.00 },
    { "type": "part", "name": "Engine oil", "brand": "Castrol Magnatec 10W-40", "qty": 4, "amount": 800.00 }
  ],
  "total_amount": { "currency": "PHP", "amount": 1200.00 },
  "photos": [
    { "label": "Odometer", "url": "https://media.shoptrace.app/signed/…", "expires_at": "2026-06-02T12:30:00Z" },
    { "label": "New oil + filter", "url": "https://media.shoptrace.app/signed/…", "expires_at": "2026-06-02T12:30:00Z" }
  ],
  "next_service": { "due_date": "2024-11-12", "due_mileage_km": 92450 } }
```

Photos are **short-lived signed URLs** (R2). Never returns internal-only photos, mechanic internal notes, payment proofs, or staff names.

### 5.3 Reminders

```
GET /partner/v1/grants/grnt_a1b2c3/reminders
→ 200
{ "data": [
    { "type": "pms", "due_date": "2024-11-12", "due_mileage_km": 92450, "source_shop": "AutoLounge" }
  ] }
```

---

## 6. Data Exposure Rules (what is never returned)

Hard exclusions, enforced server-side regardless of request:

- Internal mechanic notes; any field not flagged `customer_visible`
- Unapproved photos; internal-only / diagnostic-only media
- Payment proof images; reference numbers; verifier identity
- Individual staff/mechanic personal identities (shop name only)
- Any other customer's or vehicle's data
- Records outside the grant's ownership period
- Records from a tenant that has opted out of partner-API sharing

---

## 7. Revocation & Consent

- **Owner-initiated:** `DELETE /grants/{grant_id}` immediately revokes; subsequent calls return `403 grant_revoked`.
- **Shop-initiated:** a tenant opting out of sharing removes that shop's records from future responses.
- **Ownership transfer (PRD §18.6):** when ownership ends, the grant's `ownership_period.to` is set; records after that date stop appearing for the prior owner.
- The grant **is** the consent record (DPA alignment). ShopTrace logs claim verification, access, and revocation in its audit log (PRD §23.1 — add a "partner API access" event type).

---

## 8. Webhooks (real-time auto-fill)

So Garage can push "your service record is ready" the moment a job is released — instead of polling.

- Partner registers a webhook URL (`POST /webhooks`).
- ShopTrace POSTs events, **HMAC-signed** (`X-ShopTrace-Signature`, HMAC-SHA256 over the body with the partner's signing secret). Partner must verify the signature.
- Delivery is **at-least-once** with retry + exponential backoff; events carry an `id` for idempotency.

Events:

| Event | When |
|-------|------|
| `service_record.created` | A released job produced a new customer-visible record for a granted vehicle |
| `service_record.updated` | Photo visibility or details changed |
| `grant.revoked` | A grant was revoked (either side) |

```
POST <partner_webhook_url>
X-ShopTrace-Signature: sha256=…

{ "id": "evt_88", "type": "service_record.created",
  "grant_id": "grnt_a1b2c3", "record_id": "rec_014",
  "occurred_at": "2026-06-02T10:05:00Z" }
```

The partner then fetches the full record via Section 5.2 (the webhook carries IDs, not data).

---

## 9. Conventions

- **Versioning:** path-versioned (`/v1`). Additive changes only within a version; breaking changes → `/v2` with a deprecation window.
- **Pagination:** cursor-based (`cursor` + `limit`, default 20, max 100).
- **Errors:** JSON `{ "error": { "code": "...", "message": "..." } }` with standard status codes — `400` validation, `401` bad/expired partner token, `403` grant invalid/revoked/opted-out, `404` not found, `429` rate-limited.
- **Rate limits:** per-partner and per-grant; claim-verify is tightly limited (brute-force protection).
- **Idempotency:** `POST` accepts an `Idempotency-Key` header.
- **Time:** ISO-8601 UTC. **Money:** explicit `{ currency, amount }`.

---

## 10. Security Summary

- HTTPS only; OAuth2 client credentials; optional mTLS + IP allowlist.
- Two-layer authz (partner token + grant) on every data call.
- Server-enforced customer-visible/approved filter (Section 6) — not the partner's responsibility.
- Short-lived signed media URLs.
- HMAC-signed webhooks.
- Full audit logging on the ShopTrace side; per-tenant opt-out; owner revocation.

---

## 11. ShopTrace-Side Build Gates (for this API to exist)

1. **Canonical vehicle linking** across tenants (plate + VIN resolution).
2. **Claim-code issuance** surfaced on the job order / tracking link (closes G21).
3. **`customer_visible` + `approved` flags** reliably set on records and photos (already in the data model, PRD §11/§13).
4. **Partner-API opt-out** tenant setting (PRD §33.6 toggle).
5. **Audit event** for partner access (PRD §23.1).

Until these ship, there is no auto-fill — which is exactly why the Garage app is parked (PRD §34, consumer-app §11.4).

---

## 12. Future (not in the first contract)

- **Booking-request write path** — let Garage request an appointment at a ShopTrace shop (the one sanctioned write direction).
- **Recall / TSB feeds**, multi-partner access (insurers, fleet managers) under the same grant model.
- **Bulk/fleet grants** for a single owner with many vehicles.
