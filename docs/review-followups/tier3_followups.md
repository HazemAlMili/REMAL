# Tier 3 Review Follow-Ups

**Document Status:** Active — Tracked  
**Created:** 2026-04-15  
**Last Updated:** 2026-04-15  
**Tier 3 Review Result:** PASS — READY FOR TIER 4 = YES  
**Tickets Covered:** BZ-MD-01 through BZ-MD-06, Scaffold Restructuring

---

## Purpose

This document tracks all follow-up items identified during the completion of the Tier 3 (Business / Master Data) review. It defines structural shifts, resolved blockers originating from previous tiers, and explicit contracts that mandate how Tier 4 (API / Web integration) must interact with the Business layer.

---

## A. Monolithic Scaffold Alignment 

### Status: 🟢 RESOLVED — Scaffold Restructured

### Problem

As identified in the Tier 1 follow-ups, the original execution framework consisted of a monolithic single-project setup (`REMAL.csproj`). If we mapped API endpoints without resolving this, future API domains, UI components, and business validations would inevitably tangle, destroying the `4-project layout` mandate.

### Resolution

| Action | Detail |
|--------|--------|
| Migration | Extracted localized folders into formal `C#` library modules. |
| Projects Created | `RentalPlatform.API` (Web SDK), `RentalPlatform.Business`, `RentalPlatform.Data`, `RentalPlatform.Shared` |
| Solution Binding | Established a native `.slnx` hierarchy securely compiling outputs without cyclic boundaries |
| Legacy Deletion | Obliterated the original `REMAL.csproj`, fully cleaning the root monolith. |

> [!IMPORTANT]
> All subsequent feature development going forward must utilize the targeted projects directly. Do not route backend operations inside the `.API` folder randomly. 

---

## B. Auth Token Generation Handoff

### Status: 🟡 PENDING — Awaiting Tier 4 Controller Scaffolding

### Problem

The `IAuthService` completely validates all logic pertaining to profiles, soft-delete states, and password hashing boundaries (using `BCrypt`). It currently outputs an `AuthenticatedSubject` record successfully but deliberately **lacks** JWT formulation logic as dictated safely by Tier 3 bounds. The API needs standard JWTs per the Technical Requirements.

### Recommended Action

Tier 4 must take explicitly structured control of creating raw JWT generation mappings. 

| Tier | Role | Action |
|------|------|--------|
| **Tier 3** | Logic & Verification | `AuthService.ValidateAdminCredentialsAsync()` yields validation context. |
| **Tier 4** | Web Layer & Presentation | Needs to take the `AuthenticatedSubject` mapping its properties cleanly onto a Microsoft JwtBearer format resolving into HTTP responses |

> [!WARNING]
> Do NOT recreate password evaluation (such as `BCrypt.Verify()`) inside the Web API tier. Tier 4 controllers MUST rely strictly on `IAuthService` validation endpoints. 

---

## C. Exceptions to HTTP Status Code Interception

### Status: 🟡 PENDING — Middleware Required in Tier 4

### Context

Tier 3 utilizes bespoke logical error models (`NotFoundException`, `ConflictException`, `BusinessValidationException`) natively without returning bloated strings, `IActionResult` objects, or web specific errors. 

### Resolution Handoff

To prevent the web server from throwing unstructured HTTP 500 crashes during logical failures, Tier 4 must incorporate an **Exception Handling Middleware**.

| Business Exception | Tier 4 API Target HTTP Translation |
|--------------------|------------------------------------|
| `BusinessValidationException` | HTTP 400 - Bad Request (with clean property message details) |
| `ConflictException` | HTTP 409 - Conflict |
| `NotFoundException`| HTTP 404 - Not Found |
| `UnauthorizedBusinessException`| HTTP 401 / 403 - Blocked Scope |

> [!TIP]
> Use `.NET 10.0`'s native Global Exception Handler pattern (`IExceptionHandler`) wrapping `ProblemDetails` correctly!

---

## Summary — Impact Matrix

| Follow-Up | Severity | Status | Resolution |
|-----------|----------|--------|------------|
| Scaffold Dev/Align | 🔴 Blocker | 🟢 Resolved | Formulated explicit `.slnx` + Projects |
| JWT Construction | 🟡 Important | 🟡 Pending | Offloaded directly to Tier 4 `.API` |
| Error Interception | 🟡 Important | 🟡 Pending | Global Error Handler required strictly for Tier 4 |

---

## Rules for Tier 4 Implementation

> [!CAUTION]
> **The following rules govern the structural hand-off into Tier 4 (API):**
>
> 1. **DO NOT** execute cryptographic functions (`BCrypt.Net-Next`) inside Controllers. Rely on Tier 3 boundaries!
> 2. **DO NOT** use `DbContext`/`UnitOfWork` inside API controllers directly. The controllers must exclusively speak to the newly defined `IService` interfaces!
> 3. **DO NOT** construct `DTOs` inside the `RentalPlatform.Business` project. Request/Response payloads map strictly to the Web project (`RentalPlatform.API.csproj`).
> 4. **MANDATORY**: Ensure Tier 4 catches business layer exceptions uniformly converting them to standardized HTTP codes, avoiding bleeding Tier 3 logic into frontend 500 loops. 

---

*This document is the authoritative hand-off capturing actionable integrations translating Tier 3 Business Logic into Tier 4 Presentation rules.*
