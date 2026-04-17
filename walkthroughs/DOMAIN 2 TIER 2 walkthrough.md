# Walkthrough: Units & Availability — Tier 2 (Data Access)

This tier bridges the gap between the frozen database schema (Tier 1) and the upcoming Business logic (Tier 3). It ensures that the application can interact with the new domain entities in a type-safe, performant, and architecturally sound manner.

## 1. Foundation: AppDbContext Extension (DA-UA-01)
The primary entry point for EF Core was updated to recognize the new domain.

- **Objective**: Expose the new entities while maintaining global behaviors (soft delete, timestamps).
- **Key Changes**:
    - Added `DbSet` properties for `Units`, `UnitImages`, `UnitAmenities`, `SeasonalPricings`, and `DateBlocks`.
    - Extended the `ApplyTimestampsAndSoftDelete` logic inside `SaveChanges`.
- **Architectural Decision**: Only the `Unit` entity was added to the soft-delete conversion rule. Other entities like images or pricing are physically deleted or cascaded, keeping the database clean of unnecessary "deleted" metadata for transient records.

## 2. Anchor: The Unit Entity (DA-UA-02)
The `Unit` entity is the "Anchor" of this domain. All other records (images, pricing, blocks) revolve around it.

- **Mapping**: Strictly mapped to the `units` table using `snake_case`.
- **Constraint Alignment**: 
    - `BasePricePerNight` mapped to `decimal(12,2)` for financial precision.
    - `UnitType` kept as `string` with a length limit of 50, exactly matching the DB check constraint.
- **Safety**: A Global Query Filter `HasQueryFilter(x => x.DeletedAt == null)` was added. This ensures that "deleted" units are invisible to the rest of the application by default, preventing logical bugs in availability calculations.

## 3. Media: UnitImage Mapping (DA-UA-03)
Managed images through storage references rather than raw URLs or binary data.

- **Mapping**: Mapped to `unit_images` with a `file_key` of 500 characters.
- **Context**: Decoupled from the storage provider (Azure/AWS). It only stores the "pointer."
- **Order**: Included `display_order` and `is_cover` flags to support catalog sorting and featured image selection without overengineering specific media metadata.

## 4. Relationship: UnitAmenity Join Table (DA-UA-04)
Implemented the link between Units and Amenities.

- **Mapping**: Used a **Composite Primary Key** `(unit_id, amenity_id)`.
- **Efficiency**: No surrogate `Id` was used. This enforces uniqueness at the DB level, preventing a unit from having the same amenity twice.
- **Cascading**: Set to `DeleteBehavior.Cascade`. When a `Unit` is deleted, its amenity links are automatically purged by the database.

## 5. Pricing Overrides: SeasonalPricing (DA-UA-05)
Supported time-bounded nightly price changes.

- **Mapping**: Used `DateOnly` properties for `StartDate` and `EndDate`.
- **Precision**: Enforced `decimal(12,2)` for overrides.
- **Discipline**: Zero overlap or calculation logic was placed here. This entity is a "dumb" data container; the complex math is reserved for Tier 3.

## 6. Operational Blocks: DateBlock (DA-UA-06)
Handled manual unavailability (maintenance, owner use).

- **Mapping**: Mapped to `date_blocks` with optional `Reason` and `Notes`.
- **Isolation**: Strictly excluded any link to "Bookings." This ensures operational unavailability is handled as a separate stream of data from customer reservations, simplifying the final availability query.

## 7. Access Pattern: UnitOfWork (DA-UA-07)
Standardized the way the Business tier will access these new entities.

- **Pattern**: Extended `IUnitOfWork` and the concrete `UnitOfWork` implementation.
- **Exposures**: Added generic `IRepository<T>` properties for all 5 new entities.
- **Benefit**: This allows the Business services to perform operations on the new domain using the established `_uow.Units.Add(unit)` syntax, maintaining architectural consistency.

---

## Technical Summary
- **Build Status**: 100% Success.
- **Naming**: Explicit `snake_case` via Fluent API.
- **Soft Delete**: Applied to `Unit` only.
- **Money**: `decimal(12,2)` globally.
- **Relationships**: Properly configured `CASCADE` and `RESTRICT` behaviors matching Tier 1 SQL.

**READY FOR TIER 3 (BUSINESS LOGIC)** 
