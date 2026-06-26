# Contract — Technical & Commercial Section
## Software System: **Bookiva** (the "System")

| | |
|---|---|
| **Provider (Second Party)** | Ahmed Salem / Raven |
| **Client (First Party)** | Ahmed Khaled & Mostafa Salah |
| **Effective Date** | 21 June 2026 |
| **Governing Law** | the laws of the Arab Republic of Egypt |

---

## Article 1 — Definitions

**1.1 "System" / "Bookiva":** the hotel booking and management software platform developed by the Provider for the Client, comprising (a) a public-facing website for hotel and unit discovery and online booking, (b) a client account portal, (c) an administrative dashboard, (d) an independent hotel portal, and (e) the back-end application programming interface (API) and database that power them, all as described in Article 2.

**1.2 "Provider":** Ahmed Salem / Raven, the second party, responsible for the development, hosting, operation, and maintenance of the System under this contract.

**1.3 "Client":** Ahmed Khaled and Mostafa Salah, the first party, the proprietor and commercial operator of the System — the administrator who manages the Hotels and their Units and through whom Guests book.

**1.4 "Hotel":** a hotel (or property/establishment) managed within the System under which one or more Units are grouped and offered for booking. Each Unit belongs to exactly one Hotel.

**1.5 "Unit":** an individual bookable accommodation belonging to a Hotel (unit types include villa, chalet, and studio), having its own details, capacity, amenities, images, pricing, and availability.

**1.6 "Guest":** the end user who browses Hotels and Units and books a Unit in a specific Hotel through the administrator. The booking relationship is between the administrator (the Client) and the Guest.

**1.7 "VPS" (Virtual Private Server):** the virtual private server on which the System is deployed and from which it is served to its users.

**1.8 "Bug / Error":** any defect, fault, malfunction, or deviation that causes the delivered System to operate in a manner inconsistent with the specifications set out in Article 2, including incorrect results, failures, crashes, or broken functionality in features that have already been delivered.

**1.9 "Monthly Fee":** the single, all-inclusive recurring subscription of two thousand Egyptian Pounds (2,000 EGP) per month payable by the Client to the Provider, as defined in Article 4.

**1.10 "New Feature / Change Request":** any functionality, module, integration, or modification that was not part of the delivered System as specified in Article 2, whether requested before or after delivery.

---

## Article 2 — System Description & Technical Specifications

### 2.1 System Overview

Bookiva is a hotel booking and management platform that gives the administrator (the Client) a single tool to run the entire business. The core commercial relationship is between the administrator — who lists and manages a portfolio of Hotels and the Units within each Hotel — and the Guest, who books a Unit in a specific Hotel directly through the administrator. Through it, prospective Guests browse Hotels and Units by project, check live availability, and book online; the sales team manages every lead and booking through a structured pipeline; the finance side records payments, generates invoices, and tracks the settlement due to each Hotel; and each Hotel has a private, view-only portal to see its own Units, confirmed bookings, revenue, and settlements. The platform is delivered as a responsive web application that works across desktop, tablet, and mobile browsers.

### 2.2 Functional Modules

The delivered System includes the following modules, each verified against the implemented source code:

**2.2.1 Public Website & Hotel/Unit Discovery** — A public landing site and catalogue where visitors can browse projects, search and filter units (by project, dates, guest count, unit type, amenities, and price), view full unit detail pages with photo galleries, pricing, availability, and published guest reviews, and view hotel and unit locations on an interactive map.

**2.2.2 Online Booking & Seamless Account Creation** — Visitors can request a booking directly from a unit page; a guest account (name, mobile number, optional email, password) is created within the same booking flow, with no separate registration step required.

**2.2.3 Client Account Portal** — Registered guests have a personal portal to view their bookings and booking history, manage their profile, read their in-app notifications, and submit reviews after a completed stay.

**2.2.4 CRM / Sales Pipeline** — A lead-management pipeline that captures leads from the public website and from internal entry, lets the sales team move each case through defined stages, attach free-text notes, assign cases to specific staff members, and convert a qualified lead into a confirmed booking.

**2.2.5 Booking Management & Lifecycle** — Internal management of bookings with a controlled status lifecycle (e.g. confirmation, cancellation, check-in, completion), a full audit trail of every status change, and filtering of bookings by status, unit, and date.

**2.2.6 Hotels, Units & Inventory Management** — Management of projects, hotels, and units (types: villa, chalet, studio), with each unit belonging to a hotel, including unit details, capacity, amenities, and images, with a clear separation between the public catalogue and internal administrative editing.

**2.2.7 Pricing & Availability** — Base nightly pricing per unit, optional seasonal pricing overrides, administrative date-blocking (e.g. maintenance or hotel hold), an availability calendar, and date-aware unit selection that excludes already-booked or blocked units for a chosen stay.

**2.2.8 Finance Module** — Manual recording of guest payments (with proof-of-payment references), automatic generation of invoices, recording of hotel payouts/settlements (with proof-of-payment references), and finance summaries showing balances per booking.

**2.2.9 Hotel Portal (Independent Login)** — A separate, hotel-only portal in which each hotel sees exclusively its own units, those units' availability and confirmed bookings, its revenue and payout/settlement history, the reviews on its units (with the ability to reply), its notifications, and its profile. A hotel has view-level access only and cannot approve, reject, or alter bookings or pricing; all booking and pricing control remains with the administrator.

**2.2.10 Reviews & Ratings** — Guests submit star ratings and comments after a completed stay; administrators moderate reviews (publish or reject); the relevant hotel may reply; published reviews and per-unit rating summaries appear on the public site.

**2.2.11 Notifications** — An in-app notification inbox for administrators, hotels, and guests, with per-user notification preferences and a dispatch framework prepared for additional delivery channels (see Article 2.4 regarding the current status of external channels such as email and SMS).

**2.2.12 Reporting & Analytics** — Administrative reporting surfaces for booking analytics and finance analytics (daily and summary views) and dashboard metrics.

**2.2.13 Administration, Users & Roles** — Management of administrative users across four roles (Super Admin, Sales, Finance, Tech) with role-based access control governing which dashboard sections each role may view or modify.

### 2.3 Technical Architecture

**2.3.1 Back-end** — A RESTful API built with **C# on .NET 10** (ASP.NET Core), organised as a four-project layered solution (API, Business, Data, Shared) following the repository and unit-of-work patterns, with a strict data-transfer-object boundary so that database entities are never exposed directly. Input validation is enforced with FluentValidation (v12). Passwords are hashed with BCrypt (work factor 12). *Note: the build currently targets a preview release of the .NET 10 SDK/runtime — see Appendix A.*

**2.3.2 Front-end** — A web application built with **Next.js 14** (App Router) and **React 18** in **TypeScript**, styled with **Tailwind CSS 3**, using TanStack React Query (server state) and Zustand (client state), React Hook Form with Zod (forms and validation), and Axios (API client). The interface is fully responsive across desktop, tablet, and mobile browsers. There is **no separate native or Flutter mobile application** in the delivered System; "mobile" support is provided through the responsive web interface (see Appendix A).

**2.3.3 Database** — **PostgreSQL 16**. The schema is managed through a sequence of versioned raw-SQL migrations (each with matching verification and rollback scripts), using UUID primary keys (via the `pgcrypto` extension), `DECIMAL(12,2)` for all monetary values, `snake_case` naming, application-managed timestamps, and soft-delete columns on key entities.

**2.3.4 Authentication & Authorisation** — JSON Web Token (JWT) authentication signed with HS256, using short-lived access tokens (default 15 minutes) and longer-lived refresh tokens (default 7 days) stored in a secure, HttpOnly, SameSite=Strict cookie. Three independent login flows exist: administrators (by email), hotels (by mobile number), and guests (by mobile number). Access is governed by role-based and subject-type policies as described in Article 2.2.13.

**2.3.5 Containerisation** — The back-end API and the PostgreSQL database are packaged with **Docker** and orchestrated with Docker Compose. The API runs as a containerised service; the database runs as a containerised PostgreSQL service with a persistent data volume; uploaded files are stored on a server-mounted volume.

### 2.4 Integrations & External Services

**2.4.1 Interactive Maps — Mapbox GL (active).** The public site uses Mapbox GL to display hotel and unit project locations on an interactive map. This integration requires a Mapbox access token supplied via the `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable. *Account and any usage fees for the maps service are addressed in Appendix A.*

**2.4.2 File / Image Storage — local server storage (active).** Uploaded images and files are stored on the VPS's local file system (a server `/uploads` volume) and referenced by key; the System does **not** use an external cloud-storage service (such as Amazon S3 or Azure Blob Storage).

**2.4.3 Email / SMS / WhatsApp notifications — framework present, external delivery not yet active.** The notification system fully supports an in-app inbox today. The architecture is prepared to dispatch notifications over email, SMS, and WhatsApp channels, but **no external email, SMS, or WhatsApp provider is currently connected**, and these channels do not send messages in the delivered System. Activating any external channel requires connecting and configuring a third-party provider (see Appendix A and Article 7).

**2.4.4 Payment gateway — not integrated (by design).** Payments are recorded manually by staff (with proof-of-payment references); the System does **not** integrate an online payment processor. The data model is structured to accommodate a payment gateway in a future phase without redesign.

### 2.5 Languages & Localization

The System's user interface is delivered primarily in **English** (the application's base language is set to English). Arabic content and right-to-left (RTL) presentation are applied selectively in specific sections (notably the public landing page and certain notification content). The System does **not** currently include a full multilingual/internationalisation framework or a language-switching capability. The final intended interface language(s) are to be confirmed in Appendix A.

---

## Article 3 — Hosting & Infrastructure (VPS)

**3.1** The System shall be hosted by the Provider on a **Virtual Private Server (VPS)**, from which the System is served to its users.

**3.2** The Provider is responsible for deploying the System to the VPS, keeping the System running, and administering the server environment (including the application service, the PostgreSQL database, and server-stored uploaded files) for the duration of this contract.

**3.3** All costs of the VPS hosting are included within the Monthly Fee defined in Article 4; no separate or additional hosting charge applies (see Article 4.3).

**3.4** Provisioning of the production VPS, its specifications, the production domain name, secure handling of production credentials, and the production deployment configuration are practical set-up matters to be confirmed between the parties as listed in Appendix A.

---

## Article 4 — Fees & Payment

**4.1 Monthly Fee.** In consideration of the hosting, operation, and maintenance of the System, the Client shall pay the Provider a single, all-inclusive subscription of **two thousand Egyptian Pounds (2,000 EGP) per month**.

**4.2 All-inclusive.** The Monthly Fee is fully inclusive. It covers hosting on the VPS, ongoing maintenance, and everything related to keeping the System running and operational, as further described in Article 5.

**4.3 No additional charges.** No separate or additional charge applies for hosting or for maintenance. There are no hidden, supplementary, or usage-based fees for the operation and upkeep of the delivered System; all such costs are included in the Monthly Fee. The only matters that may be separately quoted are New Features / Change Requests, as set out in Article 7, and any third-party service fees expressly identified in Appendix A.

**4.4 Billing cycle.** The Monthly Fee is payable on a recurring monthly basis. The billing start date, payment method, and invoicing arrangements are to be confirmed by the parties (see Appendix A).

---

## Article 5 — Maintenance & Support

**5.1** For the duration of this contract and within the Monthly Fee, the Provider shall maintain the System so that it remains operational and available to its users.

**5.2** Maintenance under the Monthly Fee includes: keeping the System running on the VPS; administering and operating the database and application services; applying corrective fixes to Bugs/Errors in accordance with Article 6; and performing the routine upkeep necessary to keep the delivered System functioning as specified in Article 2.

**5.3** For the avoidance of doubt, maintenance covers the upkeep and correct functioning of the **delivered** System. It does not include the development of New Features / Change Requests, which are governed by Article 7.

---

## Article 6 — Warranty & Liability for Bugs and Errors

**6.1** The Provider warrants that the System shall operate substantially in accordance with the specifications set out in Article 2. Should any Bug, defect, or Error arise in the delivered System, the Provider shall be **solely responsible** for its correction and shall remedy it **fully at its own expense, free of charge, and at no additional cost whatsoever** to the Client.

**6.2** This free-of-charge correction obligation is absolute for the duration of this contract: the Client shall never be charged, in any form, for the diagnosis or repair of a Bug or Error in the delivered System.

**6.3** For the avoidance of doubt, this warranty applies to defects in the **delivered** System and does **not** extend to New Features or modifications requested after delivery, which constitute new development and shall be quoted separately in accordance with Article 7. This scoping does not, in any way, reduce or qualify the Provider's absolute free-of-charge obligation to fix Bugs and Errors in the delivered System.

---

## Article 7 — Out of Scope / Change Requests

**7.1** Any New Feature or Change Request — including any functionality, module, or integration not part of the delivered System as specified in Article 2 — falls outside the scope of the Monthly Fee and outside the free-of-charge warranty in Article 6.

**7.2** Without limitation, the following are New Features / Change Requests if requested: activating external notification channels (email, SMS, or WhatsApp delivery) and connecting their third-party providers; integrating an online payment gateway; adding cloud file storage; building a native or Flutter mobile application; and adding a full multilingual / language-switching capability.

**7.3** Each New Feature / Change Request shall be described, estimated, and quoted by the Provider separately, and shall proceed only upon the Client's written approval of that separate quotation. Recurring third-party service charges arising from an approved New Feature (for example, an SMS provider's per-message fees) are borne as agreed in that separate quotation and are independent of the Monthly Fee.

---

## Appendix A — Items To Confirm

The following points are not determinable from the source code and should be resolved and agreed between the parties before signing:

- **VPS details.** The specific VPS provider, server specifications (CPU, RAM, storage), region, and the production domain name.
- **.NET runtime release.** The System currently builds against a **preview** release of the .NET 10 SDK/runtime; confirm whether production should be pinned to a stable (GA) release.
- **Production hardening.** There is currently **no CI/CD pipeline, no reverse proxy/HTTPS configuration, and no externalised secrets management**; development credentials are presently held in the Docker Compose configuration. Confirm the production deployment, HTTPS/TLS, secrets handling, and backup arrangements (including the local `/uploads` files and the database).
- **Notification channels.** Confirm whether email, SMS, and/or WhatsApp delivery are required at launch (they are not currently active — see Article 2.4.3); if so, confirm the chosen provider(s). Any such activation is a Change Request under Article 7.
- **Interface language(s).** Confirm the intended UI language(s) and whether full Arabic/RTL localization is required (the delivered UI is primarily English — see Article 2.5).
- **Mapbox account.** Confirm which party holds the Mapbox account/token and responsibility for any Mapbox usage fees.
- **Mobile application.** Confirm that responsive web is sufficient, or whether a native/Flutter mobile app is expected (none exists today — see Article 2.3.2).
- **Hotel Portal.** Confirm whether the independent hotel login/portal (Article 2.2.9) is required, and if so how each Hotel's revenue/settlement is calculated and displayed; otherwise it can be disabled, leaving the administrator as the sole operator and reducing the login flows to administrators and guests only.
- **Billing.** Confirm the Monthly Fee start date, payment method, and invoicing cycle (Article 4.4).
- **Effective date.** Confirm the effective date (shown as 21 June 2026).
- **Support expectations (optional).** If the parties want defined response times or availability targets for Bug fixes, agree those separately; this section deliberately states none.

---

*This document is a technical and commercial specification drafted from the System's source code; it is not legal advice. It is recommended that the contract be reviewed by a qualified lawyer admitted in the Arab Republic of Egypt before signing.*
