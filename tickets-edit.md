## Ticket Set: Kaza Booking Platform Optimization & Bug Fix Pass

This ticket set outlines the structural fixes, data-integrity enhancements, and real-time portal synchronization layers required to clear the release gate for the **Kaza booking** platform.

---

### Ticket 1: Core Units Module Optimization (Admin Table & Dynamic Client Calendar)
* **Priority**: High
* **Type**: Functional Bug Fix + Feature Implementation
* **Scope**: `Admin/Units` Table View, `UnitsController.cs`, `UnitRepository.cs`, Client-Side Property Details View (`/units/[id]`), and `ClientBookingsController` Ingestion Loop.

#### Objective

Repair inline administrative management hooks, hydrate relational ID fields with user-facing name strings, activate catalog data filtering, and update client-side availability loops to check unit status dynamically before the checkout phase.

#### Current Problem

1. **Admin Table Actions Failure**: Clicking the "Edit" action icon inside the table row on `http://localhost:3001/admin/units` fails silently; modifications are not captured or sent to the backend.
2. **Raw ID Exposure**: The columns for `Project ID` and `Owner ID` render raw system `UUID` strings instead of corresponding human-readable context names, complicating back-office operations.
3. **Disabled Grid Filters**: Table-level data filtering selectors on the Admin panel are completely non-functional, rendering a placeholder flag stating *"Filters are currently disabled pending API support."*
4. **Reactive Availability Latency (Client Side)**: On the client property layout (`/units/[id]`), availability validation only triggers *after* a consumer submits their desired dates, causing frustration if the selection is blocked.
5. **Disconnected Pipeline Loop**: Client-side property bookings do not sink directly to the CRM framework, missing the initial tracking stage entirely.

#### Expected Behavior

* The edit action within the Admin units row grid must open a compact slide-over panel or inline input wrapper, passing payloads seamlessly to the server API.
* Raw tracking hashes must be replaced by explicit database joins rendering `Project Name` and `Owner Name` strings.
* Admin column selectors must apply live filters (Project, Type, Status) globally using type-safe URL query parameters.
* The Client property details calendar must fetch and parse availability data dynamically during the initial page load, graying out and blocking unavailable or blocked dates.
* Submitting a reservation request from the public portal must automatically initialize an entry in the CRM pipeline, setting the initial tracking state explicitly to `Prospecting`.

#### Required Investigation

* **Backend Check Path**: Inspect `UnitsController.cs` and `UnitRepository.cs`. Ensure that table query methods execute an explicit `.Include(u => u.Project).Include(u => u.Owner)` clause to make string values available to the client data mapper.
* **Frontend Check Path**: Open `/app/(admin)/units/page.tsx` and trace row interaction hooks. Verify that rows pass valid item context metrics rather than throwing silent layout errors.

#### Required Implementation

* **Admin Primitives Wiring**: Update the inline row action component to point directly to the open modification panel. Modify table data columns to present name values instead of tracking IDs.
* **Multi-Filter API Activation**: Wire the table filter header dropdowns to attach standard search flags to the data-fetching hook. Ensure that modifying any parameter updates the search metrics and resets the grid pagination to page one.
* **Dynamic Client Calendar Blocks**: Update the client calendar sub-component to invoke `POST /api/units/{id}/availability/operational-check` immediately upon loading, using the returning date arrays to disable occupied cells reactively.
* **CRM Ingestion Hook**: Wire the customer checkout execution routine to submit parameters to `POST /api/crm/leads`, passing data parameters straight to the `Prospecting` workflow step.

#### Edge Cases

* **Properties Missing Associated Project Entities**: If a unit record does not point to a valid project mapping in the database, row templates must output a fallback tag reading `[Unassigned Project]` instead of throwing null property reference exceptions.
* **Overlapping State Sync Loops**: If a customer tries to submit an inline check call at the split second an admin registers an out-of-service `date_block`, the system must intercept the request, refresh the calendar view, and notify the user of the conflict.

#### Acceptance Criteria

* The Admin units management grid supports row edits, updates names correctly, and filters fields seamlessly without interface locks or data drops.
* The Client property details calendar grays out blocked intervals automatically on page load.
* Every public reservation request drops into the CRM database engine under the tracking state `Prospecting`.
* Monetary values render with a thousands separator format rounded to exactly two decimal places.

#### QA Checklist

* **What must be verified**: Manual row inline edits pass payload validations on the server; the client calendar disables pre-booked date blocks on page load.
* **What could fail**: Delayed data re-hydration loops could allow users to click blocked calendar blocks before the UI locks them.
* **What must not break**: Existing public searching queries and backend soft-delete filters must continue operating normally.
* **Success Confirmation**: Run an E2E test: check data updates in the admin panel, confirm names render properly, and verify that dates are blocked on the client portal.

#### Production Safety Notes

* Perform a database backup before updating LINQ query join logic.
* Validate modifications inside a pre-production staging environment; do not merge updates until static type compilation checks pass successfully.

---

### Ticket 2: Advanced CRM Pipeline Engine & Real-Time Sync Sync

* **Priority**: Critical
* **Type**: Core Architectural Refactor + Structural Feature
* **Scope**: `CrmController.cs`, Admin CRM View (`/admin/crm`), Lead Creation Form, Client Booking Ingestion Loop, and Polymorphic Event Handlers.

#### Objective

Activate real-time status updates on the CRM dashboard without manual screen reloads, implement automated client profile mapping, and deploy cross-persona availability checks to prevent lead teams from double-booking units.

#### Current Problem

1. **Static CRM State Latency**: Altering a lead's tracking stage inside the detail side panel does not sync with the main CRM pipeline interface automatically; the page requires a manual browser refresh to reflect the update.
2. **Blind Double-Booking Risk**: The lead creation form allows teams to select and assign dates that conflict with active reservations, running the risk of double-booking errors.
3. **Manual Client ID Setup Hurdles**: When converting a lead to a booking, the system fails to auto-map the record if the customer is already registered. If they are a new sign-up, the form blocks the save action because it cannot generate an inline account password.

#### Expected Behavior

* Modifying a lead's status within the detail panel must instantly sync across the active CRM board view without causing layout shifts or full-screen re-renders.
* The lead creation form (on both Admin and Client apps) must intercept date parameters on-change. If the selected unit is occupied, the interface must disable the submission button and display a clear conflict warning banner.
* The billing conversion form must verify contact phone strings. If an active client profile matches, it must automatically map the `Client ID`. If it is a new registration, the interface must display an inline secure password generation module to complete the signup flow seamlessly.

#### Required Investigation

* **State Sync Architecture**: Analyze why state mutations in the detail panel do not bubble up to the global query cache layer. Ensure the state management framework updates the correct cache keys upon mutation.
* **Collision Detection Check**: Verify that the overlap detection logic checks all active holding states (`booked`, `confirmed`, `check_in`) to catch conflicts early.

#### Required Implementation

* **Real-Time Data Invalidation**: Wire up lightweight polling hooks or cache invalidation listeners on the CRM workspace page to refresh the grid layout automatically when pipeline fields change.
* **Cross-Persona Availability Guard**: Embed an automatic event listener on the date input elements of the lead form. This listener must call the operational check endpoint instantly and return error messages if conflicts match:
```json
{ "isAvailable": false, "reason": "BookingConflict", "blockedDates": ["2026-06-16"] }

```



```
*   **Conversion Form Automation**: Update the booking conversion component to trigger a profile lookup when phone strings are entered. Include a secure, random temporary password generator inside the layout panel to support inline new user registration.

#### Edge Cases
*   **Simultaneous Conversions**: Two agents processing different leads attempt to assign the exact same unit and date span simultaneously. The backend concurrency manager must accept the first request and immediately fail the second with a clear conflict alert.
*   **Incomplete Phone String Lookups**: If phone attributes match multiple accounts due to legacy format inputs, the interface must show a select dropdown listing the matching users instead of failing or picking an incorrect ID.

#### Acceptance Criteria
*   CRM pipeline card arrays update automatically across views when status changes are saved.
*   The lead creation form blocks and displays clear warning indicators for pre-booked dates on both the client and administrative portals.
*   Converting an existing client auto-populates their unique identifier, while new signups are handled via an integrated inline password manager.

#### QA Checklist
*   **What must be verified**: Lead status transitions sync across board views automatically; the system blocks overlapping date inputs on the lead form across both portals.
*   **What could fail**: High-frequency status changes could trigger race conditions or cause UI data arrays to desynchronize if cache updates overlap.
*   **What must not break**: Relational database foreign keys and owner portal data isolation rules must remain perfectly intact.
*   **Success Confirmation**: Walk through the complete workflow: create a lead, verify that double-bookings are blocked, convert the lead, check the auto-mapped ID, and confirm that updates reflect immediately across screens without reloads.

#### Production Safety Notes
*   Isolate code changes to pre-production environments; do not deploy frontends until cross-persona validation checks pass seamlessly.

---

### Ticket 3: Booking Lifecycle, Direct Ingestion, & Invoice Recovery

*   **Priority**: Critical
*   **Type**: Core Process Refactor + Functional Bug Fix
*   **Scope**: `BookingsController.cs`, `InvoiceService.cs`, Admin Bookings Grid Layout (`/admin/bookings`), and Background Automation Services.

#### Objective
Fix broken booking date filters, replace raw staff IDs with readable name strings, deploy a quick-booking entry point that bypasses the lead generation path, build a pre-confirmation payment modal step, fix invoice generation errors, and automate the checkout state machine.

#### Current Problem
1.  **Broken Date Filtering**: Querying the bookings grid using target string parameters (e.g., `?checkInFrom=2026-06-16&checkInTo=2026-06-16`) fails silently, rendering unfiltered results.
2.  **Raw Staff Key Leak**: The `Assigned To` column displays raw system user ID strings instead of clean staff names or designated organizational roles.
3.  **Missing Fast-Track Booking Path**: Agents dealing with immediate walk-ins or quick deals cannot bypass the multi-stage CRM lead engine, causing operational bottlenecks.
4.  **Missing Pre-Confirmation Payment Modal**: The workflow lack an explicit step to remind agents to log deposit details before moving a booking to a confirmed state.
5.  **Invoice Re-issuance Failure**: Triggering the invoice re-issue feature fails with an unhandled HTTP `500 Internal Server Error`.
6.  **Confusing Interface Layout**: The layout strings for Booking ID, Unit ID, and Project ID are cluttered together, making it difficult for agents to differentiate them quickly.
7.  **Manual Checkout Overhead**: Bookings remain stuck in an active state indefinitely unless an administrative manager manually updates the record to completed after the checkout date passes.

#### Expected Behavior
*   The bookings table must filter results accurately using date parameters, handling timezone offsets correctly without day-shifting bugs.
*   The assignment metrics view must display clean staff names alongside their functional organization role tags.
*   A "Quick Booking" action button must be added to the interface. This button must bypass the lead path, create a booking directly, set its initial status to `Prospecting`, and proceed straight to the core lifecycle flow.
*   Moving a booking to the confirmed stage must display a pre-confirmation payment step. This step will serve as an operational reminder to log deposit parameters or handle cancellations if needed.
*   Re-issuing an invoice must execute cleanly, regenerate the transaction document file, save it to cloud storage, and update client logs without throwing server exceptions.
*   The layout interface must present clear labels and distinct spacing for Booking ID, Unit ID, and Project ID strings.
*   The system's background engine must automatically transition check-in records to `Completed` 24 hours after the checkout date passes, provided no early leave flags are logged.

#### Required Investigation
*   **Date Query Resolution**: Investigate the date filter parsing logic. Ensure incoming ISO string queries are processed as clean dates rather than localized timestamps.
*   **Invoice Crash Isolation**: Check server error logs for the HTTP `500` error on invoice re-issuance. Investigate if the crash is caused by null reference exceptions, duplicate filename collisions, or file-writing permission blocks in cloud storage.

#### Required Implementation
*   **Unified Query Fix**: Refactor the database filtering logic to parse date strings cleanly. Update column templates to query and display staff name strings.
*   **Quick Booking Process**: Build the quick-booking input layout. Wire it to save directly to the bookings database container, bypassing the lead engine while keeping lifecycle validation rules intact.
*   **Pre-Confirmation Payment Module**: Build a step-down validation block within the status transition method. If an agent hits confirm, display the deposit payment capture form first, allowing them to cancel the flow safely if needed.
*   **Invoice Re-write**: Correct the exception path in `InvoiceService.cs`. Ensure that re-issuing an invoice generates a clean sequence code format, replaces the old cloud file asset, and updates database records.
*   **Automated Lifecycle Job**: Update `AutoCompleteBookingsJob.cs` to sweep and transition past-due records smoothly every night, writing updates directly to the status history log.

#### Edge Cases
*   **Past-Due Records with Unpaid Invoices**: If the automated checkout engine encounters an active record with an outstanding balance, it must transition the status to `Completed` but trigger an administrative notification alert to prevent silent payment drops.
*   **Duplicate Fast-Track Requests**: If an agent double-clicks the "Quick Booking" action, the interface wrapper must block secondary clicks instantly to prevent creating duplicate booking records.

#### Acceptance Criteria
*   The administrative bookings grid filters fields accurately by date parameters and hides raw layout ID strings.
*   The "Quick Booking" action successfully initializes transactions directly into the initial booking stage.
*   The pre-confirmation payment form appears as intended prior to confirmation steps, and invoice re-issuance works without server errors.
*   The automated background job transitions past-due bookings to completed smoothly every day.

#### QA Checklist
*   **What must be verified**: Table queries filter results accurately by date; the quick-booking button skips the lead generation steps; invoice re-issuance completes successfully.
*   **What could fail**: The automated background checkout script could run into timezone alignment issues, causing bookings to close a day early or late.
*   **What must not break**: Relational invoice calculations and existing client payment histories must remain unchanged.
*   **Success Confirmation**: Verify that date filtering returns accurate data, test the quick-booking creation flow, re-issue an invoice successfully, and confirm past-due records transition to completed automatically.

#### Production Safety Notes
*   Back up the database before updating core state-machine transitions or running automated background jobs.
*   Verify all updates inside a staging sandbox first; do not deploy changes to production until all validation scripts pass successfully.

---

### Ticket 4: Financial Accounting, Analytics Dashboard, & Payouts Engine

*   **Priority**: Critical
*   **Type**: Financial Engine Fix + Analytics Implementation
*   **Scope**: `FinanceService.cs`, `OwnerPortalController.cs`, Admin Analytics Tab (`/admin/analytics`), and Finance Payments View (`/admin/finance/payments`).

#### Objective
Deploy a high-precision Gross Profit analytics card to track company margins, fix broken action controls on the payments grid, add client metadata to table rows, enable multi-parameter search fields, and fix the owner payout data visibility bug.

#### Expected Behavior
*   The Admin analytics dashboard must feature a **Gross Profit** tracking card. This component will calculate company performance by applying a strict 20% margin calculation directly to aggregate revenue data:
    $$\text{Gross Profit} = \text{Total Revenue} \times 0.20$$
*   The "Actions" column dropdown controls on the payments table must be fully interactive, allowing finance managers to update payment records cleanly.
*   Table rows must display the `Client Name` string along with their contact information. The search dashboard must support multi-parameter search processing, querying inputs against text names and phone strings simultaneously.
*   The Payouts engine must function flawlessly. Selecting a specific owner profile must accurately retrieve and display all their eligible confirmed bookings and outstanding payouts, eliminating data visibility drops.

#### Required Investigation
*   **Relational Query Break Bug**: Investigate the relational database query logic inside `FinanceService` or `OwnerPortalController`. Diagnose why confirmed bookings for specific owners are dropped from the payouts table. Check if the query is failing due to strict inner join mismatches or unhandled soft-delete filters.
*   **Actions Menu Disconnect**: Open `/components/admin/finance/PaymentsTable.tsx`. Identify why row event handlers are failing or dropping user click inputs.

#### Required Implementation
*   **Analytics Card Injection**: Build the Gross Profit metric card component. Wire it to calculate and display company margins cleanly, using tabular layout typography.
*   **Payments Grid Refactor**: Correct row action event handlers. Update the underlying backend repository queries to run explicit client data joins, and add support for multi-parameter search inputs.
*   **Payout Mapping Resolution**: Correct the database query logic to ensure the payout engine processes all eligible confirmed bookings correctly. Ensure that outstanding payout balances for owners calculate and display accurately.

#### Edge Cases
*   **Owners with Zero Active Units**: If an owner profile has no active units or confirmed bookings, the system must display a clean empty state layout with clear descriptions instead of crashing or rendering empty rows.
*   **Search Inputs with Complex Characters**: The multi-parameter search field must strip out country codes or common formatting symbols (e.g., spaces, hyphens, parentheses) from phone strings to ensure searches match database records reliably.

#### Acceptance Criteria
*   The analytics interface displays Gross Profit calculations accurately based on the 20% commission scaling rule.
*   The payments table supports row actions, shows client names clearly, and filters records smoothly via the multi-parameter search bar.
*   The owner payout engine lists all eligible bookings correctly, calculating and presenting outstanding balances accurately across views.

#### QA Checklist
*   **What must be verified**: Gross Profit cards calculate metrics accurately; the payments search bar processes names and phone strings correctly; owner profiles display all corresponding bookings in the payout view.
*   **What could fail**: Rounding errors could introduce minor visual discrepancies if currency calculations map incorrectly between frontends and backends.
*   **What must not break**: Core revenue calculations and historical transaction ledgers must remain completely unaltered.
*   **Success Confirmation**: Verify profit card calculations manually, test payment table search controls, and confirm that owner payout modules display data correctly.

#### Production Safety Notes
*   Take a complete database snapshot before modifying financial tracking logic or calculation algorithms.
*   Verify all updates inside a staging sandbox first; do not deploy changes to production until all validation scripts pass successfully.

---

### Ticket 5: Client Identity Management, Auth Stability, & Owner Dashboard Utilities

*   **Priority**: High
*   **Type**: UI/UX Patch + Security Feature + Auth Refactor
*   **Scope**: Client Management Screens (`/admin/clients/[id]`), `OwnerPortalController`, Owner Dashboard UI (`/owner/dashboard`), and Client Profile Validation Rules.

#### Objective
Fix the total spent dashboard card crash, deploy an administrative password override control tool, enforce strict length restrictions on phone input fields, fix owner session persistence drops, and replace raw database IDs with clean name strings inside owner transaction logs.

#### Current Problem
1.  **Dashboard Metric Crash**: Opening client profile `45a8c13a-7946-4dcc-be95-ee05590bd8e9` crashes the interface because the **Total Spent** data card fails to process empty or null history arrays safely.
2.  **Missing Password Management Tool**: Administrative managers lack an integrated tool to help clients reset or override forgotten passwords securely.
3.  **Weak Input Validation Controls**: The client profile form lacks strict input validation rules, allowing users to save phone strings with invalid characters or excessive lengths (exceeding 12 characters).
4.  **Owner Auth Session Drops**: Property owners face frustrating session drops; refreshing the dashboard page at `/owner/dashboard` logs them out automatically and forces a full login re-entry.
5.  **Owner-Driven Calendar Blocks Gap**: Owners cannot manually declare out-of-service intervals for maintenance or personal use, increasing the risk of scheduling conflicts.
6.  **Raw ID Leaks in Transaction Logs**: The owner's transaction logs display raw system UUID strings for bookings and clients instead of human-readable names.

#### Expected Behavior
*   The **Total Spent** tracking card must handle empty histories gracefully, rendering `0.00 EGP` cleanly instead of throwing runtime interface exceptions.
*   The Admin panel must feature an integrated password override control dialog, allowing managers to update a client's password hash securely.
*   The profile interface must enforce strict validation rules on phone number fields, restricting inputs to absolute numerical ranges ($10 - 15$ digits maximum) and blocking invalid characters.
*   The Owner authentication token loop must persist sessions reliably across browser page refreshes, using secure token rotation rules.
*   The Owner Dashboard must feature a real-time updating framework along with a manual blocking interface. Owners can use this tool to declare custom out-of-service intervals, which will sync instantly to block dates across the admin panel and public client apps.
*   Owner transaction tables must replace raw system IDs with clear, human-readable name strings.

#### Required Investigation
*   **Auth Disconnect Trace**: Audit the token cookie configurations inside the Owner authentication stack. Identify why session variables clear or fail to rehydrate during page refresh actions.
*   **Null Metric Crash Isolation**: Trace the calculation mapping loop within the client details component to identify why null history arrays trigger dashboard crashes.

#### Required Implementation
*   **Resilient Total Spent Card**: Refactor the client metric card component to parse data safely using fallback boundaries (`totalSpent ?? 0`), ensuring the UI handles null inputs cleanly.
*   **Admin Password Override Tool**: Implement a secure password management dialog. This tool will allow administrators to write new password strings directly to the client's hash target using the platform's standard hashing mechanics.
*   **Profile Field Validation**: Apply regex pattern matches to phone input controls to restrict lengths and block invalid characters.
*   **Stable Session Management**: Adjust token validation cookie parameters to preserve owner sessions across page reloads.
*   **Owner Block-Out Calendar**: Build a manual date blocking interface for owners. This component will write blocking parameters directly to the platform's `date_blocks` table, syncing availability globally across all channels in real time.
*   **Log Name Hydration**: Update the owner transaction query methods to pull and display real client and booking name strings.

#### Edge Cases
*   **Owner Blocks Overlapping Existing Bookings**: If an owner attempts to block out dates that contain a confirmed or active booking, the system must block the action, display an alert, and direct them to contact management first.
*   **Special Characters in Administrative Password Resets**: The administrative password override input field must enforce password strength rules to maintain account security.

#### Acceptance Criteria
*   The client profile view loads reliably without card crashes, and support teams can execute password overrides securely.
*   The client profile form enforces strict phone number length restrictions and input validation rules.
*   Owner authentication loops preserve sessions perfectly across browser refreshes, and the dashboard updates data changes in real time.
*   Owner-driven calendar blocks sync instantly to prevent scheduling conflicts across all portal views.
*   Owner transaction tables display clear, human-readable name strings instead of raw system UUID hashes.

#### QA Checklist
*   **What must be verified**: Client metric cards handle empty data histories cleanly; administrative password updates save successfully; owner login sessions persist after hard page refreshes; owner calendar blocks sync globally across all portals.
*   **What could fail**: If token refresh parameters are configured incorrectly, owner session persistence changes could cause validation loops or lock users out.
*   **What must not break**: Core authorization matrices and user security hierarchies must remain completely secure.
*   **Success Confirmation**: Verify the metric card handles null histories, test the password override tool, confirm owner sessions remain active on refresh, test manual calendar blocks, and check that names display correctly in transaction logs.

#### Production Safety Notes
*   Isolate code updates to pre-production testing environments; do not deploy changes to production until all validation scripts pass successfully.

```
