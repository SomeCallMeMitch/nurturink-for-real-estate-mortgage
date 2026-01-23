# Base44 Evaluation Prompt for Credit System Redesign Phase 1

Please evaluate the following code changes that were pushed to the repository. These changes implement the ability for org owners and managers to choose whether purchased credits go to the company pool or their personal balance.

## Files Changed

### 1. `functions/createCheckoutSession.ts`
**Purpose:** Added `purchaseType` parameter support ('company' or 'personal')

**Key Changes:**
- Added optional `purchaseType` parameter to input validation
- Stores `purchaseType` in Stripe session metadata
- Handles simulation mode with purchaseType routing
- Defaults to 'company' for org owners if not specified

**Please Verify:**
- [ ] The `purchaseType` parameter is correctly added to Stripe metadata
- [ ] The simulation logic correctly routes credits based on purchaseType
- [ ] The function correctly handles the case when purchaseType is not provided (backward compatibility)
- [ ] Error handling is appropriate for all new code paths

### 2. `functions/handleStripeWebhook.ts`
**Purpose:** Routes credits to correct destination based on purchaseType metadata

**Key Changes:**
- Reads `purchaseType` from Stripe session metadata
- Routes credits to `Organization.creditBalance` for 'company' purchases
- Routes credits to `User.personalPurchasedCredits` for 'personal' purchases
- Creates appropriate Transaction records with correct type

**Please Verify:**
- [ ] The metadata is correctly extracted from the Stripe webhook payload
- [ ] Credits are correctly added to the right entity (Organization vs User)
- [ ] Transaction records have the correct `type` field ('purchase_org' vs 'purchase_user')
- [ ] The `toAccountType` field correctly reflects the destination ('organization_pool' vs 'user_personal')
- [ ] Backward compatibility is maintained if purchaseType is missing from metadata

### 3. `src/components/credits/PurchaseTypeDialog.jsx` (NEW FILE)
**Purpose:** Reusable dialog component for selecting purchase type

**Please Verify:**
- [ ] All imports exist and are correctly referenced
- [ ] The RadioGroup and RadioGroupItem components are available in @/components/ui
- [ ] The Lucide icons (Building2, User, Loader2) exist in the library
- [ ] Props are correctly typed and used
- [ ] The component follows Base44 patterns and conventions

### 4. `src/pages/Order.jsx`
**Purpose:** Added purchase type selection UI for org owners/managers

**Key Changes:**
- Added RadioGroup import from @/components/ui/radio-group
- Added purchaseType state variable (defaults to 'company')
- Added `canChoosePurchaseType` computed value to check if user is org owner/manager
- Added purchase type selection UI section
- Passes purchaseType to createCheckoutSession function call
- Shows selected purchase type in the order summary

**Please Verify:**
- [ ] All new imports exist and are correctly referenced
- [ ] The RadioGroup component is available and correctly used
- [ ] The conditional rendering logic is correct (only shows for org owners/managers)
- [ ] The purchaseType is correctly passed to the backend function
- [ ] The UI correctly updates based on user selection
- [ ] No syntax errors or unclosed tags

## Specific Questions for Base44

1. **RadioGroup Component:** Is `@/components/ui/radio-group` available in this project? If not, what is the correct import path or alternative component?

2. **User Role Check:** The code checks for `user?.appRole === 'organization_manager'` and `user?.isOrgManager === true`. Are these the correct field names for identifying managers in your User schema?

3. **Stripe Metadata:** Is there any limit on the metadata fields we can add to Stripe checkout sessions? We're adding `purchaseType` alongside existing metadata.

4. **Transaction Type:** We're using 'purchase_user' for personal purchases. Is this the correct transaction type, or should we use a different value?

## Test Scenarios to Validate

1. **Org Owner - Company Purchase:**
   - Select "Company Pool" option
   - Complete purchase (simulate)
   - Verify credits added to Organization.creditBalance
   - Verify Transaction created with type 'purchase_org'

2. **Org Owner - Personal Purchase:**
   - Select "Personal Balance" option
   - Complete purchase (simulate)
   - Verify credits added to User.personalPurchasedCredits
   - Verify Transaction created with type 'purchase_user'

3. **Org Manager - Both Options:**
   - Same tests as org owner

4. **Regular Team Member:**
   - Should NOT see purchase type selection
   - Credits should go to their personal balance (existing behavior)

5. **Solo User (no org):**
   - Should NOT see purchase type selection
   - Credits should go to their personal balance (existing behavior)

## Post-Implementation Verification Checklist

After reviewing, please provide:

```
## Implementation Summary

### Files Created/Modified:
- [filename] - [location] - [status: Created/Modified] - [line count]

### Verification Results:
| Check | Status | Notes |
|-------|--------|-------|
| Syntax | ✅/❌ | |
| Imports | ✅/❌ | |
| Entities | ✅/❌ | |
| Function Invocations | ✅/❌ | |
| Variables | ✅/❌ | |
| Error Handling | ✅/❌ | |
| File Locations | ✅/❌ | |
| Line Count (<800) | ✅/❌ | |

### Issues Found:
- [any issues that need to be fixed]

### Ready for Testing:
[Yes/No + any caveats]
```
