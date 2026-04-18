# Domain 3, Tier 2 Walkthrough: Data Access (EF Core) - Booking & CRM

This walkthrough documents the implementation of the Data Access Layer (Tier 2) for the **Booking & CRM** domain. This tier bridges the frozen database schema with the application's internal model, ensuring strict adherence to architectural boundaries and persistence contracts.

---

## Technical Overview

- **Domain:** Booking & CRM
- **Tier:** 2 (Data Access)
- **Primary Technology:** EF Core with PostgreSQL (Npgsql)
- **Pattern:** Repository & Unit of Work

---

## Implementation Details

### DA-BC-01: AppDbContext Expansion
The central `AppDbContext` was extended to include the five core entities of the Booking & CRM domain.
- **DbSets Added:** `Bookings`, `BookingStatusHistories`, `CrmLeads`, `CrmNotes`, and `CrmAssignments`.
- **Infrastructure Integrity:** Verified that `OnModelCreating` continues to utilize `ApplyConfigurationsFromAssembly`, ensuring all new Fluent API configurations are automatically discovered.
- **Save Interception:** Preserved existing `CreatedAt`/`UpdatedAt` automation. Verified that the Global Soft Delete toggle (`DeletedAt`) is **not** applied to these new entities, as per the frozen schema requirements (Physical deletes only for Domain 3).

### DA-BC-02: Booking Entity & Configuration
Implemented the anchor entity for the entire domain.
- **Type Safety:** Used `decimal(12,2)` for `BaseAmount` and `FinalAmount` to ensure monetary precision.
- **Date Semantics:** Adhered to `DateOnly` for `CheckInDate` and `CheckOutDate`, preventing time-zone-related stay duration bugs.
- **Boundary Control:** Explicitly avoided leaking future payment, refund, or review navigations.

### DA-BC-03: Booking Status History
Established the audit trail for booking lifecycles.
- **Mapping:** Correctly mapped `OldStatus` as nullable (for initial transitions) and `NewStatus` as required.
- **Audit Logic:** Tied transitions to the optional `AdminUser` responsible for the state change.

### DA-BC-04: CRM Leads
Built the pre-booking inquiry model.
- **Funnel Isolation:** Kept the `CrmLead` entirely independent of the `Booking` entity to prevent premature conversion logic leakage.
- **Flexible Contacts:** Implemented optional "desired stay" fields (`DateOnly?`) to accommodate varying levels of lead qualification.

### DA-BC-05: CRM Notes & Assignments
Engineered the most complex relationship structures in the CRM domain.
- **Exactly-One-Parent Constraint:** Mapped `CrmNote` and `CrmAssignment` with nullable relationships to both `Booking` and `CrmLead`.
- **DB Enforcement:** Leveraged EF Core's nullable mapping to coexist with the database check constraint (`ck_crm_exactly_one_parent`), ensuring that an entry belongs to precisely one parent without using brittle polymorphic engine hacks.

### DA-BC-06: UnitOfWork Integration
Exposed the new domain to the Business Tier through the official access pattern.
- **Interface Expansion:** Updated `IUnitOfWork` to include the five new repositories.
- **Implementation:** Initialized generic `Repository<T>` instances in `UnitOfWork` pointing to the shared context.

---

## Verification Results

### Static Verification
- [x] **Build Status:** Solution builds successfully with zero errors.
- [x] **Boundary Check:** Checked for `PaymentStatus`, `ReviewId`, or `DeletedAt` fields in Domain 3 entities. None found.
- [x] **Mapping Check:** Verified snake_case column names and table names match Tier 1 SQL precisely.

### Runtime Verification (via SQLite Mock/Integration Tests)
- [x] **Model Initialization:** `AppDbContext` initializes the model without convention conflicts.
- [x] **Persistence Flow:** Successful insertion and retrieval of a `Booking` with its `StatusHistory`.
- [x] **Constraint Verification:** Confirmed that CRM notes correctly associate with a `CrmLead` and load accurately via the Repository pattern.
- [x] **UOW Resolution:** Resolved `IUnitOfWork` via DI and verified that `SaveChanges()` persists changes across different repositories within the same transaction.

---

## Ready for Tier 3 (Business Logic)
This tier is officially **CLOSED**. The data access pathways are secure, type-safe, and mapped to the frozen database contracts.
