# Decision 0012 — Notifications & Alerts Business Layer Scope

**Status:** Frozen  
**Date:** 2026-04-22  
**Domain:** Notifications & Alerts — Tier 3 (Business)  
**Ticket:** BZ-NA-01

---

## 1. template_code doubles as preference_key

In the current MVP, `template_code` (from `notification_templates`) and `preference_key` (from `notification_preferences`) use the same slug vocabulary. A preference row keyed by `(recipient, channel, preference_key)` where `preference_key = template_code` controls whether a notification of that type is enabled for that recipient on that channel.

This keeps preference management simple and directly tied to the template catalog. No separate preference taxonomy exists in MVP.

---

## 2. Template Resolution Rules

A notification template is resolved by the exact combination of:

1. `template_code` — the event slug (e.g. `booking_confirmed`, `review_published`)
2. `channel` — the delivery channel (`in_app`, `email`, `sms`, `whatsapp`)
3. `recipient_role` — derived from the recipient type (`admin`, `client`, `owner`)

If no matching template is found for the requested combination, notification creation must fail with a clear domain exception. No fallback template resolution is performed in MVP.

---

## 3. Rendered Content Is Stored on the Notification Row

Template variable substitution (rendering) happens at notification creation time. The rendered `subject` (if applicable) and `body` are stored directly on the `notifications` row. No re-rendering occurs at delivery time. Delivery services read stored rendered content.

---

## 4. Exactly One Recipient Per Notification

Each `notifications` row has exactly one non-null recipient FK:

- `admin_user_id` — for admin recipients
- `client_id` — for client recipients
- `owner_id` — for owner recipients

The Business layer enforces this by routing creation through typed methods (`CreateForAdminAsync`, `CreateForClientAsync`, `CreateForOwnerAsync`). No generic recipient parameter is used. The DB CHECK constraint (`num_nonnulls() = 1`) provides the persistence-level safety net.

---

## 5. No Generic Recipient Polymorphism in Business Layer Behavior

The Business layer does not introduce a `RecipientType` / `RecipientId` abstraction at the application level. All recipient-specific operations are handled through typed methods and typed FK columns. This is consistent with the frozen DB tier decision (typed FKs over polymorphic columns).

---

## 6. in_app Notifications Are Immediate and Cannot Be Scheduled

In the current MVP, `in_app` notifications are created with `notification_status = 'sent'` immediately at creation time. The `scheduled_at` field is only relevant for external channels (`email`, `sms`, `whatsapp`). Business layer code must reject or ignore `scheduledAt` values when `channel = 'in_app'`.

---

## 7. External Channels in MVP

The following external channels are supported in MVP:

- `email`
- `sms`
- `whatsapp`

No push notification channel, no WebSocket channel, no webhook delivery channel exists in MVP scope.

---

## 8. Preference-Disabled Notification Creates an Audit Row with status = cancelled

If a recipient preference row exists for the combination `(recipient, channel, preference_key)` and `is_enabled = false`, the notification creation flow must:

1. Still insert a `notifications` row
2. Set `notification_status = 'cancelled'` on that row
3. Not proceed to dispatch

This preserves an auditable record that a notification was attempted but suppressed by the recipient's preference. It also prevents silent data loss when preferences change later.

---

## 9. No Preference Row Means Default Enabled

If no `notification_preferences` row exists for a given `(recipient, channel, preference_key)` combination, the default behavior is **enabled**. Absence of a preference record is not treated as disabled.

---

## 10. Dispatch Service Is Provider-Agnostic

`INotificationDispatchService` manages notification lifecycle state transitions only:

- `pending` → `queued`
- `queued` → `sent` / `failed`
- `sent` → `delivered` / `failed`
- any → `cancelled`

It writes `NotificationDeliveryLog` rows for each attempt. It does **not**:

- Implement provider API calls (no SendGrid, Twilio, etc.)
- Store raw provider payloads
- Handle webhook callbacks
- Implement retry scheduling

Provider integration is out of scope for MVP Business tier. The dispatch service is the boundary between internal state management and future provider adapter layers.

---

## 11. In-App Inbox Reads Operate Only on in_app Notifications

`INotificationInboxService` methods (`GetAdminInboxAsync`, `GetClientInboxAsync`, `GetOwnerInboxAsync`, `MarkAdminReadAsync`, etc.) operate exclusively on notifications where `channel = 'in_app'`. Querying or marking-as-read for email/sms/whatsapp notifications is not performed through the inbox service.

---

## 12. Out of Scope for MVP

The following are explicitly excluded from Notifications & Alerts Business tier MVP scope:

| Excluded Feature | Reason |
|---|---|
| Push token management | Requires device registration infrastructure not in scope |
| Marketing campaign engine | Different domain — out of scope for operational notifications |
| Marketing consent / opt-in flows | Different domain — out of scope |
| Quiet-hours scheduling | Not in product requirements |
| Webhook event delivery | Provider integration layer, not Business layer |
| Bulk broadcast / fan-out | Not in product requirements |
| Notification template versioning | Not in product requirements |
| Localization / multi-language templates | Not in product requirements |
| Topic hierarchy / notification categories | Not in product requirements |
| Read receipts for external channels | Not reliably trackable without provider webhook integration |
