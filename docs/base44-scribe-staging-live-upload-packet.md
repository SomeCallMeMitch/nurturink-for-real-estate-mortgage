# Base44 Upload Packet: Scribe Staging/Live Manual Send Review

Prepared for Base44 review before merge/deploy.

## Goal

Make manual card sends stop at an admin-reviewable state, allow a super admin to submit the batch to ScribeNurture staging first, and only allow the live ScribeNurture submission after staging has succeeded.

Scheduled/service-role sends are intentionally preserved as automatic production sends for now.

## Changed Files Included In This Packet

Backend functions:

- `base44/functions/processMailingBatch/entry.ts`
- `base44/functions/submitBatchToScribe/entry.ts`

Entity schema proposal:

- `base44/entities/MailingBatch.jsonc`

Admin/user UI:

- `src/pages/AdminSendDetails.jsx`
- `src/pages/AdminSends.jsx`
- `src/pages/ReviewAndSend.jsx`
- `src/pages/MailingConfirmation.jsx`
- `src/pages/AdminCardDetails.jsx`

Dependency compatibility:

- `src/components/ui/Pill.jsx`
- `src/components/ui/pill.jsx`

Review manifest:

- `docs/base44-scribe-staging-live-upload-packet.md`

## Secret Names

This draft intentionally uses one consistent set of secrets:

- `SCRIBE_API_TOKEN`: staging/test Scribe token.
- `SCRIBE_LIVE_API_TOKEN`: production/live Scribe token.
- `SCRIBE_API_BASE_URL`: staging/test Scribe base URL.

Production base URL is set in code as:

- `https://scribenurture.com`

Fallback staging base URL is:

- `https://staging.scribenurture.com`

Please confirm these URLs against ScribeNurture API documentation before production testing.

## Backend Behavior

### `processMailingBatch`

Purpose:

- Creates the local `MailingBatch`, `Mailing`, and `Note` records.
- Deducts credits when applicable.
- Does not submit to Scribe.

Manual interactive sends now finish as:

- `ready_to_send`

Service-role/scheduled sends still finish as:

- `completed`

This keeps scheduled automation behavior unchanged while manual sends become reviewable.

### `submitBatchToScribe`

Purpose:

- Performs Scribe campaign creation, contact upload, and campaign send.
- Accepts `targetEnvironment` as `staging`/`test` or `production`/`live`.
- Interactive calls default to staging.
- Service-role calls default to production.
- Interactive calls require `super_admin`.
- Production/live is blocked until the batch has a successful staging submission.
- Production/live is blocked after a successful production submission to reduce duplicate live-mail risk.
- A failed staging attempt leaves the batch reviewable/retryable.
- Existing batches marked `completed` but still containing queued notes can be recovered if they have not already had a successful production submission.

## Scribe Tracking Metadata

The PR appends entries to `MailingBatch.scribeCampaigns` with:

- `scribeCampaignId`
- `contactCount`
- `status`
- `environment`
- `targetBaseUrl`
- `cardDesignId`
- `returnAddressMode`
- `submittedAt`
- `errorMessage`

The expected `status` values are:

- `submitted`
- `needs_credits`
- `failed`

The expected `environment` values are:

- `staging`
- `production`

## Schema Review Required

`base44/entities/MailingBatch.jsonc` is a merge proposal, not a blind replacement for the deployed entity.

Please merge only the required additions into the current live `MailingBatch` schema:

- Add `ready_to_send` and `pending_credits` to `MailingBatch.status`.
- Add or extend `scribeCampaigns[]` with the metadata fields listed above.

Base44 previously confirmed schemas are strict, so these fields must be explicitly present or the metadata may not persist.

## UI Behavior

### Admin Send Details

Adds:

- `Send to Staging`
- `Send Live`
- staging/live indicators from `scribeCampaigns`
- visible error state when Scribe submission fails

`Send Live` stays disabled until staging has a successful `submitted` entry.

### Admin Sends

Adds handling for:

- `ready_to_send`
- `pending_credits`

Batches needing review are prioritized in the list.

### Review and Confirmation

Manual send copy now says the batch is prepared for review/submission instead of implying the cards have already gone to mail.

## `Pill.jsx`

This PR restores `src/components/ui/Pill.jsx` as a compatibility component because existing pages still import it. This repository also tracks `src/components/ui/pill.jsx`; on this Windows checkout those case-only paths resolve to the same physical file, so both tracked entries are included with the same compatibility component.

The owner is open to removing `Pill`, but that should be a separate cleanup PR that updates every import at the same time.

## Verification Performed Locally

Passed:

- `node --check base44/functions/submitBatchToScribe/entry.ts`
- `node --check base44/functions/processMailingBatch/entry.ts`
- `Get-Content base44/entities/MailingBatch.jsonc | ConvertFrom-Json`

Not completed:

- Full frontend build. `npm run build` could not run because local `node_modules` is not installed and `vite` is unavailable.

## Base44 Review Checklist

Please confirm before merge/deploy:

- The `MailingBatch` schema merge preserves all current live fields.
- The new status enum values are accepted in the deployed schema.
- `scribeCampaigns[]` nested fields are accepted and persist after refresh.
- ScribeNurture staging URL/token are correct.
- ScribeNurture live URL/token are correct.
- Staging submissions should call `/api/v1/campaign/send`.
- Live duplicate-send blocking is acceptable.
- Service-role scheduled sends should remain automatic production sends for now.
- `Pill.jsx` restoration is acceptable for this PR.

## Recommended Test Path

1. Merge schema additions into Base44 entity schema.
2. Deploy functions/UI to a safe review environment.
3. Create one manual single-card batch.
4. Confirm it appears as `ready_to_send`.
5. Use `Send to Staging`.
6. Refresh and confirm `scribeCampaigns` contains a staging `submitted` entry.
7. Use `Send Live` only after staging succeeds.
8. Refresh and confirm production `submitted` metadata exists.
9. Confirm notes/mailings move to sent only after production submission.
