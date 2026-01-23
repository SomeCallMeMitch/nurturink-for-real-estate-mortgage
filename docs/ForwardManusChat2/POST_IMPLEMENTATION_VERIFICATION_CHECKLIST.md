# Post-Implementation Verification Checklist for Base44

Use this checklist when asking Base44 to implement code changes. Paste this at the end of your implementation request.

---

**Post-Implementation Verification Request**

Before returning your report, please perform these checks:

1. **Syntax Validation:** Verify all JSX files have matching opening/closing tags, proper JavaScript syntax, no unclosed brackets or parentheses, and no duplicate function/variable declarations.

2. **Import Verification:** For each new file, confirm:
   - All imported components exist
   - All imported hooks are available
   - Icon imports from lucide-react are valid icon names
   - Path aliases (@/) resolve correctly
   - No circular dependencies between files

3. **Entity/Schema Check:** Verify any entity references (Client, QuickSendTemplate, User, Organization, FavoriteClient, Transaction, PricingTier, etc.) match existing entity schemas, including field names and types.

4. **Function Invocation Check:** Verify all `base44.functions.invoke()` calls use correct function names and parameter structures.

5. **Variable Consistency:** Check that:
   - Props passed to child components match their prop definitions
   - State variables and setters are consistently named
   - Callback functions receive expected parameters
   - async/await is used correctly (no missing await on async calls)

6. **Error Handling Check:** Verify try/catch blocks exist around async operations and error messages are user-friendly.

7. **File Locations:** Confirm files are placed in correct directories per project structure.

8. **Line Count Check:** Verify each file is under 800 lines. If over, suggest refactoring opportunities.

**Report Format:**
```
## Implementation Summary

### Files Created/Modified:
- [filename] - [location] - [status: Created/Modified] - [line count]

### Constants Centralization:
- [status and details]

### Entity Updates:
- [status and details]

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

Use a red X when there's anything that you could not execute and explain why

### Issues Found & Resolved:
- [any issues and how they were fixed]

### Ready for Testing:
[Yes/No + any caveats]
```
