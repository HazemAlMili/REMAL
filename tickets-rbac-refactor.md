# SECURITY-REFACTOR — Dynamic RBAC (Role Templates + Per-User Overrides)

> **Execution brief for the implementing agent.** Every statement below was verified against the actual codebase (not the original ticket — see *Ticket corrections*). Follow it as written. A separate reviewer will audit the implementation against the **Acceptance criteria** and **QA script** at the end.

---

## 0. Ticket corrections — read first

The original Jira ticket was written from memory and is wrong in several places. **Trust this section, not the ticket:**

| Ticket says | Reality (verified) |
|---|---|
| ".NET 8 API" | **.NET 10** (preview SDK/runtime). |
| Refactor `RoleAuthorizationMiddleware.cs` | **No such file exists.** Authorization is ASP.NET **policy-based**, defined in `RentalPlatform.API/Authorization/PermissionCatalog.cs` and registered in `Program.cs` (`AddAuthorization`). Change those. |
| Token signing in `AuthService.cs` | Token signing is in **`RentalPlatform.API/Services/JwtTokenService.cs`**. `AuthService` only validates credentials and builds the `AuthenticatedSubject`. |
| EF Core migrations | **Raw SQL migrations** in `db/migrations/NNNN_*.sql` (+ `_rollback`/`_verify`), applied only on **fresh Postgres container init** via `docker-entrypoint-initdb.d` (orchestrated by `db/init.sql`). There is **no runtime migrator**. |
| Frontend has no permission concept | Frontend is **already permission-driven**: `AuthResponse.permissions[]` → `lib/stores/auth.store.ts` → `lib/hooks/usePermissions.ts` → `AdminNav.tsx` `requiredPermission` gating. **Extend this seam; don't rebuild it.** |
| Role is "a static string enum in `admin_users`" | True-ish: `admin_users.role VARCHAR(50)` with `CHECK (role IN ('super_admin','sales','finance','tech'))`, mapped to a C# enum `AdminRole` via `AdminRoleValueConverter`. |

**Confirmed product decisions (do not re-litigate):**
1. **Granular `module:action` permission model** (~20 keys). Re-point the ~110 admin-guarded endpoints to specific permission policies. (Coarse-bucket reuse was rejected because today `canViewCRM`/`canManageCRM` both map to one `SalesOrSuperAdmin` policy — read-only-CRM is impossible without splitting, and the QA script requires it.)
2. **DB execution scope = LOCAL DEV ONLY.** Author migration `0053` (up/rollback/verify) **and** apply it + the legacy backfill to the **local dev DB only** (additive, non-destructive DDL via `docker compose exec`). **Never** touch staging/production. Do not push to production.

---

## 1. What we're building

Replace the hardcoded role→policy mapping with **data-driven RBAC**:

- A fixed, **code-owned permission registry** (`module:action` keys).
- **Role templates** (DB rows): named bundles of permission keys. The 4 current roles are seeded as `is_system` templates; admins can create custom ones (e.g. `Marketing`) with zero code deploys.
- **Per-account overrides** (DB rows): explicit `grant`/`deny` of a key for one admin.
- **Effective permissions** = `(template keys ∪ user grants) \ user denies`, computed at login/refresh, embedded in the JWT as `perm` claims.
- **Enforcement**: each key is an ASP.NET policy requiring `subjectType=admin` + `RequireClaim("perm", key)`. Controllers reference the key constants.
- **Instant-ish revocation**: a role/override change bumps `admin_users.updated_at` for affected admins → their stale access token fails the `OnTokenValidated` stamp check → 401 → the axios interceptor silently refreshes → new token carries the new permissions. This reuses the **existing client security-stamp pattern**.

---

## 2. Permission registry (the keys)

Create `RentalPlatform.API/Authorization/PermissionKeys.cs` with `public const string` per key, plus a descriptor list (`key`, `module`, `label`, `description`) and an `All` collection that powers both `AddAuthorization` and the `GET /permissions` endpoint.

| Key | Guards (current policy it replaces) |
|---|---|
| `crm:read` | CRM GET endpoints |
| `crm:write` | CRM create/update/convert + notes write |
| `crm:assign` | Lead assignment/reassignment (`CrmAssignmentsController`) |
| `bookings:read` | Bookings GET |
| `bookings:write` | Bookings mutations + lifecycle |
| `finance:overview` | Finance summary/dashboard reads |
| `finance:manage` | Invoices + Payments |
| `finance:payouts` | Owner payouts |
| `units:read` | Units / date-blocks / seasonal-pricing reads |
| `units:manage` | Units / images / amenity-links / date-blocks / seasonal-pricing writes |
| `owners:read` | Owners reads |
| `owners:manage` | Owners create/update/deactivate |
| `clients:read` | Clients reads |
| `clients:write` | Clients create/update |
| `clients:reset_password` | Client password reset |
| `reviews:moderate` | Review moderation |
| `projects:manage` | Resort projects CRUD |
| `amenities:manage` | Amenities CRUD |
| `analytics:read` | Reporting/analytics |
| `settings:admin` | Admin-user list + RBAC management (this feature) |

**Keep `AdminAuthenticated`** as a base policy (requires only `subjectType=admin`, NOT a removable key) for notification inbox/preferences/dispatch endpoints — so **no role, including new custom ones, ever loses its own in-app notifications**. `OwnerOnly`/`ClientOnly` are unchanged.

---

## 3. Endpoint re-decoration map

Current admin policy usage (from `[Authorize(Policy=...)]` across `RentalPlatform.API/Controllers`) and its new key. Re-point **by controller + HTTP verb** (GET → read key; POST/PUT/PATCH/DELETE → write/manage key):

- **CrmLeadsController, CrmNotesController** — GET → `crm:read`; mutations → `crm:write`. **CrmAssignmentsController** (class-level) → `crm:assign`.
- **BookingsController** — GET → `bookings:read`; mutations → `bookings:write`. **BookingLifecycleController** (class-level) → `bookings:write`.
- **FinanceSummaryController** — all reads → `finance:overview`. **InvoicesController, PaymentsController** → `finance:manage`. **OwnerPayoutsController** → `finance:payouts`.
- **UnitsController** — `InternalUnitsRead` reads → `units:read`; `SuperAdminOnly` mutations → `units:manage`. **UnitImagesController, UnitAmenitiesController, SeasonalPricingController, DateBlocksController** (admin actions) → reads `units:read`, mutations `units:manage`. ⚠️ `DateBlocksController` has an `OwnerOnly` line — **leave it `OwnerOnly`**.
- **OwnersController** — `InternalAdminReadOwners` → `owners:read`; `SuperAdminOnly` → `owners:manage`.
- **ClientsController** — `InternalAdminRead` → `clients:read`; `SalesOrSuperAdmin` create/update → `clients:write`; `SuperAdminOnly` password reset → `clients:reset_password`.
- **ReviewModerationController** (class-level) → `reviews:moderate`.
- **ProjectsController** → `projects:manage`. **AmenitiesController** → `amenities:manage`.
- **ReportingBookingAnalyticsController, ReportingFinanceAnalyticsController** (class-level) → `analytics:read`.
- **AdminUsersController** — GET list + all mutations → `settings:admin`.
- **Notification\* controllers** — admin endpoints stay **`AdminAuthenticated`**; owner/client endpoints unchanged.

**Completeness check:** after the sweep, a grep for `Authorize(Policy = "SuperAdminOnly"|"SalesOrSuperAdmin"|"FinanceOrSuperAdmin"|"InternalAdminRead"|"InternalAdminReadOwners"|"InternalUnitsRead"|"InternalAnalyticsRead")` must return **zero matches in `Controllers/`**. Remaining policy literals allowed: `AdminAuthenticated`, `OwnerOnly`, `ClientOnly`, and `PermissionKeys.*` constants.

---

## 4. Legacy-role backfill (must preserve current access EXACTLY)

Seed 4 `is_system` templates with these key sets (derived from `usePermissions.ts` `LEGACY_ROLE_POLICIES` mapped through §3):

- **SuperAdmin** → **all keys**.
- **Sales** → `crm:read, crm:write, crm:assign, bookings:read, bookings:write, reviews:moderate, clients:read, clients:write, owners:read, units:read, analytics:read`.
- **Finance** → `finance:overview, finance:manage, finance:payouts, bookings:read, clients:read, owners:read, analytics:read`. *(No CRM — today all CRM endpoints are `SalesOrSuperAdmin`, which Finance lacks.)*
- **Tech** → `units:read, analytics:read`. *(Matches reality: Tech has only `InternalUnitsRead` + `InternalAnalyticsRead`; unit writes are `SuperAdminOnly`.)*

Backfill `admin_users.role_template_id` by matching each row's existing `role` to the seeded template of the same name. **Net effect: every existing admin keeps identical effective access** — this is the #1 regression to verify.

---

## 5. Phase 1 — Backend

### 5a. Migration — `db/migrations/0053_create_dynamic_rbac.sql` (+ `_rollback`, `_verify`)
Follow conventions in `0001_init_postgres_conventions.sql` & `0004_create_admin_users.sql`: UUID PKs `DEFAULT gen_random_uuid()`, snake_case, app-managed `created_at/updated_at`, named `pk_/fk_/uq_/ck_/ix_` constraints. UP script, in dependency order:

1. `rbac_role_templates` — `id` PK, `name VARCHAR(100) NOT NULL` (`uq_rbac_role_templates_name`), `description TEXT NULL`, `is_system BOOLEAN NOT NULL DEFAULT FALSE`, `is_active BOOLEAN NOT NULL DEFAULT TRUE`, `created_at`, `updated_at`.
2. `rbac_role_template_permissions` — `role_template_id UUID NOT NULL` (`fk_… ON DELETE CASCADE`), `permission_key VARCHAR(50) NOT NULL`, `created_at`; PK `(role_template_id, permission_key)`.
3. `rbac_admin_user_permission_overrides` — `admin_user_id UUID NOT NULL` (`fk_… ON DELETE CASCADE`), `permission_key VARCHAR(50) NOT NULL`, `modifier_type VARCHAR(10) NOT NULL CHECK (modifier_type IN ('grant','deny'))`, `created_at`, `updated_at`; PK `(admin_user_id, permission_key)`.
4. `ALTER TABLE admin_users ADD COLUMN role_template_id UUID NULL` + `fk_admin_users_role_template_id … ON DELETE RESTRICT` (RESTRICT = orphaned-role guard).
5. `INSERT` the 4 system templates (`is_system = TRUE`) + their permission rows (the §4 sets).
6. `UPDATE admin_users SET role_template_id = <template matched on role>`.
7. `ALTER TABLE admin_users ALTER COLUMN role_template_id SET NOT NULL`.
8. Relax legacy column so custom-role admins are valid: `ALTER TABLE admin_users DROP CONSTRAINT ck_admin_users_role; ALTER COLUMN role DROP NOT NULL`. (Keep the `role` column for display/back-compat; it is no longer authoritative.)

- **`_rollback`**: reverse everything (restore `role` NOT NULL + CHECK, drop the column + the 3 tables).
- **`_verify`**: assert the 3 tables exist, every `admin_users` row has a non-null `role_template_id`, and the 4 system templates carry the expected permission-key counts.
- **Register** in `db/init.sql` with an `\i …/0053_create_dynamic_rbac.sql` include line.
- **Apply to local dev** (do NOT recreate the volume — that wipes dev data): run `0053` then `0053_verify` against the running `kaza-db` container, e.g. `docker compose exec -T db psql -U <user> -d <db> -f /docker-entrypoint-initdb.d/migrations/0053_create_dynamic_rbac.sql` (mount path) or pipe the file via stdin. Additive DDL only.

### 5b. Data layer (`RentalPlatform.Data`)
Mirror the `UnitAmenity` join pattern exactly (`Configurations/UnitAmenityConfiguration.cs` + repo/UoW wiring):
- Entities: `RbacRoleTemplate` (with `ICollection<RbacRoleTemplatePermission> Permissions`), `RbacRoleTemplatePermission`, `RbacAdminUserPermissionOverride`. Add `Guid RoleTemplateId` (+ optional `RbacRoleTemplate?` nav) to `Entities/AdminUser.cs`.
- One `IEntityTypeConfiguration<>` per entity in `Configurations/` (composite keys via `HasKey(x => new {…}).HasName(...)`, `HasColumnName`, named FK constraints, cascade matching the SQL).
- Add `DbSet<>`s to `AppDbContext`; add `IRepository<>` properties to `IUnitOfWork` and initialize them in the `UnitOfWork` constructor (follow the existing `AdminUsers`/`Amenities` examples).

### 5c. Authorization core (`RentalPlatform.API/Authorization` + `Program.cs`)
- **`PermissionKeys.cs`** — const keys + descriptor list + `All`.
- **Rewrite `PermissionCatalog.cs`** — delete the static `Dictionary<policy, AdminRole[]>` and `PermissionsForRole(AdminRole)`. Add an effective-permission resolver (new `IPermissionResolver` service in Business, using `IUnitOfWork`): `Task<IReadOnlyCollection<string>> ResolveAsync(Guid adminUserId)` → loads template keys + overrides → returns `(template ∪ grants) \ denies`.
- **`Program.cs` `AddAuthorization`** — replace the `foreach (PermissionCatalog.AdminPolicies)` loop with: `foreach (var key in PermissionKeys.All) options.AddPolicy(key, p => p.RequireClaim("subjectType","admin").RequireClaim("perm", key));`. Keep `AdminAuthenticated` (subjectType=admin only), `OwnerOnly`, `ClientOnly`.

### 5d. Auth pipeline (claims + revocation)
- **`AuthenticatedSubject`** (`RentalPlatform.Business/Models`) — add `IReadOnlyCollection<string> AdminPermissions` and `DateTime? AdminUpdatedAt`.
- **`AuthService.ValidateAdminCredentialsAsync`** — after loading the admin, set `AdminPermissions = await _permissionResolver.ResolveAsync(admin.Id)` and `AdminUpdatedAt = admin.UpdatedAt`.
- **`JwtTokenService`** — in `GenerateAccessToken` & `GenerateRefreshToken`, add `new Claim("perm", key)` for each `subject.AdminPermissions`, plus an `adminUpdatedAtTicks` claim (mirror `AddClientSecurityStampClaim`). Keep the existing `ClaimTypes.Role` claim for back-compat.
- **`AuthController.GenerateAuthResponse`** (~line 196) — replace `PermissionCatalog.PermissionsForRole(role)` with `subject.AdminPermissions`. Add a `RoleName` field to `AuthResponse` (the template name) while keeping nullable `AdminRole`.
- **`AuthController.Refresh`** admin branch (~line 154) — after re-reading the admin: recompute permissions, set `AdminUpdatedAt`, and **add a stamp check** (reject if `admin.UpdatedAt.Ticks != tokenStamp`) mirroring the client branch (~line 133).
- **`Program.cs` `OnTokenValidated`** (~line 144) — add `else if (subjectType == "admin")`: load `admin_users.updated_at` (`AsNoTracking`, single column) and `context.Fail(...)` if it differs from the `adminUpdatedAtTicks` claim. (The admin twin of the existing client check.)

### 5e. RBAC management API — `SecurityController`
`[ApiController] [Route("api/internal/security")]`, every action `[Authorize(Policy = PermissionKeys.SettingsAdmin)]`. Standard `ApiResponse` envelope. Backed by a new `IRbacAdminService` (Business) using `IUnitOfWork` + `BeginTransactionAsync`.

- `GET /permissions` → registry descriptors grouped by module.
- `GET /roles` → templates + key sets + assigned-user counts. `POST /roles` (name + keys). `PUT /roles/{id}` (rename / replace key set). `DELETE /roles/{id}`.
- `GET /users/{id}/overrides` → `{ effective, inherited, grants[], denies[] }`. `PUT /users/{id}/overrides` → replace the override set.

**Edge-case guards** (reuse the `GetCallerId()` / `callerId == id` pattern already in `AdminUsersController` lines 68–72):
- *Self-demotion:* block editing your **own** overrides and reassigning your **own** template; reject any change that would strip `settings:admin` from your own effective set (anti-lockout). Return 400 with a clear message.
- *Orphaned roles:* `DELETE /roles/{id}` with assigned users → the `ON DELETE RESTRICT` FK throws → service catches it → return **409** "Reassign users before deleting this role." Also block deleting `is_system` templates.
- *Revocation:* after a successful role-permission change, `UPDATE admin_users SET updated_at = now() WHERE role_template_id = @id`; after an override change, bump that one admin. (Forces stale-token rejection on next request.)

**`AdminUsersController` + `AdminUserService`** — change create/change-role from `AdminRole Role` to `Guid RoleTemplateId`; validate the template exists and is active; set `role_template_id`. Add a FluentValidation validator for the create request (mirror `ClientRegisterRequestValidator`).

---

## 6. Phase 2 — Frontend (`rental-platform`)

Mirror existing patterns: `lib/api/services/admin-users.service.ts`, `lib/hooks/useAdminUsers.ts`, `lib/utils/query-keys.ts`, `lib/api/endpoints.ts`, and `react-hook-form + zod` forms. **Design system:** admin portal scope uses `--portal-radius-card/-control: 6px`, hairline `border-neutral-200`, **no heavy shadows**; terracotta `#E87651` / `primary-500` reserved for active toggles + primary buttons only. Reuse `components/ui/{Switch,Modal,Button,Badge,Input,Select}`.

1. **Types** — `lib/types/rbac.types.ts`: `PermissionDescriptor`, `RoleTemplate`, `UserOverrides` (`effective/inherited/grants/denies`), request DTOs. Add `roleName` to the `AuthResponse` type.
2. **Service / endpoints / query-keys** — `security.service.ts` against `/api/internal/security/*`; `endpoints.security.*`; `queryKeys.security.*`.
3. **Hooks** — `useRbac.ts`: `usePermissionRegistry`, `useRoleTemplates`, `useCreateRole/useUpdateRole/useDeleteRole`, `useUserOverrides/useUpdateUserOverrides`; mutations invalidate the relevant keys (same shape as `useAdminUsers`).
4. **Rewrite `usePermissions.ts`** — keep the **same `Permissions` interface** (so all `requiredPermission` nav gates + `canX` call-sites keep working) but map each `canX` to its granular key, e.g.:
   - `canViewCRM: has("crm:read")`, `canManageCRM: has("crm:write")`, `canAssignLeads: has("crm:assign")`
   - `canViewBookings: has("bookings:read")`, `canManageBookings: has("bookings:write")`
   - `canViewFinance: has("finance:overview")`, `canManageFinance: has("finance:manage")`
   - `canViewUnits: has("units:read")`, `canManageUnits: has("units:manage")`
   - `canViewOwners: has("owners:read")`, `canManageOwners: has("owners:manage")`
   - `canViewClients: has("clients:read")`, `canManageClients: has("clients:write")`, `canResetClientPasswords: has("clients:reset_password")`
   - `canModerateReviews: has("reviews:moderate")`, `canManageProjects: has("projects:manage")`, `canManageAmenities: has("amenities:manage")`
   - `canManageAdminUsers: has("settings:admin")`, `canViewReports: has("analytics:read")`
   
   Replace/trim the `LEGACY_ROLE_POLICIES` fallback (server now always issues granular keys; keep a minimal version only for pre-existing persisted sessions, or drop it). `AdminNav.tsx` gating is structurally unchanged.
5. **Settings dual-panel** — `app/(admin)/settings/page.tsx` + new `components/admin/settings/rbac/`. Add a `RoleAccessSection`: **Left** = role-template list (select / add / edit / delete; `is_system` badged + delete-disabled). **Right** = permission matrix of `Switch` toggles grouped by module for the selected template, with a Save. Keep `AdminUsersSection` + `NotificationPreferencesSection`.
6. **Per-user override matrix** — extend the `AdminUserTable`/`AdminUsersSection` row actions with a modal listing every key as a **tri-state** control: *inherited* (neutral), *granted* (terracotta on), *denied* (explicit off / red). Save via `useUpdateUserOverrides`. Clearly distinguish inherited vs. explicit override.
7. **Role selection** — `CreateAdminUserModal` + `ChangeRoleDialog`: replace the static 4-role `Select` with a dynamic list from `useRoleTemplates`. `RoleBadge` renders the template name (fallback to legacy `adminRole`).
8. **Silent enforcement** — no new code: the axios 401→refresh queue (`lib/api/axios.ts`) already re-issues tokens. After a permission change, a hard reload re-runs login/refresh and picks up the new `perm` claims. Just verify it works.

---

## 7. Critical files

**Backend** — `db/migrations/0053_create_dynamic_rbac.sql` (+rollback/verify), `db/init.sql`; `RentalPlatform.Data/{Entities,Configurations}/Rbac*`, `Entities/AdminUser.cs`, `AppDbContext.cs`, `IUnitOfWork.cs`, `UnitOfWork.cs`; `RentalPlatform.API/Authorization/{PermissionKeys.cs,PermissionCatalog.cs}`, `Program.cs`, `Services/JwtTokenService.cs`, `Controllers/AuthController.cs`, `Controllers/SecurityController.cs` (new), `Controllers/AdminUsersController.cs`, `Business/Models/AuthenticatedSubject.cs`, `Business/Services/{AuthService,AdminUserService,RbacAdminService,PermissionResolver}.cs`; **all admin controllers** for §3 re-decoration.

**Frontend** — `lib/types/rbac.types.ts`, `lib/api/services/security.service.ts`, `lib/api/endpoints.ts`, `lib/utils/query-keys.ts`, `lib/hooks/{useRbac.ts,usePermissions.ts}`, `app/(admin)/settings/page.tsx`, `components/admin/settings/rbac/*` (new), `components/admin/settings/{AdminUserTable,CreateAdminUserModal,ChangeRoleDialog}.tsx`.

---

## 8. Acceptance criteria

1. **Dynamic templates** — create/edit/delete custom role profiles (e.g. `Marketing`) from the UI, no code change.
2. **Account overrides** — a restricted user can be granted an extra capability or denied an inherited one via per-account overrides; the waterfall `(template ∪ grants) \ denies` holds.
3. **Real-time enforcement** — saving a change alters access on the target's next action/refresh, no unhandled errors.
4. **No mock data** — every toggle / card / row fetches live from the new endpoints; no hardcoded fallback arrays.
5. **Envelope conformity** — all new endpoints use the standard `ApiResponse` wrapper.
6. **Zero regression** — every existing admin retains identical effective access post-backfill (see §4).
7. **Completeness** — the §3 grep returns zero stale admin-policy literals in controllers.

---

## 9. QA / smoke script

**Build & apply:** `docker compose build api && docker compose up -d api`; apply `0053` + run `0053_verify` against `kaza-db`; frontend hot-reloads. `npm run type-check` (frontend) and the .NET build must pass.

**Backfill regression (most important):** log in as each seeded role (SuperAdmin/Sales/Finance/Tech) and confirm nav + one guarded call per module behaves exactly as before the change.

**Multi-persona lifecycle** (at `http://localhost:3001/admin/settings`):
1. Log in as SuperAdmin (clear cache/cookies first). Open the role builder.
2. Create role **Operations Alpha** with only `crm:read` + `units:read`. Save.
3. Create admin **Smoke Tester Base** on `Operations Alpha`.
4. Incognito: log in as Smoke Tester Base → can view CRM pipeline + units catalog; Finance + Settings are blocked (403 / hidden nav).
5. As SuperAdmin: grant **`finance:overview`** override to Smoke Tester Base. Save.
6. Incognito hard-reload (`Ctrl+F5`) → finance overview metrics now visible.
7. As SuperAdmin: deny **`crm:read`** override. Save.
8. Incognito reload → CRM pipeline now blocked. (Confirms the deny half of the waterfall.)

**Edge cases:** deleting `Operations Alpha` while a user is assigned → **409** (reassign-first); editing your own overrides / removing your own `settings:admin` → blocked; `is_system` roles can't be deleted.

**Visual audit:** matrix cards ~6–8px radius, hairline borders, no heavy shadows; terracotta only on active toggles / primary buttons; browser console clean (no unhandled network exceptions).

---

## 10. Guardrails (standing rules)

- **DB changes: local dev only.** No staging/prod DB writes. No schema changes beyond migration `0053`.
- **No production deploy.** The release gate stays closed until review sign-off.
- **No mock/seed data in any live DB.** Test profiles (`Operations Alpha`, `Smoke Tester Base`) are for the local dev DB only.
- Legacy `AdminRole` enum + `admin_users.role` column are **retained** (display/back-compat), not dropped in this pass.
- JWT permission "compression"/bitmask from the ticket is **intentionally skipped** — header size is a non-issue at ~20 short claims; one `perm` claim per key keeps `RequireClaim` enforcement simple.
