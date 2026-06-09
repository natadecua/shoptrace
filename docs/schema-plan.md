# ShopTrace — MVP Schema Plan (for approval)

**Status:** 🟡 v2 DRAFT — pending owner approval. No migrations written yet.
**Grounded in:** PRD §11 (+§11.4 forward seams, §9.4 13-status list, §14.6 reliability, §27 RLS, §16.7 BIR) · `pre-schema-decisions.md` (LOCKED) · `feature-backlog.md` themes A–T · `roadmap.md` MVP line.
**v2 changes:** revised after a two-agent critique (MVP-integrity/RLS + feature-coverage/seams). See §9 changelog for what changed and why.
**Discipline:** Build the **MVP paper-killer spine** in full; add every **locked seam column** now (cheap); **don't** create deferred theme tables — but prove each has a clean seam (§11.4). RLS-first, Supabase/Postgres, `supabase-js` at runtime, Prisma migrations-only.

---

## 1. Conventions (every table unless noted)

- **PK** `id uuid default gen_random_uuid()`. **Tenant key** `tenant_id uuid not null references shop(id)` on every tenant-scoped table (`organization` + global lookup tables excepted).
- **Money** `*_centavos bigint` (decision C1) — never float. **Time** `timestamptz` UTC; day-bucketing uses `shop.timezone` (default `Asia/Manila`, G1).
- **Audit cols** `created_at default now()`, `updated_at`, `created_by uuid` where an actor exists.
- **Deletes** financial/audit rows **never hard-deleted**; all FKs into them are `ON DELETE RESTRICT`. PII erasure = **anonymize** (`anonymized_at`, PII→tombstone) via a `SECURITY DEFINER` function, distinct from `deleted_at` soft-delete (F1/H7).
- **Sensitive writes** (portal approve/pay, release-with-balance, photo-metadata, anonymize, audit) go through **`SECURITY DEFINER` RPCs** that re-validate and stamp `tenant_id` from server-trusted data, never client input.
- **Branch model:** a `shop` row = one branch = the `tenant_id`; `organization` groups branches via `org_id`. (Supersedes the decision-sheet "location_id" — the shop *is* the location.)
- **Evolving status sets** are **lookup tables** (FK), not PG enums, so product can evolve them without type surgery and attach metadata; true-invariant sets stay PG enums (§3).

---

## 2. Tables

### 2.1 Tenancy, org & auth
| Table | Key columns | Notes |
|---|---|---|
| `organization` | `id`, `name` | Groups shops. No `tenant_id`. |
| `shop` | `id`(=tenant_id), `org_id`, `name`, `slug`, `timezone` def `Asia/Manila`, `branding jsonb`, `round_total_to_peso bool def false` (C2), **`plan` def `basic`** | Tenant/branch; RLS root. `plan` gates Pro features (catalog auto-fill) — **new in v2 (#3)**. Default-subdomain resolution = `shop.slug` (no `domain` row needed for MVP). |
| `app_user` | `id`(=`auth.uid`), `org_id`, `email`, `display_name`, `disabled_at` | Profile mirror; created by an `auth.users`→`app_user` insert trigger (L1). **No single `tenant_id`** — membership is in `user_role`. |
| `user_role` | `user_id`, `tenant_id`, `role` (enum) | Many roles per user (D3). |
| `user_org_role` | `user_id`, `org_id`, `role` (org_owner/org_manager) | Cross-branch read grant. |
| `feature_toggle` | `tenant_id`, `key`, `enabled bool` | **New in v2 (#3).** §33.6 per-tenant toggles (proof recorder, portal, reminders…). The deferred `feature_state` engine *reads* this later. |

### 2.2 Identity (customer / vehicle)
| Table | Key columns | Notes |
|---|---|---|
| `customer` | `tenant_id`, `name`, `phone`, `email`, `consent_sms`, `consent_marketing`, `portal_pin_hash`, `portal_pin_set_at`, **`portal_pin_attempts int`, `portal_pin_locked_until`**, `preferences jsonb` (G8), `lounge_optout` (O), **`merged_into_id` self-FK (M2)**, `anonymized_at` | PIN customer-set+hashed (D2); throttle cols (#14); merge pointer (#2/M2). PII cols nullable for anonymize. |
| `vehicle` | `tenant_id`, `make`, `model`, `year`, `plate`, `vin`, `fleet_account_id` null (F2), **`merged_into_id` self-FK**, `anonymized_at` | Canonical `id`; plate is a mutable alias (P25/B2). |
| `plate_history` | `tenant_id`, `vehicle_id`, `plate`, `from_date`, `to_date` | Survives replating; `unique(vehicle_id) where to_date is null`; `CHECK(to_date is null or to_date>=from_date)` (M3). |
| `vehicle_ownership` | `tenant_id`, `customer_id`, `vehicle_id`, `from_date`, `to_date` null | Time-bound (D5/B5); same one-open-interval constraints (M3). |

### 2.3 Intake & work orders
| Table | Key columns | Notes |
|---|---|---|
| `inquiry` | `tenant_id`, `source` enum, `status` enum (new/accepted/declined/converted), contact+vehicle hint, `converted_work_order_id` null | Pre-WO intake. |
| `work_order` | `tenant_id`, `vehicle_id`, `customer_id` (**billed-party snapshot at check-in, immutable**, M1), `owned_by` (advisor, ADV-J1), **`status` FK→`work_order_status`** (H5/H6), `cancel_reason` (req when cancelled, CHECK — C7/H5), `parent_work_order_id` null (P3), `payer_type` def customer (B4/K), `progress_mode` def checklist (T), `current_stage_id` null (**stage seam #7**), `bay_id` null (B; *current bay only — history lives in deferred `bay_assignment`*, #1), `fleet_account_id` null, `claim_code` (O), `blocker_reason` null (L sublet/parts seam), `locked bool`, `requires_estimate_approval bool`, `checked_in_at`, `service_started_at` null (timer), `est_duration_min` null, `ready_at`, `released_at` | The spine. |
| `work_order_mechanic` | `tenant_id`, `work_order_id`, `user_id`, `contribution` null | **New in v2 (#9/#12).** Multi-mechanic is MVP (§12.10); the RLS "assigned-to-me" policy and all of M/commission/performance anchor here. |

### 2.4 Checklists & proof (the make-or-break surface)
| Table | Key columns | Notes |
|---|---|---|
| `checklist_template` | `tenant_id`, `service_type`, `name`, `applicability jsonb` (A1), `active` | Admin CRUD. |
| `checklist_template_item` | `tenant_id`, `template_id`, `label`, `required bool`, `photo_required bool`, `sort` | |
| `photo_template` | `tenant_id`, `service_type`, `label`, `required bool`, `sort` | |
| `job_checklist` | `tenant_id`, `work_order_id`, `template_id` | |
| `job_checklist_item` | `tenant_id`, `job_checklist_id`, `template_item_id`, `status` enum (pending/done/na/needs_attention/blocked), `skip_reason`, `assigned_user_id` null (#12), `completed_by`, `completed_at` | Skip reason required if a required item is skipped. |
| `proof_photo` | `tenant_id`, `work_order_id`, `job_checklist_item_id` null, `storage_path`, `captured_at` **server-set RPC**, `content_hash` **server-computed** (P28/M4), `kind` enum (proof/inspection/part_authenticity/old_part/customer_supplied) (**#11 — enforces §9.7 boundary**), `uploaded_by`, `visibility` enum (internal/customer) | Client cannot set `captured_at`/`content_hash` (REVOKE + RPC). |

### 2.5 Findings, estimates & approvals
| Table | Key columns | Notes |
|---|---|---|
| `issue` | `tenant_id`, `work_order_id`, `description`, `severity`, `status`, `value`/`unit`/`threshold`/`dtc_code` null (P), `old_part_returned bool` null, `created_by`, `reviewed_by` | Proof-first; admin review before customer. |
| `estimate` | `tenant_id`, `work_order_id`, `status` FK/enum (draft/sent/approved/partially_approved/declined/expired — C4), `sent_at`, `responded_at`, `expires_at` (C6 +7d), **`approved_total_centavos`** (set at approval, H4), `variance_reapproval_required bool` (trigger-set, H4), `total_centavos` | Declined→parks WO (P1). |
| `estimate_line` | `tenant_id`, `estimate_id`, `kind` enum, `description`, `unit_price_centavos`, `qty`, `line_total_centavos` (H1 CHECK), **`approval_status` enum (pending/approved/declined)** (per-line truth, H3), `catalog_item_id` null, `source` enum null (L), `cost_centavos` null (Q) | Per-line approval lives here, not a jsonb blob. |
| `approval` | `tenant_id`, `estimate_id` null, `issue_id` null, `approver_type` enum (K), `response` enum, `responded_at`, `ip`, `typed_name`, `pin_verified bool` | Header (who/when/how-verified); per-line state on `estimate_line` (H3). |

### 2.6 Billing, payment & release
| Table | Key columns | Notes |
|---|---|---|
| `bill` | `tenant_id`, `work_order_id`, `status`, `subtotal_centavos`, `discount_centavos`, `round_applied_centavos` (C2), `total_centavos` (CHECK = subtotal − discount + round, L3), `manual_or_ref` null (C9), `discount_approved_by` null (L5) | Statement of Account, **never an OR** (C9). |
| `bill_line` | `tenant_id`, `bill_id`, `kind`, `description`, `unit_price_centavos`, `qty`, `line_total_centavos` (CHECK, H1), `catalog_item_id` null (**canonical sold-part record for warranty/RMA/margin**, #5), `cost_centavos` null, `source_estimate_line_id` null (provenance only — *not* pricing FK, H1) | **Physically copied** at bill creation; margin (Q) derives from `bill_line.cost`. |
| `payment` | `tenant_id`, `bill_id` null (deposits precede bill, H2), `work_order_id`, `amount_centavos` (CHECK>0), `method` enum, `kind` enum (deposit/partial/final/prepaid) (**replaces `is_deposit`, #10**), `payer_type` def customer (#8), `reference_no`, `proof_photo_id` null, `verified_by`, `verified_at` | Balance = `sum(amount) where verified_at not null` (H2). Cross-FK tenant agreement enforced (L2). |
| `release` | `tenant_id`, `work_order_id`, `released_by`, `released_at`, `balance_at_release_centavos`, `authorized_by` null, `reason` null | Release-with-balance via `SECURITY DEFINER` fn: `SELECT…FOR UPDATE` bill, recompute balance, block-or-audit atomically (H2/C8). |

### 2.7 Catalog & parts
| Table | Key columns | Notes |
|---|---|---|
| `service_catalog_item` | `tenant_id`, `kind` (service/part), `name`, `category`, `default_price_centavos` null, `default_cost_centavos` null (Q), `active` | Price auto-fill gated by `shop.plan` (Pro). |
| `parts_autocomplete` | `tenant_id`, `name`, `last_used_at` | §11.3; `inventory_item` supersedes later (F1). |

### 2.8 Communication & notifications
| Table | Key columns | Notes |
|---|---|---|
| `thread` | `tenant_id`, `work_order_id` null, `inquiry_id` null (**pre-WO threads, #4**; one of the two required) | §14.4/§10.6 "Ask a question" before a WO exists. |
| `message` | `tenant_id`, `thread_id`, `direction`, `author_user_id` null, `channel` enum, `external_ref` null (**G1 inbound match, #4**), `body`, `created_at` | |
| `notification` | `tenant_id`, `work_order_id` null, `customer_id` null, `source_type` enum null + `source_id` null (**campaign/reminder attribution, #2**), `channel` enum, `template_key`, `payload jsonb`, `status` (queued/sent/delivered/failed), `attempts`, `last_error`, `idempotency_key`, `sent_at` | `unique(tenant_id, idempotency_key)` (M5); reliability layer §14.6 — visible retry, never silent loss. |
| `share_grant` | `tenant_id`, `work_order_id` null, `vehicle_id` null, `type` enum (portal/history/lounge/intake/**referral**) (#6), `token_hash` **globally unique** (L4), `claim_code` null, `expires_at`, `revoked_at` | One token infra (B6/D1/C4); 90d post-release (F2). |

### 2.9 Reminders, instrumentation, audit
| Table | Key columns | Notes |
|---|---|---|
| `reminder` | `tenant_id`, `customer_id`, `vehicle_id` null, `type` (pms/checkin/milestone/thankyou), `basis` (date/mileage), `due_at` null, `due_mileage` null, `status` | Extend for C/E/G. |
| `event_log` | `tenant_id`, `name` (taxonomy E2), `actor_id` null, `entity`, `entity_id`, `payload jsonb`, `occurred_at` | First-party product events (metrics E1). **Mutable** analytics. |
| `audit_event` | `tenant_id`, `actor_id`, `entity`, `entity_id`, `action`, `before jsonb`, `after jsonb`, `occurred_at` | **Append-only, hard-enforced** (B4): INSERT-only RLS + `BEFORE UPDATE/DELETE` block trigger + revoked UPDATE/DELETE grants; written by `SECURITY DEFINER` triggers on audited tables so the app can't skip logging. |

*(`domain` table deferred to the custom-domain add-on (P2); MVP resolves tenants via `shop.slug`. — over-build note resolved.)*

---

## 3. Types: enums vs lookup tables
**Lookup tables** (product-evolvable + metadata; tenants cannot extend — no `tenant_id`):
- `work_order_status(code pk, label, is_terminal, board_visible, sort)` — seeded from PRD §9.4 **13 states**: `new_inquiry, walk_in_queued, for_inspection, inspection_in_progress, awaiting_approval, approved, in_progress, awaiting_parts, final_checking, ready_for_release, payment_pending, released, cancelled` + §18 additions `no_show, abandoned`. (Comeback = `parent_work_order_id`, not a status.)

**PG enums** (true invariants): `user_role`, `progress_mode` (checklist/timer/stage), `payer_type` (customer/insurer/fleet/warranty), `job_item_status`, `photo_visibility`, `photo_kind`, `estimate_status`, `line_kind` (labor/part/supply/discount), `line_source` (byo/ordered/sublet), `approver_type`, `approval_response`, `payment_method`, `payment_kind`, `channel`, `notification_status`, `notification_source` (campaign/reminder/approval/manual), `share_type`, `reminder_type`, `reminder_basis`, `inquiry_status`, `inquiry_source`.

---

## 4. RLS & access (the security spine)
- **Staff (JWT):** every tenant table has `using (tenant_id = (auth.jwt()->>'tenant_id')::uuid)`. The `tenant_id` + active-shop's roles are written into the JWT by a **Supabase custom-access-token Auth hook** from `user_role`; an explicit **active-shop switch** re-mints the token (B2). Multi-shop/multi-role users are handled because role checks **gate against `user_role`, not a scalar claim**: e.g. mechanic-write policy = `EXISTS(select 1 from work_order_mechanic m where m.work_order_id = id and m.user_id = auth.uid())`.
- **Org cross-branch read (B3):** second permissive SELECT policy `using (tenant_id in (select id from shop where org_id = (auth.jwt()->>'org_id')::uuid) and EXISTS(user_org_role…))`. `org_id` denormalized onto hot tables (`work_order`, `bill`, `payment`) to avoid per-row subqueries.
- **Customer portal (no JWT, B1):** the token route sets a GUC (`set_config('request.share_wo', …, true)`) after validating `share_grant`; portal-readable tables get a policy `using (work_order_id = current_setting('request.share_wo')::uuid)` **plus** `proof_photo.visibility='customer'`. **No `service_role` in the portal path.** Money actions (approve/pay) call a `SECURITY DEFINER` RPC that re-validates token **+ PIN**, stamps `tenant_id` from the WO, and writes the audit row.
- **Storage:** photos under `/{tenant_id}/{work_order_id}/…`; access via short-lived signed URLs from a server route that already passed RLS/token.

---

## 5. Constraints, triggers & functions (integrity spine)
1. **Snapshot integrity (H1):** `bill_line`/`estimate_line` `CHECK(line_total_centavos = unit_price_centavos*qty)` (discount lines allowed negative); bill lines copied at creation, no pricing FK to catalog/estimate.
2. **Variance re-approval (H4/C5):** trigger on `bill` sets `estimate.variance_reapproval_required = (bill.total − approved_total > 50000 AND bill.total > approved_total*1.15)`; release blocked while required without a fresh approval.
3. **Balance/release (H2/C8):** `release_work_order()` `SECURITY DEFINER`: `SELECT…FOR UPDATE` bill, balance = sum(verified payments), block or write audited utang atomically.
4. **Audit immutability (B4):** INSERT-only RLS, block trigger on UPDATE/DELETE, revoked grants; audit rows written by `SECURITY DEFINER` triggers on WO transitions, money events, PII edits, photo skips, token issue/revoke, release-with-balance.
5. **Photo anti-spoof (M4):** `add_proof_photo()` RPC sets `captured_at=now()` + server-computed `content_hash`; `REVOKE INSERT` on those columns from app role.
6. **Temporal (M3):** `unique(vehicle_id) where to_date is null` on `plate_history` & `vehicle_ownership`; optional `btree_gist` exclusion to forbid overlaps; `CHECK(to_date>=from_date)`.
7. **Tenant agreement (L2):** trigger/`CHECK` that a row's two parent FKs (e.g. `payment.bill_id` & `work_order_id`) belong to the same `tenant_id`.
8. **Money (L3):** `bill` `CHECK(total = subtotal − discount + round_applied)`; `payment` `CHECK(amount_centavos>0)`; discount over threshold ⇒ `discount_approved_by` non-null (L5).
9. **Anonymize (F1/H7):** `anonymize_customer()` nulls PII → tombstone, writes audit, leaves operational/financial rows; all FKs into financial/audit `ON DELETE RESTRICT`.
10. **Expiry sweeper (M6):** `pg_cron` flips `sent` estimates past `expires_at` → `expired` + `event_log`. (Or derive on read — pick at build.)
11. **Cancel reason (C7/H5):** `CHECK(status_code <> 'cancelled' OR cancel_reason is not null)`.
12. **Identity sync (L1):** `auth.users` insert → `app_user` row.

---

## 6. Indexes & search
- `tenant_id` index on every tenant table (RLS perf); denormalized `org_id` index on `work_order`/`bill`/`payment`.
- Global search (§9.1): `pg_trgm` GIN on `vehicle.plate/vin`, `customer.name/phone`; FTS across work_order/customer/vehicle/inquiry.
- Hot paths: `work_order(tenant_id, status_code)`, `work_order(tenant_id, checked_in_at)`, `payment(bill_id)`, `vehicle_ownership(vehicle_id, to_date)`, `share_grant(token_hash)` unique, `notification(status, attempts) where status in ('queued','failed')`, `unique(tenant_id, idempotency_key)`.

## 7. Deferred tables (NOT created in MVP — seam confirmed §11.4)
`bay`/`bay_assignment`/`bay_layout`/`bay_group`, `inspection`, `reference_standard`, `expense`, `package`/`voucher`/`redemption`/`promo_code`, `customer_flag`/abuse, `supplier_warranty_claim`, `shop_archetype`/`workflow_stage`, `survey`, `campaign`/`campaign_recipient`, `warranty`, `emission_test`, `inventory_item`/`stock_movement`, `fleet_account`, `service_bundle`, loyalty_* / `referral`, `customer_note`, `feature_definition`/`feature_state`, `milestone`/`milestone_grant`, `plan`/`subscription`/`sms_credit`, `insurance_claim`, `parts_order`/`sublet_job`, `labor_entry`/`commission_rule`/`mechanic_skill`, `business_hours`/`capacity`/`slot`/`appointment`, `lounge_display_config`, `domain`. Each maps to a preserved seam in §2/§5.

## 8. Open items to confirm at build (small)
- Final reconciliation of `work_order_status` rows against §9.4/§10.3 if any drift (lookup table makes this safe to adjust).
- Whether estimate `expired` is swept (pg_cron) or derived-on-read.
- Whether to add the `btree_gist` exclusion (needs extension) or rely on the partial-unique for the one-open-interval guarantee.

## 9. Critique-resolution changelog (v1 → v2)
**Integrity/RLS (Agent A):** added concrete portal-token RLS via GUC + `SECURITY DEFINER` (B1); JWT Auth-hook + role-gating against `user_role` + active-shop switch (B2); org cross-branch read policy + denormalized `org_id` (B3); audit immutability enforcement (B4); snapshot `CHECK` + copy rule (H1); verified-payment balance + `FOR UPDATE` release fn (H2); per-line `estimate_line.approval_status` (H3); `approved_total_centavos` + variance trigger (H4); `work_order_status` **lookup table** + `cancel_reason` CHECK (H5/H6); anonymize vs soft-delete cols + `ON DELETE RESTRICT` + `anonymize_customer()` (H7); billed-party snapshot (M1); `merged_into_id` (M2); temporal constraints (M3); photo anti-spoof RPC (M4); idempotency unique (M5); expiry sweeper (M6); app_user sync, cross-FK tenant CHECK, bill-total CHECK, discount-approver, token global-unique (L1–L5).
**Seams (Agent B):** `shop.plan` + `feature_toggle` (MVP, #3); `proof_photo.kind` for §9.7 boundary (#11); `thread.inquiry_id` + `message.external_ref` (#4); `work_order_mechanic` table + `job_checklist_item.assigned_user_id` (#9/#12); `notification.source_type/source_id` (#2); `payment.kind` replacing `is_deposit` + `payment.payer_type` (#10/#8); `bill_line.catalog_item_id` canonical (#5); `share_type += referral` (#6); `work_order.current_stage_id` (#7); `work_order.blocker_reason` (L); reconciled `bay_id` = current-only vs deferred `bay_assignment` history (#1). `domain` table dropped from MVP (over-build); resolution via `shop.slug`.
