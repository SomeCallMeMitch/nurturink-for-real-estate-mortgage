# Credit Management — Approved Implementation Plan

## Purpose
This document replaces the earlier proposal with an **approved implementation plan** that incorporates:
- the prior Credit Management audit context,
- Base44 evaluation feedback,
- and final product decisions.

The goal is to ship security and authorization fixes first, then role/permission alignment, while keeping changes small and reviewable.

## Final Decisions (Base44 Feedback + Product Direction)

### 1) Authorization / `orgId` handling
- Backend functions must **not trust caller-supplied `orgId`** for normal users.
- Organization context should be derived from the authenticated user/session.
- Function-level authorization validation is required for tenant isolation.
- If a caller-provided `orgId` is mismatched with authenticated context, return **403 Forbidden**.
- Any super-admin override path (if supported) must be explicit and separately guarded.

### 2) Transaction visibility and export role model
- **Owners and managers** can view/export organization-wide transaction history.
- **Regular members** can only view/export their own transaction history.
- The same rule must be enforced in both UI and backend.

### 3) Company pool access control role model
- **Owners and managers** can toggle company pool access.
- The same rule must be enforced in both UI and backend.
- The current mismatch between visible UI controls and backend authorization must be resolved.

### 4) Null-safety
- Standard JavaScript defensive defaults are approved.
- `transaction.description` and `transaction.type` must be handled safely when `null`, `undefined`, or missing.

### 5) Logging and error handling
- Sensitive objects, credit metadata, stack traces, and internal details must not be exposed to clients.
- Client-facing errors should be generic and safe.
- Server logs should remain minimal and sanitized.

### 6) Deferred P2 cleanup
The following items stay deferred and are not included in the first implementation PR:
- Centralizing duplicate credit/org reads through `CreditContext`.
- Explicit transaction sorting in `getTeamMemberUsage`.
- Removing/gating diagnostic client logs in `TransferCreditsDialog`.

## Approved Implementation Plan

### Phase 1 — Security and low-risk stability patch
1. Fix `checkCreditAvailability` authorization.
2. Add null-safe transaction filtering in `Credits.jsx`.
3. Remove sensitive debug/error exposure in `transferCreditsToPool`.

### Phase 2 — Role/permission alignment
1. Enforce owner+manager org-wide transaction visibility/export.
2. Restrict regular members to their own transactions.
3. Align company pool access toggle permissions so owners and managers can use it consistently in both UI and backend.

### Phase 3 — Deferred cleanup
- Address the P2 maintainability improvements later (separate follow-up work).

## Implementation Boundaries
- Keep PRs small and reviewable.
- Do not combine Phase 1 and Phase 2 into one PR.
- Do not add libraries.
- Do not refactor unrelated code.
- Follow `AGENTS.md`.

## Delivery Notes
- This plan is documentation-only and records approved scope/order before implementation.
- Implementation should start with Phase 1 in a dedicated PR.
- Phase 2 should follow in a separate PR after Phase 1 validation.
