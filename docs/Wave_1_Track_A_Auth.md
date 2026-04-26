# Wave 1 — Auth Flows + UI Component Library
## Rental Platform Frontend — Complete Ticket Pack
**Wave Number:** 1
**Wave Name:** Auth Flows + UI Component Library
**Total Tickets:** 16
**Estimated Days (1 dev):** 5
**Parallel Tracks:** Yes — Track A (Auth, 6 tickets) and Track B (UI Library, 10 tickets) run simultaneously
**Critical Path:** Yes — blocks ALL feature waves (2–7)

---

## Wave 1 Overview

Wave 1 delivers two things that every future ticket depends on:

**Track A — Auth (FE-1-AUTH-01 → 06):**
Three separate login flows (Admin / Owner / Client), client registration, middleware route protection, Axios auth wiring, and logout. After Wave 1-A, every user type can authenticate and every protected route is guarded.

**Track B — UI Component Library (FE-1-UI-01 → 10):**
The shared component library used by Waves 2–7 across all three apps. Button, Input, Select, Modal, Skeleton, Table, Badge, DatePicker, Toast notifications, EmptyState, ConfirmDialog, and the `usePermissions` hook. After Wave 1-B, every feature wave has a complete design-system-aligned toolkit.

**API Source:** All contracts in this wave are derived directly from `REMAL_API_Reference.md`.

---

## ⛔ GLOBAL RULES — ENFORCED IN EVERY TICKET

```
NO MOCK DATA — EVER:
- Do NOT use hardcoded arrays, objects, or placeholder data anywhere
- Do NOT use faker, msw, json-server, or any mock library
- Do NOT initialize state with fake data
- ALL data must come from the real API at NEXT_PUBLIC_API_URL
- If API is down → show EmptyState or Error state — never fake data

NO LOCALSTORAGE FOR TOKENS:
- Access token lives in Zustand auth store (memory only)
- Refresh token lives in HttpOnly cookie (set by server, never touched by JS)

NO INLINE STRINGS:
- Endpoints → lib/api/endpoints.ts only
- Routes → lib/constants/routes.ts only
- Statuses/roles → lib/constants/ only

ALL ENUM VALUES ARE PascalCase (per API):
- Roles: 'SuperAdmin' | 'Sales' | 'Finance' | 'Tech'
- Booking statuses: 'Prospecting' | 'Confirmed' | 'CheckIn' etc.
- Payment statuses: 'Pending' | 'Paid' | 'Failed' | 'Cancelled'
- Channels: 'Email' | 'SMS' | 'InApp'
- Sources: 'Website' | 'App' | 'WhatsApp' | 'PhoneCall' | 'Referral'
(Exception: unit types villa/chalet/studio are lowercase by API design)
```

---

## Ticket List

| # | Ticket ID | Title | Track | Priority |
|---|-----------|-------|-------|----------|
| 1 | FE-1-AUTH-01 | Build Admin Login page | A | Critical |
| 2 | FE-1-AUTH-02 | Build Owner Login page | A | Critical |
| 3 | FE-1-AUTH-03 | Build Client Login page | A | Critical |
| 4 | FE-1-AUTH-04 | Build Client Registration flow | A | Critical |
| 5 | FE-1-AUTH-05 | Wire auth store into Axios + Next.js middleware | A | Critical |
| 6 | FE-1-AUTH-06 | Build Logout flow | A | Critical |
| 7 | FE-1-UI-01 | Build Button component | B | Critical |
| 8 | FE-1-UI-02 | Build Input and Textarea components | B | Critical |
| 9 | FE-1-UI-03 | Build Select and Combobox components | B | Critical |
| 10 | FE-1-UI-04 | Build Modal and Dialog component | B | Critical |
| 11 | FE-1-UI-05 | Build Skeleton loading components | B | Critical |
| 12 | FE-1-UI-06 | Build Table component with TanStack Table | B | High |
| 13 | FE-1-UI-07 | Build Badge and StatusBadge components | B | Critical |
| 14 | FE-1-UI-08 | Build DatePicker and DateRangePicker components | B | High |
| 15 | FE-1-UI-09 | Setup Toast notifications + wire into Axios interceptor | B | Critical |
| 16 | FE-1-UI-10 | Build usePermissions hook + EmptyState + ConfirmDialog | B | Critical |

---

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TICKET ID: FE-1-AUTH-01
TITLE: Build Admin Login page
WAVE: Wave 1 — Auth Flows + UI Component Library
DOMAIN: Auth
PRIORITY: Critical
DEPENDS ON: FE-0-INFRA-01, FE-0-INFRA-03, FE-0-INFRA-04, FE-0-INFRA-05, FE-0-INFRA-07
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 1 — Walkthrough

**What is this ticket about?**
The Admin Panel has no front door yet. This ticket builds `/auth/admin/login` — the page every Sales, Finance, Tech, and SuperAdmin person opens when they start their day. It's a focused, professional login form: email + password, a submit button, an error state for wrong credentials, and a redirect to the admin dashboard on success. No "forgot password" in MVP. No social login. Clean and functional.

**Why does this ticket exist NOW (in this wave)?**
Nothing in the Admin Panel (Waves 2–5) can be built or tested without authentication. The auth store (FE-0-INFRA-05) exists, the Axios instance (FE-0-INFRA-03) exists, but neither is wired yet. This ticket provides the first real login mutation and populates the auth store for the first time with real API data.

**What does success look like?**
An admin opens `/auth/admin/login`, enters their email and password, clicks "Sign In", and lands on `/admin/dashboard`. If credentials are wrong, they see a clear inline error. The access token is in memory (Zustand), the refresh token is in the HttpOnly cookie set by the server.

---

### Section 2 — Objective

Build the Admin Login page at `/auth/admin/login` that authenticates admin users via email + password using `POST /api/auth/admin/login`, stores the returned auth state in Zustand, and redirects to the admin dashboard — so every admin role can begin using the platform.

---

### Section 3 — User-Facing Outcome

The admin user can:
- Open `/auth/admin/login` and see a clean login form
- Enter their email and password
- Click "Sign In" and be redirected to `/admin/dashboard` on success
- See an inline error message if credentials are wrong (401)
- See a field-level validation error if email format is invalid before submitting
- See the submit button show a loading spinner while the request is in flight

---

### Section 4 — In Scope

- [ ] Create route at `app/(auth)/admin/login/page.tsx`
- [ ] Create layout at `app/(auth)/layout.tsx` — centered auth layout (shared by all 3 login pages)
- [ ] Build `<AdminLoginForm>` component with React Hook Form + Zod
- [ ] Fields: `email` (type=email, required), `password` (type=password, required)
- [ ] Submit calls `POST /api/auth/admin/login`
- [ ] On success: call `useAuthStore.getState().setAuth({...})` with the response data, then `router.push(ROUTES.admin.dashboard)`
- [ ] On 401: show inline error "Invalid email or password"
- [ ] On 422: show field-level errors from `ApiError.errors[]`
- [ ] On 500/network: toast (handled by Axios interceptor — no per-form handling needed)
- [ ] Loading state: disable button + show spinner inside button during submission
- [ ] Platform logo/name shown above the form
- [ ] "Rental Platform" heading (English)
- [ ] Link to Owner login page below the form: "Are you an owner? Sign in here"
- [ ] Redirect logged-in users away from login page (if token exists, redirect to dashboard)

**Files to create:**
- `app/(auth)/layout.tsx` — shared centered auth layout
- `app/(auth)/admin/login/page.tsx` — page shell
- `components/auth/AdminLoginForm.tsx` — the form component
- `lib/api/services/auth.service.ts` — auth API service (shared by all auth tickets)
- `lib/hooks/useAuth.ts` — auth mutations hook (shared by all auth tickets)
- `lib/types/auth.types.ts` — TypeScript types for all auth API shapes

**Files to modify:**
- `lib/stores/index.ts` — verify SubjectType export (from FE-0-INFRA-05 corrections)

---

### Section 5 — Out of Scope

- Do NOT build "Forgot Password" — not in MVP
- Do NOT build "Remember Me" checkbox — refresh token handles persistence
- Do NOT build owner or client login here — FE-1-AUTH-02 and FE-1-AUTH-03
- Do NOT wire the Axios auth interceptor here — that is FE-1-AUTH-05
- Do NOT build the admin dashboard — Wave 2
- Do NOT add social login (Google, etc.) — not in scope
- Do NOT use `localStorage` to store the token — memory only (Zustand)
- Do NOT add 2FA — not in MVP
- Do NOT build the admin layout/sidebar — Wave 2 (FE-2-ADMIN-01)

---

### Section 6 — Technical Contract

#### 6a. Component Props Interface

```typescript
// components/auth/AdminLoginForm.tsx
interface AdminLoginFormProps {
  // No props — self-contained form with its own mutation
}
```

#### 6b. Hook Return Type

```typescript
// lib/hooks/useAuth.ts — adminLogin mutation
interface UseAdminLoginReturn {
  adminLogin: UseMutationResult<AuthResponse, ApiError, AdminLoginRequest>
  isLoading: boolean
}

// Full hook:
export function useAdminLogin(): UseAdminLoginReturn {
  const mutation = useMutation({
    mutationFn: (data: AdminLoginRequest) => authService.adminLogin(data),
    onSuccess: (response) => {
      useAuthStore.getState().setAuth({
        accessToken:      response.accessToken,
        expiresInSeconds: response.expiresInSeconds,
        subjectType:      response.subjectType,
        user:             response.user,
        role:             response.adminRole,
      })
    },
  })
  return { adminLogin: mutation, isLoading: mutation.isPending }
}
```

#### 6c. Zod Schema

```typescript
// Admin login — uses EMAIL (not phone)
const adminLoginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>
```

#### 6d. Key Enums / Constants Used

```typescript
// From lib/api/endpoints.ts:
endpoints.auth.adminLogin   // 'POST /api/auth/admin/login'

// From lib/constants/routes.ts:
ROUTES.auth.adminLogin      // '/auth/admin/login'
ROUTES.admin.dashboard      // '/admin/dashboard'
ROUTES.auth.ownerLogin      // '/auth/owner/login'

// From lib/stores/auth.store.ts:
useAuthStore.getState().setAuth({ ... })
```

---

### Section 7 — API Integration

#### 7a. Endpoints Used

| Method | Endpoint | Request Type | Response Type | When Called |
|---|---|---|---|---|
| POST | `/api/auth/admin/login` | `AdminLoginRequest` | `AuthResponse` | on form submit |

**Full API Contract (from REMAL_API_Reference.md):**

```typescript
// lib/types/auth.types.ts

// ── Admin Login ──
interface AdminLoginRequest {
  email:    string    // required — admin uses email, NOT phone
  password: string    // required
}

// ── Auth Response (same shape for all login endpoints) ──
interface AuthResponse {
  accessToken:      string
  expiresInSeconds: number        // 900 = 15 minutes
  subjectType:      SubjectType   // 'Admin' | 'Owner' | 'Client'
  adminRole:        AdminRole | null  // 'SuperAdmin'|'Sales'|'Finance'|'Tech'|null
  user: {
    userId:      string           // UUID — this is "userId" NOT "id"
    identifier:  string           // the email used to login
    subjectType: SubjectType
    adminRole:   AdminRole | null
  }
}

type SubjectType = 'Admin' | 'Owner' | 'Client'
type AdminRole   = 'SuperAdmin' | 'Sales' | 'Finance' | 'Tech'

// ── Auth Service ──
// lib/api/services/auth.service.ts
export const authService = {
  adminLogin: (data: AdminLoginRequest): Promise<AuthResponse> =>
    api.post(endpoints.auth.adminLogin, data),
  // ownerLogin, clientLogin, register, refresh, logout added in FE-1-AUTH-02/03/04/06
}
```

#### 7b. TanStack Query Keys

```typescript
// Login is a MUTATION — no query key needed
// No cache invalidation — login doesn't affect any existing query cache
```

#### 7c. Query Configuration

N/A — mutation only.

#### 7d. Mutation Side Effects

```typescript
// After successful login:
// 1. setAuth() with response data → Zustand auth store updated
// 2. router.push(ROUTES.admin.dashboard) → navigate to dashboard
// 3. No query invalidation needed — fresh session has no stale cache
```

#### 7e. Error Handling

| Status | Handler |
|---|---|
| 401 | Show inline form error: "Invalid email or password" — NOT a toast |
| 422 | Show field-level errors from `apiError.errors[]` — map to RHF `setError()` |
| 500+ | Axios interceptor shows toast — form just re-enables button |
| Network | Axios interceptor shows toast — form just re-enables button |

---

### Section 8 — State & Data Management Rules

| State | Where it lives | Why |
|---|---|---|
| Form values (email, password) | React Hook Form | form state |
| Inline error message | React Hook Form `formState.errors` | form validation state |
| Submit loading | React Hook Form `formState.isSubmitting` or `mutation.isPending` | form submission state |
| Access token | Zustand auth store | global auth — populated on success |
| Refresh token | HttpOnly cookie | set by backend — never touched by JS |
| Redirect after login | `router.push()` inside onSuccess | not stored anywhere |

**Rules for this ticket:**
- [x] No server data in Zustand (only auth token/user goes in auth store — that's its purpose)
- [x] No `useEffect` for data fetching
- [x] No `localStorage` for the token
- [x] No direct axios calls in the component — use `authService` via `useAdminLogin` hook

---

### Section 9 — Component & File Deliverables

#### Files to CREATE:

```
app/
  (auth)/
    layout.tsx                    ← centered auth shell (logo + card container)
    admin/
      login/
        page.tsx                  ← renders <AdminLoginForm>

components/
  auth/
    AdminLoginForm.tsx            ← RHF form with email+password fields

lib/
  api/
    services/
      auth.service.ts             ← authService.adminLogin() (+ stubs for FE-1-AUTH-02..06)
  hooks/
    useAuth.ts                    ← useAdminLogin() mutation hook (+ stubs)
  types/
    auth.types.ts                 ← AuthResponse, AdminLoginRequest, SubjectType, AdminRole, etc.
```

#### `app/(auth)/layout.tsx` structure:

```tsx
// Shared centered layout for all auth pages
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Platform logo/name */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-neutral-800">Remal</h1>
          <p className="text-neutral-500 text-sm mt-1">Property Management Platform</p>
        </div>
        {/* Auth card */}
        <div className="bg-white rounded-card shadow-card p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
```

#### `lib/types/auth.types.ts` full content:

```typescript
// All auth-related TypeScript types
// Derived from REMAL_API_Reference.md Section 1 — Auth

export type SubjectType = 'Admin' | 'Owner' | 'Client'
export type AdminRole   = 'SuperAdmin' | 'Sales' | 'Finance' | 'Tech'

// ── Login requests ──
export interface AdminLoginRequest {
  email:    string    // Admin uses EMAIL
  password: string
}

export interface PhoneLoginRequest {
  phone:    string    // Owner and Client use PHONE (not email)
  password: string
}

// ── Register request (Client only) ──
export interface ClientRegisterRequest {
  name:      string           // required
  phone:     string           // required — unique
  email?:    string           // optional — unique if provided
  password:  string           // required — min 8 chars
}

// ── The authenticated user embedded in AuthResponse ──
export interface AuthUserPayload {
  userId:      string          // UUID — field name is "userId" NOT "id"
  identifier:  string          // the email (admin) or phone (owner/client) used to login
  subjectType: SubjectType
  adminRole:   AdminRole | null
}

// ── Auth response — same shape for all login + refresh endpoints ──
export interface AuthResponse {
  accessToken:      string
  expiresInSeconds: number           // 900 = 15 minutes
  subjectType:      SubjectType      // 'Admin' | 'Owner' | 'Client'
  adminRole:        AdminRole | null // only set when subjectType = 'Admin'
  user:             AuthUserPayload
}

// ── Client register response — NOT an AuthResponse (no token!) ──
// After registering, the client must call clientLogin separately
export interface ClientProfileResponse {
  id:        string
  name:      string
  phone:     string
  email:     string | null
  isActive:  boolean
  createdAt: string
  updatedAt: string
}
```

#### Files to MODIFY:

```
lib/types/index.ts    ← add: export * from './auth.types'
```

#### Files NOT to touch:

```
lib/stores/auth.store.ts    ← FE-0-INFRA-05 owns it (corrections applied separately)
app/(auth)/owner/           ← FE-1-AUTH-02
app/(auth)/client/          ← FE-1-AUTH-03
```

---

### Section 10 — UX & Loading State Rules

| State | Required? | Behavior |
|---|---|---|
| Loading (submit) | ✓ REQUIRED | Button shows spinner + "Signing in..." text, button disabled, fields disabled |
| Error (401) | ✓ REQUIRED | Inline error below form: "Invalid email or password" — red text, no toast |
| Error (422) | ✓ REQUIRED | Field-level error under the failing field |
| Error (500/network) | ✓ REQUIRED | Axios interceptor handles toast — form re-enables, user can retry |
| Success | ✓ REQUIRED | Immediate redirect to `/admin/dashboard` — no success toast on login |
| Already logged in | ✓ REQUIRED | If `accessToken` in store → redirect to dashboard without showing form |
| Empty state | N/A | Form always shows |
| Skeleton | N/A | Login page has no data to load |

**Skeleton shape:** N/A

**Empty state:** N/A

---

### Section 11 — Verification Steps

**Setup:**
1. Wave 0 must be fully merged
2. Backend running at `NEXT_PUBLIC_API_URL`
3. Have a valid admin seed account: `email: admin@remal.com`, `password: Admin@1234` (or whatever the dev seed provides)
4. Navigate to `http://localhost:3000/auth/admin/login`

**Happy path:**
1. Page loads → expected: centered login card with email + password fields, "Sign In" button, platform name above
2. Enter valid admin email + password, click "Sign In" → expected: button shows spinner + "Signing in...", fields disabled
3. Request completes → expected: redirect to `/admin/dashboard`
4. Open DevTools → Application → Cookies → expected: `refreshToken` (or similar) cookie set as HttpOnly by server
5. Open DevTools → check `localStorage` → expected: NO token stored (only Zustand memory)
6. Inspect Zustand store in React DevTools → expected: `accessToken`, `userId`, `role` are populated

**Edge cases:**
1. Enter wrong password → expected: inline error "Invalid email or password" appears below form, no toast, form re-enables
2. Enter invalid email format (e.g., "notanemail") → expected: client-side Zod error "Please enter a valid email address" — form does NOT submit
3. Leave email empty, click submit → expected: Zod error "Email is required" (or equivalent)
4. Leave password empty, click submit → expected: Zod error "Password is required"
5. Backend returns 500 → expected: toast "Something went wrong" (from Axios interceptor), form re-enables, inline error NOT shown
6. Backend offline → expected: toast "Cannot reach the server", form re-enables
7. Navigate to `/auth/admin/login` while already logged in → expected: automatic redirect to `/admin/dashboard`

**Permission test:**
N/A — this IS the authentication page.

---

### Section 12 — Acceptance Criteria

**Functionality:**
- [ ] `POST /api/auth/admin/login` called with `{ email, password }` on submit (email field, NOT phone)
- [ ] On success: `setAuth()` called with `{ accessToken, expiresInSeconds, subjectType, user, role }`
- [ ] `user.userId` stored correctly (not `user.id`)
- [ ] On success: redirect to `ROUTES.admin.dashboard`
- [ ] On 401: inline error shown, form re-enables
- [ ] On 422: field-level errors shown via `setError()`
- [ ] Submit button disabled and shows loading state during request

**Data & State:**
- [ ] Access token stored in Zustand only — NOT in `localStorage`
- [ ] `expiresInSeconds` stored in auth store
- [ ] `subjectType: 'Admin'` stored in auth store
- [ ] No server data in Zustand (only auth state)
- [ ] No `useEffect` for data fetching

**UX States:**
- [ ] Loading state: button disabled + spinner visible
- [ ] 401 error: inline message below form (not toast)
- [ ] Already authenticated: redirected without seeing form
- [ ] No mock data anywhere in the form, the service, or the hook

**TypeScript:**
- [ ] `AuthResponse`, `AdminLoginRequest`, `SubjectType`, `AdminRole` types from `lib/types/auth.types.ts`
- [ ] `AdminRole` is `'SuperAdmin' | 'Sales' | 'Finance' | 'Tech'` (PascalCase)
- [ ] `SubjectType` is `'Admin' | 'Owner' | 'Client'` (PascalCase)
- [ ] No `any` type used
- [ ] Zero TypeScript errors

**Architecture:**
- [ ] `POST /api/auth/admin/login` called via `authService.adminLogin()` (never direct axios in component)
- [ ] Endpoint string from `endpoints.auth.adminLogin` (never inline `/api/auth/admin/login`)
- [ ] Redirect path from `ROUTES.admin.dashboard` (never inline `/admin/dashboard`)
- [ ] `app/(auth)/layout.tsx` created and shared by all auth pages

**Performance:**
- [ ] No heavy imports on the login page (no GSAP, no Mapbox, no Recharts)

**Role-based access:**
- [ ] Already-authenticated admin is redirected away from login page

---

### Section 13 — Notes for AI / Common Mistakes

**DO:**
- Use `email` field (not `phone`) for admin login — this is different from owner/client login
- Store `user.userId` in auth store — the field from the API is `userId`, not `id`
- Store `expiresInSeconds` — needed for token expiry tracking
- Store `subjectType: 'Admin'` — needed by `usePermissions` to distinguish user type
- Use `mutation.isPending` (TanStack Query v5) not `mutation.isLoading` (v4 deprecated)
- Handle 401 with `setError('root', { message: '...' })` in React Hook Form — not a toast

**DO NOT:**
- ⛔ DO NOT USE ANY MOCK DATA. No hardcoded credentials, no fake user objects for "testing", no seeded auth state. The form must call the real API.
- Do NOT use `phone` field for admin login — admin uses email. Owner and Client use phone (FE-1-AUTH-02/03)
- Do NOT store refresh token in any JS state — it's in HttpOnly cookie, backend manages it
- Do NOT use `localStorage` for the access token — Zustand memory only
- Do NOT call `router.push()` directly in the form component — call it inside `onSuccess` in the hook or the form's submit handler after the mutation resolves
- Do NOT show a success toast on login — redirect is the success feedback
- Do NOT skip the "already logged in" redirect check — without it, the back button after logout shows the form briefly
- Do NOT call the owner or client login endpoints here
- Do NOT add "remember me" — the refresh token cookie already persists the session

**WATCH OUT FOR:**
- The Axios interceptor in FE-0-INFRA-03 has TODO markers for auth wiring — that's fine for now. The `setAuth()` call happens INSIDE the `onSuccess` of the mutation, AFTER the axios call resolves. The interceptor wiring (FE-1-AUTH-05) happens in a later ticket.
- The `(auth)` route group means the URL is `/auth/admin/login`, not `/admin/auth/login` — the parentheses are invisible in the URL
- `withCredentials: true` is already set on the Axios instance (FE-0-INFRA-03) — the refresh token cookie will be set automatically by the browser after a successful login response
- React Hook Form's `formState.isSubmitting` is true only while the async `handleSubmit` function runs. Use this OR `mutation.isPending` for the loading state — not both (they can diverge)
- The `(auth)/layout.tsx` must NOT include the admin sidebar/header — those are in the admin layout (Wave 2). Auth layout is a standalone centered layout.

**REFERENCES:**
- REMAL_API_Reference.md Section 1 (Auth) — `POST /api/auth/admin/login` request/response
- lib/types/auth.types.ts (created in this ticket) — all type definitions
- FE-0-INFRA-05 — auth store `setAuth()` signature (after corrections applied)
- FE-1-AUTH-05 — will wire the access token into Axios request interceptor
- FE-1-AUTH-06 — will build the logout flow
- Related: FE-1-AUTH-02 (owner login — uses phone), FE-1-AUTH-03 (client login — uses phone)

---

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TICKET ID: FE-1-AUTH-02
TITLE: Build Owner Login page
WAVE: Wave 1 — Auth Flows + UI Component Library
DOMAIN: Auth
PRIORITY: Critical
DEPENDS ON: FE-1-AUTH-01 (for auth.service.ts, auth.types.ts, useAuth.ts, and (auth)/layout.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 1 — Walkthrough

**What is this ticket about?**
Property owners log in through a completely separate portal from admins. Their URL is `/auth/owner/login`, they use their **phone number** (not email) + password, and on success they land on `/owner/dashboard` — not the admin panel. The backend returns the same `AuthResponse` shape but with `subjectType: 'Owner'` and `adminRole: null`. This ticket builds the owner login page using the infrastructure created in FE-1-AUTH-01.

**Why does this ticket exist NOW (in this wave)?**
The Owner Portal (Wave 6) depends on authenticated owners. The auth infrastructure (service, types, hook patterns) was established in FE-1-AUTH-01 — this ticket adds to it, not rebuilds it.

**What does success look like?**
An owner opens `/auth/owner/login`, enters their phone number and password, and lands on `/owner/dashboard`. The auth store shows `subjectType: 'Owner'` and `role: null`.

---

### Section 2 — Objective

Build the Owner Login page at `/auth/owner/login` that authenticates owners via phone + password using `POST /api/auth/owner/login`, stores auth state with `subjectType: 'Owner'`, and redirects to the owner dashboard.

---

### Section 3 — User-Facing Outcome

The owner can:
- Open `/auth/owner/login` and see a login form with phone + password fields
- Enter their phone and password and be redirected to `/owner/dashboard` on success
- See a clear error if credentials are wrong
- See field validation errors before submitting

---

### Section 4 — In Scope

- [ ] Create route at `app/(auth)/owner/login/page.tsx`
- [ ] Build `<OwnerLoginForm>` component
- [ ] Fields: `phone` (type=tel, required), `password` (type=password, required)
- [ ] Submit calls `POST /api/auth/owner/login`
- [ ] On success: `setAuth({...})` with `subjectType: 'Owner'` + redirect to `ROUTES.owner.dashboard`
- [ ] On 401: inline error "Invalid phone number or password"
- [ ] Loading state on submit button
- [ ] Add `ownerLogin` function to `lib/api/services/auth.service.ts`
- [ ] Add `useOwnerLogin` hook to `lib/hooks/useAuth.ts`
- [ ] Link below form: "Are you an admin? Sign in here" → `ROUTES.auth.adminLogin`
- [ ] Redirect already-authenticated owners to `/owner/dashboard`

**Files to create:**
- `app/(auth)/owner/login/page.tsx`
- `components/auth/OwnerLoginForm.tsx`

**Files to modify:**
- `lib/api/services/auth.service.ts` — add `ownerLogin()`
- `lib/hooks/useAuth.ts` — add `useOwnerLogin()`

---

### Section 5 — Out of Scope

- Do NOT build client login here — FE-1-AUTH-03
- Do NOT build the owner dashboard — Wave 6
- Do NOT build the owner portal layout — Wave 6
- Do NOT add phone number formatting/masking — plain text input only in MVP

---

### Section 6 — Technical Contract

#### 6a. Component Props Interface

```typescript
interface OwnerLoginFormProps {
  // No props — self-contained
}
```

#### 6b. Hook Return Type

```typescript
// Added to lib/hooks/useAuth.ts:
export function useOwnerLogin() {
  const mutation = useMutation({
    mutationFn: (data: PhoneLoginRequest) => authService.ownerLogin(data),
    onSuccess: (response: AuthResponse) => {
      useAuthStore.getState().setAuth({
        accessToken:      response.accessToken,
        expiresInSeconds: response.expiresInSeconds,
        subjectType:      response.subjectType,   // 'Owner'
        user:             response.user,
        role:             response.adminRole,      // null for owners
      })
    },
  })
  return { ownerLogin: mutation, isLoading: mutation.isPending }
}
```

#### 6c. Zod Schema

```typescript
// Owner login — uses PHONE (not email)
const ownerLoginSchema = z.object({
  phone:    z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
})
```

#### 6d. Key Enums / Constants Used

```typescript
endpoints.auth.ownerLogin      // 'POST /api/auth/owner/login'
ROUTES.auth.ownerLogin         // '/auth/owner/login'
ROUTES.owner.dashboard         // '/owner/dashboard'
ROUTES.auth.adminLogin         // '/auth/admin/login' (for "admin? sign in here" link)
```

---

### Section 7 — API Integration

#### 7a. Endpoints Used

| Method | Endpoint | Request Type | Response Type | When Called |
|---|---|---|---|---|
| POST | `/api/auth/owner/login` | `PhoneLoginRequest` | `AuthResponse` | on form submit |

**Full API Contract (from REMAL_API_Reference.md):**

```typescript
// Owner login — PHONE not email
interface PhoneLoginRequest {
  phone:    string    // ← PHONE, not email. This distinguishes owner/client from admin login.
  password: string
}

// Response — same AuthResponse shape as admin login:
// subjectType = 'Owner'
// adminRole = null (owners have no admin role)
// user.identifier = the phone number used to login
```

#### 7b–7e: Same pattern as FE-1-AUTH-01. Mutation only, no query keys, 401 → inline error, 422 → field errors.

---

### Section 8 — State & Data Management Rules

Same rules as FE-1-AUTH-01. Auth state goes in Zustand. No localStorage. No server data in Zustand.

---

### Section 9 — Component & File Deliverables

#### Files to CREATE:

```
app/(auth)/owner/login/page.tsx            ← renders <OwnerLoginForm>
components/auth/OwnerLoginForm.tsx         ← phone + password form
```

#### Files to MODIFY:

```
lib/api/services/auth.service.ts           ← add ownerLogin()
lib/hooks/useAuth.ts                       ← add useOwnerLogin()
```

`auth.service.ts` additions:

```typescript
ownerLogin: (data: PhoneLoginRequest): Promise<AuthResponse> =>
  api.post(endpoints.auth.ownerLogin, data),
```

#### Files NOT to touch:

```
app/(auth)/layout.tsx                       ← FE-1-AUTH-01 owns it
components/auth/AdminLoginForm.tsx          ← FE-1-AUTH-01 owns it
```

---

### Section 10 — UX & Loading State Rules

| State | Required? | Behavior |
|---|---|---|
| Loading | ✓ REQUIRED | Button spinner + disabled |
| 401 Error | ✓ REQUIRED | Inline: "Invalid phone number or password" |
| 422 Error | ✓ REQUIRED | Field-level errors |
| Already logged in (as owner) | ✓ REQUIRED | Redirect to `/owner/dashboard` |
| Already logged in (as admin) | ✓ REQUIRED | Redirect to `/admin/dashboard` |

---

### Section 11 — Verification Steps

**Setup:** Backend running, valid owner seed account with phone+password.

**Happy path:**
1. Navigate to `/auth/owner/login` → expected: form with `Phone` and `Password` fields (NOT email)
2. Enter valid owner phone + password → expected: redirect to `/owner/dashboard`
3. Check auth store → expected: `subjectType: 'Owner'`, `role: null`

**Edge cases:**
1. Enter wrong password → inline error "Invalid phone number or password"
2. Leave phone empty → Zod error "Phone number is required"
3. Enter an email in the phone field → NO email validation error (it's a free-text phone field)
4. Navigate to owner login while logged in as admin → expected: redirect to admin dashboard

**Permission test:**
N/A.

---

### Section 12 — Acceptance Criteria

- [ ] `POST /api/auth/owner/login` called with `{ phone, password }` — NOT `{ email, password }`
- [ ] `subjectType: 'Owner'` stored in auth store after login
- [ ] `role: null` stored in auth store (owners have no admin role)
- [ ] Redirect goes to `ROUTES.owner.dashboard` (not admin dashboard)
- [ ] 401 shows inline error with phone-specific wording
- [ ] Phone field is `type="tel"`, not `type="email"`
- [ ] Already-authenticated users redirected correctly based on their `subjectType`
- [ ] No mock data anywhere

---

### Section 13 — Notes for AI / Common Mistakes

**DO NOT:**
- ⛔ NO MOCK DATA. No hardcoded phone numbers, no fake owners.
- Do NOT use `email` field — owner login uses `phone`
- Do NOT redirect to admin dashboard — owner goes to `/owner/dashboard`
- Do NOT reuse `AdminLoginForm` — build a separate `OwnerLoginForm` (different field, different wording, different redirect)
- Do NOT copy-paste and forget to change the `subjectType` check in the "already logged in" redirect logic

**WATCH OUT FOR:**
- `user.identifier` from the response will be the phone number for owners (not email). Store it correctly in auth store.
- The redirect for already-authenticated users must check `subjectType` — an admin visiting owner login should go to admin dashboard, an owner should go to owner dashboard.

**REFERENCES:**
- REMAL_API_Reference.md Section 1 — `POST /api/auth/owner/login`
- FE-1-AUTH-01 — auth service, types, hooks created there

---

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TICKET ID: FE-1-AUTH-03
TITLE: Build Client Login page
WAVE: Wave 1 — Auth Flows + UI Component Library
DOMAIN: Auth
PRIORITY: Critical
DEPENDS ON: FE-1-AUTH-01, FE-1-AUTH-04 (client register page must exist for the "register" link)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 1 — Walkthrough

**What is this ticket about?**
Clients (guests who book rentals) need their own login at `/auth/client/login`. Like owners, they use phone + password. Unlike admins and owners, they land on a client account area (`/account`) after login, not an admin panel or owner portal. The client login page is also the place where already-registered clients return after having created their account during the booking flow (FE-7-PUB-12). This ticket builds that page.

**Why does this ticket exist NOW?**
The client booking flow (Wave 7) references the login page. The auth infrastructure is ready from FE-1-AUTH-01. Building this now means Wave 7 can link to it without building it from scratch mid-wave.

**What does success look like?**
A client goes to `/auth/client/login`, enters their phone and password, and is redirected to `/account`. Auth store shows `subjectType: 'Client'`, `role: null`.

---

### Section 2 — Objective

Build the Client Login page at `/auth/client/login` that authenticates clients via phone + password using `POST /api/auth/client/login`, and redirects to the client account area.

---

### Section 3 — User-Facing Outcome

The client can:
- Open `/auth/client/login` and see a phone + password form
- Log in and be redirected to their account page
- See a link to register if they don't have an account yet
- See validation and error messages

---

### Section 4 — In Scope

- [ ] Create `app/(auth)/client/login/page.tsx`
- [ ] Build `<ClientLoginForm>` component
- [ ] Fields: `phone` (tel), `password`
- [ ] Submit calls `POST /api/auth/client/login`
- [ ] On success: `setAuth({...})` + redirect to `ROUTES.client.account`
- [ ] On 401: inline error "Invalid phone number or password"
- [ ] Link below form: "Don't have an account? Register" → `ROUTES.auth.register`
- [ ] Add `clientLogin` to auth service + `useClientLogin` hook
- [ ] Redirect already-authenticated clients to `/account`

**Files to create:**
- `app/(auth)/client/login/page.tsx`
- `components/auth/ClientLoginForm.tsx`

**Files to modify:**
- `lib/api/services/auth.service.ts` — add `clientLogin()`
- `lib/hooks/useAuth.ts` — add `useClientLogin()`

---

### Section 5 — Out of Scope

- Do NOT build the client account page — Wave 7
- Do NOT build inline registration (that's part of the booking flow — Wave 7)
- Do NOT add phone OTP or SMS verification — not in MVP

---

### Section 6 — Technical Contract

#### 6c. Zod Schema

```typescript
// Same as owner login — phone not email
const clientLoginSchema = z.object({
  phone:    z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
})
```

#### 6d. Key Enums / Constants Used

```typescript
endpoints.auth.clientLogin     // 'POST /api/auth/client/login'
ROUTES.auth.clientLogin        // '/auth/client/login'
ROUTES.client.account          // '/account'
ROUTES.auth.register           // '/auth/client/register'
```

---

### Section 7 — API Integration

| Method | Endpoint | Request Type | Response Type | When Called |
|---|---|---|---|---|
| POST | `/api/auth/client/login` | `PhoneLoginRequest` | `AuthResponse` | on form submit |

```typescript
// From REMAL_API_Reference.md:
// subjectType = 'Client', adminRole = null
// user.identifier = the phone number used to login
```

---

### Section 8–10 — (Same patterns as FE-1-AUTH-02)

State in Zustand, no localStorage, loading/error/success states as per global rules.

---

### Section 11 — Verification Steps

1. Navigate to `/auth/client/login` → phone + password fields visible
2. Valid credentials → redirect to `/account`, auth store shows `subjectType: 'Client'`, `role: null`
3. Wrong password → inline error
4. Click "Register" link → goes to `/auth/client/register`
5. Already logged-in client visits page → redirects to `/account`

---

### Section 12 — Acceptance Criteria

- [ ] `POST /api/auth/client/login` called with `{ phone, password }`
- [ ] `subjectType: 'Client'` in auth store after login
- [ ] `role: null` stored (clients have no admin role)
- [ ] Redirect to `ROUTES.client.account`
- [ ] "Register" link goes to `ROUTES.auth.register`
- [ ] 401 shows inline error
- [ ] No mock data anywhere

---

### Section 13 — Notes for AI / Common Mistakes

**DO NOT:**
- ⛔ NO MOCK DATA.
- Do NOT redirect to `/admin/dashboard` — client goes to `/account`
- Do NOT use email field — client uses phone
- Do NOT forget the "Register" link — clients often land here looking for registration

**REFERENCES:**
- REMAL_API_Reference.md Section 1 — `POST /api/auth/client/login`
- FE-1-AUTH-04 — client registration (completes the register link target)

---

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TICKET ID: FE-1-AUTH-04
TITLE: Build Client Registration flow
WAVE: Wave 1 — Auth Flows + UI Component Library
DOMAIN: Auth
PRIORITY: Critical
DEPENDS ON: FE-1-AUTH-01, FE-1-AUTH-03
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 1 — Walkthrough

**What is this ticket about?**
New clients who don't have an account can register at `/auth/client/register`. This page is the STANDALONE registration form — separate from the inline booking registration (which is built in Wave 7 as part of the booking form). The important business rule here: `POST /api/auth/client/register` does NOT return a token. It returns the client profile. After successful registration, the frontend must automatically call `POST /api/auth/client/login` to get the token and log the client in. This two-step flow is intentional in the API design.

**Why does this ticket exist NOW?**
The client login page (FE-1-AUTH-03) has a "Register" link pointing to this page. Without this page, the link goes nowhere. Also, Wave 7 references this flow for the seamless in-booking registration.

**What does success look like?**
A new client fills in name, phone, optional email, and password. They click "Create Account". The system registers them, automatically logs them in (two API calls), and redirects them to `/account`. They never see a "now log in" step.

---

### Section 2 — Objective

Build the Client Registration page at `/auth/client/register` that registers a new client via `POST /api/auth/client/register` (which returns a profile, NOT a token), then automatically calls `POST /api/auth/client/login` to authenticate, and redirects to the client account area — making registration a single seamless experience.

---

### Section 3 — User-Facing Outcome

The new client can:
- Fill in name, phone, optional email, and password
- Click "Create Account" and be automatically logged in
- Land on `/account` without any extra steps
- See field-level validation errors (min length, required, phone format)
- See an error if the phone number is already registered (422 from backend)

---

### Section 4 — In Scope

- [ ] Create `app/(auth)/client/register/page.tsx`
- [ ] Build `<ClientRegisterForm>` component
- [ ] Fields: `name` (required, min 2 chars), `phone` (required), `email` (optional), `password` (required, min 8)
- [ ] Submit calls `POST /api/auth/client/register` → then immediately calls `POST /api/auth/client/login`
- [ ] On register success + login success: `setAuth({...})` + redirect to `ROUTES.client.account`
- [ ] On 422 (phone already taken): show inline error under phone field "This phone number is already registered"
- [ ] Loading state covers both API calls (single spinner from start to finish)
- [ ] Link: "Already have an account? Sign in" → `ROUTES.auth.clientLogin`
- [ ] Add `clientRegister` to auth service + `useClientRegister` hook

**Files to create:**
- `app/(auth)/client/register/page.tsx`
- `components/auth/ClientRegisterForm.tsx`

**Files to modify:**
- `lib/api/services/auth.service.ts` — add `clientRegister()`
- `lib/hooks/useAuth.ts` — add `useClientRegister()`

---

### Section 5 — Out of Scope

- Do NOT build the inline booking registration (that's Wave 7 — FE-7-PUB-12)
- Do NOT send a verification email/SMS after registration — not in MVP
- Do NOT add password confirmation field — backend handles password rules
- Do NOT add phone number formatting or masking

---

### Section 6 — Technical Contract

#### 6a. Component Props Interface

```typescript
interface ClientRegisterFormProps {
  // No props — self-contained
  // NOTE: Wave 7 will build a SEPARATE inline version of this form
  // Do NOT add props to make this reusable there — that's a separate component
}
```

#### 6b. Hook Return Type

```typescript
// lib/hooks/useAuth.ts — useClientRegister
// This hook orchestrates TWO API calls: register → then login
export function useClientRegister() {
  const [isLoading, setIsLoading] = useState(false)

  async function register(data: ClientRegisterRequest): Promise<void> {
    setIsLoading(true)
    try {
      // Step 1: Register — returns ClientProfileResponse (NO token)
      await authService.clientRegister(data)

      // Step 2: Auto-login with the same phone+password
      const loginResponse = await authService.clientLogin({
        phone:    data.phone,
        password: data.password,
      })

      // Step 3: Populate auth store
      useAuthStore.getState().setAuth({
        accessToken:      loginResponse.accessToken,
        expiresInSeconds: loginResponse.expiresInSeconds,
        subjectType:      loginResponse.subjectType,
        user:             loginResponse.user,
        role:             loginResponse.adminRole,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading }
}
```

#### 6c. Zod Schema

```typescript
const clientRegisterSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  phone:    z.string().min(1, 'Phone number is required'),
  email:    z.string().email('Invalid email format').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>
```

#### 6d. Key Enums / Constants Used

```typescript
endpoints.auth.clientRegister  // POST /api/auth/client/register
endpoints.auth.clientLogin     // POST /api/auth/client/login (auto-called after register)
ROUTES.auth.register           // '/auth/client/register'
ROUTES.auth.clientLogin        // '/auth/client/login'
ROUTES.client.account          // '/account'
```

---

### Section 7 — API Integration

#### 7a. Endpoints Used

| Method | Endpoint | Request Type | Response Type | When Called |
|---|---|---|---|---|
| POST | `/api/auth/client/register` | `ClientRegisterRequest` | `ClientProfileResponse` | on form submit |
| POST | `/api/auth/client/login` | `PhoneLoginRequest` | `AuthResponse` | immediately after register success |

**CRITICAL API NOTE from REMAL_API_Reference.md:**
```
POST /api/auth/client/register
→ Returns ClientProfileResponse (the client's profile object)
→ Does NOT return a token
→ Frontend MUST call POST /api/auth/client/login immediately after
   to get the access token and log the user in
```

```typescript
// auth.service.ts additions:
clientRegister: (data: ClientRegisterRequest): Promise<ClientProfileResponse> =>
  api.post(endpoints.auth.clientRegister, data),
```

#### 7e. Error Handling

| Status | Handler |
|---|---|
| 422 (phone taken) | Parse `apiError.errors[]` — show under phone field: "This phone number is already registered" |
| 422 (email taken) | Parse `apiError.errors[]` — show under email field: "This email is already registered" |
| 500/network | Axios interceptor toast — re-enable form |

---

### Section 8 — State & Data Management Rules

| State | Where it lives | Why |
|---|---|---|
| Form values | React Hook Form | form state |
| isLoading | useState in hook | orchestrates 2 API calls |
| Auth state | Zustand (after auto-login) | global auth |

---

### Section 9 — Component & File Deliverables

```
app/(auth)/client/register/page.tsx      ← renders <ClientRegisterForm>
components/auth/ClientRegisterForm.tsx   ← register form (4 fields)
```

Modified:
```
lib/api/services/auth.service.ts         ← add clientRegister()
lib/hooks/useAuth.ts                     ← add useClientRegister()
```

---

### Section 10 — UX & Loading State Rules

| State | Required? | Behavior |
|---|---|---|
| Loading | ✓ REQUIRED | Single spinner covers BOTH API calls — from "Create Account" click until redirect |
| 422 phone taken | ✓ REQUIRED | Field error under phone input |
| 422 email taken | ✓ REQUIRED | Field error under email input |
| Login step fails after register | ✓ REQUIRED | Show error "Account created but login failed. Please sign in manually." + redirect to `/auth/client/login` |

---

### Section 11 — Verification Steps

1. Navigate to `/auth/client/register`
2. Fill in all fields with a NEW phone number → click "Create Account"
3. Expected: single loading state → redirect to `/account` → auth store populated
4. Check: no intermediate "now log in" screen
5. Try registering with an existing phone → expected: field error under phone
6. Leave name empty → Zod error
7. Enter 6-char password → Zod error "at least 8 characters"
8. Enter invalid email → Zod error
9. Enter no email → form submits successfully (email is optional)

---

### Section 12 — Acceptance Criteria

- [ ] `POST /api/auth/client/register` called with `{ name, phone, email?, password }`
- [ ] `POST /api/auth/client/login` automatically called after successful register
- [ ] No intermediate "now log in" screen shown to user
- [ ] Auth store populated after auto-login
- [ ] Redirect to `ROUTES.client.account` after both calls succeed
- [ ] 422 errors shown as field-level errors (phone taken, email taken)
- [ ] Loading state covers both API calls as one continuous loading experience
- [ ] Email field is optional — form submits without it
- [ ] No mock data anywhere

---

### Section 13 — Notes for AI / Common Mistakes

**DO NOT:**
- ⛔ NO MOCK DATA.
- Do NOT skip the auto-login step — register alone gives no token
- Do NOT call `useMutation` for this — the two-call orchestration needs `async/await` in a custom hook, not a single mutation
- Do NOT show a "registration successful" toast then redirect to login — that breaks the seamless flow
- Do NOT make the email field required — it's optional per the API

**WATCH OUT FOR:**
- The `email` field: send it as `undefined` (not empty string `""`) when not filled — Zod's `.optional().or(z.literal(''))` handles this. Transform before sending: `email: data.email || undefined`
- If register succeeds but auto-login fails (rare), don't leave the user in limbo — redirect to login with a helpful message
- `ClientProfileResponse` has `id` (not `userId`) — it's a different shape from `AuthResponse.user`. Don't confuse them.

**REFERENCES:**
- REMAL_API_Reference.md Section 1 — `POST /api/auth/client/register` (returns profile, not token)
- REMAL_API_Reference.md Section 1 — `POST /api/auth/client/login` (called after register)
- FE-7-PUB-12 — will build a SEPARATE inline version of this form inside the booking flow

---

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TICKET ID: FE-1-AUTH-05
TITLE: Wire auth store into Axios interceptor + Next.js middleware route protection
WAVE: Wave 1 — Auth Flows + UI Component Library
DOMAIN: Auth
PRIORITY: Critical
DEPENDS ON: FE-1-AUTH-01, FE-1-AUTH-02, FE-1-AUTH-03 (auth store is now populated)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 1 — Walkthrough

**What is this ticket about?**
The Axios instance (FE-0-INFRA-03) was built with TODO markers where the auth token should be attached. The middleware (not yet created) needs to protect routes. Now that the auth store is populated by the login pages, this ticket resolves those TODOs. Specifically: (1) the Axios request interceptor now reads the access token from Zustand and attaches it as a Bearer header, (2) the refresh interceptor now calls `setAccessToken()` and `clearAuth()` instead of TODOs, (3) `middleware.ts` is created to protect all admin and owner routes using the HttpOnly refresh token cookie as the gate signal.

**Why does this ticket exist NOW?**
The login mutations (FE-1-AUTH-01..03) now populate the auth store. Without this ticket, every API call to protected endpoints would fail with 401 (no token attached). This is the "last mile" of auth infrastructure.

**What does success look like?**
After login, every subsequent API call automatically carries `Authorization: Bearer {token}`. Navigating directly to `/admin/crm` without being logged in redirects to `/auth/admin/login`. The refresh flow silently refreshes the token on expiry.

---

### Section 2 — Objective

Wire the auth store access token into the Axios request interceptor and resolve all TODO markers from FE-0-INFRA-03, then create `middleware.ts` to protect admin, owner, and client-account routes using the refresh token cookie presence as the authentication signal.

---

### Section 3 — User-Facing Outcome

The developer/AI implementer can:
- Log in once and all subsequent API calls include the Bearer token automatically
- Navigate to any protected route without being logged in and get redirected to the correct login page
- Have the session automatically refreshed when the access token expires (handled by existing interceptor, now wired)

---

### Section 4 — In Scope

- [ ] Edit `lib/api/axios.ts`: resolve the TODO in the request interceptor — import `useAuthStore` and attach `Authorization: Bearer {token}` header
- [ ] Edit `lib/api/axios.ts`: resolve the TODO in the 401 refresh handler — call `useAuthStore.getState().setAccessToken(newToken)` on success, call `useAuthStore.getState().clearAuth()` on failure
- [ ] Create `middleware.ts` at the project root with Next.js route matching
- [ ] Middleware logic:
  - Check for refresh token cookie presence (not the access token — that's in memory)
  - If accessing `/admin/*` without cookie → redirect to `/auth/admin/login`
  - If accessing `/owner/*` without cookie → redirect to `/auth/owner/login`
  - If accessing `/account/*` without cookie → redirect to `/auth/client/login`
  - If accessing `/auth/*` WITH a cookie → redirect to the appropriate dashboard (prevent logged-in users from seeing login pages)
- [ ] Add `POST /api/auth/logout` call in `useAuthStore.getState().clearAuth()` context — no, actually this is FE-1-AUTH-06's job. Here: just resolve the TODO to call `clearAuth()`.
- [ ] Verify the interceptor wiring doesn't break the refresh queue logic from FE-0-INFRA-03

**Files to create:**
- `middleware.ts` — Next.js edge middleware for route protection

**Files to modify:**
- `lib/api/axios.ts` — resolve all 4 TODO markers

---

### Section 5 — Out of Scope

- Do NOT build the logout UI — that is FE-1-AUTH-06
- Do NOT add role-based route protection in middleware (e.g., Finance can't access CRM) — that is `usePermissions()` hook at the page level (FE-1-UI-10). Middleware only checks logged-in vs logged-out.
- Do NOT add admin user management pages — Wave 5

---

### Section 6 — Technical Contract

#### 6a. Component Props Interface

N/A — no components.

#### 6b. Hook Return Type

N/A — modifying the Axios interceptor and middleware.

#### 6c. Zod Schema

N/A.

#### 6d. Key Enums / Constants Used

```typescript
// Middleware route patterns:
const ADMIN_ROUTES   = '/admin/:path*'
const OWNER_ROUTES   = '/owner/:path*'
const ACCOUNT_ROUTES = '/account/:path*'
const AUTH_ROUTES    = '/auth/:path*'

// Cookie name (set by backend — verify name with backend team):
const REFRESH_TOKEN_COOKIE = 'refreshToken'  // confirm exact name

// Redirect targets:
ROUTES.auth.adminLogin   // '/auth/admin/login'
ROUTES.auth.ownerLogin   // '/auth/owner/login'
ROUTES.auth.clientLogin  // '/auth/client/login'
ROUTES.admin.dashboard   // '/admin/dashboard'
ROUTES.owner.dashboard   // '/owner/dashboard'
ROUTES.client.account    // '/account'
```

---

### Section 7 — API Integration

The Axios interceptor wiring (not a new endpoint — resolves TODOs from FE-0-INFRA-03):

```typescript
// lib/api/axios.ts — REQUEST INTERCEPTOR (resolve TODO):
import { useAuthStore } from '@/lib/stores/auth.store'

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken  // ← replaces TODO
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// lib/api/axios.ts — RESPONSE INTERCEPTOR 401 handler (resolve TODOs):
// On refresh success:
useAuthStore.getState().setAccessToken(newToken)    // ← replaces TODO

// On refresh failure:
useAuthStore.getState().clearAuth()                  // ← replaces TODO
// Redirect to appropriate login based on subjectType:
const subjectType = useAuthStore.getState().subjectType
const loginRoute = subjectType === 'Owner'
  ? '/auth/owner/login'
  : subjectType === 'Client'
  ? '/auth/client/login'
  : '/auth/admin/login'
if (typeof window !== 'undefined') {
  window.location.href = loginRoute
}
```

**Middleware — No API calls.** Middleware runs at the edge and reads only cookies.

---

### Section 8 — State & Data Management Rules

| State | Where it lives | Why |
|---|---|---|
| Access token (for Bearer header) | Read from Zustand via `getState()` | synchronous read in interceptor |
| Refresh token (for middleware gate) | HttpOnly cookie | only cookie is accessible in Edge middleware |
| subjectType (for redirect on clearAuth) | Zustand auth store | determines which login page to redirect to |

**Key architectural point:** Next.js middleware runs on the Edge runtime. It cannot access Zustand (client-side JavaScript). The ONLY thing it can check is cookies. So middleware uses the HttpOnly refresh token cookie as a proxy for "is the user logged in". The actual role/permission check happens at the page level via `usePermissions()`.

---

### Section 9 — Component & File Deliverables

#### Files to CREATE:

```typescript
// middleware.ts (project root — NOT inside app/)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const REFRESH_TOKEN_COOKIE = 'refreshToken'  // confirm exact cookie name with backend

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE)

  // ── Protect admin routes ──
  if (pathname.startsWith('/admin')) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL('/auth/admin/login', request.url))
    }
  }

  // ── Protect owner routes ──
  if (pathname.startsWith('/owner')) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL('/auth/owner/login', request.url))
    }
  }

  // ── Protect client account routes ──
  if (pathname.startsWith('/account')) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL('/auth/client/login', request.url))
    }
  }

  // ── Redirect logged-in users away from auth pages ──
  // (only /auth/admin/login, /auth/owner/login, /auth/client/login, /auth/client/register)
  if (pathname.startsWith('/auth') && hasRefreshToken) {
    // We can't determine subjectType in middleware (no Zustand access)
    // So we redirect all logged-in users visiting /auth/* to the admin dashboard
    // Fine for MVP — in practice, each user type knows their own URL
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/account/:path*',
    '/auth/:path*',
  ],
}
```

#### Files to MODIFY:

```typescript
// lib/api/axios.ts — resolve all 4 TODO markers
// (see Section 7 for exact code replacements)
```

#### Files NOT to touch:

```
lib/stores/auth.store.ts           ← FE-0-INFRA-05 + corrections
app/(auth)/*/login/page.tsx        ← FE-1-AUTH-01..03 own these
```

---

### Section 10 — UX & Loading State Rules

| State | Required? | Behavior |
|---|---|---|
| Unauthenticated → protected route | ✓ REQUIRED | Middleware redirects to login before page renders |
| Authenticated → auth page | ✓ REQUIRED | Middleware redirects to dashboard |
| Token expired mid-session | ✓ REQUIRED | Axios interceptor silently refreshes; user sees no interruption |
| Refresh token expired | ✓ REQUIRED | `clearAuth()` called + redirect to login |

---

### Section 11 — Verification Steps

**Setup:** Have two browser sessions — one logged in, one not.

**Happy path:**
1. Not logged in → navigate to `/admin/crm` → expected: redirect to `/auth/admin/login`
2. Not logged in → navigate to `/owner/dashboard` → expected: redirect to `/auth/owner/login`
3. Not logged in → navigate to `/account` → expected: redirect to `/auth/client/login`
4. Log in as admin → navigate to `/auth/admin/login` → expected: redirect to `/admin/dashboard`
5. Log in → make any API call → expected: DevTools shows `Authorization: Bearer {token}` header on all requests
6. Simulate expired access token (change expiry in memory): next API call → expected: refresh fires, new token used, original request retries transparently

**Edge cases:**
1. Clear only the Zustand store (not the cookie) → expected: middleware still allows access, but API calls fail with 401 until refresh completes
2. Clear only the cookie → expected: middleware blocks and redirects to login
3. Call clearAuth() → expected: access token removed from memory AND redirect to login happens

**Permission test:**
N/A at middleware level — middleware only checks logged-in status. Role checks happen at the page level (FE-1-UI-10).

---

### Section 12 — Acceptance Criteria

**Functionality:**
- [ ] All API calls after login include `Authorization: Bearer {token}` header (verify in Network tab)
- [ ] Navigating to `/admin/*` without cookie redirects to admin login
- [ ] Navigating to `/owner/*` without cookie redirects to owner login
- [ ] Navigating to `/account/*` without cookie redirects to client login
- [ ] Logged-in user visiting `/auth/*` is redirected away
- [ ] Token refresh works silently (verify by waiting for token to expire and making an API call)
- [ ] `clearAuth()` is called when refresh token is expired

**Data & State:**
- [ ] No `localStorage` used in interceptor — only Zustand `getState()`
- [ ] Middleware reads only cookies — no Zustand, no localStorage

**TypeScript:**
- [ ] `middleware.ts` is typed correctly
- [ ] No `any` in the interceptor changes
- [ ] Zero TypeScript errors after changes

**Architecture:**
- [ ] TODO markers in `lib/api/axios.ts` are all resolved (grep `// TODO (FE-1-AUTH-05)` returns 0 results)
- [ ] `middleware.ts` is at the project root (not inside `app/`)
- [ ] `config.matcher` covers all three protected route groups

---

### Section 13 — Notes for AI / Common Mistakes

**DO NOT:**
- ⛔ NO MOCK DATA. This ticket has no data, but the rule applies.
- Do NOT try to access Zustand in middleware — it runs on Edge, no access to client-side JS
- Do NOT check the access token in middleware — it's in memory (Zustand), not accessible at Edge. Check the refresh token COOKIE only.
- Do NOT add role-based checks in middleware — `usePermissions()` handles that at page level
- Do NOT use `router.push()` for the expired session redirect — use `window.location.href` (the interceptor runs outside React)

**WATCH OUT FOR:**
- The exact cookie name: ask the backend team what they name the refresh token cookie. Do NOT assume `refreshToken` — confirm it. If wrong, all middleware checks will fail silently.
- `useAuthStore.getState()` is safe to call outside React because Zustand's `getState()` is synchronous. But it must NOT be called during SSR — wrap in `typeof window !== 'undefined'` where needed.
- The redirect for logged-in users visiting `/auth/*` is a simplified implementation — it sends everyone to `/admin/dashboard`. For MVP this is acceptable. In Phase 2, use a cookie that stores the subjectType.
- After resolving the TODO in the refresh failure handler, the `window.location.href` redirect is a hard navigation — this clears all React state cleanly, which is the desired behavior after session expiry.

**REFERENCES:**
- REMAL_API_Reference.md Section 1 — `POST /api/auth/refresh` (the endpoint the interceptor calls)
- FE-0-INFRA-03 — the TODO markers this ticket resolves
- FE-0-INFRA-05 — `setAccessToken()`, `clearAuth()` actions used here
- FE-1-AUTH-06 — logout flow (separate from session expiry handling here)

---

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TICKET ID: FE-1-AUTH-06
TITLE: Build Logout flow
WAVE: Wave 1 — Auth Flows + UI Component Library
DOMAIN: Auth
PRIORITY: Critical
DEPENDS ON: FE-1-AUTH-01, FE-1-AUTH-05
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Section 1 — Walkthrough

**What is this ticket about?**
Logging out has a security requirement: the backend must be told to revoke the refresh token cookie, or it stays valid for 7 days even after the user "logs out". This ticket builds the logout flow that: (1) calls `POST /api/auth/logout` to revoke the server-side session, (2) clears the Zustand auth store, and (3) redirects to the appropriate login page. It also creates a reusable `useLogout` hook that any component (admin sidebar, owner nav, client account) can call.

**Why does this ticket exist NOW?**
The Validation Report v2 flagged this as a HIGH severity security issue. Without calling the logout endpoint, the refresh token stays alive after logout — a stolen cookie can still generate new access tokens for 7 days. This ticket plugs that hole.

**What does success look like?**
Admin clicks "Sign Out" in the sidebar → `POST /api/auth/logout` fires → Zustand cleared → redirect to `/auth/admin/login`. Checking cookies shows the refresh token cookie is gone (cleared by the server response).

---

### Section 2 — Objective

Build the `useLogout` hook that calls `POST /api/auth/logout` to revoke the server session, then clears the auth store and redirects to the appropriate login page — so logging out is secure and works correctly across all three user types.

---

### Section 3 — User-Facing Outcome

The authenticated user can:
- Click a logout button (anywhere in any app shell) and be signed out
- Have their session revoked on the server (refresh token cookie cleared)
- Be redirected to the correct login page for their user type
- Not be able to use the previous refresh token after logout

---

### Section 4 — In Scope

- [ ] Add `logout` to `lib/api/services/auth.service.ts`
- [ ] Create `useLogout` hook in `lib/hooks/useAuth.ts`
- [ ] The hook: calls `POST /api/auth/logout` → then calls `clearAuth()` → then redirects based on `subjectType`
- [ ] If the logout API call fails (network error) → still clear local auth state and redirect (fail-safe: local logout always succeeds)
- [ ] Create a minimal `<LogoutButton>` component in `components/auth/LogoutButton.tsx` for use by layout components in later waves
- [ ] The button shows a loading state while the logout call is in flight

**Files to create:**
- `components/auth/LogoutButton.tsx` — reusable logout button

**Files to modify:**
- `lib/api/services/auth.service.ts` — add `logout()`
- `lib/hooks/useAuth.ts` — add `useLogout()`

---

### Section 5 — Out of Scope

- Do NOT build the admin sidebar — Wave 2 (FE-2-ADMIN-01) will use this button
- Do NOT build the owner nav — Wave 6
- Do NOT add "confirm before logout" dialog — not in MVP
- Do NOT add "remember me" logic — refresh token handles persistence

---

### Section 6 — Technical Contract

#### 6a. Component Props Interface

```typescript
interface LogoutButtonProps {
  variant?: 'icon' | 'full'   // 'icon' = just icon, 'full' = icon + "Sign Out" text
  className?: string
}
```

#### 6b. Hook Return Type

```typescript
// lib/hooks/useAuth.ts
export function useLogout() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function logout(): Promise<void> {
    setIsLoading(true)
    try {
      // Step 1: Tell backend to revoke refresh token cookie
      await authService.logout()
    } catch {
      // If logout API fails, still clear local state (fail-safe)
      // User should not be stuck logged in because the API is down
    } finally {
      // Step 2: Always clear local auth state
      const subjectType = useAuthStore.getState().subjectType
      useAuthStore.getState().clearAuth()

      // Step 3: Redirect to appropriate login
      const loginRoute =
        subjectType === 'Owner'  ? ROUTES.auth.ownerLogin  :
        subjectType === 'Client' ? ROUTES.auth.clientLogin  :
                                   ROUTES.auth.adminLogin

      router.push(loginRoute)
      setIsLoading(false)
    }
  }

  return { logout, isLoading }
}
```

#### 6c. Zod Schema

N/A.

#### 6d. Key Enums / Constants Used

```typescript
endpoints.auth.logout           // POST /api/auth/logout
ROUTES.auth.adminLogin          // redirect after admin logout
ROUTES.auth.ownerLogin          // redirect after owner logout
ROUTES.auth.clientLogin         // redirect after client logout
```

---

### Section 7 — API Integration

| Method | Endpoint | Request Type | Response Type | When Called |
|---|---|---|---|---|
| POST | `/api/auth/logout` | (no body) | `string` | on logout button click |

**Full API Contract (from REMAL_API_Reference.md):**

```typescript
// POST /api/auth/logout
// Access: Any authenticated user
// Request body: none
// Response data: "string" (e.g., "Logged out successfully")
// Side effect: Server clears the HttpOnly refresh token cookie

authService.logout = (): Promise<string> =>
  api.post(endpoints.auth.logout)
```

---

### Section 8 — State & Data Management Rules

| State | Where it lives | Why |
|---|---|---|
| isLoading | useState in hook | local — only while logout call is in flight |
| subjectType (for redirect) | Read from Zustand BEFORE clearAuth | must read before clearing |

**Critical order of operations:**
1. Read `subjectType` from store first
2. Call `clearAuth()` (this wipes subjectType too)
3. Redirect using the stored subjectType value

---

### Section 9 — Component & File Deliverables

#### Files to CREATE:

```tsx
// components/auth/LogoutButton.tsx
'use client'
import { useLogout } from '@/lib/hooks/useAuth'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function LogoutButton({ variant = 'full', className }: LogoutButtonProps) {
  const { logout, isLoading } = useLogout()

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <LogOut size={18} className={isLoading ? 'animate-spin' : ''} />
      {variant === 'full' && (
        <span className="text-sm">{isLoading ? 'Signing out...' : 'Sign Out'}</span>
      )}
    </button>
  )
}
```

#### Files to MODIFY:

```
lib/api/services/auth.service.ts    ← add logout()
lib/hooks/useAuth.ts                ← add useLogout()
```

`auth.service.ts` final version (all 6 functions):

```typescript
// lib/api/services/auth.service.ts
import api from '@/lib/api/axios'
import { endpoints } from '@/lib/api/endpoints'
import type {
  AdminLoginRequest,
  PhoneLoginRequest,
  ClientRegisterRequest,
  AuthResponse,
  ClientProfileResponse,
} from '@/lib/types/auth.types'

export const authService = {
  adminLogin:     (data: AdminLoginRequest):    Promise<AuthResponse>         =>
    api.post(endpoints.auth.adminLogin, data),

  ownerLogin:     (data: PhoneLoginRequest):    Promise<AuthResponse>         =>
    api.post(endpoints.auth.ownerLogin, data),

  clientLogin:    (data: PhoneLoginRequest):    Promise<AuthResponse>         =>
    api.post(endpoints.auth.clientLogin, data),

  clientRegister: (data: ClientRegisterRequest): Promise<ClientProfileResponse> =>
    api.post(endpoints.auth.clientRegister, data),

  refresh:        ():                           Promise<AuthResponse>         =>
    api.post(endpoints.auth.refresh),

  logout:         ():                           Promise<string>               =>
    api.post(endpoints.auth.logout),
}
```

---

### Section 10 — UX & Loading State Rules

| State | Required? | Behavior |
|---|---|---|
| Loading | ✓ REQUIRED | Button shows "Signing out...", icon animates |
| Success | ✓ REQUIRED | Redirect — no toast (redirect IS the confirmation) |
| API failure | ✓ REQUIRED | Still clears auth and redirects — fail-safe. No error toast for logout failure. |

---

### Section 11 — Verification Steps

1. Log in as admin → find or add a logout trigger (temporarily add `<LogoutButton />` to any page)
2. Click "Sign Out" → expected: brief loading state, redirect to `/auth/admin/login`
3. Check cookies → expected: refresh token cookie gone (cleared by server)
4. Check Zustand store → expected: all fields null
5. Navigate to `/admin/crm` → expected: middleware redirects back to login (cookie gone)
6. Simulate network failure during logout → expected: auth still cleared, redirect still happens
7. Log in as owner → logout → expected: redirect to `/auth/owner/login` (not admin login)

---

### Section 12 — Acceptance Criteria

- [ ] `POST /api/auth/logout` called before clearing local state
- [ ] `clearAuth()` called in `finally` block — always runs even if API fails
- [ ] Redirect uses correct login route based on `subjectType` read BEFORE `clearAuth()`
- [ ] `<LogoutButton>` component exists and shows loading state
- [ ] After logout: Zustand auth store is completely null
- [ ] After logout: refresh token cookie is cleared (verified in browser DevTools)
- [ ] After logout: navigating to protected route redirects to login
- [ ] No mock data anywhere

---

### Section 13 — Notes for AI / Common Mistakes

**DO NOT:**
- ⛔ NO MOCK DATA.
- Do NOT call `clearAuth()` BEFORE reading `subjectType` — the value will be null and redirect will default to admin login for everyone
- Do NOT skip the API call and just clear locally — the refresh token stays alive server-side
- Do NOT show an error toast if logout API fails — fail silently and still clear locally
- Do NOT use `window.location.href` for the redirect — use `router.push()` (React Router is available here, unlike in the Axios interceptor)

**WATCH OUT FOR:**
- The `POST /api/auth/logout` response is `data: "string"` per the API. The Axios interceptor unwraps `response.data.data` — so the resolved promise returns a plain string. That's fine, we ignore the response value.
- `useLogout` uses `useRouter()` from `next/navigation` — this hook only works inside React components. The hook itself IS a React hook (uses useState, useRouter) so it must be called from a `'use client'` component.
- The `LogoutButton` must have `'use client'` directive because it uses a hook.

**REFERENCES:**
- REMAL_API_Reference.md Section 1 — `POST /api/auth/logout`
- Validation Report v2 — Security Gap: logout must call the server endpoint
- FE-1-AUTH-05 — `clearAuth()` (the action this calls)
- Wave 2 (FE-2-ADMIN-01) — will import `<LogoutButton>` into the admin sidebar
