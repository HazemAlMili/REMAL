# 0006: Booking Date Semantics vs Pricing Range Semantics

## Context & Motivation

Before making any progress on the Booking & CRM domain, it is critical to eliminate ambiguity regarding date semantics. The current Units & Availability business and API layers expect an **inclusive nightly range** for pricing calculations. However, the booking flow traditionally relies on standard hotel semantics (Check-In/Check-Out). 

Failing to explicitly freeze how booking dates translate into the availability/pricing model will lead to silent bugs, incorrect total nights count, and erroneous financial calculations later in the invoice/payment flows. 

This decision solidifies the meaning of the booking check-in/out dates and explicitly specifies how they translate to the current operational pricing range semantics used in the Units & Availability services.

## Decisions

### 1. Booking Domain Semantics
- **`check_in_date`**: The very first date of the guest's stay.
- **`check_out_date`**: The departure date. 
- **Important**: The `check_out_date` itself is **NOT a charged night** and the guest does not stay over this night.

### 2. Nights Count Formula
- The number of `nights` is calculated as the number of dates from `check_in_date` up to, but **excluding**, the `check_out_date`.

### 3. Current Units & Availability Pricing Service Semantics
- The current Units & Availability services (including pricing and availability checks) accept an **inclusive nightly range**.

### 4. Translation Rule
Whenever the Booking domain needs to retrieve pricing or check availability from the underlying Units & Availability services, it **MUST** translate the dates using this exact rule:
- `startDate` = `check_in_date`
- `endDate` = `check_out_date` minus 1 day

### 5. Boundary Rejections
The Booking domain logic **MUST** reject any requested bookings where:
- `check_out_date` <= `check_in_date`

## Examples

**Example 1: A 2-Night Stay**
- **Guest request**: Wants to check-in on **2026-06-01** and check-out on **2026-06-03**.
- **Calculated Nights**: 2 nights (staying the night of the 1st and the night of the 2nd).
- **Call to Pricing Service**: The booking layer will request pricing for the inclusive range of `2026-06-01` through `2026-06-02`.

**Example 2: A 1-Night Stay**
- **Guest request**: Wants to check-in on **2026-07-15** and check-out on **2026-07-16**.
- **Calculated Nights**: 1 night (staying the night of the 15th).
- **Call to Pricing Service**: The booking layer will request pricing for the inclusive range of `2026-07-15` through `2026-07-15`.

## Out of Scope
- Changing the `UnitAvailabilityService` or current pricing APIs.
- Implementing the booking tables or invoices.
- Adding taxes, fees, or discount calculations at this stage. 

## Definition of Done
This decision document serves as the formal freezing of these semantics. All subsequent Booking & CRM tasks must adhere to these rules without exception.
