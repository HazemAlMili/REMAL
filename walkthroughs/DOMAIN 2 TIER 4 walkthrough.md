# API Implementation Walkthrough: Units & Availability Tier 4

This walkthrough details the systematic rollout of the inventory controllers (Domain 2, Tier 4) connecting safe, read-only public queries with tightly protected backend administrative routines, culminating in operational availability queries.

## 1. DTO Contracts & Validations (Ticket API-UA-01)

Established the rigorous Data Transfer Object definitions isolating EF Core queries away from external view completely. This prevents raw structural leakage. Accompanied by integrated `FluentValidation` patterns preventing missing requirements, bad strings, and overlapping date injections explicitly at the network edge.

## 2. Units API (Ticket API-UA-02)
We erected a dedicated entry point `UnitsController` strictly enforcing boundary protection avoiding query overlap with the deferred Availability logic layers.

- **Internal vs. Public Routes Separated:** 
  - `GET /api/units` (Public) handles pagination cleanly, hiding archived/deactivated inventory subsets natively.
  - `GET /api/internal/units` (Admin/Sales) guarantees full inventory pool visibility ensuring operational optics on offline properties.
- **Administrative Protection:** Handled modifiers like `POST /api/internal/units` exclusively restricting access bounds to the static `SuperAdminOnly` policy.

## 3. Unit Images API (Ticket API-UA-03)

Continuing the modularity, `UnitImagesController` isolates the visual catalog registry from any filesystem storage ingestion payloads, maintaining safe string mappings.

- **Public Access Protection:** Fails securely throwing `404 Not Found` if a general non-authenticated caller points toward a dormant tracking ID. Overrides seamlessly via valid payload headers for authorized Admin read roles.
- **Tuples over Raw Bytes:** Employs arrays mapped directly across `(ImageId, DisplayOrder)` sequences delegating heavy-lifting internally to the `ReorderAsync` logic blocks flawlessly.

## 4. Unit Amenities Alignment (Ticket API-UA-04)

Completed the structural mapping sequence constructing `UnitAmenitiesController`. This avoids confusing the amenity catalog assignment pathways with future broad search-listing filters.

- **Public Retrieval Logic:** Exposes exactly `{ AmenityId, Name, Icon }` vectors stripping SQL joins.
- **Unit Association Overrides:** Employs isolated `AssignAsync`, `RemoveAsync`, and `ReplaceAllAsync` triggers cleanly without contaminating global catalogs. 

## 5. Scheduling APIs: SeasonalPricing & DateBlocks (Ticket API-UA-05)

Constructed the `SeasonalPricingController` and `DateBlocksController` as strict administration-only inventory schedules.

- **Total Isolation Upheld:** Extracted these elements entirely from the upcoming Availability modules. Validation boundaries are properly centralized inside the `Pricing` & `Blocks` services avoiding redundant duplicate logic loops inside the controllers.
- **Roles Mapped:** Exposes purely protected `POST / PUT / DELETE` mechanisms via `SuperAdminOnly`, while yielding list visibility safely using `SalesOrSuperAdmin` via routes such as `GET /api/internal/units/{unitId}/seasonal-pricing` and `/date-blocks`. 

## 6. Unit Availability Query Surface (Ticket API-UA-06)

Finally, completed the `UnitAvailabilityController` explicitly exposing the operational outputs based on blocks and pricing boundaries. This is the domain's ultimate public surface query, built without implying or guaranteeing final booking completion.

- **Endpoint Routing:** Safely exposes:
  - `POST /api/units/{unitId}/availability/operational-check`
  - `POST /api/units/{unitId}/pricing/calculate`
- **Zero Booking Leakage:** Carefully scoped wording exclusively around `CheckOperationalAvailabilityAsync` avoiding confusing public interfaces with future checkout taxes, hold statuses, or invoice commitments.
- **Privacy Handled Seamlessly:** Protects inactive/offline stock accurately against public probing without throwing random 500s. Authenticated access appropriately scales permissions locally avoiding redundant separate code paths.

## Verification Checklist

1. **Build Validations Passed**
   The architecture compiles cleanly `0 Warnings, 0 Errors`. Each individual Component Service (`IUnitService`, `IUnitImageService`, `IUnitAmenityService`, `ISeasonalPricingService`, `IDateBlockService`, `IUnitAvailabilityService`) is safely orchestrated inside `Program.cs` establishing predictable Runtime DI lifecycles.
2. **Behavioral Accuracy Tested**
   - Structural modifiers execute cleanly via designated APIs sequentially protecting pipeline paths.
   - Public visibility scopes intelligently reject unauthenticated probes onto hidden/offline unit attributes efficiently.
3. **Contracts Locked**
   - Zero mapping conflicts, zero ORM dependencies leak into the API tier. All boundaries rely exclusively on strictly mapped DTOs returned through Standardized `ApiResponse<T>` envelopes.

## Next Steps
The core CRUD pipelines and Operational Data extraction APIs for Domain 2 are effectively finished. The ecosystem is now structurally pristine allowing the front-end architectures—and eventual booking mechanisms—to interface stably without entity leakage or fragmented availability results.
