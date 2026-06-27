# JIRA / LINEAR TRACKING TICKET

## Title

**INTEGRATION**: Connect Public Storefront/Demo Website (Port 3000) with Live Kaza Booking Rental Platform (Port 3001) and Backend API Core

## Priority

Critical (Release Gate Blocker — Ecosystem Integration Phase)

## Type

Cross-Origin Integration / Full-Stack Refactor / Auth Handoff

## Scope

* **Public Frontend Storefront (`localhost:3000`)**: Authentication modules, navigation controllers, search page parameters (`/search?project=...`), and the featured landing units grid ("وحدات مختارة وجاهزة للحجز").
* **Platform System (`localhost:3001`)**: Auth route handling patterns (`/app/(auth)/*`) and post-login redirection guards.
* **Backend API Core (`.NET 8`)**: Cross-Origin Resource Sharing (CORS) configuration matrix inside `Program.cs`.

---

## Objective

Eradicate all static fallback scripts, hardcoded component profiles, and artificial demonstration parameters inside the public-facing portfolio/demo application running on port 3000. Bridge this discovery environment with the production-ready **Kaza booking** platform running on port 3001 and its underlying backend data engine.

The storefront must dynamically fetch activated marketplace assets directly from live database repositories, route customer queries against verified regional entities, and seamlessly hand off authentication pipelines to our secure identity verification infrastructure.

---

## Current Problem & Technical Blocks

The public landing application running on `http://localhost:3000` functions strictly as an isolated presentation prototype. It uses disconnected mock data arrays that look clean but fail to communicate with our system components:

1. **Auth Dead-Ends**: Clicking sign-in or register hooks (`http://localhost:3000/auth/client/login`) targets visual components that fail to issue operational security sessions or persist user access tokens securely.
2. **Disconnected Discovery Routing**: Search parameters such as `?project=abraj` run against unmapped static filters, completely bypassing our active geographical repository configurations.
3. **Stale Visual Displays**: The showcase layout panel ("وحدات مختارة وجاهزة للحجز") presents fictional property metrics rather than querying actual units flagged as active and verified within the database.

---

## Expected System Behavior & Architectural Rules

### 1. Unified Authentication Handoff Pipeline

When an anonymous visitor engages an authentication hook inside the public storefront environment, the system must securely bridge the transition to the primary application platform:

* **Redirection Guard Model**: Route user interaction anchors directly to the live platform's route layout:
```
http://localhost:3000/auth/client/login  ──► Redirect ──► http://localhost:3001/login?returnUrl=http://localhost:3000

```


* **Token Delivery Exchange**: Upon successful validation inside the real platform portal, the backend auth service issues the standard security envelope payload (Access and Refresh tokens). The session tracking layer must persist cookies under explicit parameters supporting secure multi-port cross-origin transfers.

### 2. Live Area Discovery Parameters

The query parser inside `http://localhost:3000/search` must decode natural string tags dynamically and map requests onto real database entities:

* A query string like `?project=abraj` must map cleanly onto the primary structural area row representing *Abraj Al Alamein*.
* The application must query the live backend controller using standardized filters:
```http
GET /api/areas?includeInactive=false

```



### 3. Real-Time Activated Showcases ("وحدات مختارة وجاهزة للحجز")

The featured grid layout must display properties pulling live from the database. It is strictly forbidden from displaying units that are marked as inactive, soft-deleted, or out-of-service.

* **Data Sourcing Rule**: Fetch properties directly from the repository catalog endpoint:
```http
GET /api/units?page=1&pageSize=6&isActive=true

```


* **Precision Alignment Rule**: Every displayed asset card must output pricing data formatted to exactly two decimal places with explicit thousands separation styling rules applied (e.g., `19,000.00 EGP` instead of `19000`), preserving total parity with our core ledger rules.

---

## Required Engineering Investigation

### Backend API Configuration Audit

* Open `Program.cs` within the .NET 8 solution codebase. Locate the active CORS configuration block. Ensure the middleware policy explicitly whitelists the port 3000 origin to allow cookie transit:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("KazaOriginPolicy", policy => {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Critical for HttpOnly token cookies
    });
});

```



### Frontend Environment Validation

* Review the client application request layer setup inside the port 3000 project files. Ensure that API call paths reference the correct target domain configurations rather than referencing internal route maps.

---

## Required Implementation Details

### Phase 1: CORS Whitelisting & API Routing Map

1. Update the backend `.NET` configuration settings to officially accept incoming communication requests originating from `http://localhost:3000`.
2. Expose an optimized cross-origin parameter redirect helper to process authentication transitions cleanly.

### Phase 2: Refactoring the Public Portal Grid (Port 3000)

1. **Purge Mock Mock Arrays**: Open components rendering the featured property cards ("وحدات مختارة وجاهزة للحجز"). Eradicate all hardcoded JavaScript data maps.
2. **Bind Dynamic Fetching Hooks**: Wire the grid component using standard data-fetching hooks points to invoke the primary catalog API route. Filter the grid to only match active properties.
3. **Sync Search Filters**: Update the main search submission script to read text parameters, map target strings (like mapping `abraj` to the correct area key), and trigger accurate live network filter actions.

---

## Operational Edge Cases to Handle

* **Unassigned Content Fallbacks**: If an activated property lacks attached preview assets, the card component must fallback gracefully to a stylized CSS geometric layer to protect the storefront grid balance.
* **Token Synchronization Overlap**: If a user clears their tracking cookie cache within port 3001, port 3000 must gracefully capture the session expiration state, display an intuitive message, and redirect users safely to the entry screen.

---

## Acceptance Criteria

1. **Dynamic Grid Hydration**: The featured asset showcase layout ("وحدات مختارة وجاهزة للحجز") reads properties directly from live endpoints. Code reviews will reject the pull request if any mock arrays remain.
2. **Flawless Dynamic Search Actions**: Query inputs matching `?project=abraj` resolve seamlessly, loading only active listings linked to *Abraj Al Alamein*.
3. **Production Financial Scale Handling**: Every visual financial field across the storefront layout prints figures precisely to two trailing decimal places.
4. **Seamless Cross-Origin Authentication**: Executing a signup or login interaction within the public marketing site transitions users to the platform portal without throwing script exceptions or dropping data.

---

## QA Manual Smoke Testing Matrix & Checklist

### Multi-Port Full-Cycle Validation Sequence

* [ ] Launch all runtime environments locally. Open browser DevTools (`F12`) and clear all active cookies, session keys, and local state targets across ports 3000 and 3001.
* [ ] Navigate directly to the public marketing storefront interface page at `http://localhost:3000`.
* [ ] **Verify Live Unit Ingestion**: Scroll down to the featured properties container layout ("وحدات مختارة وجاهزة للحجز"). Verify that all property cards render actual image assets and show precise pricing outputs formatted cleanly with two trailing decimals.
* [ ] **Verify Dynamic Storefront Search**: Click into the primary search selector bar or use the explicit path route: `http://localhost:3000/search?project=abraj`. Verify that the system updates search outputs dynamically to present only available listings linked to the *Abraj Al Alamein* area.
* [ ] **Execute Authentication Security Transitions**: Click the primary Login action control inside the storefront layout header menu.
* [ ] Confirm that the application updates the browser viewport context, routing your page session to the live application portal identity validation portal at `http://localhost:3001`.
* [ ] Provide valid client credentials to log into the platform. Confirm the system authenticates the user session successfully and redirects you back to the client account dashboard layout view.
* [ ] Execute a hard page reload (`Ctrl + F5`) on your browser window. Verify that your login tracking data remains persistent and active across the workspace.

### Visual Layout & Formatting Conformity Check

* [ ] Verify that no visual layout components suffer text truncation or alignment distortions across varying display scales.
* [ ] Confirm that all financial summary modules preserve proper space positioning layouts and clear text hierarchies.

---

## Production Safety & Deployment Guardrails

* **Strict Isolation Execution Rules**: These full-stack integration changes must be deployed and validated exclusively within an isolated pre-production Staging workspace environment. Never connect untrusted dev ports or inject synthetic lead accounts inside production environment databases.
* **CORS Hardening Validation**: Double-check that your production configuration profiles exclude catch-all wildcards (`*`) once code moves beyond local environments to prevent security leakage across origins.
* **Release Gate Closure Policy**: The deployment gate remains completely locked. Do not push updates to production environments until this cross-origin integration suite passes verification and a full regression run succeeds.


# GLOBAL-QA-FRAMEWORK: Implement Universal End-to-End Manual Smoke Testing Protocol and Codebase-Wide Verification Rules for Kaza Booking Ecosystem

**Priority**: Critical (Release Gate Foundation)

**Type**: Quality Assurance & Architectural Standardization

**Scope**: Across the entire multi-project monorepo workspace: Public Storefront Portal (`localhost:3000`), Core Rental Platform Portals (`localhost:3001` covering Admin, Owner, and Client environments), `.NET 8` Backend API Core, and `PostgreSQL` Database layers.

---

## Objective

Establish a definitive, zero-variance testing framework and code verification protocol that all functional feature additions, bug patches, and layout updates must pass before code check-in, merge validation, or live production deployment.

This framework defines strict cross-persona tracking scenarios, multi-port validation scripts, and design system constraints to eliminate the risk of hardcoded mock implementations, timezone day-shifting errors, visual numeric truncation bugs, or security leaks.

---

## Current Problem

As full-stack updates expand the capabilities of the **Kaza booking** ecosystem, the lack of an explicit, centralized testing blueprint can cause regressions to slide through code gates. Common issues include:

* Frontend developers adding client-side mock data arrays or temporary hardcoded state placeholders to simulate unfinished backend APIs, leading to visual false positives during local checks.
* Cross-origin session drops or unexpected layout routing loops when jumping between the storefront (`port 3000`) and the rental application (`port 3001`).


* Timezone conversion shifts misaligning check-in and check-out dates over midnight boundaries during payload serialization.
* UI components failing to conform to the established design system tokens, creating an inconsistent user experience across different user portals.

---

## Expected System Behavior & Baseline Architectural Rules

### 1. Zero-Mock Presentation Constraint

* **0% Static Fallback Tolerance**: No visual interface component, summary data card, list table row, or notification dropdown may embed static placeholders or simulated local state mock arrays.
* **Live Infrastructure Hydration**: Every data layer must interface directly with live runtime database entities via the `.NET 8` REST API endpoints, utilizing clean, fallback boundaries (`?? 0` or empty arrays) to handle null or empty server responses safely.

### 2. Impeccable Design System Geometry & Visual Tokens

All interfaces must adhere strictly to the **Balanced Geometry** tempo specifications:

* **Border Radii**: Every dashboard data wrapper card, button asset, input box, and dialog panel must enforce a uniform `8px` corner radius layout configuration (`rounded-lg` / `rounded-md`).
* **Shadow Profiles**: Replace fuzzy or dark drop shadows with clean, subtle structural shadows combined with distinct `1px` hairline boundaries (`border: 1px solid var(--neutral-border)`).
* **Typographic Numeric Alignment**: All visible pricing models, invoices, financial summaries, and occupancy percentages must be formatted with thousands separators and tabular numerals for clear vertical alignment:
```css
font-variant-numeric: tabular-nums;

```


* **The Spotlight Accent Rule**: Saturated terracotta washes are prohibited as background fills for large layout panels. The terracotta palette (**#E87651**) is strictly reserved as an intentional active accent indicator (e.g., active navigation routes, focused text fields, primary action paths, or data peaks).

### 3. Absolute Timezone and Input Integrity

* **Pure String Serialization**: Selected check-in, check-out, maintenance, and blackout dates must serialize and pass across the network wire exclusively as raw `YYYY-MM-DD` ISO strings.
* **Offset Suppression**: Frontend wrappers must strip out local client machine timezone offsets before serialization to prevent midnight day-shifting bugs.
* **Canonical Phone Constraint**: All phone input controllers must restrict inputs to numerical ranges ($10 - 15$ digits maximum) via a strict regex pattern filter, blocking spaces, letters, or dashes automatically:
$$\text{Regex Pattern: } ^+?\d{10,15}$$

---

## Required Testing Playbook (Exhaustive Cross-Persona Script)

For every verification loop, human testers or automated browser control modules (such as Playwright/MCP execution tools) must process through these explicit integration steps:

```
[Storefront Port 3000] ──► Clear Cache/Cookies ──► Register: "Hozaifa Almelli"
                                                                    │
[Redirect Port 3001]   ◄── Auth Handoff Guard  ◄────────────────────┘
          │
          ▼
[Client Session]       ──► Pick Dates (20 Nights) ──► Submit Prospecting Booking
                                                                    │
[Admin Session]        ──► Ingest Lead ──► Log Deposit (.00) ──► Confirm Booking
                                                                    │
[Owner Session]        ──► Verify Display Names ──► View Verified Payout Rows
                                                                    │
[Global Calendar]      ──► Ensure Real-Time Lockout of Selected Range Across Channels

```

### Step 1: Pre-Flight Environment Purge

* Launch browser developer configurations (`F12`), enter the Application/Storage tools, and execute a complete wipe of `LocalStorage`, `SessionStorage`, and domain `Cookies` across both origins (`http://localhost:3000` and `http://localhost:3001`) to eliminate stale token noise.

### Step 2: Cross-Origin Onboarding and Routing Guard Verification

* Open the public storefront website directory at `http://localhost:3000`. Click the primary login or registration link wrapper.
* Verify that the authentication routing engine seamlessly hands off the session context to the real system platform portal at `http://localhost:3001/login`.
* Complete the client signup routine utilizing the explicit system verification credentials:
* **Full Name Input**: `Hozaifa Almelli`
* **Secure Password Input**: `Admin@123`
* **Email Tracking Input**: `hozaifa.almelli.smoke@kaza.dev`


* Confirm that once authentication succeeds, the routing guard routes the session directly to the personal customer account path (`/account/bookings`), avoiding unauthorized administrator workspace leaks.
* Perform a hard browser reload (`Ctrl + F5`) and ensure that your authenticated session remains active and persistent.

### Step 3: Direct Booking Ingestion & Verification

* Return to the storefront view. Navigate the catalog, use a search tag (e.g., `?project=abraj`), and select an active, verified property card.
* Open the date selection drawer. Pick a check-in day and ensure the calendar overlay remains open, closing cleanly *only* after a check-out date is locked.
* Configure a 20-night reservation window. Confirm that the checkout totals display exactly two trailing decimals and thousands separation layout styling parameters (e.g., `19,000.00 EGP`). Submit the form.

### Step 4: Administrative CRM Processing and Financial Settlement

* Open an isolated incognito browser workspace and log in using an identity with administrative privileges. Open the CRM Lead Management pipeline board (`/admin/crm`).
* Locate the incoming lead card generated for customer **Hozaifa Almelli**. Verify that the status tag matches the initial stage `Prospecting` exactly, with zero empty fields.
* Move the record through its pipeline milestones (`Prospecting` $\rightarrow$ `Relevant` $\rightarrow$ `Booked`) and confirm that modifications persist reliably upon page rehydration.
* Transition the booking to the **Confirmed** processing stage. Verify that the system opens the manual deposit tracking form as a mandatory pre-confirmation step.
* Key in the exact deposit transaction configuration details, upload a validation receipt asset image file, and save. Trigger the invoice re-issue feature and confirm that it completes without throwing unhandled server errors.

### Step 5: Owner Portal Sync & Multi-Tenant Data Isolation

* Open a third isolated browser space and log in using the Property Owner credentials linked to that specific property.
* Navigate directly to the Owner Dashboard and open the Transaction History ledger view.
* **Verify Relational Label Hydration**: Confirm that the table layout completely replaces raw system UUID hashes, cleanly rendering the real `Unit Name` and `Client Name` (`Hozaifa Almelli`) within the transaction rows.
* **Confirm Absolute Multi-Tenancy Segregation**: Audit incoming network payloads via the browser network tab to ensure that this owner session is strictly bounded and cannot view any bookings, revenue metrics, or analytics assets belonging to another owner.
* **Global Availability Check**: Open the public website, check the unit calendar page, and verify that the selected 20-night range is fully locked out across all platform portals, preventing duplicate overlapping bookings.

---

## Edge Cases to Audit

* **The Whole-Integer Precision Check**: If an item or booking total resolves to a round whole integer (e.g., exactly `19000`), verify that all client cards, invoices, and table rows preserve the trailing decimals to display consistently as `19,000.00`.
* **The High-Frequency Double-Click Test**: Rapidly multi-click the form submission button on checkout pages. The interface frame must instantly set its loading state to true, disable interaction elements, and ensure that only a single network mutation reaches the server API.
* **Soft-Deleted Entity Behavior**: Set a test unit record to a soft-deleted state (`deleted_at = NOW()`) inside a test database sandbox. Verify that all historical financial tracking records, payment histories, and invoices linked to that unit remain visible inside owner and admin finance tables, falling back to display names gracefully.

---

## Acceptance Criteria

1. **Dynamic Cross-Persona Mapping**: Shifting a booking status inside the Admin workspace updates the record across the Client and Owner portals immediately on page reload, with no data dropping out due to case sensitivity or query filtering bugs.
2. **Strict Design System Adherence**: Every modified interface card, metrics row, input frame, and badge primitive matches the balanced geometry spec, tracking precisely at an `8px` corner radius with crisp hairline borders.
3. **No Mobile/Touch Target Degradation**: All user-facing portal buttons, form fields, and navigation elements preserve comfortable, finger-friendly interactive heights of $\ge$ **40px**.
4. **Absolute Zero-Mock Execution**: Hardcoded frontend state placeholders or static fallback data structures are completely banned from the repository. All components must read and write data directly against live `.NET 8` API endpoints.
5. **Clean Envelope Wrappers**: All newly exposed or modified endpoints wrap their outputs within the standard platform envelope framework: `{ success, data, message, errors, pagination }`.

---

## QA Framework Master Checklist

### Cross-Persona Lifecycle Verification

* [ ] Purge all local database storage states, cache keys, and cross-origin cookies prior to starting.
* [ ] Onboard client user `Hozaifa Almelli` using password `Admin@123` via the storefront handoff view.
* [ ] Confirm that post-auth routing mechanics isolate user views, directing the client session strictly to the consumer account area.
* [ ] Apply catalog filters, select a property, and confirm that changing local system time offsets introduces zero day shifts within network payloads.
* [ ] Verify that the calendar picker remains open during check-in selection, dismissing itself cleanly *only* after a check-out date is locked.
* [ ] Verify that client-side forms reject phone inputs that violate the required length or formatting rules.
* [ ] Ingest the lead in the Admin dashboard, update its pipeline stages, and ensure historical data saves on refresh.
* [ ] Log a manual deposit transaction complete with a sample payment receipt image upload.
* [ ] Re-issue an invoice document and confirm that it completes successfully without server exceptions.
* [ ] Confirm that the owner transaction table displays real unit and client names instead of raw system hashes.
* [ ] Verify that the global availability engine locks out the date range for all other user accounts across all platform portals.

### Design Token & Layout Audit

* [ ] Check that currency strings maintain proper thousands separation markers and explicit `.00` trailing zeros across all views.
* [ ] Confirm that the terracotta color (**#E87651**) functions exclusively as an intentional spotlight tool.
* [ ] Verify that all metrics cards and tables across portals conform to the required `8px` corner radius rules.

---

## Production Safety & Deployment Guardrails

* **Live Infrastructure Snapshot Obligation**: Because these QA framework validation constraints touch core authorization middleware, token generation engines, and global availability services, taking a complete production database snapshot before deployment is an absolute operational requirement.
* **Sandbox Target Isolation**: All manual validation testing runs, migration scripts, and mock input procedures must be executed and verified exclusively within an isolated Stage or Sandbox testing environment. Never inject test accounts or mock payment files inside live production database instances.
* **Release Gate Lock Policy**: The deployment pipeline remains completely locked. Do not push updates to production environments until this comprehensive dynamic RBAC testing sequence passes 100% successfully and is signed off as safe.