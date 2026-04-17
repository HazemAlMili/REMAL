# Decision Record: Units & Availability Business Scope

## Context
Before implementing the service logic for Units and Availability in the Tier 3 Business Layer, it is critical to define the scope and responsibilities of the services. Mixing administrative availability, booking availability, pricing calculation, and unit CRUD operations can lead to an unmanageable service layer.

## Decision
We establish explicit Business-layer service contracts, result models, and domain boundaries for the Units & Availability domain. The following constraints define the current scope:

1. **Availability Scope:** The current availability in this tier is strictly modeled based on:
   - Unit active state
   - Unit soft-delete state
   - Explicit `date_blocks` only

2. **Booking Overlap:** Confirmed booking overlaps are **NOT** included in the availability checks yet. 
   - Once the booking domain exists, the availability service will be seamlessly extended and integrated to consume booking constraints.

3. **Service Responsibilities:** Service abstractions are strongly segregated:
   - `IUnitService`: unit CRUD, soft deletes, activation states.
   - `IUnitImageService`: image assignment, cover management, display ordering.
   - `IUnitAmenityService`: amenity assignment.
   - `ISeasonalPricingService`: seasonal pricing adjustments.
   - `IDateBlockService`: manual overriding availability blocks (e.g. maintenance).
   - `IUnitAvailabilityService`: operational availability queries and pricing calculation queries. No invoice or booking state modification logic exists here.

## Consequences
- Prevents booking leakages into the Units & Availability operational services.
- Maintains a clean architecture by isolating CRUD from availability and from invoicing.
- Readies result models for consumption by Tier 4 (API) without exposing internal mechanisms.
