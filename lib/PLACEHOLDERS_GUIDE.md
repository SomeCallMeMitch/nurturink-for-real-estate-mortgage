# Placeholder Single Source of Truth (SSOT) Guide

**Location:** `/lib/placeholders.ts` and `/lib/placeholders.json`  
**Status:** Active - All code should reference this SSOT  
**Last Updated:** January 2026

---

## Overview

The Placeholder SSOT defines all supported placeholders for the NurturInk application. It serves as the canonical reference for:

- **Frontend UI components** - Display available placeholders to users
- **Backend functions** - Substitute placeholder values when rendering cards
- **Seed functions** - Create templates with correct placeholder syntax
- **Template rendering** - Validate and process placeholder strings
- **Documentation** - Reference for developers

---

## Unified Standard

**Format:** `{{object.property}}`  
**Convention:** Dot notation with lowercase object names  
**Objects:** `user`, `client`, `org`

### Why This Standard?

1. **Consistency** - Single convention across entire application
2. **Clarity** - Unambiguous object and property references
3. **Validation** - Easy to validate placeholder strings
4. **IDE Support** - TypeScript provides autocomplete and type checking
5. **Maintainability** - Single source of truth prevents duplication

---

## Placeholder Objects

### User Placeholders

Represents the person sending the card (rep/user/sender).

| Placeholder | Description | Required | Example |
|-------------|-------------|----------|---------|
| `{{user.firstName}}` | User first name | Yes | John |
| `{{user.lastName}}` | User last name | Yes | Smith |
| `{{user.fullName}}` | User full name (first + last) | Yes | John Smith |
| `{{user.email}}` | User email address | No | john@example.com |
| `{{user.phone}}` | User phone number | No | (555) 123-4567 |
| `{{user.companyName}}` | User company name | No | Acme Roofing |
| `{{user.title}}` | User job title | No | Sales Manager |
| `{{user.street}}` | User street address | No | 123 Main St |
| `{{user.city}}` | User city | No | Denver |
| `{{user.state}}` | User state/province | No | CO |
| `{{user.zipCode}}` | User ZIP/postal code | No | 80202 |

**Used in:** Signatures, greetings, message body personalization

---

### Client Placeholders

Represents the person receiving the card.

| Placeholder | Description | Required | Example |
|-------------|-------------|----------|---------|
| `{{client.firstName}}` | Client first name | Yes | Jane |
| `{{client.lastName}}` | Client last name | Yes | Doe |
| `{{client.fullName}}` | Client full name (first + last) | Yes | Jane Doe |
| `{{client.email}}` | Client email address | No | jane@example.com |
| `{{client.phone}}` | Client phone number | No | (555) 987-6543 |
| `{{client.company}}` | Client company name | No | ABC Construction |
| `{{client.street}}` | Client street address | No | 456 Oak Ave |
| `{{client.city}}` | Client city | No | Boulder |
| `{{client.state}}` | Client state/province | No | CO |
| `{{client.zipCode}}` | Client ZIP/postal code | No | 80301 |
| `{{client.initials}}` | Client initials (first + last) | No | JD |

**Used in:** Greetings, message body personalization

---

### Organization Placeholders

Represents the organization/company.

| Placeholder | Description | Required | Example |
|-------------|-------------|----------|---------|
| `{{org.name}}` | Organization name | Yes | Acme Roofing Inc |
| `{{org.email}}` | Organization email address | No | info@acmeroofing.com |
| `{{org.phone}}` | Organization phone number | No | (555) 123-4567 |
| `{{org.website}}` | Organization website URL | No | www.acmeroofing.com |
| `{{org.street}}` | Organization street address | No | 123 Main St |
| `{{org.city}}` | Organization city | No | Denver |
| `{{org.state}}` | Organization state/province | No | CO |
| `{{org.zipCode}}` | Organization ZIP/postal code | No | 80202 |

**Used in:** Signatures, envelopes, organizational context

---

## Usage Examples

### Note Style Signatures

**Friendly:**
```
Thanks!
{{user.firstName}}
```

**Casual:**
```
Talk soon,
{{user.firstName}}
```

**Professional:**
```
Best,
{{user.fullName}}
```

**Grateful:**
```
Thank you,
{{user.firstName}}
```

**Direct:**
```
— {{user.firstName}}
```

### Message Body Examples

**Thank You Message:**
```
Just wanted to say thanks for trusting us with your roof. 
We really appreciate your business and look forward to working with you again!
```

**Birthday Message:**
```
Happy birthday! Hope you have an amazing day.
```

**Win-back Message:**
```
Hey {{client.firstName}}, been thinking about you - it's been a minute! 
Would love to catch up soon.
```

### Envelope Address

```
{{client.fullName}}
{{client.street}}
{{client.city}}, {{client.state}} {{client.zipCode}}
```

---

## API Reference

### TypeScript Usage

```typescript
import { 
  PLACEHOLDERS, 
  isValidPlaceholder, 
  extractPlaceholders, 
  validatePlaceholders,
  getPlaceholderMetadata,
  getRequiredPlaceholders,
  getOptionalPlaceholders,
  getPlaceholderOptions
} from '@/lib/placeholders';

// Check if a placeholder is valid
const valid = isValidPlaceholder('{{user.firstName}}');  // true
const invalid = isValidPlaceholder('{{me.firstName}}');  // false

// Extract all placeholders from text
const text = 'Hi {{client.firstName}}, thanks {{user.firstName}}!';
const found = extractPlaceholders(text);  
// Returns: ['{{client.firstName}}', '{{user.firstName}}']

// Validate all placeholders in text
const result = validatePlaceholders(text);
// Returns: { isValid: true, found: [...], invalid: [] }

// Get metadata for a placeholder
const meta = getPlaceholderMetadata('{{user.firstName}}');
// Returns: { format, description, dataType, required, example }

// Get required placeholders for user object
const required = getRequiredPlaceholders('user');
// Returns: ['{{user.firstName}}', '{{user.lastName}}', '{{user.fullName}}']

// Get optional placeholders for client object
const optional = getOptionalPlaceholders('client');
// Returns: ['{{client.email}}', '{{client.phone}}', ...]

// Get formatted options for UI dropdown
const options = getPlaceholderOptions('user');
// Returns: [
//   { label: 'User first name ({{user.firstName}})', value: '{{user.firstName}}', ... },
//   ...
// ]
```

### JSON Usage

```javascript
// For backend functions that need to validate placeholders
import placeholders from '@/lib/placeholders.json';

const userPlaceholders = placeholders.user;
const clientFirstName = userPlaceholders.firstName.format;  // '{{user.firstName}}'
```

---

## Migration Guide

### Old Placeholders → New Standard

| Old Format | New Format | Notes |
|-----------|-----------|-------|
| `{{me.firstName}}` | `{{user.firstName}}` | Use `user` not `me` |
| `{{me.fullName}}` | `{{user.fullName}}` | Use `user` not `me` |
| `{{rep_first_name}}` | `{{user.firstName}}` | Use dot notation, not underscore |
| `{{rep_full_name}}` | `{{user.fullName}}` | Use dot notation, not underscore |
| `{{firstName}}` | `{{client.firstName}}` | Always include object prefix |
| `{{organization_name}}` | `{{org.name}}` | Use `org` not `organization` |

### Files to Update

1. **seedNoteStyleProfiles.js** - Update signature placeholders
2. **SettingsWritingStyle.jsx** - Reference SSOT for placeholder list
3. **AdminCardLayout.jsx** - Update placeholder references
4. **AdminEnvelopeLayout.jsx** - Update placeholder references
5. **Master Niche Prompt** - Use new placeholder format
6. **Any other templates** - Audit and update

---

## Validation Rules

### Required Placeholders

Every template must include at least these placeholders:

- **User:** `{{user.firstName}}` (for personalization)
- **Client:** `{{client.firstName}}` (for greeting)
- **Organization:** `{{org.name}}` (for context)

### Optional Placeholders

These can be used for additional personalization:

- User: email, phone, companyName, title, address fields
- Client: email, phone, company, address fields
- Organization: email, phone, website, address fields

### Validation Process

1. Extract all placeholders from text using `extractPlaceholders()`
2. Validate each placeholder using `isValidPlaceholder()`
3. Check for required placeholders using `getRequiredPlaceholders()`
4. Log errors for invalid or missing placeholders

---

## Best Practices

### For Frontend Components

1. **Always reference SSOT** - Import from `@/lib/placeholders`
2. **Use getPlaceholderOptions()** - For UI dropdowns and lists
3. **Validate user input** - Use `validatePlaceholders()` when users edit templates
4. **Show examples** - Display example values from metadata

### For Backend Functions

1. **Validate before rendering** - Check placeholders before sending to Scribe
2. **Log invalid placeholders** - Help developers debug template issues
3. **Handle missing data** - Gracefully handle missing placeholder values
4. **Use metadata** - Reference data types for validation

### For Seed Functions

1. **Use standardized format** - Always use `{{object.property}}`
2. **Reference SSOT** - Don't hardcode placeholder strings
3. **Validate templates** - Check all templates before creating
4. **Document variations** - Explain why different templates use different placeholders

---

## Testing

### Unit Tests

```typescript
import { isValidPlaceholder, validatePlaceholders } from '@/lib/placeholders';

describe('Placeholder Validation', () => {
  test('valid placeholder passes', () => {
    expect(isValidPlaceholder('{{user.firstName}}')).toBe(true);
  });

  test('invalid placeholder fails', () => {
    expect(isValidPlaceholder('{{me.firstName}}')).toBe(false);
  });

  test('validates all placeholders in text', () => {
    const result = validatePlaceholders('Hi {{client.firstName}}, thanks {{user.firstName}}!');
    expect(result.isValid).toBe(true);
    expect(result.found.length).toBe(2);
  });

  test('detects invalid placeholders', () => {
    const result = validatePlaceholders('Hi {{client.firstName}}, thanks {{me.firstName}}!');
    expect(result.isValid).toBe(false);
    expect(result.invalid).toContain('{{me.firstName}}');
  });
});
```

### Integration Tests

1. **Seed function test** - seedNoteStyleProfiles uses correct placeholders
2. **Template rendering test** - Placeholders are correctly substituted
3. **UI component test** - Placeholder dropdown shows correct options
4. **Validation test** - Invalid placeholders are rejected

---

## Future Enhancements

### Potential Additions

1. **Custom placeholders** - Allow organizations to define custom fields
2. **Conditional placeholders** - Show/hide based on conditions
3. **Formatting options** - `{{user.firstName|uppercase}}`, `{{client.phone|format}}`
4. **Localization** - Support multiple languages
5. **Dynamic placeholders** - Reference other placeholders

### Versioning

If changes are needed to the SSOT:

1. Update `lib/placeholders.ts`
2. Export both old and new formats during transition period
3. Update migration guide
4. Notify developers of deprecations
5. Set deprecation timeline

---

## Support & Questions

For questions about placeholders:

1. **Check this guide** - Most questions are answered here
2. **Review examples** - Look at existing templates
3. **Check metadata** - Use `getPlaceholderMetadata()` for details
4. **Ask Base44** - For backend rendering questions

---

## Changelog

### Version 1.0 (January 2026)

- Initial SSOT creation
- 32 total placeholders (11 user, 11 client, 10 org)
- TypeScript + JSON formats
- Comprehensive utility functions
- Migration guide from old formats
- Validation and testing utilities

