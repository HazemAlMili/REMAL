// ──────────────────────────────────────────────────────────────────────────────
// Review Types
// From REMAL_API_Reference.md Sections 22-24
// ──────────────────────────────────────────────────────────────────────────────

export type ReviewStatus = "Pending" | "Published" | "Rejected" | "Hidden";

// ── Full Review Response (returned by moderation + client endpoints) ──
// From API Reference Section 22
export interface ReviewResponse {
  id: string;
  bookingId: string;
  unitId: string;
  clientId: string;
  ownerId: string;
  rating: number;
  title: string;
  comment: string | null;
  reviewStatus: ReviewStatus;
  submittedAt: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Public review (from GET /api/public/units/{unitId}/reviews) ──
// From API Reference Section 23 / P23
// NOTE: NO clientName field — P23
export interface PublishedReviewListItemResponse {
  reviewId: string;
  unitId: string;
  rating: number;
  title: string;
  comment: string | null;
  publishedAt: string;
  ownerReplyText: string | null;
  ownerReplyUpdatedAt: string | null;
}

// ── Public review summary ──
// From API Reference Section 23 / P22
export interface UnitPublishedReviewSummaryResponse {
  unitId: string;
  publishedReviewCount: number;
  averageRating: number;
  lastReviewPublishedAt: string | null;
}

// ── Review Status History ──
// From API Reference Section 24 / P24
// NOTE: changedByAdminUserId (UUID, not display name) — P24
export interface ReviewStatusHistoryResponse {
  id: string;
  reviewId: string;
  oldStatus: ReviewStatus | null;
  newStatus: ReviewStatus;
  changedByAdminUserId: string; // UUID — cross-reference with admin users for display name
  notes: string | null;
  changedAt: string;
}

// ── Moderation requests ──
// From API Reference Section 24 / P21
// All three take optional notes ONLY — NO required "reason" field
export interface PublishReviewRequest {
  notes?: string;
}

export interface RejectReviewRequest {
  notes?: string; // NOT { reason: string, notes?: string } — P21
}

export interface HideReviewRequest {
  notes?: string; // NOT { reason: string, notes?: string } — P21
}

// ── Client review submission ──
export interface CreateReviewRequest {
  bookingId: string;
  rating: number; // 1-5
  title: string; // REQUIRED — reviews have a title
  comment?: string;
}

export interface UpdatePendingReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

// ── Review Detail Data (for drawer) ──
// ⚠️ Backend Gap: no GET /api/internal/reviews/{reviewId} endpoint is documented
// The drawer receives its review content from the parent list data
// When a dedicated internal review detail endpoint is documented, replace this
export interface ReviewDetailData {
  reviewId: string;
  unitId: string;
  rating: number;
  title: string;
  comment: string | null;
  reviewStatus: ReviewStatus;
  ownerReplyText: string | null;
  ownerReplyUpdatedAt: string | null;
  publishedAt: string;
  // Additional fields will be available when internal review detail endpoint is documented
}
