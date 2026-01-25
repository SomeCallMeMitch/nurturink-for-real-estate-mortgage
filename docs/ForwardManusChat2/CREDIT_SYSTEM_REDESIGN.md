# NurturInk Credit System Redesign

## Executive Summary

This document outlines a comprehensive redesign of the NurturInk credit system to properly handle three distinct credit types with clear purchase flows, transfer capabilities, and consumption hierarchy.

---

## Current State Analysis

### Current Credit Buckets

| Bucket | Location | Purpose | Current Behavior |
|--------|----------|---------|------------------|
| **Company Pool** | `Organization.creditBalance` | Shared credits for the team | Org owners purchase → credits go here |
| **Company Allocated** | `User.companyAllocatedCredits` | Credits given to a user from the pool | Owner allocates from pool → user receives |
| **Personal Purchased** | `User.personalPurchasedCredits` | Credits user bought themselves | Non-org users purchase → credits go here |

### Current Problems

1. **No Choice at Purchase Time:** Org owners can't choose between company vs personal credits
2. **Org Owner Personal Credits:** If an org owner wants personal credits, they can't get them (all purchases go to pool)
3. **Transfer Function Mismatch:** The `transferCreditsToPool` function checks `personalPurchasedCredits`, but org owners typically have `0` there
4. **No Reclaim Function:** Can't take back allocated credits from team members
5. **Confusing UI:** The "56 credits" shown is `companyAllocatedCredits`, but transfer dialog checks `personalPurchasedCredits`

---

## Proposed Credit System Architecture

### Credit Buckets (No Change to Structure)

The three-bucket system is correct. We keep:

1. **Organization Pool** (`Organization.creditBalance`)
2. **Company Allocated** (`User.companyAllocatedCredits`)  
3. **Personal Purchased** (`User.personalPurchasedCredits`)

### User Types & Credit Access

| User Type | Can Purchase For Company? | Can Purchase Personal? | Can Access Pool? | Can Be Allocated? |
|-----------|--------------------------|----------------------|------------------|-------------------|
| **Solo User** (no org) | No | Yes | N/A | No |
| **Org Owner** | Yes | Yes | Yes (owns it) | Yes (self-allocate) |
| **Org Manager** | Yes | Yes | Yes | Yes |
| **Team Rep** | No | Yes | Configurable | Yes |

### Credit Consumption Hierarchy (No Change)

When a user sends cards, credits are consumed in this order:
1. **First:** `companyAllocatedCredits` (use what was given to you)
2. **Second:** `Organization.creditBalance` (if `canAccessCompanyPool = true`)
3. **Last:** `personalPurchasedCredits` (your own money, last resort)

This hierarchy is correct and should remain unchanged.

---

## Required Changes

### 1. Purchase Flow Changes

#### Current Flow
```
User clicks "Buy Credits" → Stripe checkout → 
  If org owner: credits → Organization.creditBalance
  If not org owner: credits → User.personalPurchasedCredits
```

#### New Flow
```
User clicks "Buy Credits" → 
  If user belongs to org AND (is owner OR is manager):
    Show modal: "Are these credits for Company Use or Personal Use?"
      Company Use → credits → Organization.creditBalance
      Personal Use → credits → User.personalPurchasedCredits
  Else if user belongs to org (team rep):
    credits → User.personalPurchasedCredits (their own money)
  Else (solo user):
    credits → User.personalPurchasedCredits
```

#### Implementation

**File: `functions/createCheckoutSession.ts`**

Add a new parameter `purchaseType` that can be:
- `"company"` - Credits go to `Organization.creditBalance`
- `"personal"` - Credits go to `User.personalPurchasedCredits`

**File: `functions/handleStripeWebhook.ts`**

Same change - read `purchaseType` from metadata and route accordingly.

**File: `src/pages/Credits.jsx`**

Before initiating checkout, show a modal for org owners/managers asking:
> "Where should these credits go?"
> - **Company Pool** - Available for your entire team
> - **Personal Balance** - Only for your personal use

---

### 2. Transfer Functions

#### 2.1 Transfer Personal Credits to Pool

**Purpose:** Allow any user with personal credits to contribute them to the company pool.

**Who can use:** Any org member with `personalPurchasedCredits > 0`

**File:** `functions/transferCreditsToPool.ts` (already exists, needs fix)

**Current Issue:** Only checks `personalPurchasedCredits`, which is correct. The UI was passing the wrong user object.

**Status:** ✅ Function logic is correct. UI fix was applied.

---

#### 2.2 Transfer Company Allocated Credits Back to Pool (NEW)

**Purpose:** Allow a user to return their allocated credits back to the company pool.

**Who can use:** Any org member with `companyAllocatedCredits > 0`

**Use cases:**
- Employee leaving the company
- Employee has too many credits allocated
- Employee wants to share unused credits with team

**File:** `functions/returnAllocatedCredits.ts` (NEW)

```
Input: { amount: number }
Process:
  1. Verify user is authenticated
  2. Verify user belongs to an org
  3. Verify user has enough companyAllocatedCredits
  4. Debit User.companyAllocatedCredits
  5. Credit Organization.creditBalance
  6. Create Transaction records
Output: { success, newUserBalance, newPoolBalance }
```

---

#### 2.3 Reclaim Allocated Credits (Owner Only) (NEW)

**Purpose:** Allow org owner to take back credits they allocated to a team member.

**Who can use:** Org owners only

**Use cases:**
- Employee leaving the company
- Employee misusing credits
- Rebalancing team allocations

**File:** `functions/reclaimAllocatedCredits.ts` (NEW)

```
Input: { userId: string, amount: number }
Process:
  1. Verify caller is org owner
  2. Verify target user belongs to same org
  3. Verify target user has enough companyAllocatedCredits
  4. Debit target User.companyAllocatedCredits
  5. Credit Organization.creditBalance
  6. Create Transaction records
Output: { success, userNewBalance, poolNewBalance }
```

---

### 3. UI Changes

#### 3.1 Credits Page - Purchase Section

Add a modal/dialog before checkout for org owners/managers:

```jsx
<PurchaseTypeDialog>
  <DialogTitle>Where should these credits go?</DialogTitle>
  <DialogDescription>
    Choose whether to add credits to your company pool (shared with team) 
    or your personal balance (only for your use).
  </DialogDescription>
  <RadioGroup>
    <Radio value="company">
      <Label>Company Pool</Label>
      <Description>Credits will be available for your entire team to use.</Description>
    </Radio>
    <Radio value="personal">
      <Label>Personal Balance</Label>
      <Description>Credits will only be available for your personal use.</Description>
    </Radio>
  </RadioGroup>
</PurchaseTypeDialog>
```

#### 3.2 Credits Page - Balance Display

Current display shows:
- Company Credit Pool: X
- Your Credit Balance: Y (companyAllocated + personalPurchased)

Proposed display:
```
┌─────────────────────────────────────────────────────────────┐
│ COMPANY CREDITS                                             │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ Pool Balance        │  │ Your Allocation     │           │
│ │ 150 credits         │  │ 56 credits          │           │
│ │ [Add to Pool]       │  │ [Return to Pool]    │           │
│ └─────────────────────┘  └─────────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│ PERSONAL CREDITS                                            │
│ ┌─────────────────────┐                                    │
│ │ Your Personal       │                                    │
│ │ 0 credits           │                                    │
│ │ [Transfer to Pool]  │                                    │
│ └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3 Team Management Page

Add ability for org owner to:
- See each member's `companyAllocatedCredits`
- Allocate more credits (existing)
- Reclaim credits (new)

---

## Transaction Types

Ensure the Transaction entity supports these types:

| Type | Description | Amount Sign |
|------|-------------|-------------|
| `purchase_org` | Company purchased credits | + |
| `purchase_user` | User purchased personal credits | + |
| `allocation_out` | Credits moved from pool to user | - (pool) |
| `allocation_in` | Credits received by user from pool | + (user) |
| `return_to_pool` | User returns allocated credits to pool | - (user), + (pool) |
| `reclaim` | Owner reclaims credits from user | - (user), + (pool) |
| `transfer_to_pool` | User transfers personal credits to pool | - (user), + (pool) |
| `usage` | Credits consumed sending cards | - |

---

## Implementation Priority

### Phase 1: Fix Current Issues (Immediate)
1. ✅ Fix TransferCreditsDialog user prop issue
2. Update `createCheckoutSession.ts` to accept `purchaseType` parameter
3. Update `handleStripeWebhook.ts` to read `purchaseType` from metadata
4. Add purchase type selection UI for org owners/managers

### Phase 2: Add Missing Functions (Short-term)
1. Create `returnAllocatedCredits.ts` function
2. Create `reclaimAllocatedCredits.ts` function
3. Add UI buttons for these actions

### Phase 3: UI Polish (Medium-term)
1. Redesign Credits page with clearer bucket display
2. Add credit management to Team page
3. Add transaction history filtering by type

---

## Questions for Base44 Review

1. Is the `purchaseType` parameter approach correct for routing credits at purchase time?
2. Should we add a `purchaseType` field to the Transaction entity for better tracking?
3. Are there any Base44 platform constraints we should be aware of for the new functions?
4. Should the `returnAllocatedCredits` function require owner approval, or can users do it freely?

---

## Files to Create/Modify

### New Files
- `functions/returnAllocatedCredits.ts`
- `functions/reclaimAllocatedCredits.ts`
- `src/components/credits/PurchaseTypeDialog.jsx`
- `src/components/credits/ReturnCreditsDialog.jsx`
- `src/components/credits/ReclaimCreditsDialog.jsx`

### Modified Files
- `functions/createCheckoutSession.ts` - Add `purchaseType` parameter
- `functions/handleStripeWebhook.ts` - Read `purchaseType` from metadata
- `src/pages/Credits.jsx` - Add purchase type selection, new balance display
- `src/pages/Team.jsx` - Add reclaim credits UI

---

## Appendix: Current Function Inventory

| Function | Purpose | Status |
|----------|---------|--------|
| `checkCreditAvailability.ts` | Check if user has enough credits | ✅ Correct |
| `allocateCredits.ts` | Allocate from pool to user | ✅ Correct |
| `createCheckoutSession.ts` | Create Stripe checkout | ⚠️ Needs purchaseType |
| `handleStripeWebhook.ts` | Process Stripe payment | ⚠️ Needs purchaseType |
| `transferCreditsToPool.ts` | Transfer personal to pool | ✅ Correct (UI was wrong) |
| `getCompanyPoolStats.ts` | Get pool statistics | ✅ Correct |
| `seedCompanyPoolCredits.ts` | Seed initial credits | ✅ Correct |
| `toggleCompanyPoolAccess.ts` | Toggle user pool access | ✅ Correct |
