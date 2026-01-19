# Placeholder Audit - Inconsistencies & Conflicts

**Date:** January 2026  
**Purpose:** Document all placeholder usage patterns and identify inconsistencies  
**Status:** Requires Base44 confirmation before cleanup

---

## 📊 Summary of Findings

**Total Placeholder Patterns Found:** 8 different naming conventions  
**Files with Inconsistencies:** 10+  
**Critical Issues:** 3  
**Moderate Issues:** 5  
**Minor Issues:** 4

---

## 🔴 CRITICAL ISSUES

### Issue #1: Multiple Naming Conventions for Same Data

**Problem:** Different parts of the code use different placeholder names for the same data.

| Data | Placeholder Variants Found |
|------|---------------------------|
| **User/Rep First Name** | `{{user.firstName}}`, `{{me.firstName}}`, `{{rep_first_name}}` |
| **User/Rep Full Name** | `{{user.fullName}}`, `{{me.fullName}}`, `{{rep_full_name}}` |
| **User/Rep Company** | `{{user.companyName}}`, `{{me.companyName}}`, `{{rep_company_name}}` |
| **User/Rep Phone** | `{{user.phone}}`, `{{me.phone}}`, `{{rep_phone}}` |
| **Client First Name** | `{{client.firstName}}`, `{{firstName}}` |
| **Organization Name** | `{{org.name}}`, `{{organization_name}}` |

**Example Conflicts:**
- `seedNoteStyleProfiles.js` uses: `{{me.fullName}}`
- `SettingsWritingStyle.jsx` uses: `{{user.fullName}}`
- `AdminCardLayout.jsx` uses: `{{rep_full_name}}`

**Impact:** When templates are rendered, the system needs to know which placeholder convention to use. If different functions expect different formats, data won't be substituted correctly.

---

### Issue #2: Dot Notation vs Underscore Notation

**Problem:** Inconsistent use of dot notation vs underscore notation.

**Dot Notation (Object-style):**
```
{{user.firstName}}
{{client.firstName}}
{{org.name}}
{{me.fullName}}
```

**Underscore Notation (Flat-style):**
```
{{rep_first_name}}
{{rep_full_name}}
{{rep_company_name}}
{{rep_phone}}
{{organization_name}}
```

**Where Each is Used:**

| File | Convention | Examples |
|------|-----------|----------|
| `seedNoteStyleProfiles.js` | Dot + `me` | `{{me.fullName}}`, `{{client.firstName}}` |
| `SettingsWritingStyle.jsx` | Dot + `user` | `{{user.firstName}}`, `{{client.firstName}}` |
| `AdminCardLayout.jsx` | Underscore + `rep` | `{{rep_full_name}}`, `{{rep_company_name}}` |
| `AdminEnvelopeLayout.jsx` | Dot + `org` | `{{org.name}}`, `{{org.street}}` |
| `SettingsProfile.jsx` | Dot + `me` | `{{me.firstName}}`, `{{me.companyName}}` |

**Impact:** Backend rendering engine needs to know which convention to use. If it expects `{{user.firstName}}` but receives `{{me.firstName}}`, it won't substitute.

---

### Issue #3: Inconsistent Object Naming (`me` vs `user`)

**Problem:** User/rep data is referenced as both `{{me.*}}` and `{{user.*}}`.

**`{{me.*}}` Usage:**
- `seedNoteStyleProfiles.js`: `{{me.fullName}}`, `{{me.companyName}}`, `{{me.phone}}`
- `SettingsProfile.jsx`: `{{me.firstName}}`, `{{me.lastName}}`, `{{me.companyName}}`

**`{{user.*}}` Usage:**
- `SettingsWritingStyle.jsx`: `{{user.firstName}}`, `{{user.fullName}}`, `{{user.phone}}`
- `seedNoteStyleProfiles.js` (alternative): Would use `{{user.fullName}}`

**Impact:** These refer to the same person (the rep/user sending the card). Using both conventions creates confusion and potential rendering failures.

---

## 🟡 MODERATE ISSUES

### Issue #4: Missing Placeholder Documentation

**Problem:** Different files document different available placeholders.

**SettingsWritingStyle.jsx** documents these placeholders:

**Client Placeholders:**
- `{{client.firstName}}`
- `{{client.lastName}}`
- `{{client.fullName}}`
- `{{client.email}}`
- `{{client.phone}}`
- `{{client.company}}`
- `{{client.street}}`
- `{{client.city}}`
- `{{client.state}}`
- `{{client.zipCode}}`
- `{{client.initials}}`

**User Placeholders:**
- `{{user.firstName}}`
- `{{user.lastName}}`
- `{{user.fullName}}`
- `{{user.email}}`
- `{{user.phone}}`
- `{{user.companyName}}`
- `{{user.title}}`
- `{{user.street}}`
- `{{user.city}}`
- `{{user.state}}`
- `{{user.zipCode}}`

**Organization Placeholders:**
- `{{org.name}}`
- `{{org.email}}`
- `{{org.phone}}`
- `{{org.website}}`
- `{{org.street}}`
- `{{org.city}}`
- `{{org.state}}`
- `{{org.zipCode}}`

**But:** `seedNoteStyleProfiles.js` only uses:
- `{{client.firstName}}`
- `{{me.fullName}}`
- `{{me.companyName}}`
- `{{me.phone}}`

**Question:** Are all the documented placeholders actually supported by the backend rendering engine?

---

### Issue #5: `{{firstName}}` Without Prefix

**Problem:** `AdminCardLayout.jsx` uses `{{firstName}}` without object prefix.

```javascript
{ label: "Dear {{firstName}},", value: "Dear {{firstName}}," }
```

**But everywhere else uses:** `{{client.firstName}}`

**Question:** Is `{{firstName}}` a shorthand for `{{client.firstName}}`? Or is this a bug?

---

### Issue #6: Inconsistent Signature Format

**Problem:** Different files format signatures differently.

**seedNoteStyleProfiles.js:**
```
"signatureText: "Sincerely,\n{{me.fullName}}\n{{me.companyName}}\n{{me.phone}}"
```

**SettingsWritingStyle.jsx:**
```
"Sincerely,\n{{user.fullName}}\n{{user.companyName}}\n{{user.phone}}"
```

**AdminCardLayout.jsx:**
```
"Sincerely, {{rep_full_name}}"
```

**Your Standard (from recent conversation):**
```
"Best,\n{{user.fullName}}"
```

**Question:** Which format is correct? Should signatures include phone and company, or just name?

---

### Issue #7: Organization vs Org Naming

**Problem:** Organization data uses both `{{org.*}}` and `{{organization_name}}`.

**SettingsWritingStyle.jsx uses:** `{{org.name}}`, `{{org.email}}`, `{{org.phone}}`, `{{org.website}}`

**AdminEnvelopeLayout.jsx uses:** `{{org.name}}`, `{{org.street}}`, `{{org.city}}`, `{{org.state}}`, `{{org.zipCode}}`

**But:** No `{{organization_name}}` found in current code (though it was mentioned in your standards).

---

## 🟢 MINOR ISSUES

### Issue #8: Missing Phone in Some Signatures

**seedNoteStyleProfiles.js** includes phone in some signatures:
```
"signatureText: "Thank you,\n{{me.fullName}}\n{{me.companyName}}"
```

**But also:**
```
"signatureText: "All the best,\n{{me.fullName}}\n{{me.phone}}"
```

**Your standards** don't include phone in signatures.

---

### Issue #9: Inconsistent Capitalization

**seedNoteStyleProfiles.js:**
- `signatureText` (camelCase)
- `defaultGreeting` (camelCase)
- `includeSignatureByDefault` (camelCase)

**SettingsWritingStyle.jsx:**
- `signatureText` (camelCase)
- `defaultGreeting` (camelCase)

**AdminCardLayout.jsx:**
- Uses plain strings, no field names

**Question:** Are field names consistent in the database entity?

---

### Issue #10: Missing Placeholders in Some Contexts

**SettingsWritingStyle.jsx** documents many placeholders, but:
- `seedNoteStyleProfiles.js` only uses 4 of them
- `AdminCardLayout.jsx` uses even fewer

**Question:** Are the undocumented placeholders actually available for use?

---

## 📋 Placeholder Inventory

### All Placeholder Patterns Found in Code

| Pattern | Convention | Object | Field | Files |
|---------|-----------|--------|-------|-------|
| `{{user.firstName}}` | Dot | user | firstName | SettingsWritingStyle.jsx |
| `{{user.fullName}}` | Dot | user | fullName | SettingsWritingStyle.jsx |
| `{{user.companyName}}` | Dot | user | companyName | SettingsWritingStyle.jsx |
| `{{user.phone}}` | Dot | user | phone | SettingsWritingStyle.jsx |
| `{{me.firstName}}` | Dot | me | firstName | SettingsProfile.jsx |
| `{{me.fullName}}` | Dot | me | fullName | seedNoteStyleProfiles.js, SettingsProfile.jsx |
| `{{me.companyName}}` | Dot | me | companyName | SettingsProfile.jsx |
| `{{me.phone}}` | Dot | me | phone | seedNoteStyleProfiles.js |
| `{{client.firstName}}` | Dot | client | firstName | seedNoteStyleProfiles.js, SettingsWritingStyle.jsx |
| `{{client.lastName}}` | Dot | client | lastName | SettingsWritingStyle.jsx |
| `{{client.fullName}}` | Dot | client | fullName | SettingsWritingStyle.jsx |
| `{{client.email}}` | Dot | client | email | SettingsWritingStyle.jsx |
| `{{client.phone}}` | Dot | client | phone | SettingsWritingStyle.jsx |
| `{{client.company}}` | Dot | client | company | SettingsWritingStyle.jsx |
| `{{client.street}}` | Dot | client | street | SettingsWritingStyle.jsx |
| `{{client.city}}` | Dot | client | city | SettingsWritingStyle.jsx |
| `{{client.state}}` | Dot | client | state | SettingsWritingStyle.jsx |
| `{{client.zipCode}}` | Dot | client | zipCode | SettingsWritingStyle.jsx |
| `{{client.initials}}` | Dot | client | initials | SettingsWritingStyle.jsx |
| `{{org.name}}` | Dot | org | name | AdminEnvelopeLayout.jsx, SettingsWritingStyle.jsx |
| `{{org.email}}` | Dot | org | email | SettingsWritingStyle.jsx |
| `{{org.phone}}` | Dot | org | phone | SettingsWritingStyle.jsx |
| `{{org.website}}` | Dot | org | website | SettingsWritingStyle.jsx |
| `{{org.street}}` | Dot | org | street | AdminEnvelopeLayout.jsx |
| `{{org.city}}` | Dot | org | city | AdminEnvelopeLayout.jsx |
| `{{org.state}}` | Dot | org | state | AdminEnvelopeLayout.jsx |
| `{{org.zipCode}}` | Dot | org | zipCode | AdminEnvelopeLayout.jsx |
| `{{firstName}}` | Plain | - | firstName | AdminCardLayout.jsx |
| `{{rep_full_name}}` | Underscore | rep | full_name | AdminCardLayout.jsx |
| `{{rep_company_name}}` | Underscore | rep | company_name | AdminCardLayout.jsx |
| `{{rep_phone}}` | Underscore | rep | phone | AdminCardLayout.jsx |

---

## 🎯 Recommended Standard (Pending Base44 Confirmation)

Based on the most common usage and your recent standards, I recommend:

### **Unified Placeholder Convention**

**User/Rep Placeholders:**
- `{{user.firstName}}` (not `{{me.firstName}}` or `{{rep_first_name}}`)
- `{{user.lastName}}`
- `{{user.fullName}}`
- `{{user.email}}`
- `{{user.phone}}`
- `{{user.companyName}}`
- `{{user.title}}`
- `{{user.street}}`
- `{{user.city}}`
- `{{user.state}}`
- `{{user.zipCode}}`

**Client Placeholders:**
- `{{client.firstName}}`
- `{{client.lastName}}`
- `{{client.fullName}}`
- `{{client.email}}`
- `{{client.phone}}`
- `{{client.company}}`
- `{{client.street}}`
- `{{client.city}}`
- `{{client.state}}`
- `{{client.zipCode}}`
- `{{client.initials}}`

**Organization Placeholders:**
- `{{org.name}}`
- `{{org.email}}`
- `{{org.phone}}`
- `{{org.website}}`
- `{{org.street}}`
- `{{org.city}}`
- `{{org.state}}`
- `{{org.zipCode}}`

### **Signature Standard (Pending Confirmation)**

Your recent standard:
```
Friendly: "Thanks!\n{{user.firstName}}"
Casual: "Talk soon,\n{{user.firstName}}"
Professional: "Best,\n{{user.fullName}}"
Grateful: "Thank you,\n{{user.firstName}}"
Direct: "— {{user.firstName}}"
```

---

## ❓ Questions for Base44

1. **Which placeholder convention is the backend rendering engine expecting?**
   - Dot notation with `user`? (e.g., `{{user.firstName}}`)
   - Dot notation with `me`? (e.g., `{{me.firstName}}`)
   - Underscore notation? (e.g., `{{rep_first_name}}`)

2. **Are all documented placeholders in SettingsWritingStyle.jsx actually supported?**
   - Or only a subset?

3. **What is the correct signature format?**
   - Just name? (e.g., `Thanks!\n{{user.firstName}}`)
   - Name + company? (e.g., `Thanks!\n{{user.fullName}}\n{{user.companyName}}`)
   - Name + phone? (e.g., `Thanks!\n{{user.fullName}}\n{{user.phone}}`)

4. **Should `{{firstName}}` (without prefix) work as shorthand for `{{client.firstName}}`?**

5. **Are there any other placeholders we should support?**

---

## 📝 Files Affected

**Files with Placeholder Usage:**
1. `functions/seedNoteStyleProfiles.js` - Uses `{{me.*}}` and `{{client.firstName}}`
2. `src/pages/SettingsWritingStyle.jsx` - Documents `{{user.*}}`, `{{client.*}}`, `{{org.*}}`
3. `src/pages/SettingsProfile.jsx` - Uses `{{me.*}}`
4. `src/pages/AdminCardLayout.jsx` - Uses `{{firstName}}` and `{{rep_*}}`
5. `src/pages/AdminEnvelopeLayout.jsx` - Uses `{{org.*}}`
6. `src/pages/SettingsOrganization.jsx` - References `{{org.*}}`

---

## 🔧 Next Steps

1. **Get Base44 Confirmation** on the 5 questions above
2. **Create Placeholder Standard Document** with confirmed convention
3. **Update all files** to use consistent convention
4. **Update seedNoteStyleProfiles.js** to use correct placeholders
5. **Update Master Niche Prompt** to use correct placeholders
6. **Create placeholder reference guide** for future development

---

**Status:** Awaiting Base44 confirmation before proceeding with cleanup.

