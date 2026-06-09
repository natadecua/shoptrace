# ShopTrace — MVP Schema Plan (for approval)

**Status:** 🟡 DRAFT — pending owner approval. No migrations written yet.
**Grounded in:** PRD §11 (data model) + §11.4 (forward seams) · `pre-schema-decisions.md` (LOCKED) · `feature-backlog.md` themes A–T · `roadmap.md` MVP line.
**Discipline:** Build the **MVP paper-killer spine** in full; add every **locked seam column** now (cheap); **do not** create deferred theme tables — but prove each has a clean seam so it's additive later (§11.4). RLS-first, Supabase/Postgres, no ORM at runtime (`supabase-js`), Prisma migrations-only.

---

## 1. Conventions (apply to every table unless noted)

- **PK:** `id uuid default gen_random_uuid()`.
- **Tenant key:** `tenant_id uuid not null references shop(id)` on **every** tenant-scoped table. `organization` and truly-global tables are the only exceptions.
- **RLS:** every tenant table gets `using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)`; finer role policies layered on (e.g. mechanic can only `update` WOs assigned to them). Customer-portal reads bypass JWT and go through a token-validating server route.
- **Money:** all amounts are `*_centavos bigint` (integer centavos — decision C1). Never float.
- **Time:** `timestamptz` stored UTC; day-bucketing uses `shop.timezone` (default `Asia/Manila` — G1).
- **Audit columns:** `created_at timestamptz default now()`, `updated_at`, and `created_by uuid` (FK `app_user`) where an actor exists.
- **Deletes:** financial/audit rows are **never hard-deleted**; PII erasure = anonymize (`anonymized_at`) keeping the record (F1).
- **Naming:** `snake_case` tables/columns; enums as Postgres `enum` types (listed §3).
- **Branch model (reconciled w/ PRD):** a **`shop` row = one branch = the `tenant_id`**; `organization` groups branches via `org_id`. (This supersedes the "location_id" idea in the decision sheet — the shop *is* the location; one less table.)

---

## 2. Table groups

### 2.1 Tenancy, org & auth
| Table | Key columns | Notes |
|---|---|---|
| `organization` | `id`, `name` | Groups shops. No `tenant_id`. |
| `shop` | `id` (=tenant_id), `org_id`, `name`, `slug`, `timezone` default `Asia/Manila`, `branding jsonb`, `round_total_to_peso bool default false` (C2) | The tenant/branch. RLS root. |
| `app_user` | `id` (=Supabase `auth.uid`), `org_id`, primary `tenant_id`, `email`, `display_name`, `disabled_at` | Profile mirror of `auth.users`. |
| `user_role` | `user_id`, `tenant_id`, `role` (enum) | **Many roles per user** (D3 — role = permission set, not a seat). Org roles in `user_org_role`. |

### 2.2 Identity (customer / vehicle)
| Table | Key columns | Notes |
|---|---|---|
| `customer` | `tenant_id`, `name`, `phone`, `email`, `consent_sms bool`, `consent_marketing bool`, `portal_pin_hash`, `portal_pin_set_at`, `preferences jsonb` (G8 seam), `lounge_optout bool` (O seam), `anonymized_at` | PIN is customer-set + hashed (D2). |
| `vehicle` | `tenant_id`, `make`, `model`, `year`, `plate`, `vin`, `fleet_account_id` null (F2 seam) | Canonical `id`; plate is a mutable alias (P25/B2). |
| `plate_history` | `tenant_id`, `vehicle_id`, `plate`, `from_date`, `to_date` | Survives replating; search finds old plates. |
| `vehicle_ownership` | `tenant_id`, `customer_id`, `vehicle_id`, `from_date`, `to_date` null | Time-bound (D5/B5). History survives a sale. |

### 2.3 Intake & work orders
| Table | Key columns | Notes |
|---|---|---|
| `inquiry` | `tenant_id`, `source` (enum), `status` (enum: new/accepted/declined/converted), contact + vehicle hint, `converted_work_order_id` null | Pre-WO intake (§10.6). |
| `work_order` | `tenant_id`, `vehicle_id`, `customer_id`, `owned_by` (advisor, ADV-J1), `status` (enum §10.3), `parent_work_order_id` null (P3), `payer_type` enum default `customer` (B4/K), `progress_mode` enum default `checklist` (T), `bay_id` null (B seam), `fleet_account_id` null, `claim_code` (O seam), `locked bool`, `requires_estimate_approval bool`, `checked_in_at`, `service_started_at` null (timer seam), `est_duration_min` null, `ready_at`, `released_at` | The spine. |

### 2.4 Checklists & proof photos (the make-or-break surface)
| Table | Key columns | Notes |
|---|---|---|
| `checklist_template` | `tenant_id`, `service_type`, `name`, `applicability jsonb` (A1 seam: fuel/drivetrain/make), `active` | Admin CRUD required. |
| `checklist_template_item` | `tenant_id`, `template_id`, `label`, `required bool`, `photo_required bool`, `sort` | |
| `photo_template` | `tenant_id`, `service_type`, `label`, `required bool`, `sort` | Standalone required photos. |
| `job_checklist` | `tenant_id`, `work_order_id`, `template_id` | Instance on a WO. |
| `job_checklist_item` | `tenant_id`, `job_checklist_id`, `template_item_id`, `status` (enum: pending/done/na/needs_attention/blocked), `skip_reason`, `completed_by`, `completed_at` | Skip reason required if a required item is skipped. |
| `proof_photo` | `tenant_id`, `work_order_id`, `job_checklist_item_id` null, `storage_path`, `captured_at` **server-set** (P28), `content_hash` (P28), `uploaded_by`, `visibility` (enum internal/customer) | Tamper-evidence day one. |

### 2.5 Findings, estimates & approvals
| Table | Key columns | Notes |
|---|---|---|
| `issue` | `tenant_id`, `work_order_id`, `description`, `severity`, `status` (draft/under_review/published), `value`/`unit`/`threshold`/`dtc_code` null (Theme P seams), `old_part_returned bool` null, `created_by`, `reviewed_by` | Proof-first; admin review before customer sees. |
| `estimate` | `tenant_id`, `work_order_id`, `status` (enum: draft/sent/approved/partially_approved/declined/expired — C4), `sent_at`, `responded_at`, `expires_at` (C6: +7d), `variance_reapproval_required bool` (C5), `total_centavos` | Declined → parks WO (P1). |
| `estimate_line` | `tenant_id`, `estimate_id`, `kind` (labor/part/supply/discount), `description`, `unit_price_centavos`, `qty`, `line_total_centavos` (snapshot P23), `source` enum null (byo/ordered/sublet — L seam), `cost_centavos` null (Q seam) | |
| `approval` | `tenant_id`, `estimate_id` null, `issue_id` null, `approver_type` (enum customer/insurer/fleet/warranty — K), `response` (approved/declined/partial), `responded_at`, `ip`, `typed_name`, `per_line jsonb` | Records the customer/payer decision. |

### 2.6 Billing, payment & release
| Table | Key columns | Notes |
|---|---|---|
| `bill` | `tenant_id`, `work_order_id`, `status`, `subtotal_centavos`, `discount_centavos`, `round_applied_centavos` (C2), `total_centavos`, `manual_or_ref` null (BIR C9), `approved_by` null (above-threshold discount) | A **Statement of Account**, never an OR. |
| `bill_line` | `tenant_id`, `bill_id`, `kind`, `description`, `unit_price_centavos`, `qty`, `line_total_centavos` (snapshot), `cost_centavos` null | Snapshotted at bill time. |
| `payment` | `tenant_id`, `bill_id`, `work_order_id`, `amount_centavos`, `method` (enum), `reference_no`, `proof_photo_id` null, `verified_by`, `verified_at`, `is_deposit bool` (Deposit) | Many payments → balance (C8). |
| `release` | `tenant_id`, `work_order_id`, `released_by`, `released_at`, `balance_at_release_centavos`, `authorized_by` null, `reason` null | Release-with-balance (utang) is audited (C8). |

### 2.7 Catalog & parts (structured-lite)
| Table | Key columns | Notes |
|---|---|---|
| `service_catalog_item` | `tenant_id`, `kind` (service/part), `name`, `category`, `default_price_centavos` null, `default_cost_centavos` null (Q seam), `active` | Price auto-fill = Pro (A/C1); table exists for all. |
| `parts_autocomplete` | `tenant_id`, `name`, `last_used_at` | §11.3 growing list; upgrades to `inventory_item` later (F1). |

### 2.8 Communication & notifications
| Table | Key columns | Notes |
|---|---|---|
| `thread` | `tenant_id`, `work_order_id` | One per WO (§14.4). |
| `message` | `tenant_id`, `thread_id`, `direction` (in/out), `author_user_id` null, `channel` (enum), `body`, `created_at` | |
| `notification` | `tenant_id`, `work_order_id` null, `customer_id` null, `channel` (enum), `template_key`, `payload jsonb`, `status` (queued/sent/failed/delivered), `attempts`, `last_error`, `idempotency_key`, `sent_at` | Reliability layer (§14.6, SYS-J3): visible retry, never silent loss. |
| `share_grant` | `tenant_id`, `work_order_id` null, `vehicle_id` null, `type` (portal/history/lounge/intake), `token_hash`, `claim_code` null, `expires_at`, `revoked_at` | **One** token infra (B6/D1/C4); 90d post-release (F2). |

### 2.9 Reminders, domains, instrumentation, audit
| Table | Key columns | Notes |
|---|---|---|
| `reminder` | `tenant_id`, `customer_id`, `vehicle_id` null, `type` (pms/checkin/milestone/thankyou), `basis` (date/mileage), `due_at` null, `due_mileage` null, `status` | Exists in MVP; extend for C/E/G. |
| `domain` | `tenant_id`, `hostname`, `surface` (portal/public), `verified`, `cert_status` | Host-aware tenant resolution. |
| `event_log` | `tenant_id`, `name` (taxonomy E2), `actor_id` null, `entity`, `entity_id`, `payload jsonb`, `occurred_at` | First-party product events (metrics E1). |
| `audit_event` | `tenant_id`, `actor_id`, `entity`, `entity_id`, `action`, `before jsonb`, `after jsonb`, `occurred_at` | **Append-only/immutable** (E3). Distinct from `event_log`. |

---

## 3. Enums (Postgres types)
- `user_role`: owner · manager · advisor · mechanic · cashier (org: org_owner · org_manager)
- `work_order_status`: (align to PRD §10.3 — 13 statuses) received · scheduled · checked_in · in_progress · awaiting_approval · awaiting_parts · final_check · ready · released · parked · cancelled · comeback · no_show
- `inquiry_status`: new · accepted · declined · converted
- `progress_mode`: checklist · timer · stage (T)
- `payer_type`: customer · insurer · fleet · warranty (K)
- `job_item_status`: pending · done · na · needs_attention · blocked
- `photo_visibility`: internal · customer
- `estimate_status`: draft · sent · approved · partially_approved · declined · expired (C4)
- `line_kind`: labor · part · supply · discount
- `line_source`: byo · ordered · sublet (L seam)
- `approver_type`: customer · insurer · fleet · warranty
- `approval_response`: approved · declined · partial
- `payment_method`: cash · gcash · maya · bank_transfer · card · other
- `channel`: sms · messenger · portal · phone · in_person
- `notification_status`: queued · sent · delivered · failed
- `share_type`: portal · history · lounge · intake
- `reminder_type` / `reminder_basis` as above.

---

## 4. Indexes & search
- `tenant_id` index on every tenant table (RLS performance).
- **Global search** (§9.1): `pg_trgm` GIN on `vehicle.plate`, `vehicle.vin`, `customer.name`, `customer.phone`; FTS index spanning work_order/customer/vehicle/inquiry.
- FKs all indexed; `work_order(tenant_id, status)`, `work_order(tenant_id, checked_in_at)` for the queue/board; `payment(bill_id)`, `vehicle_ownership(vehicle_id, to_date)`.
- `notification(status, attempts)` for the retry worker; `share_grant(token_hash)` unique.

---

## 5. Locked seam columns added now (cheap; from §11.4 + decisions)
`work_order`: `parent_work_order_id`, `payer_type`, `progress_mode`, `bay_id`, `fleet_account_id`, `claim_code`, `service_started_at`, `est_duration_min` ·
`vehicle`: `fleet_account_id` · `customer`: `preferences jsonb`, `lounge_optout`, `portal_pin_hash` ·
`estimate_line`/`bill_line`: `source`, `cost_centavos` · `issue`: `value`/`unit`/`threshold`/`dtc_code`/`old_part_returned` ·
`checklist_template`: `applicability jsonb` · `approval`: `approver_type`.
**All nullable / defaulted — no behavior in MVP, but no rewrite later.**

## 6. Deferred tables (NOT created in MVP — seam confirmed per §11.4)
`bay`/`bay_layout`/`bay_group`, `inspection`, `reference_standard`, `expense`, `package`/`voucher`/`redemption`/`promo_code`, `customer_flag`/abuse tables, `supplier_warranty_claim`, `shop_archetype`/`workflow_stage`, `survey`, `campaign`/`campaign_recipient`, `warranty`, `emission_test`, `inventory_item`/`stock_movement`, `fleet_account`, `service_bundle`, `loyalty_tier`/`loyalty_reward`/`loyalty_grant`/`referral`, `customer_note`, `feature_definition`/`feature_state`, `milestone`/`milestone_grant`, `plan`/`subscription`/`sms_credit`, `insurance_claim`, `parts_order`/`sublet_job`, `labor_entry`/`commission_rule`/`mechanic_skill`, `business_hours`/`capacity`/`slot`/`appointment`, `lounge_display_config`. Each maps to a preserved seam above.

## 7. Open risks / to validate in critique
- Exact `work_order_status` enum vs PRD §10.3 (13) and §9.4 queue statuses (11) — must reconcile, not invent.
- Discount modeled as a `line_kind` vs a `discount` table (above-threshold approver) — pick one.
- `bill` vs `estimate` line duplication — confirm snapshot-copy on bill creation (not shared rows).
- `feature_state` is deferred, but MVP still needs *some* plan/flag gating (catalog auto-fill = Pro). Minimal `shop.plan` column now?
- Where does `org_id` live on child tables — only on `shop`, or denormalized for cross-branch reads?
