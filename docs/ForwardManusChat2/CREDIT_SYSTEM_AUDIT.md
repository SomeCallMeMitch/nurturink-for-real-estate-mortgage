# NurturInk Credit System - Deep Dive Audit

## Executive Summary

This document provides a detailed analysis of the NurturInk credit system, with a specific focus on the team/pool credit functionality. The audit was conducted to identify potential issues, missing functionality, and areas for improvement.

**Key Finding:** There is **no function** that allows an organization owner to transfer their personal credits (`personalPurchasedCredits`) to the organization pool (`Organization.creditBalance`). This is a significant gap in the credit management workflow.

---

## 1. Credit System Architecture

The NurturInk credit system uses three distinct credit "buckets":

| Credit Type | Stored On | Description |
|---|---|---|
| **Company Allocated Credits** | `User.companyAllocatedCredits` | Credits allocated to a specific team member from the organization pool by an owner/manager. |
| **Personal Purchased Credits** | `User.personalPurchasedCredits` | Credits purchased directly by an individual user for their own use. |
| **Organization Pool Credits** | `Organization.creditBalance` | A shared pool of credits for the entire organization, accessible by team members (if permitted). |

### Credit Deduction Hierarchy

When a user sends a card, credits are deducted in the following order (as defined in `checkCreditAvailability.ts`):

1.  **First:** `User.companyAllocatedCredits` (credits given to the user by their org)
2.  **Second:** `Organization.creditBalance` (the shared pool, if `User.canAccessCompanyPool` is `true`)
3.  **Last:** `User.personalPurchasedCredits` (the user's own purchased credits)

---

## 2. Credit Flow Analysis

### How Credits Enter the System

| Action | Function | Destination |
|---|---|---|
| **Organization Purchase** | `createCheckoutSession.ts` / `handleStripeWebhook.ts` | `Organization.creditBalance` |
| **Individual Purchase** | `createCheckoutSession.ts` / `handleStripeWebhook.ts` | `User.personalPurchasedCredits` |
| **Test/Seed Credits (Pool)** | `seedCompanyPoolCredits.ts` | `Organization.creditBalance` |
| **Test/Seed Credits (User)** | `seedUserCredits.ts` | `User.companyAllocatedCredits` |

### How Credits Move Within the System

| Action | Function | Source | Destination |
|---|---|---|---|
| **Allocate to Team Member** | `allocateCredits.ts` | `Organization.creditBalance` | `User.companyAllocatedCredits` |

### How Credits Leave the System

| Action | Function | Source(s) |
|---|---|---|
| **Send a Card** | `processMailingBatch.ts` | Deducted from `User.companyAllocatedCredits`, then `Organization.creditBalance`, then `User.personalPurchasedCredits` (in that order). |

---

## 3. Identified Issues

### Issue #1: Missing "Add Personal Credits to Pool" Function (Critical Gap)

**Problem:** An organization owner who purchases credits as an individual (which go to `User.personalPurchasedCredits`) has **no way** to transfer those credits to the `Organization.creditBalance` pool.

**Scenario:**
1.  An owner logs in and buys 100 credits.
2.  If the purchase is flagged as an "organization purchase" (based on `isOrgOwner` flag), the credits go to `Organization.creditBalance`. ✅
3.  If the purchase is flagged as an "individual purchase" (e.g., the `isOrgOwner` flag is not set correctly, or the user explicitly wants personal credits), the credits go to `User.personalPurchasedCredits`. ❌ **These credits are now "stuck" on the user and cannot be shared with the team.**

**Impact:** This can lead to confusion and frustration for organization owners who accidentally purchase credits for themselves instead of the pool, or who want to contribute their personal credits to the team.

**Recommendation:** Create a new function, `transferCreditsToPool.ts`, that allows an organization owner to move credits from their `personalPurchasedCredits` balance to the `Organization.creditBalance`.

---

### Issue #2: Potential Race Condition in `allocateCredits.ts`

**Problem:** The `allocateCredits.ts` function is not atomic. The process is:
1.  Read the organization's `creditBalance`.
2.  Check if the balance is sufficient.
3.  Loop through each user and update their `companyAllocatedCredits`.
4.  Update the organization's `creditBalance`.

If two administrators try to allocate credits at the exact same time, they could both read the same initial balance, both pass the sufficiency check, and both proceed to allocate, potentially over-allocating credits.

**Impact:** Low to Medium. This is unlikely to happen frequently, but it could lead to the organization pool going into a "negative" state if it does.

**Recommendation:** Refactor the function to use a single atomic database operation to check and debit the organization balance, or implement a locking mechanism.

---

### Issue #3: No Reversal/Clawback Mechanism

**Problem:** Once credits are allocated to a team member, there is no function to reverse the allocation (i.e., move credits from `User.companyAllocatedCredits` back to `Organization.creditBalance`).

**Scenario:** An owner allocates 50 credits to an employee. The employee leaves the company. Those 50 credits are now inaccessible to the organization.

**Impact:** Medium. This can lead to a gradual loss of credits from the organization pool over time.

**Recommendation:** Create a new function, `reclaimCredits.ts` or `deallocateCredits.ts`, that allows an organization owner to move credits from a team member's `companyAllocatedCredits` back to the `Organization.creditBalance`.

---

### Issue #4: `isOrgOwner` Check is Inconsistent

**Problem:** The check for whether a user is an organization owner is performed in two different ways across the codebase:
*   `user.appRole === 'organization_owner'`
*   `user.isOrgOwner === true`

Most functions check for **both** (`user.appRole === 'organization_owner' || user.isOrgOwner === true`), which is correct. However, if these two fields ever get out of sync, it could lead to unexpected behavior.

**Recommendation:** Standardize on a single source of truth for the "is org owner" check. Ideally, this should be a computed property or a single, authoritative field.

---

## 4. Summary of Recommendations

| Priority | Issue | Recommendation |
|---|---|---|
| **High** | Missing "Add to Pool" function | Create `transferCreditsToPool.ts` |
| **Medium** | No reversal mechanism | Create `reclaimCredits.ts` |
| **Medium** | Potential race condition | Refactor `allocateCredits.ts` for atomicity |
| **Low** | Inconsistent `isOrgOwner` check | Standardize the check across all functions |

---

## 5. Appendix: Function Inventory

| Function | Purpose |
|---|---|
| `checkCreditAvailability.ts` | Checks if a user has enough credits and calculates the deduction plan. |
| `allocateCredits.ts` | Moves credits from the org pool to a team member's allocated balance. |
| `getCompanyPoolStats.ts` | Gets statistics about the company pool (balance, team size, usage). |
| `toggleCompanyPoolAccess.ts` | Enables/disables a team member's access to the shared pool. |
| `seedCompanyPoolCredits.ts` | (Dev/Test) Adds test credits to the org pool. |
| `seedUserCredits.ts` | (Dev/Test) Adds test credits to a user's allocated balance. |
| `createCheckoutSession.ts` | Initiates a Stripe checkout session for purchasing credits. |
| `handleStripeWebhook.ts` | Processes Stripe webhook events to add credits after a successful purchase. |
| `processMailingBatch.ts` | Deducts credits when a batch of cards is sent. |
