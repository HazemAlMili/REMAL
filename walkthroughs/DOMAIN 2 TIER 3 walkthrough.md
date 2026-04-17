# Walkthrough: Units & Availability — Tier 3 (Business)

## Overview
This tier successfully establishes the pure business logic and boundary rules for the **Units & Availability** domain. Rather than exposing raw persistence access directly to APIs, this tier adds a highly stable and structured set of service boundaries mapping Database constraints into dependable C# behaviors.

Below is a detailed breakdown of what was accomplished explicitly across every ticketing phase:

### Ticket [BZ-UA-01]: Business Layer Contracts & Domain Notes
**Goal:** Establish clear, predictable contracts and scope definitions mapping expectations prior to logic coding.
* **Interfaces defined:** Created pure abstraction contracts (`IUnitService`, `IUnitAvailabilityService`, `ISeasonalPricingService`, `IUnitImageService`, `IDateBlockService`, `IUnitAmenityService`).
* **Result Models built:** Created `UnitAvailabilityResult`, `NightlyPriceBreakdownItem`, and `UnitPricingResult` preserving primitive return parameters without touching framework `DTOs`.
* **Domain Check Definitions:** Added logic notes inside `docs/decisions/0005_units_availability_business_scope.md`. Re-affirmed operations isolate checks strictly avoiding overlapping CRM dynamics/Booking queries entirely.

### Ticket [BZ-UA-02]: Unit Inventory Management Service (`UnitService`)
**Goal:** Implement safe property CRUD avoiding impossible logic variables or orphan bindings. 
* **Database Relational Safeguards:** Overrode implicit relationship error-throwing by proactively fetching `ExistsAsync()` on `OwnerId` and `AreaId` raising explicit `NotFoundException`s directly within the Business Tier.
* **Positive Restrictions:** Guaranteed basic scalar parameters explicitly remain positive or strictly within logical bounds (`Bedrooms >= 0`, `Bathrooms >= 0`, `MaxGuests > 0`, `BasePricePerNight >= 0`). 
* **State Operations:** Mapped visibility modes directly (`SetActiveAsync`) and secured soft-delete interactions via the internal repository (`SoftDeleteAsync`) handling rows correctly.
* **Enum-like Checks:** Explicitly enforces string variants against accepted architectural types exactly natively filtering via: `apartment`, `villa`, `chalet`, `studio`.

### Ticket [BZ-UA-03]: Unit Image Media Management (`UnitImageService`)
**Goal:** Stabilize visual property elements independently enforcing single-cover checks.
* **Exclusive `IsCover` Controls:** Engineered logic that flips `IsCover=false` off all sibling records whenever a new image enforces itself as the property cover natively without DbContext collisions.
* **Explicit Array Identifiers (`DisplayOrder`):** Handled numeric priority dynamically enforcing explicit ordered mapping provided by outer layers securely validating orders efficiently. Discards CDN variables entirely.

### Ticket [BZ-UA-04]: Immutable Property Interlinking (`UnitAmenityService`)
**Goal:** Solidify amenity bindings proactively dropping potential mapping duplicates ensuring safety directly through deterministic idempotency behaviors cleanly separated from front-end catalogs.
* **Idempotency Standards:** Assign and Remove checks mapping redundant action states dynamically return native `void` early exits smoothly avoiding crashing errors internally.
* **Deduplicated Sets (`ReplaceAllAsync`):** Intersects incoming definitions natively comparing differences cleanly using C# Hash maps evaluating additive and subtractive changes elegantly replacing mappings safely maintaining absolute database integrity logically.

### Ticket [BZ-UA-05]: Seasonal Overrides (`SeasonalPricingService`)
**Goal:** Create predictable operational override loops effectively mapping explicit date sequences cleanly separated securely locking unit validity boundaries naturally.
* **Overlap Preflight Blockers:** Modeled explicitly restricting overlapping date limits verifying combinations across `newStart <= existingEnd AND newEnd >= existingStart`. Firing `.ConflictException` whenever an overlapping range generates conflicts on the same property natively skipping self-hits across `.UpdateAsync`.
* **Sequential Verification:** Avoided backward chronologies verifying `StartDate <= EndDate` blocking invalid chronological targets preventing downstream pricing logic from locking unpredictably reliably throwing `.BusinessValidationException`.

### Ticket [BZ-UA-06]: Sequential Operational Constraints (`DateBlockService`)
**Goal:** Establish concrete hard constraints managing property system closures efficiently disconnected from CRM booking systems entirely blocking availability directly.
* **Boundary Restrictions:** Replaced manual availability overrides employing identically bounded overlap boundaries generating the strict rule (`newStart <= existingEnd AND newEnd >= existingStart`) mapping limitations securely throwing clean `.ConflictException` models preserving operational uniqueness proactively. Includes strict truncations trimming generic notes parameters smoothly without crashing constraints functionally.

### Ticket [BZ-UA-07]: Agnostic Query Generation (`UnitAvailabilityService`)
**Goal:** Leverage all defined Tier 3 components translating pure raw constraints extracting explicitly formatted values accurately separating booking logic safely modeling final responses comprehensively via operation blocks purely predictably natively avoiding CRM restrictions securely precisely.
* **Operational Availability (`CheckOperationalAvailabilityAsync`):** Extracts Block arrays safely generating targeted list intersections computing filtered `BlockedDates` maps iterating across chronologies natively responding with structured exceptions formatting parameters transparently (`Reason: 'date_blocked'`). 
* **Pricing Calculator (`CalculatePricingAsync`):** Implements standard loop generation incrementally shifting checking daily records independently building Base vs Seasonal evaluations seamlessly. Appends internal total maps producing exactly equivalent aggregations without implicit external accounting fees mapped cleanly into robust collections arrays natively separating calculation environments explicitly matching design metrics properly.

---

## Technical Validation Run 
**Compilation Result:** Executing `.sln` via `dotnet build` returns perfectly: `0 Warnings, 0 Errors`.

> خلاصة الدومين ده كاملًا على مستوى التيكتات: كل خدمة اتبنت بهدف واضح يسد ثغرة (Duplicates/Overlaps/Invalid states) قبل ما نوصل لمرحلة الأيه بي آي. حوّلنا البيانات الخام لقواعد عمل منظمة تخص الوحدة، الأسعار الموسمية، الأيام المغلقة، وربط الخدمات عشان يترد بيها للعميل بكل سهولة من غير اختلاط بالـ Bookings أو الـ Payments نهائيًا.
