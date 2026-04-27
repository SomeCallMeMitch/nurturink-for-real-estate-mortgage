# Access Control P1 — Invitation Flow Hardening (Proposal Only)

## 1) Summary

This document is a **proposal only** for Base44 review and approval.

- No app code changes are included in this PR.
- No backend function behavior changes are included in this PR.
- No UI behavior changes are included in this PR.
- No implementation is being performed yet.

Scope in this proposal is intentionally narrow to support a conservative Base44-reviewed workflow.

## 2) Current implementation observations (read-only)

The following observations are based only on read-only inspection of scoped files:

- `base44/functions/processInvitation/entry.ts`
- `base44/functions/acceptInvitation/entry.ts`
- `src/pages/AcceptInvitation.jsx`

### 2.1 `processInvitation` current behavior

- Public endpoint; no authentication required.
- Expects `{ token }` in request body.
- Returns `isValid: false` with error payload for:
  - missing token,
  - token not found,
  - already accepted invitation,
  - expired invitation.
- Looks up organization name by `invitation.orgId`; falls back to `'Your Organization'` if org fetch fails.
- Returns `isValid: true` and an `invitation` object that currently includes:
  - `id`,
  - `email`,
  - `role`,
  - `roleName` (from local mapping),
  - `organizationId`,
  - `organizationName`,
  - `invitedByName`.
- Logs full caught errors for org fetch and top-level failure via `console.error`.
- On catch, returns status `500` with `{ isValid: false, errorType: 'error', errorMessage: '...' }`.

### 2.2 `acceptInvitation` current behavior

- Auth-required endpoint in practice via `base44.auth.me()` check.
- Returns `401` when user is missing (`not_authenticated`).
- Expects `{ token }`; returns `400` when token is missing.
- Reads invitation by token; returns:
  - `404` when invitation is missing,
  - `400` for already accepted,
  - `400` for expired,
  - `403` for email mismatch.
- Email mismatch message includes the invited email in client response.
- Logs include:
  - start/success markers,
  - current user id/email,
  - invitation id/orgRole/role/email,
  - role-assignment details,
  - user/org info in success log line.
- Role assignment uses mapping:
  - `owner -> organization_owner`,
  - `manager -> organization_manager`,
  - `member -> sales_rep`.
- Uses `orgRole` first, fallback to `role`, default `'member'`.
- Updates `auth.updateMe` with `orgId`, `appRole`, and `isOrgOwner`.
- Creates/updates `UserProfile` with `orgRole`.
- Marks invitation as accepted.
- Returns success payload with `organizationName` and `assignedRole`.
- On catch, returns `500` with `{ success: false, error: 'error', message: '...' }` and logs full error.

### 2.3 `AcceptInvitation.jsx` current behavior

- Reads `token` from query string on `/AcceptInvitation` route usage.
- On load:
  - checks auth status,
  - fetches current user if authenticated,
  - invokes `processInvitation` with token.
- If invitation is valid:
  - auto-accepts when authenticated user email matches invited email,
  - otherwise shows invitation screen with org name, inviter name, role display, invited email, and accept CTA.
- On manual accept:
  - unauthenticated users are redirected to login with return URL,
  - email mismatch is handled client-side and shown as detailed error,
  - calls `acceptInvitation` and then redirects to `/SettingsProfile` on success.
- Error handling expects structured `errorType`/`errorMessage` style and includes specialized titles for several error types.
- Logs client-side errors and auto-accept events in console.

## 3) Current audit concerns

1. `processInvitation` may expose more public metadata than required for pre-auth invitation validation/rendering.
2. Role taxonomy may be inconsistent across `processInvitation`, `acceptInvitation`, and `AcceptInvitation.jsx` (legacy vs newer role fields and display mapping).
3. Invitation/auth access flows currently log potentially sensitive details (emails, IDs, role internals, and full error objects).
4. Error response shape/status appears inconsistent across related paths (`401` / `403` / `404` / `400` / `500`) and may need canonicalization.

## 4) Proposed implementation plan (narrow phases)

### Phase 1 — `processInvitation` response minimization

- Define and enforce a minimal, public-safe response contract for pre-auth invitation checks.
- Do **not** expose inviter details beyond approved display-safe fields.
- Do **not** expose internal IDs, token details, full org records, full user records, or role internals not needed by UI.
- Preserve only the minimum fields needed for `AcceptInvitation.jsx` to render a valid invitation flow.

### Phase 2 — Invitation role taxonomy alignment

- Confirm canonical invitation roles and acceptance role-mapping contract.
- Normalize role handling **inside invitation flow only** unless Base44 explicitly approves shared helper updates.
- Keep TeamManagement and unrelated role systems unchanged.
- Preserve backward compatibility where needed but avoid broad helper refactors.

### Phase 3 — Logging and error-shape cleanup

- Reduce logs to minimal, sanitized operational messages.
- Remove sensitive payload logging (tokens, full user/org objects, detailed raw errors).
- Use client-safe generic `500` responses (no `error.message` / `stack` exposure).
- Apply canonical patterns where auth is required:
  - `Response.json({ error: 'Unauthorized' }, { status: 401 })` for unauthenticated.
  - `Response.json({ error: 'Forbidden' }, { status: 403 })` for authenticated unauthorized.
- Preserve intended public invalid-invitation behavior (avoid accidentally forcing auth for token validation paths).

## 5) Proposed response-contract questions for Base44

Please confirm:

1. Exactly which fields `processInvitation` may return publicly before auth.
2. Preferred invalid/expired invitation semantics: `404`, `400`, or safe generic `200` invalid result.
3. Whether `acceptInvitation` must always require authenticated user context.
4. Whether email mismatch should return canonical `403` vs safer generic invitation failure shape.
5. Canonical role names for invitation and accepted membership assignment.
6. Whether legacy flags (e.g., `isOrgOwner`) must still be set/maintained during acceptance.
7. Whether `AcceptInvitation.jsx` should display organization name before login/signup.
8. Whether invited email should be displayed before authentication.

## 6) Files likely affected after Base44 approval

- `base44/functions/processInvitation/entry.ts`
- `base44/functions/acceptInvitation/entry.ts`
- `src/pages/AcceptInvitation.jsx`
- Direct role mapping/helper dependency only if Base44 explicitly approves

## 7) Non-goals

- No implementation in this PR.
- Do not change `updateUserRole`.
- Do not change TeamManagement.
- Do not change credit-management functions.
- Do not change unrelated auth flows.
- Do not introduce broad role-helper refactors.
- Do not alter routing unless Base44 specifically requests it.

## 8) Verification plan for later implementation (read-only checks)

After Base44 approves and implementation is completed, run read-only verification:

1. Confirm diff is limited to Base44-approved invitation-scope files.
2. Confirm `processInvitation` no longer returns unnecessary sensitive metadata.
3. Confirm `acceptInvitation` requires auth where appropriate.
4. Confirm authenticated unauthorized callers receive canonical `403` where appropriate.
5. Confirm unauthenticated required-auth paths receive canonical `401` where appropriate.
6. Confirm `500` responses are generic and client-safe.
7. Confirm invitation tokens, stack traces, full user objects, full org objects, or internal IDs are not logged/returned unnecessarily.
8. Confirm successful invitation acceptance flow still works end-to-end.

## 9) Questions for Base44 before implementation (explicit approvals)

1. Approve the proposed public response contract for `processInvitation` (exact allowed fields).
2. Approve the chosen invalid/expired invitation status strategy (`404` / `400` / safe `200` invalid result).
3. Approve required-auth policy for `acceptInvitation` and canonical unauthorized/forbidden response shapes.
4. Approve email-mismatch response strategy (strict canonical `403` vs generic invitation error).
5. Approve canonical invitation role taxonomy and mapping for accepted membership.
6. Approve whether `isOrgOwner` must be maintained on acceptance.
7. Approve pre-auth UI display policy for org name and invited email.
8. Approve that scope remains limited to invitation-flow files only, with no TeamManagement/updateUserRole/credit-management changes.
