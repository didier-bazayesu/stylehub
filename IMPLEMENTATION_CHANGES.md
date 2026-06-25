# Implementation Changes — Back Button + Order Notifications

Summary of all changes for the **Back to Store** sidebar links and the **full order notification system**.

---

## Feature 1 — Back to Store (Dashboard Sidebars)

### Status: Complete

All three sidebars include a **Back to Store** link that navigates to `/` (`ROUTES.HOME`).

| File | Location | Behavior |
|------|----------|----------|
| `frontend/src/components/shared/layout/AdminSidebar.tsx` | Bottom section, above footer area | Home icon + label when expanded; icon-only + tooltip when collapsed |
| `frontend/src/components/shared/layout/VendorSidebar.tsx` | Above store info footer | Same pattern |
| `frontend/src/components/shared/layout/CustomerSidebar.tsx` | Above user footer | Same pattern |

### Styling

- Separated from nav items with `border-t`
- Muted text (`text-gray-500`) to distinguish from primary nav links
- Matches existing sidebar link patterns (rounded-lg, hover states, dark mode)

---

## Feature 2 — Notification System

### New helpers — `notifications.service.ts`

| Method | Purpose |
|--------|---------|
| `notifyCustomer(userId, payload)` | Single customer notification |
| `notifyVendor(vendorUserId, payload)` | Single vendor notification |
| `notifyAdmins(payload)` | Broadcast to all active `ADMIN` / `SUPER_ADMIN` users via `createMany` |
| `safeNotify(action)` | Wraps delivery in try/catch — failures are logged, never thrown |

All high-level helpers use `safeNotify` so notification failures **never break** the primary business action (order creation, payment webhook, registration, etc.).

### Notification type mapping

The Prisma enum is:

```prisma
enum NotificationType {
  ORDER_UPDATE
  REVIEW
  NEW_PRODUCT
  PROMOTION
  SYSTEM
}
```

| Event category | Type used |
|----------------|-----------|
| Order lifecycle (placed, status, payment) | `ORDER_UPDATE` |
| Admin operational alerts (registration, vendor app, cancel, refund) | `SYSTEM` |

No schema migration was required. Optional future improvement: add `PAYMENT` or `VENDOR` enum values if you want finer-grained filtering in the UI.

---

## Notification Flow Matrix (Target State)

| Event | Customer | Vendor | Admin |
|-------|----------|--------|-------|
| Order placed | ✅ Order placed | ✅ New order received | ❌ |
| Payment confirmed (Stripe webhook) | ✅ Payment confirmed | ✅ Payment confirmed | ❌ |
| Status → CONFIRMED | ✅ Order confirmed | — | — |
| Status → PROCESSING | ✅ Order processing | — | — |
| Status → SHIPPED | ✅ Order shipped | — | — |
| Status → DELIVERED | ✅ Order delivered | ✅ Item delivered — sale complete | — |
| Status → CANCELLED (vendor) | ✅ Order cancelled | ✅ Item cancelled | ✅ Order item cancelled |
| Status → CANCELLED (admin) | ✅ Order cancelled | ✅ Item cancelled by admin | ✅ Order item cancelled |
| Refund issued (admin) | ✅ Refund issued | — | ✅ Refund issued |
| Vendor application submitted | — | — | ✅ Vendor application submitted |
| New user registered | — | — | ✅ New user registered (informational) |

---

## File-by-File Change Summary

### Frontend

| File | Changes |
|------|---------|
| `AdminSidebar.tsx` | Added Back to Store link with Home icon, divider, collapsed tooltip |
| `VendorSidebar.tsx` | Same — placed above store footer |
| `CustomerSidebar.tsx` | Same — placed above user footer |

### Backend — Core notification layer

| File | Changes |
|------|---------|
| `notifications.service.ts` | Added `notifyCustomer`, `notifyVendor`, refactored `notifyAdmins` to use `createMany`, added `safeNotify` + `Logger` |
| `notifications.module.ts` | No changes (already exported service) |

### Backend — Event triggers

| File | Changes |
|------|---------|
| `orders.service.ts` | Customer notify on order create; centralized `sendOrderItemStatusNotifications`; vendor notify on new order / delivered / cancelled; admin notify on cancel; `sendRefundNotifications`; `adminCancelOrderItem` + `adminRefundOrderItem`; order ref helper `#XXXXXXXX` |
| `payments.service.ts` | Payment success → customer + vendor notifications via helpers (no admin) |
| `auth.service.ts` | Registration → `notifyAdmins` with proper `NotificationType.SYSTEM` |
| `vendors.service.ts` | Vendor application → `notifyAdmins`; injected `NotificationsService` |
| `admin.service.ts` | `cancelOrderItem` + `refundOrderItem` delegating to `OrdersService` with audit logs |
| `admin.controller.ts` | `PATCH admin/orders/items/:id/cancel` and `PATCH admin/orders/items/:id/refund` |
| `admin.module.ts` | Imports `OrdersModule` |

### Backend — Module wiring

| Module | Imports `NotificationsModule` |
|--------|-------------------------------|
| `auth.module.ts` | ✅ (already wired) |
| `vendors.module.ts` | ✅ (already wired) |
| `orders.module.ts` | ✅ (already wired) |
| `payments.module.ts` | ✅ (already wired) |
| `admin.module.ts` | ✅ + `OrdersModule` |

---

## New Admin API Endpoints

| Method | Route | Action |
|--------|-------|--------|
| `PATCH` | `/admin/orders/items/:id/cancel` | Cancel item + notify customer, vendor, admins |
| `PATCH` | `/admin/orders/items/:id/refund` | Mark refunded + notify customer, admins |

> **Note:** Refund endpoint updates order item status and sends notifications. Stripe refund processing is not yet integrated — wire `sendRefundNotifications` after payment refund logic is added.

---

## Migrations / Enum Changes

| Item | Required? |
|------|-----------|
| Database migration | **No** — uses existing `Notification` model and `NotificationType` enum |
| New enum values (`PAYMENT`, `VENDOR`) | **Optional** — not added; `ORDER_UPDATE` and `SYSTEM` cover all cases |

---

## Performance Considerations

| Area | Concern | Mitigation |
|------|---------|------------|
| `notifyAdmins` | N inserts for N admins | Uses `createMany` (single query) instead of sequential `create` |
| Payment webhook | Multiple vendor notifications | De-duplicated by `vendor.user_id` Set |
| New order | Multiple vendor notifications | Same de-duplication pattern |
| Notification failures | Could hide delivery issues | Logged via `Logger.error` in `safeNotify` — consider a dead-letter queue or metrics in production |
| Admin broadcast on high traffic | Many admins × many events | Low risk at current scale; batch or queue if admin count grows |

---

## How to Test

1. **Back to Store** — Open each dashboard (admin / vendor / customer), collapse sidebar, confirm icon + tooltip, expand and confirm label, click → lands on `/`.
2. **Order placed** — Checkout as customer; vendor receives new order notification; customer receives placed notification; admins do **not**.
3. **Payment** — Complete Stripe payment; customer + vendors notified; admins do **not**.
4. **Vendor status updates** — Move item through CONFIRMED → PROCESSING → SHIPPED → DELIVERED; customer notified each step; vendor notified on DELIVERED only.
5. **Cancel** — Vendor cancels item → customer, vendor, admin notified. Admin cancels via API → vendor message includes "cancelled by admin".
6. **Refund** — `PATCH /admin/orders/items/:id/refund` → customer + admins notified.
7. **Registration** — New user signs up → admins receive SYSTEM notification.
8. **Vendor apply** — User submits vendor application → admins receive SYSTEM notification.

---

## Related Files (unchanged but relevant)

- `frontend/src/config/constants.ts` — `ROUTES.HOME: '/'`
- `backend/prisma/schema.prisma` — `Notification`, `NotificationType`, `OrderStatus`
- `backend/src/reviews/reviews.service.ts` — already uses `NotificationType.REVIEW` (unchanged)
