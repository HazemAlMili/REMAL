# Kaza Booking Design System

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Source:** Extracted from `demo/src/` codebase  
**API Reference:** `../../docs/api/KAZA_BOOKING_API_Reference.md`

---

## 🎯 Scope Overview

This design system covers **three distinct applications**:

| Application                     | Routes                                     | User Type       | Purpose                              |
| ------------------------------- | ------------------------------------------ | --------------- | ------------------------------------ |
| **🌐 Landing Page / Guest App** | `/`, `/search`, `/units/*`, `/checkout`    | Public visitors | Property browsing, search, booking   |
| **👔 Admin Dashboard**          | `/dashboard/*`, `/crm`, `/bookings`, etc.  | Internal staff  | Property management, CRM, operations |
| **🏠 Owner Portal**             | `/owner-dashboard/*`, `/owner-units`, etc. | Property owners | View units, bookings, earnings       |

**Shared Components:** All three applications share the same foundational design tokens (colors, typography, shadows) but have different layouts and component usage patterns.

---

## 📋 Quick Reference: What's Used Where

### 🌐 Landing Page / Guest App

**Routes:** `/`, `/search`, `/units/{id}`, `/checkout`

**Components:**

- ✅ `UnitCard` - Property listings
- ✅ `LeadForm` - Contact/inquiry form
- ✅ `UnitGallery` - Image carousel
- ✅ `UnitBookingWidget` - Booking form
- ✅ Hero sections with video
- ✅ Glass morphism overlays
- ✅ Full footer with contact info

**Forms:**

- Lead Capture Form (public inquiries)

**Layout:**

- Transparent navbar → sticky white on scroll
- No sidebar
- Full-width hero sections
- Footer with brand + contact

---

### 👔 Admin Dashboard

**Routes:** `/dashboard`, `/crm`, `/bookings`, `/units`, `/finance`, etc.

**Components:**

- ✅ `KpiCardSkeleton` - Dashboard metrics
- ✅ `LeadCard` - CRM Kanban cards
- ✅ `BookingRow` - Booking tables
- ✅ `FinanceRow` - Financial reports
- ✅ Status badges (all types)
- ✅ Data tables with sorting/filtering
- ✅ Action buttons (confirm, cancel, edit)

**Forms:**

- Booking Confirmation Form
- Owner Payout Form
- Notification Dispatch Form

**Layout:**

- Full sidebar (collapsible)
- Top header with search + profile
- Mobile: Bottom nav + drawer
- No footer
- Gray-50 background

---

### 🏠 Owner Portal

**Routes:** `/owner-dashboard`, `/owner-units`, `/owner-bookings`, `/owner-earnings`

**Components:**

- ✅ `KpiCardSkeleton` - Earnings metrics
- ✅ `BookingRow` - Booking history (read-only)
- ✅ `UnitCard` - Owner's properties
- ✅ Calendar views
- ✅ Payout history tables
- ✅ Status badges (read-only)

**Forms:**

- None (read-only portal)

**Layout:**

- Full sidebar with "بوابة المُلاك" branding
- Mobile: Bottom nav + drawer
- No footer
- Gray-50 background
- Data scoped to owner's ID only

---

## Table of Contents

1. [Global UI States](#1-global-ui-states) - **ALL APPS**
2. [Design Tokens & Enum Mappings](#2-design-tokens--enum-mappings) - **ADMIN + OWNER**
3. [Core Component Interfaces](#3-core-component-interfaces) - **ALL APPS**
4. [Layout Architecture](#4-layout-architecture) - **ALL APPS** (Separated by app)
5. [Form Schemas](#5-form-schemas) - **ALL APPS** (Separated by app)
6. [Color System](#6-color-system) - **ALL APPS**
7. [Typography](#7-typography) - **ALL APPS**
8. [Shadow System](#8-shadow-system) - **ALL APPS**
9. [Animation System](#9-animation-system) - **ALL APPS**

---

## 1. Global UI States

**🎯 Applies to:** ALL APPS (Landing Page, Admin Dashboard, Owner Portal)

The source code implements a 4-state UI pattern for handling API responses.

### API Response Envelope

**Source:** `../../docs/api/KAZA_BOOKING_API_Reference.md`

All API responses follow this unified envelope structure:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string | null;
  errors: string[] | null;
  pagination: PaginationMeta | null;
}

interface PaginationMeta {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

**Note:** `pagination` is `null` for single-object responses.

### UI State Types

**Implementation Pattern from Source Code:**

```typescript
// Loading State - Show skeletons/spinners
interface LoadingState {
  status: "loading";
  data: null;
  error: null;
}

// Success State - Map response.data
interface SuccessState<T> {
  status: "success";
  data: T;
  error: null;
  pagination?: PaginationMeta;
}

// Empty State - Handle empty arrays or null data
interface EmptyState {
  status: "empty";
  data: null;
  error: null;
}

// Error State - Map response.errors array
interface ErrorState {
  status: "error";
  data: null;
  error: {
    message: string;
    errors: string[];
  };
}
```

### Loading State Implementation

**Skeleton Components from Source:** `demo/src/components/ui/Skeleton.tsx`

```tsx
// Base shimmer skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[length:200%_100%] animate-shimmer",
        "bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100",
        className,
      )}
    />
  );
}

// Unit Card Skeleton (matches UnitCard layout)
export function UnitCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[1.5rem] overflow-hidden bg-white border border-gray-100">
      <Skeleton className="w-full aspect-[4/3] rounded-none rounded-t-[1.5rem]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <Skeleton className="h-4 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Grid of property card skeletons
export function UnitGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <UnitCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Admin KPI card skeleton
export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-5">
        <Skeleton className="w-11 h-11 rounded-2xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24 rounded-lg mb-2" />
      <Skeleton className="h-3 w-16 rounded-lg mb-4" />
      <Skeleton className="h-7 w-32 rounded-lg" />
    </div>
  );
}
```

### Success State Implementation

**Pattern from `demo/src/app/(guest)/search/page.tsx`:**

```tsx
// Data mapping pattern
{
  MOCK_UNITS.map((unit) => (
    <Link href={`/units/${unit.id}`} key={unit.id} className="block group">
      <Card padding="none" className="overflow-hidden...">
        <img src={unit.images[0]} alt={unit.name} />
        <h3 className="text-lg font-black text-brand-950">{unit.name}</h3>
        <span className="text-xl font-black text-brand-950">
          EGP {unit.basePrice.toLocaleString()}
        </span>
      </Card>
    </Link>
  ));
}
```

### Empty State Implementation

**Pattern (should be implemented):**

```tsx
// Empty state handling - check if data array is empty
if (!data || (Array.isArray(data) && data.length === 0)) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
      <p className="text-gray-500">جرب تعديل معايير البحث</p>
    </div>
  );
}
```

### Error State Implementation

**Pattern from source code:**

```tsx
// Error display pattern
interface ErrorDisplayProps {
  message: string;
  errors: string[];
}

function ErrorDisplay({ message, errors }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
      <h3 className="font-bold text-red-700 mb-2">{message}</h3>
      {errors.length > 0 && (
        <ul className="text-sm text-red-600 space-y-1">
          {errors.map((err, idx) => (
            <li key={idx}>• {err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 2. Design Tokens & Enum Mappings

**🎯 Applies to:** ADMIN DASHBOARD + OWNER PORTAL (Status badges for bookings, leads, payments, etc.)

**Source:** `demo/docs/02_STATUS_ENUMS_COLOR_TOKENS.md`, `demo/src/components/ui/Badge.tsx`

### Badge Component Variants

```tsx
// From demo/src/components/ui/Badge.tsx
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger" | "neutral";
}

const variants = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
};
```

### Booking Status Color Mapping

| Status     | Enum Value  | Badge Variant | Tailwind Classes                                    |
| ---------- | ----------- | ------------- | --------------------------------------------------- |
| Pending    | `Pending`   | `warning`     | `bg-amber-50 text-amber-700 border-amber-200`       |
| Confirmed  | `Confirmed` | `info`        | `bg-blue-50 text-blue-700 border-blue-200`          |
| Check-In   | `CheckIn`   | `success`     | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| Completed  | `Completed` | `neutral`     | `bg-gray-50 text-gray-700 border-gray-200`          |
| Cancelled  | `Cancelled` | `danger`      | `bg-red-50 text-red-700 border-red-200`             |
| Left Early | `LeftEarly` | `warning`     | `bg-orange-50 text-orange-700 border-orange-200`    |

```typescript
// Enum definition
export enum BookingStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  CHECK_IN = "CheckIn",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
  LEFT_EARLY = "LeftEarly",
}

// Color token mapping
export const BOOKING_STATUS_COLORS: Record<
  BookingStatus,
  { badge: BadgeProps["variant"] }
> = {
  [BookingStatus.PENDING]: { badge: "warning" },
  [BookingStatus.CONFIRMED]: { badge: "info" },
  [BookingStatus.CHECK_IN]: { badge: "success" },
  [BookingStatus.COMPLETED]: { badge: "neutral" },
  [BookingStatus.CANCELLED]: { badge: "danger" },
  [BookingStatus.LEFT_EARLY]: { badge: "warning" },
};

// Arabic labels
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "قيد الانتظار",
  [BookingStatus.CONFIRMED]: "مؤكد",
  [BookingStatus.CHECK_IN]: "تم الوصول",
  [BookingStatus.COMPLETED]: "مكتمل",
  [BookingStatus.CANCELLED]: "ملغي",
  [BookingStatus.LEFT_EARLY]: "مغادرة مبكرة",
};
```

### CRM Lead Status Color Mapping

| Status       | Enum Value    | Badge Variant | Arabic Label |
| ------------ | ------------- | ------------- | ------------ |
| Prospecting  | `Prospecting` | `info`        | استفسار جديد |
| Relevant     | `Relevant`    | `info`        | مهتم         |
| No Answer    | `NoAnswer`    | `neutral`     | لا يرد       |
| Not Relevant | `NotRelevant` | `danger`      | غير مهتم     |
| Booked       | `Booked`      | `warning`     | محجوز        |
| Confirmed    | `Confirmed`   | `success`     | مؤكد         |

```typescript
export enum LeadStatus {
  PROSPECTING = "Prospecting",
  RELEVANT = "Relevant",
  NO_ANSWER = "NoAnswer",
  NOT_RELEVANT = "NotRelevant",
  BOOKED = "Booked",
  CONFIRMED = "Confirmed",
}
```

### Unit Activity Status

| isActive  | Status   | Badge Variant | Arabic Label |
| --------- | -------- | ------------- | ------------ |
| `true`    | Active   | `success`     | نشط          |
| `false`   | Inactive | `neutral`     | غير نشط      |
| (blocked) | Blocked  | `danger`      | محظور        |

```typescript
export enum UnitStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  BLOCKED = "Blocked",
}

// Helper to convert boolean to status
export function mapIsActiveToStatus(isActive: boolean): UnitStatus {
  return isActive ? UnitStatus.ACTIVE : UnitStatus.INACTIVE;
}
```

### Payment Status Color Mapping

| Status    | Enum Value  | Badge Variant | Arabic Label |
| --------- | ----------- | ------------- | ------------ |
| Pending   | `Pending`   | `warning`     | قيد الانتظار |
| Paid      | `Paid`      | `success`     | مدفوع        |
| Failed    | `Failed`    | `danger`      | فشل          |
| Cancelled | `Cancelled` | `neutral`     | ملغي         |

### Invoice Status Color Mapping

| Status         | Enum Value      | Badge Variant | Arabic Label |
| -------------- | --------------- | ------------- | ------------ |
| Draft          | `Draft`         | `neutral`     | مسودة        |
| Issued         | `Issued`        | `info`        | صادر         |
| Paid           | `Paid`          | `success`     | مدفوع        |
| Partially Paid | `PartiallyPaid` | `warning`     | مدفوع جزئياً |
| Cancelled      | `Cancelled`     | `danger`      | ملغي         |

### Payout Status Color Mapping

| Status    | Enum Value  | Badge Variant | Arabic Label |
| --------- | ----------- | ------------- | ------------ |
| Pending   | `Pending`   | `warning`     | قيد الانتظار |
| Scheduled | `Scheduled` | `info`        | مجدول        |
| Paid      | `Paid`      | `success`     | مدفوع        |
| Cancelled | `Cancelled` | `neutral`     | ملغي         |

### Review Status Color Mapping

| Status    | Enum Value  | Badge Variant | Arabic Label |
| --------- | ----------- | ------------- | ------------ |
| Pending   | `Pending`   | `warning`     | قيد المراجعة |
| Published | `Published` | `success`     | منشور        |
| Rejected  | `Rejected`  | `danger`      | مرفوض        |
| Hidden    | `Hidden`    | `neutral`     | مخفي         |

### Notification Status Color Mapping

| Status    | Enum Value  | Badge Variant |
| --------- | ----------- | ------------- |
| Pending   | `Pending`   | `neutral`     |
| Queued    | `Queued`    | `info`        |
| Sent      | `Sent`      | `info`        |
| Delivered | `Delivered` | `success`     |
| Failed    | `Failed`    | `danger`      |
| Cancelled | `Cancelled` | `neutral`     |
| Read      | `Read`      | `neutral`     |

### Booking Source Labels

| Source     | Enum Value  | Arabic Label      |
| ---------- | ----------- | ----------------- |
| Website    | `Website`   | الموقع الإلكتروني |
| App        | `App`       | التطبيق           |
| WhatsApp   | `WhatsApp`  | واتساب            |
| Phone Call | `PhoneCall` | مكالمة هاتفية     |
| Instagram  | `Instagram` | إنستجرام          |
| Referral   | `Referral`  | إحالة             |
| Checkout   | `Checkout`  | صفحة الدفع        |

---

## 3. Core Component Interfaces

**🎯 Applies to:** ALL APPS (Different components used in each app)

**Source:** `demo/docs/03_CORE_COMPONENT_PROPS.md`, `demo/src/components/ui/*.tsx`

### Entity Types (API Keys)

**Source:** `../../docs/api/KAZA_BOOKING_API_Reference.md`

```typescript
// Unit Entity - Maps to GET /api/units/{id} response
interface Unit {
  id: string;
  ownerId: string;
  projectId: string;
  name: string;
  description: string;
  address: string;
  unitType: string; // "villa" | "chalet" | "studio"
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  basePricePerNight: number;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Unit Image Entity - Maps to GET /api/units/{unitId}/images
interface UnitImage {
  id: string;
  unitId: string;
  fileKey: string; // ⚠️ CRITICAL: API uses fileKey, not imageUrl
  isCover: boolean;
  displayOrder: number;
  createdAt: string;
}

// Amenity Entity - Maps to GET /api/amenities
interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

// Project Entity - Maps to GET /api/projects/{id}
interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking Entity - Maps to GET /api/internal/bookings/{id}
interface Booking {
  id: string;
  clientId: string;
  unitId: string;
  ownerId: string;
  assignedAdminUserId: string | null;
  bookingStatus: string; // "Pending" | "Confirmed" | "CheckIn" | "Completed" | "Cancelled" | "LeftEarly"
  checkInDate: string; // ISO 8601 date
  checkOutDate: string; // ISO 8601 date
  guestCount: number;
  baseAmount: number;
  finalAmount: number;
  source: string;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// CRM Lead Entity - Maps to GET /api/internal/crm/leads/{id}
interface CRMLead {
  id: string;
  clientId: string | null;
  targetUnitId: string | null;
  assignedAdminUserId: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  desiredCheckInDate: string | null;
  desiredCheckOutDate: string | null;
  guestCount: number | null;
  leadStatus: string; // "Prospecting" | "Relevant" | "NoAnswer" | "NotRelevant" | "Booked" | "Confirmed"
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Owner Entity - Maps to GET /api/owners/{id}
interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  commissionRate: number; // Decimal, e.g., 20.00 for 20%
  notes: string | null;
  status: string; // "active" | "inactive"
  createdAt: string;
  updatedAt: string;
}

// Client Entity - Maps to GET /api/clients/{id}
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment Entity - Maps to GET /api/internal/payments/{id}
interface Payment {
  id: string;
  bookingId: string;
  invoiceId: string | null;
  paymentStatus: string; // "Pending" | "Paid" | "Failed" | "Cancelled"
  paymentMethod: string; // "InstaPay" | "VodafoneCash" | "Cash" | "BankTransfer"
  amount: number;
  referenceNumber: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Invoice Entity - Maps to GET /api/internal/invoices/{id}
interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  invoiceStatus: string; // "Draft" | "Issued" | "Cancelled"
  subtotalAmount: number;
  totalAmount: number;
  issuedAt: string | null;
  dueDate: string;
  notes: string | null;
  items: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  lineType: string; // "Accommodation" | "ManualAdjustment"
  description: string;
  quantity: number;
  unitAmount: number;
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
}

// Owner Payout Entity - Maps to GET /api/internal/owner-payouts/by-booking/{bookingId}
interface OwnerPayout {
  id: string;
  bookingId: string;
  ownerId: string;
  payoutStatus: string; // "Pending" | "Scheduled" | "Paid" | "Cancelled"
  grossBookingAmount: number;
  commissionRate: number;
  commissionAmount: number;
  payoutAmount: number;
  scheduledAt: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Review Entity - Maps to GET /api/client/reviews/by-booking/{bookingId}
interface Review {
  id: string;
  bookingId: string;
  unitId: string;
  clientId: string;
  ownerId: string;
  rating: number; // 1-5
  title: string;
  comment: string | null;
  reviewStatus: string; // "Pending" | "Published" | "Rejected" | "Hidden"
  submittedAt: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### UnitCardProps

**🎯 Used in:** LANDING PAGE (Search results, home page featured units)

**Implementation from `demo/src/app/(guest)/page.tsx`:**

```tsx
// Unit Card implementation pattern from source
interface UnitCardProps {
  // Core unit data
  id: string;
  unitName: string;
  unitType: UnitType;
  projectId: string;
  projectName?: string; // Optional joined data

  // Pricing - Uses basePricePerNight (API key)
  basePricePerNight: number;

  // Capacity
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;

  // Media - Uses fileKey where isCover: true
  coverImage: string | null;
  images: string[]; // Array of fileKeys

  // Status
  isActive: boolean;

  // Optional metadata
  rating?: number;
  reviewsCount?: number;

  // Interaction handlers
  onClick?: () => void;
  onFavorite?: () => void;

  // Display options
  showPrice?: boolean;
  showCapacity?: boolean;
  compact?: boolean;
  className?: string;
}

// Usage from source code
function UnitCard({ unit }: { unit: UnitCardProps }) {
  return (
    <Link href={`/units/${unit.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-gray-100">
        <img src={unit.images[0]} className="w-full h-full object-cover" />
        <Badge className="bg-brand-950/80 backdrop-blur-md text-white">
          فيديو فعلي متاح
        </Badge>
      </div>
      <h3 className="font-black text-lg text-brand-950">{unit.unitName}</h3>
      <span className="text-brand-950 font-black">
        EGP {unit.basePricePerNight.toLocaleString()}
      </span>
    </Link>
  );
}
```

### LeadCardProps (CRM Kanban)

**🎯 Used in:** ADMIN DASHBOARD (`/crm` page - Kanban board)

```typescript
interface LeadCardProps {
  // Core lead data
  id: string;
  leadStatus: LeadStatusValue;
  source: BookingSourceValue;

  // Client info
  clientId: string | null;
  clientName?: string; // Optional joined data
  clientPhone?: string;

  // Booking details
  desiredCheckInDate: string | null;
  desiredCheckOutDate: string | null;
  guestCount: number | null;

  // Unit info
  unitId: string | null;
  unitName?: string;
  projectName?: string;

  // Assignment
  assignedAdminUserId: string | null;
  assignedAdminName?: string;

  // Notes
  internalNotes: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Interaction handlers
  onClick?: () => void;
  onStatusChange?: (newStatus: LeadStatusValue) => void;
  onAssign?: (adminUserId: string) => void;

  // Display options
  showNotes?: boolean;
  draggable?: boolean;
  className?: string;
}
```

### BookingRowProps (DataGrid)

**🎯 Used in:** ADMIN DASHBOARD + OWNER PORTAL (Bookings tables)

**Pattern from `demo/src/app/(admin)/dashboard/page.tsx`:**

```typescript
interface BookingRowProps {
  // Core booking data
  id: string;
  bookingStatus: BookingStatusValue;
  source: BookingSourceValue;

  // Related entities
  clientId: string;
  clientName?: string;
  clientPhone?: string;

  unitId: string;
  unitName?: string;
  unitType?: UnitType;

  ownerId: string;
  ownerName?: string;

  // Dates
  desiredCheckInDate: string;
  desiredCheckOutDate: string;
  actualCheckInDate: string | null;
  actualCheckOutDate: string | null;

  // Guests
  guestCount: number;

  // Financial - Uses finalAmount (API key)
  baseAmount: number;
  finalAmount: number;

  // Assignment
  assignedAdminUserId: string | null;
  assignedAdminName?: string;

  // Notes
  internalNotes: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Interaction handlers
  onClick?: () => void;
  onStatusChange?: (newStatus: BookingStatusValue) => void;
  onEdit?: () => void;
  onCancel?: () => void;

  // Display options
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  className?: string;
}

// Usage from source
const RECENT_BOOKINGS = [
  {
    id: "b1",
    guest: "أحمد السيد",
    unit: "فيلا مارينا A1",
    unitImg: MOCK_UNITS[0].images[0],
    dates: "12 - 15 أغسطس",
    status: "warning" as const,
    statusLabel: "قيد المراجعة",
    amount: "EGP 18,000",
    phone: "01011223344",
    pax: 4,
  },
  // ...
];
```

### FinanceRowProps

**🎯 Used in:** ADMIN DASHBOARD (`/finance` page - Financial reports)

```typescript
interface FinanceRowProps {
  // Booking reference
  bookingId: string;
  bookingRef?: string;

  // Client info
  clientId: string;
  clientName?: string;

  // Unit info
  unitId: string;
  unitName?: string;

  // Owner info
  ownerId: string;
  ownerName?: string;
  commissionRate: number; // Percentage

  // Financial amounts
  baseAmount: number;
  finalAmount: number;
  commissionAmount: number; // Calculated: finalAmount * (commissionRate / 100)
  ownerNetAmount: number; // Calculated: finalAmount - commissionAmount

  // Payment info
  paymentId?: string;
  paymentStatus: PaymentStatusValue;
  paymentMethod: PaymentMethod | null;
  paidAt: string | null;

  // Invoice info
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceStatus: InvoiceStatusValue;

  // Payout info
  payoutId?: string;
  payoutStatus: PayoutStatusValue;
  payoutScheduledAt?: string | null;
  payoutPaidAt?: string | null;

  // Notes
  notes: string | null;

  // Timestamps
  createdAt: string;

  // Interaction handlers
  onClick?: () => void;
  onViewInvoice?: () => void;
  onRecordPayment?: () => void;
  onRecordPayout?: () => void;

  // Display options
  showCommissionBreakdown?: boolean;
  className?: string;
}
```

### Card Component

**🎯 Used in:** ALL APPS (Universal container component)

**Source:** `demo/src/components/ui/Card.tsx`

```tsx
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "glass";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variants = {
  default:
    "bg-surface shadow-soft hover:shadow-float border border-gray-100/50",
  glass: "glass-panel", // bg-white/70 backdrop-blur-md border border-white/40 shadow-glass
};

// Usage
<Card padding="md" variant="default">
  {children}
</Card>;
```

### Button Component

**🎯 Used in:** ALL APPS (Universal button component)

**Source:** `demo/src/components/ui/Button.tsx`

```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glass" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary:
    "bg-brand-900 text-white hover:bg-brand-800 shadow-soft hover:shadow-float",
  secondary: "bg-brand-50 text-brand-900 hover:bg-brand-100",
  ghost: "hover:bg-gray-100 text-gray-700",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
  glass:
    "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-glass",
  outline:
    "border border-gray-200 text-brand-950 hover:bg-gray-50 bg-transparent",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-lg",
  icon: "h-11 w-11",
};

// Usage
<Button variant="primary" size="lg" isLoading={false}>
  تأكيد الحجز
</Button>;
```

---

## 4. Layout Architecture

**🎯 Applies to:** ALL APPS (Each app has its own layout)

**Source:** `demo/src/app/(admin)/layout.tsx`, `demo/src/app/(owner)/layout.tsx`, `demo/src/app/(guest)/layout.tsx`

### Three Main Scopes

---

#### 1. 🌐 Landing Page / Guest App (`/`, `/search`, `/units/*`)

**Routes:** `/`, `/search`, `/projects`, `/units/{id}`, `/checkout`
**User Type:** Public visitors (unauthenticated)  
**Purpose:** Property discovery, search, booking

**Layout Structure:**

```tsx
// Transparent navbar → white sticky on scroll
// Full-width hero sections
// Footer with contact info

<div className="min-h-screen flex flex-col bg-background">
  {/* Navbar */}
  <Navbar />

  {/* Main Content */}
  <main className="flex-1 w-full overflow-hidden">{children}</main>

  {/* Footer */}
  <footer className="bg-brand-950 text-white">
    {/* Brand section */}
    {/* Quick links */}
    {/* Contact info */}
  </footer>
</div>
```

**Guest Navigation Items:**

| Tab   | Label (AR) | Route    | Description           |
| ----- | ---------- | -------- | --------------------- |
| Home  | الرئيسية   | `/`      | Hero + featured units |
| Projects | الوجهات    | `/projects` | Browse by location    |
| About | كيف نعمل   | `/about` | About the service     |

**Key Components Used:**

- `UnitCard` - Property listings
- `LeadForm` - Contact/inquiry form
- `UnitGallery` - Image carousel
- `UnitBookingWidget` - Booking form
- Hero sections with video backgrounds
- Glass morphism overlays

---

#### 2. 👔 Admin Dashboard (`/dashboard/*`)

**Routes:** `/dashboard`, `/crm`, `/bookings`, `/units`, `/finance`, etc.  
**User Type:** Internal staff (authenticated admin users)  
**Purpose:** Property management, CRM, operations, financial tracking

**Layout Structure:**

```tsx
// Sidebar: 80px (tablet) → 280px (desktop)
// Mobile: Bottom nav + hamburger drawer

<div className="flex flex-col md:flex-row h-screen bg-gray-50">
  {/* Sidebar - Desktop */}
  <aside className="hidden md:flex w-[80px] lg:w-72 bg-white border-l border-gray-200">
    {/* Logo */}
    {/* Navigation Items */}
    {/* Logout */}
  </aside>

  {/* Mobile Sticky Header */}
  <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white">
    {/* Logo + Menu Button */}
  </header>

  {/* Main Content */}
  <main className="flex-1 flex flex-col overflow-hidden pb-[68px] md:pb-0">
    {/* Top Header - Desktop Only */}
    <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md">
      {/* Search + User Profile */}
    </header>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
  </main>

  {/* Mobile Bottom Navigation */}
  <nav className="md:hidden fixed bottom-0 bg-white border-t">
    {/* 5 primary nav items */}
  </nav>
</div>
```

**Admin Navigation Items:**

| Tab       | Label (AR) | Route        | Mobile Visible | Description                 |
| --------- | ---------- | ------------ | -------------- | --------------------------- |
| Dashboard | اللوحة     | `/dashboard` | ✓              | KPIs, recent activity       |
| CRM       | CRM        | `/crm`       | ✗ (in drawer)  | Lead management Kanban      |
| Bookings  | الحجوزات   | `/bookings`  | ✓              | Booking management          |
| Units     | الوحدات    | `/units`     | ✓              | Property inventory          |
| Projects     | المشروعات    | `/projects`     | ✗ (in drawer)  | Project management         |
| Clients   | العملاء    | `/clients`   | ✓              | Customer database           |
| Owners    | الملاك     | `/owners`    | ✗ (in drawer)  | Property owner management   |
| Finance   | الماليات   | `/finance`   | ✗ (in drawer)  | Payments, invoices, payouts |
| Reviews   | المراجعات  | `/reviews`   | ✗ (in drawer)  | Review moderation           |
| Settings  | الإعدادات  | `/settings`  | ✗ (in drawer)  | System settings             |

**Role-Based Access Control:**

```typescript
// Authorization policies from API reference
enum AdminRole {
  SUPER_ADMIN = "super_admin",
  SALES = "sales",
  FINANCE = "finance",
  TECH = "tech",
}

// Permission matrix
const PERMISSIONS = {
  SUPER_ADMIN: [
    "dashboard",
    "projects",
    "units",
    "crm",
    "bookings",
    "owners",
    "clients",
    "finance",
    "reviews",
    "settings",
  ],
  SALES: ["dashboard", "crm", "units", "bookings", "clients", "reviews"],
  FINANCE: ["dashboard", "units", "bookings", "owners", "finance"],
  TECH: ["dashboard", "units", "settings"],
};
```

**Key Components Used:**

- `KpiCardSkeleton` - Dashboard metrics
- `LeadCard` - CRM Kanban cards
- `BookingRow` - Booking tables
- `FinanceRow` - Financial reports
- Data tables with sorting/filtering
- Status badges
- Action buttons (confirm, cancel, edit)

---

#### 3. 🏠 Owner Portal (`/owner-dashboard/*`)

**Routes:** `/owner-dashboard`, `/owner-units`, `/owner-bookings`, `/owner-earnings`  
**User Type:** Property owners (authenticated owners)  
**Purpose:** View their units, bookings, and earnings

**Layout Structure:**

```tsx
// Sidebar: 80px (tablet) → 260px (desktop)
// Accent color branding for owner portal

<div className="flex flex-col md:flex-row h-screen bg-[#F7F7F9]">
  {/* Sidebar */}
  <aside className="hidden md:flex w-[80px] lg:w-[260px] bg-white border-l border-gray-100">
    {/* Logo + "بوابة المُلاك" badge */}
    {/* Navigation */}
    {/* Profile + Logout */}
  </aside>

  {/* Mobile Header */}
  <header className="md:hidden flex items-center justify-between px-5 h-16 bg-white">
    {/* Logo + "مُلاك" badge */}
  </header>

  {/* Main Content */}
  <main className="flex-1 overflow-y-auto pb-[76px] md:pb-0">
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">{children}</div>
  </main>

  {/* Mobile Bottom Nav */}
  <nav className="md:hidden fixed bottom-0 bg-white border-t">
    {/* 5 nav items */}
  </nav>
</div>
```

**Owner Navigation Items:**

| Tab           | Label (AR) | Route                  | Mobile Visible | Description           |
| ------------- | ---------- | ---------------------- | -------------- | --------------------- |
| Dashboard     | الرئيسية   | `/owner-dashboard`     | ✓              | Overview, stats       |
| Units         | الوحدات    | `/owner-units`         | ✓              | My properties         |
| Bookings      | الحجوزات   | `/owner-bookings`      | ✓              | My bookings           |
| Earnings      | أرباحي     | `/owner-earnings`      | ✓              | Financial reports     |
| Calendar      | التقويم    | `/owner-calendar`      | ✗ (in drawer)  | Availability calendar |
| Notifications | الإشعارات  | `/owner-notifications` | ✗ (in drawer)  | Alerts                |

**Data Scoping:**

```typescript
// Owner can only see their own data
interface OwnerDataScopeFilter {
  ownerId: string; // Must match authenticated owner's ID
}

// Applied to all owner queries
function applyOwnerScope(context: OwnerUserContext) {
  return {
    ownerId: context.userId,
  };
}
```

**Key Components Used:**

- `KpiCardSkeleton` - Earnings metrics
- `BookingRow` - Booking history
- `UnitCard` - Owner's properties
- Calendar views
- Payout history tables
- Read-only status badges

---

### Layout Comparison

| Feature            | Landing Page       | Admin Dashboard     | Owner Portal          |
| ------------------ | ------------------ | ------------------- | --------------------- |
| **Authentication** | ❌ Public          | ✅ Required (Admin) | ✅ Required (Owner)   |
| **Sidebar**        | ❌ None            | ✅ Full sidebar     | ✅ Full sidebar       |
| **Footer**         | ✅ Full footer     | ❌ None             | ❌ None               |
| **Mobile Nav**     | Top navbar only    | Bottom nav + drawer | Bottom nav + drawer   |
| **Background**     | White/Brand        | Gray-50             | Gray-50               |
| **Branding**       | Full hero sections | Minimal             | "بوابة المُلاك" badge |
| **Data Scope**     | Public units only  | All data            | Owner's data only     |

---

## 5. Form Schemas

**🎯 Applies to:** ALL APPS (Different forms in each app)

---

### 🌐 Landing Page Forms

#### Lead Capture Form (Public)

**🎯 Used in:** LANDING PAGE (`/` home page, `/units/{id}` inquiry form)  
**API Endpoint:** `POST /api/crm/leads`

**Implementation from `demo/src/components/sections/LeadForm.tsx`:**

```typescript
interface LeadCaptureForm {
  // Required - Contact info
  fullName: string;
  phoneNumber: string;

  // Optional - Email
  email?: string;

  // Required - Trip details
  desiredCheckInDate: string;
  desiredCheckOutDate: string;
  guestCount: number;

  // Optional - Preferences
  preferredProjectId?: string;
  preferredUnitType?: UnitType;
  budgetRange?: string;

  // Optional - Special requests
  notes?: string;

  // System-managed
  source: BookingSource; // Auto-detected: Website, App, etc.
  leadStatus: LeadStatus; // Defaults to 'Prospecting'
}
```

---

### 👔 Admin Dashboard Forms

#### Booking Confirmation Form

**🎯 Used in:** ADMIN DASHBOARD (`/bookings/{id}` - Confirm booking action)  
**API Endpoint:** `POST /api/internal/bookings/{id}/confirm`

```typescript
interface BookingConfirmationPayload {
  // Required - Deposit amount
  depositAmount: number;

  // Required - Payment method
  depositPaymentMethod: PaymentMethod;

  // Optional - Payment reference
  depositReferenceNumber?: string;

  // Optional - Proof image
  depositProofFileKey?: string;

  // Optional - Internal notes
  internalNotes?: string;
}
```

#### Owner Payout Form

**🎯 Used in:** ADMIN DASHBOARD (`/finance` - Record payout to owner)  
**API Endpoint:** `POST /api/internal/owner-payouts`

```typescript
interface OwnerPayoutForm {
  // Required - Booking reference
  bookingId: string;

  // Required - Owner reference
  ownerId: string;

  // Required - Payout amount
  amount: number;

  // Required - Payment method
  paymentMethod: PaymentMethod;

  // Optional - Reference number (Instapay/Vodafone Cash ref)
  referenceNumber?: string;

  // Optional - Proof image (file upload)
  proofImageFileKey?: string;

  // Optional - Notes
  notes?: string;

  // System-managed
  payoutStatus: PayoutStatus;
  paidAt?: string;
}

// Form submission payload
interface CreatePayoutPayload {
  bookingId: string;
  ownerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  proofImageFileKey?: string;
  notes?: string;
}
```

#### Notification Dispatch Form

**🎯 Used in:** ADMIN DASHBOARD (`/notifications` - Send notification)  
**API Endpoint:** `POST /api/internal/notifications/{recipientType}/{recipientId}`

```typescript
interface NotificationDispatchForm {
  // Required - Template ID
  templateId: string;

  // Required - Channel
  channel: NotificationChannel; // 'in_app' | 'email' | 'sms' | 'whatsapp'

  // Required - Title
  title: string;

  // Required - Body content
  body: string;

  // Optional - Template variables
  templateVariables?: Record<string, string>;

  // Optional - Scheduled time
  scheduledAt?: string; // ISO 8601

  // Recipient is part of the URL path
  // POST /api/internal/notifications/admins/{adminUserId}
  // POST /api/internal/notifications/clients/{clientId}
  // POST /api/internal/notifications/owners/{ownerId}
}

enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  SMS = "sms",
  WHATSAPP = "whatsapp",
}
```

---

### 🏠 Owner Portal Forms

**Note:** Owner portal is primarily read-only. Owners cannot create/edit bookings or units directly. They can only view their data and potentially update their profile settings.

---

## 6. Color System

**🎯 Applies to:** ALL APPS (Shared design tokens)

**Source:** `demo/tailwind.config.ts`

### Brand Colors

```typescript
colors: {
  brand: {
    50: '#f2f5f8',   // Very light blue-gray
    100: '#e1e8f0',
    200: '#c8d7e4',
    300: '#a3bed1',
    400: '#789ebb',
    500: '#5a82a2',  // Sea glass / Muted turquoise
    600: '#466785',
    700: '#39536d',
    800: '#32465b',
    900: '#1b2a3a',  // Deep navy / midnight blue (primary)
    950: '#111a25',  // Almost black
  },
  accent: {
    50: '#fcfaf6',
    100: '#f8f4eb',
    200: '#f0e5d1',
    300: '#e4d1ae',
    400: '#d5b785',
    500: '#c9a162',  // Sand / Warm beige / Muted gold
    600: '#bd8b4a',
    700: '#9d6d39',
    800: '#805934',
    900: '#67482d',
    950: '#382515',
  },
  background: '#FAFBFD',
  surface: '#FFFFFF',
  foreground: '#1b2a3a',
}
```

### Semantic Color Usage

| Purpose              | Color Class                         | Usage                             |
| -------------------- | ----------------------------------- | --------------------------------- |
| Primary Background   | `bg-brand-900`                      | Primary buttons, active states    |
| Secondary Background | `bg-brand-50`                       | Hover states, cards               |
| Surface Background   | `bg-surface`                        | Cards, panels                     |
| Page Background      | `bg-background`                     | Page backgrounds                  |
| Text Primary         | `text-brand-950`                    | Headings, important text          |
| Text Secondary       | `text-gray-600`                     | Body text                         |
| Text Muted           | `text-gray-400`                     | Labels, captions                  |
| Success              | `text-emerald-700`, `bg-emerald-50` | Success states                    |
| Warning              | `text-amber-700`, `bg{}             |
| -amber-50`           | Warning states                      |
| Danger               | `text-red-700`, `bg-red-50`         | Error states, destructive actions |
| Info                 | `text-blue-700`, `bg-blue-50`       | Information states                |

---

## 7. Typography

**🎯 Applies to:** ALL APPS (Shared typography system)

**Source:** `demo/tailwind.config.ts`, `demo/src/app/layout.tsx`

### Font Family

```typescript
fontFamily: {
  sans: ['var(--font-cairo)', 'ui-sans-serif', 'system-ui'],
}
```

The application uses **Cairo** font for Arabic text support.

### Font Weight Scale

| Weight | Class            | Usage                     |
| ------ | ---------------- | ------------------------- |
| 400    | `font-normal`    | Body text                 |
| 500    | `font-medium`    | Emphasized body           |
| 600    | `font-semibold`  | Subheadings               |
| 700    | `font-bold`      | Labels, buttons           |
| 800    | `font-extrabold` | Headings                  |
| 900    | `font-black`     | Hero text, large headings |

### Heading Scale

```tsx
// Hero Heading
<h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-brand-950 tracking-tight">
  Hero Title
</h1>

// Section Heading
<h2 className="text-2xl md:text-3xl font-black text-brand-950">
  Section Title
</h2>

// Card Heading
<h3 className="text-lg font-black text-brand-950">
  Card Title
</h3>

// Small Heading
<h4 className="text-base font-bold text-brand-950">
  Small Title
</h4>
```

### Text Utilities

```tsx
// Labels
<span className="text-xs font-bold uppercase tracking-widest text-gray-400">
  LABEL
</span>

// Caption
<span className="text-[10px] font-bold text-gray-500">
  Caption text
</span>

// Body
<p className="text-sm md:text-base text-gray-600 font-medium">
  Body text
</p>
```

---

## 8. Shadow System

**🎯 Applies to:** ALL APPS (Shared shadow tokens)

**Source:** `demo/tailwind.config.ts`

### Shadow Tokens

```typescript
boxShadow: {
  'soft': '0 4px 20px -2px rgba(0,0,0,0.03)',
  'float': '0 10px 40px -5px rgba(0,0,0,0.06)',
  'premium': '0 20px 40px -10px rgba(0,0,0,0.08)',
  'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
}
```

### Shadow Usage

| Shadow           | Usage                        |
| ---------------- | ---------------------------- |
| `shadow-soft`    | Cards, buttons default state |
| `shadow-float`   | Hover states, elevated cards |
| `shadow-premium` | Hero elements, modals        |
| `shadow-glass`   | Glass morphism components    |
| `shadow-sm`      | Subtle elements, badges      |

### Glass Panel Utilities

```css
/* From demo/src/app/globals.css */
.glass-panel {
  @apply bg-white/70 backdrop-blur-md border border-white/40 shadow-glass;
}

.glass-panel-dark {
  @apply bg-black/40 backdrop-blur-md border border-white/10 shadow-glass;
}
```

---

## 9. Animation System

**🎯 Applies to:** ALL APPS (Shared animation tokens)

**Source:** `demo/tailwind.config.ts`, `demo/src/app/globals.css`

### Keyframe Animations

```typescript
keyframes: {
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'slide-up': {
    '0%': { opacity: '0', transform: 'translateY(16px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
}
```

### Animation Classes

```typescript
animation: {
  shimmer: 'shimmer 1.8s ease-in-out infinite',
  'fade-in': 'fade-in 0.4s ease forwards',
  'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
}
```

### Framer Motion Patterns

**From source code implementation:**

```tsx
// Staggered container animation
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Fade in up animation
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

// Usage
<motion.div initial="hidden" animate="visible" variants={staggerContainer}>
  <motion.div variants={fadeInUp}>Item 1</motion.div>
  <motion.div variants={fadeInUp}>Item 2</motion.div>
</motion.div>;
```

### Mobile Drawer Animation

```tsx
// Bottom sheet / Side drawer
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 200 }}
  className="fixed bottom-0 rounded-t-3xl bg-white"
>
  {children}
</motion.div>
```

---

## 10. Spacing & Layout

### Container Widths

```tsx
// Page container
<div className="container mx-auto px-6 max-w-7xl">

// Content container
<div className="max-w-6xl mx-auto">

// Narrow content
<div className="max-w-4xl mx-auto">

// Wide content
<div className="max-w-[1400px] mx-auto">
```

### Responsive Breakpoints

| Breakpoint | Min Width | Usage                  |
| ---------- | --------- | ---------------------- |
| `sm`       | 640px     | Small phones → tablets |
| `md`       | 768px     | Tablet layout          |
| `lg`       | 1024px    | Desktop layout         |
| `xl`       | 1280px    | Large desktop          |
| `2xl`      | 1536px    | Extra large screens    |

### Card Spacing

```tsx
// Card padding variants
const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

// Grid gaps
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Stack spacing
<div className="space-y-6">
```

---

## 11. Border Radius System

### Radius Scale

| Radius | Class              | Usage                   |
| ------ | ------------------ | ----------------------- |
| Small  | `rounded-lg`       | Badges, small elements  |
| Medium | `rounded-xl`       | Buttons, inputs         |
| Large  | `rounded-2xl`      | Cards, modals           |
| XL     | `rounded-3xl`      | Large cards, containers |
| 2XL    | `rounded-[1.5rem]` | Featured cards          |
| 3XL    | `rounded-[2rem]`   | Hero sections           |
| Full   | `rounded-full`     | Avatars, pills, icons   |

### Example Usage

```tsx
// Card with large radius
<Card className="rounded-2xl md:rounded-[1.5rem]">

// Avatar
<div className="w-10 h-10 rounded-full">

// Badge
<Badge className="rounded-full">

// Input
<input className="rounded-xl" />

// Button
<Button className="rounded-2xl">
```

---

## 12. Icon System

**Library:** `lucide-react`

### Common Icons

| Icon      | Component         | Usage            |
| --------- | ----------------- | ---------------- |
| Dashboard | `LayoutDashboard` | Dashboard nav    |
| CRM       | `KanbanSquare`    | CRM nav          |
| Calendar  | `CalendarDays`    | Bookings nav     |
| Building  | `Building2`       | Units nav        |
| Map Pin   | `MapPinned`       | Projects nav        |
| Users     | `UsersRound`      | Clients nav      |
| User      | `UserRound`       | Owners nav       |
| Wallet    | `Wallet`          | Finance nav      |
| Star      | `Star`            | Reviews nav      |
| Settings  | `Settings`        | Settings nav     |
| Logout    | `LogOut`          | Logout button    |
| Search    | `Search`          | Search inputs    |
| Bell      | `Bell`            | Notifications    |
| Arrow     | `ArrowUpRight`    | External links   |
| Check     | `Check`           | Confirmation     |
| X         | `X`               | Close, cancel    |
| Menu      | `Menu`            | Mobile menu      |
| Video     | `Video`           | Video feature    |
| Shield    | `ShieldCheck`     | Trust indicators |

### Icon Sizing

```tsx
// Small icon (inline with text)
<Icon className="w-4 h-4" />

// Medium icon (buttons, nav)
<Icon className="w-5 h-5" />

// Large icon (hero, features)
<Icon className="w-6 h-6" />
```

---

## 13. API Property Mismatches

This section documents properties found in the source code that do not match the API reference or require special handling.

### Unit Card - Mock Data vs API

| Mock Data Property | API Property          | Status                                |
| ------------------ | --------------------- | ------------------------------------- |
| `name`             | `unitName`            | ⚠️ Mismatch - Use `unitName`          |
| `type`             | `unitType`            | ⚠️ Mismatch - Use `unitType`          |
| `basePrice`        | `basePricePerNight`   | ⚠️ Mismatch - Use `basePricePerNight` |
| `capacity`         | `maxGuests`           | ⚠️ Mismatch - Use `maxGuests`         |
| `images[]`         | `UnitImage.fileKey`   | ✅ Correct - Use `fileKey`            |
| `rating`           | Computed from reviews | ✅ Correct - Joined data              |

### Booking - Status Mapping

| Mock Status | API Status                             | Badge Variant                |
| ----------- | -------------------------------------- | ---------------------------- |
| `booked`    | `Booked` (Lead) or `Pending` (Booking) | ⚠️ Clarify - Lead vs Booking |
| `confirmed` | `Confirmed`                            | ✅ Correct                   |

### Owner - Commission Rate

```typescript
// Mock data uses integer percentage
commissionRate: 20;

// API returns decimal
commissionRate: 20.0; // Decimal type

// Calculations should handle both
const commissionAmount = finalAmount * (commissionRate / 100);
```

---

## 14. Component Examples

### Status Badge Component

```tsx
import { Badge, BadgeProps } from "@/components/ui/Badge";

interface StatusBadgeProps<T extends string> {
  status: T;
  colorMap: Record<T, { badge: BadgeProps["variant"] }>;
  labelMap: Record<T, string>;
  className?: string;
}

export function StatusBadge<T extends string>({
  status,
  colorMap,
  labelMap,
  className,
}: StatusBadgeProps<T>) {
  const config = colorMap[status];
  const label = labelMap[status];

  return (
    <Badge variant={config.badge} className={className}>
      {label}
    </Badge>
  );
}

// Usage
<StatusBadge
  status={booking.bookingStatus}
  colorMap={BOOKING_STATUS_COLORS}
  labelMap={BOOKING_STATUS_LABELS}
/>;
```

### Unit Card Component

```tsx
interface UnitCardProps {
  unit: {
    id: string;
    unitName: string;
    unitType: UnitType;
    basePricePerNight: number;
    images: string[];
    rating?: number;
    projectName?: string;
  };
}

function UnitCard({ unit }: UnitCardProps) {
  return (
    <Link href={`/units/${unit.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-gray-100">
        <img
          src={unit.images[0]}
          alt={unit.unitName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <Badge className="absolute top-4 left-4 bg-brand-950/80 backdrop-blur-md text-white">
          فيديو فعلي متاح
        </Badge>
      </div>

      <div className="px-1 space-y-1 mt-5">
        <h3 className="font-black text-lg text-brand-950">{unit.unitName}</h3>
        <p className="text-gray-400 text-xs font-bold">{unit.unitType}</p>
        <div className="pt-2">
          <span className="text-brand-950 font-black text-lg">
            EGP {unit.basePricePerNight.toLocaleString()}
          </span>
          <span className="text-gray-400 text-xs font-bold"> / ليلة</span>
        </div>
      </div>
    </Link>
  );
}
```

### Booking Row Component (Desktop Table)

```tsx
function BookingRow({ booking }: { booking: BookingRowProps }) {
  return (
    <tr
      onClick={() => onSelect(booking)}
      className="hover:bg-brand-50/50 transition-colors cursor-pointer group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black">
            {booking.clientName?.charAt(0)}
          </div>
          <span className="font-bold text-gray-900">{booking.clientName}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{booking.unitName}</td>
      <td className="px-6 py-4 text-xs text-gray-500">
        {booking.desiredCheckInDate}
      </td>
      <td className="px-6 py-4">
        <StatusBadge
          status={booking.bookingStatus}
          colorMap={BOOKING_STATUS_COLORS}
          labelMap={BOOKING_STATUS_LABELS}
        />
      </td>
      <td className="px-6 py-4 font-black text-brand-950">
        EGP {booking.finalAmount.toLocaleString()}
      </td>
    </tr>
  );
}
```

---

## 15. Utility Functions

### Currency Formatting

```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Usage
formatCurrency(18000); // "EGP 18,000"
```

### Date Formatting

```typescript
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function formatDate(isoDate: string): string {
  return format(new Date(isoDate), "d MMMM yyyy", { locale: ar });
}

export function formatDateShort(isoDate: string): string {
  return format(new Date(isoDate), "d MMM", { locale: ar });
}

// Usage
formatDate("2026-07-20"); // "20 يوليو 2026"
```

### Nights Calculation

```typescript
export function calculateNights(
  checkInDate: string,
  checkOutDate: string,
): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

### Commission Calculation

```typescript
export function calculateCommission(
  amount: number,
  commissionRate: number,
): number {
  return (amount * commissionRate) / 100;
}

export function calculateOwnerNet(
  amount: number,
  commissionRate: number,
): number {
  return amount - calculateCommission(amount, commissionRate);
}
```

### Class Name Utility

```typescript
// From demo/src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 16. Responsive Design Patterns

### Mobile-First Approach

All components should be designed mobile-first with progressive enhancement for larger screens.

```tsx
// Mobile-first responsive classes
<div
  className="
  p-4              // Mobile: 16px padding
  md:p-6           // Tablet: 24px padding
  lg:p-8           // Desktop: 32px padding
"
>
  <h1
    className="
    text-xl         // Mobile: 20px
    md:text-2xl     // Tablet: 24px
    lg:text-3xl     // Desktop: 30px
    font-black
    text-brand-950
  "
  >
    Title
  </h1>
</div>
```

### Navigation Patterns

| Screen Size           | Navigation Pattern             |
| --------------------- | ------------------------------ |
| Mobile (<768px)       | Bottom nav + Hamburger drawer  |
| Tablet (768px-1024px) | Collapsed sidebar (icons only) |
| Desktop (>1024px)     | Full sidebar with labels       |

### Grid Patterns

```tsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

// 2-column on mobile, 3 on tablet+
<div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
```

---

## 17. Accessibility Guidelines

### Color Contrast

- Text on backgrounds must meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- `brand-900` text on white backgrounds meets contrast requirements
- Gray text (`text-gray-500`, `text-gray-400`) should only be used for non-critical information

### Interactive Elements

```tsx
// Buttons must have accessible labels
<Button aria-label="تأكيد الحجز">
  <Check className="w-5 h-5" />
</Button>

// Links should describe destination
<Link href="/units/u1" aria-label="عرض تفاصيل الوحدة">
  عرض الوحدة
</Link>
```

### Focus States

```tsx
// Focus visible styles
<button className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-brand-500
  focus-visible:ring-offset-2
">
```

---

## 18. File Structure Reference

```
demo/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Admin dashboard routes
│   │   │   ├── layout.tsx    # Admin layout with sidebar
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── crm/          # CRM pages
│   │   │   ├── bookings/     # Bookings pages
│   │   │   ├── units/        # Units pages
│   │   │   ├── projects/        # Projects pages
│   │   │   ├── clients/      # Clients pages
│   │   │   ├── owners/       # Owners pages
│   │   │   ├── finance/      # Finance pages
│   │   │   ├── reviews/      # Reviews pages
│   │   │   └── settings/     # Settings pages
│   │   ├── (owner)/          # Owner portal routes
│   │   │   ├── layout.tsx    # Owner layout
│   │   │   ├── owner-dashboard/
│   │   │   ├── owner-units/
│   │   │   ├── owner-bookings/
│   │   │   ├── owner-calendar/
│   │   │   ├── owner-earnings/
│   │   │   └── owner-notifications/
│   │   ├── (guest)/          # Public guest routes
│   │   │   ├── layout.tsx    # Guest layout with footer
│   │   │   ├── page.tsx      # Home page
│   │   │   ├── search/       # Search page
│   │   │   ├── checkout/     # Checkout page
│   │   │   └── units/        # Unit detail pages
│   │   ├── (client)/         # Client portal routes
│   │   ├── auth/             # Authentication pages
│   │   ├── globals.css       # Global styles
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx    # Guest navbar
│   │   │   └── BottomNav.tsx # Mobile bottom nav
│   │   ├── sections/
│   │   │   └── LeadForm.tsx  # Lead capture form
│   │   └── ui/
│   │       ├── Badge.tsx     # Status badges
│   │       ├── Button.tsx    # Button component
│   │       ├── Card.tsx      # Card container
│   │       ├── Skeleton.tsx  # Loading skeletons
│   │       ├── UnitBookingWidget.tsx
│   │       └── UnitGallery.tsx
│   └── lib/
│       ├── constants/
│       │   └── routes.ts     # Route constants
│       ├── mock-data/
│       │   └── index.ts      # Mock data (DO NOT USE IN PRODUCTION)
│       └── utils/
│           └── cn.ts         # Class name utility
├── docs/
│   ├── 01_API_RESPONSE_ENVELOPE.md
│   ├── 02_STATUS_ENUMS_COLOR_TOKENS.md
│   ├── 03_CORE_COMPONENT_PROPS.md
│   ├── 04_LAYOUT_ACCESS_CONTROL.md
│   └── KAZA_BOOKING_Design_System.md  # This file
└── tailwind.config.ts        # Tailwind configuration
```

---

## Changelog

| Version | Date     | Changes                                  |
| ------- | -------- | ---------------------------------------- |
| 1.0.0   | May 2026 | Initial extraction from demo source code |

---

**Document Status:** Production Ready  
**Maintained By:** Kaza Booking Frontend Team
