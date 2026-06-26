go # REVIEW-FINDINGS Resolution Report

## Scope and Constraints

- Reviewed and addressed findings F1-F20 from `REVIEW-FINDINGS.md`.
- No migration, DDL, seed, SQL console, or database mutation command was run.
- The existing database container was stopped during verification and was not started.
- Database-independent browser and HTTP checks used the rebuilt API on port 5001 and the frontend on port 3001.

## Resolution Matrix

| Finding | Resolution | Verification |
|---|---|---|
| F1 | CRM conversion now acquires unit and lead advisory locks, creates the booking and moves the lead to terminal `Completed` in one transaction. Client booking endpoints exclude all terminal leads. | Source verified; database-backed conversion/retry test blocked by DB constraint. |
| F2 | Quick booking now uses `CreateQuickAsync`, a per-unit transaction advisory lock, and a 30-second exact duplicate guard. Confirmation uses the same unit lock and reloads state after lock acquisition. | Build and route registration pass; concurrent persistence test blocked. |
| F3 | Auto-complete uses a cross-replica try-lock, Cairo-local cutoff, tracked-property updates, and PostgreSQL `xmin` optimistic concurrency. Notifications run only for rows transitioned by that sweep. | Build and container publish pass; multi-replica persistence test blocked. |
| F4 | Client tokens contain the client's `UpdatedAt` stamp. Access-token validation and refresh both reject stale stamps. Password reset writes a structured security audit log containing actor and target IDs. | Source/build pass; reset-to-stale-token test blocked. |
| F5 | Backend and frontend use `^\+?[1-9]\d{9,14}$`. Client lookup, uniqueness, login, and search ignore an optional leading `+`. | Invalid format returns HTTP 400; browser accepts `+201111111111`; persistence test blocked. |
| F6 | Removed the fabricated 20% gross-profit card because no authoritative profit model exists. | Static search confirms no `* 0.2` calculation; frontend build passes. |
| F7 | Generated invoice numbers are serialized with transaction advisory locks. Booking/reissue operations are separately locked and unique violations map to HTTP conflict behavior rather than an unhandled DB exception. | Source/build pass; parallel creation test blocked. |
| F8 | Completion cutoff is based on the Cairo calendar day with Linux and Windows timezone identifiers. History text now describes the actual scheduled-sweep behavior. | Source/build pass. |
| F9 | Admin client creation returns a one-time temporary password. CRM conversion UI displays it with a secure copy action. | Type-check and production build pass; client creation blocked. |
| F10 | Password reset policy is `SuperAdminOnly`; frontend hides reset controls from Sales. | Signed Sales token receives HTTP 403 before controller/database access. |
| F11 | `OwnerPayout.PayoutStatus` is `OwnerPayoutStatus`, persisted through an enum-string converter. Services use enum comparisons and API responses retain lowercase contract casing. | Backend and Docker release builds pass. |
| F12 | Added `GET /api/internal/crm/leads/open-count` and wired the dashboard to its live server-side count with cache invalidation. | Swagger route exists; frontend builds pass. |
| F13 | Booking status-history responses normalize stored values to API PascalCase. | Source/build pass. |
| F14 | CRM grouping normalizes and validates runtime status values before indexing pipeline columns. | Type-check/build pass. |
| F15 | Deferred as required: view joins are protected by current FK rules and changing the view would violate the no-schema constraint. | No change. |
| F16 | Rollback file now explicitly warns that status collapse is data-lossy and production migration 0048 is one-way. | Documentation verified. |
| F17 | Removed all `Console.WriteLine` statements from client booking flows and replaced pricing failures with structured logger warnings. | Static search pass. |
| F18 | Added `tabular-nums` to all analytics summary values. | Static/source verification and frontend build pass. |
| F19 | `db/init.sql` now documents that 0046 is intentionally skipped because 0047 is the minimal-login replacement. | Documentation verified. |
| F20 | No change required: route groups and re-export routes are intentional and production build reports no route collision. | Next.js production build pass. |

## Verification Evidence

- `dotnet build RentalPlatform.API\RentalPlatform.API.csproj --no-restore`: PASS, 0 warnings, 0 errors.
- `docker compose build api`: PASS using the repository's .NET 10 preview image.
- `npm run type-check`: PASS.
- `npm run build`: PASS. One pre-existing public homepage `<img>` optimization warning remains.
- `git diff --check`: PASS. Git only reports existing LF-to-CRLF normalization notices.
- Swagger route checks: PASS for quick booking, CRM open count, password reset, client status, and booking status history.
- Browser checks: PASS for homepage, client registration, client login, owner login, and protected admin redirect, with no console/network errors.
- Authorization checks: Sales password reset `403`; anonymous quick booking `401`; anonymous CRM open count `401`.

## Explicit Residuals

1. `LeadStatus.Completed` is repurposed as the no-schema terminal state after conversion because the approved ten-state vocabulary has no `Converted` value.
2. Quick-booking duplicate detection is a 30-second application guard. The advisory lock closes same-unit request interleaving, but durable request-key idempotency would require schema.
3. Reusing `Client.UpdatedAt` as a credential stamp also revokes sessions after profile edits. A credential-only stamp requires a new column.
4. Gross profit is intentionally absent until product defines an authoritative basis and the backend can compute it.
5. Database-backed concurrency and mutation checks remain unexecuted because starting or modifying a database was outside the user's constraint.

