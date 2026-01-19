/**
 * Placeholder Single Source of Truth (SSOT)
 * 
 * This file defines all supported placeholders for the NurturInk application.
 * It serves as the canonical reference for:
 * - Frontend UI components (SettingsWritingStyle, PlaceholderModal, etc.)
 * - Backend functions (submitBatchToScribe, formatMessageForScribe, etc.)
 * - Seed functions (seedNoteStyleProfiles, etc.)
 * - Template rendering and validation
 * 
 * Format: {{object.property}}
 * Convention: Dot notation with lowercase object names
 * 
 * Objects:
 * - user: The person sending the card (rep/user)
 * - client: The person receiving the card
 * - org: The organization/company
 */

// Type definitions for placeholder metadata
export interface PlaceholderField {
  format: string;           // The actual placeholder string (e.g., "{{user.firstName}}")
  description: string;      // Human-readable description
  dataType: 'string' | 'email' | 'phone' | 'date';  // Data type for validation
  required: boolean;        // Whether this field is typically populated
  example: string;          // Example value
}

export interface PlaceholderCategory {
  [key: string]: PlaceholderField;
}

export interface PlaceholderStructure {
  user: PlaceholderCategory;
  client: PlaceholderCategory;
  org: PlaceholderCategory;
}

/**
 * UNIFIED PLACEHOLDER STANDARD
 * 
 * All placeholders use dot notation: {{object.property}}
 * This ensures consistency across frontend, backend, and seed functions.
 */
export const PLACEHOLDERS: PlaceholderStructure = {
  /**
   * USER PLACEHOLDERS
   * Represents the person sending the card (rep/user/sender)
   * Used in signatures, greetings, and message body
   */
  user: {
    firstName: {
      format: '{{user.firstName}}',
      description: 'User first name',
      dataType: 'string',
      required: true,
      example: 'John'
    },
    lastName: {
      format: '{{user.lastName}}',
      description: 'User last name',
      dataType: 'string',
      required: true,
      example: 'Smith'
    },
    fullName: {
      format: '{{user.fullName}}',
      description: 'User full name (first + last)',
      dataType: 'string',
      required: true,
      example: 'John Smith'
    },
    email: {
      format: '{{user.email}}',
      description: 'User email address',
      dataType: 'email',
      required: false,
      example: 'john@example.com'
    },
    phone: {
      format: '{{user.phone}}',
      description: 'User phone number',
      dataType: 'phone',
      required: false,
      example: '(555) 123-4567'
    },
    companyName: {
      format: '{{user.companyName}}',
      description: 'User company name',
      dataType: 'string',
      required: false,
      example: 'Acme Roofing'
    },
    title: {
      format: '{{user.title}}',
      description: 'User job title',
      dataType: 'string',
      required: false,
      example: 'Sales Manager'
    },
    street: {
      format: '{{user.street}}',
      description: 'User street address',
      dataType: 'string',
      required: false,
      example: '123 Main St'
    },
    city: {
      format: '{{user.city}}',
      description: 'User city',
      dataType: 'string',
      required: false,
      example: 'Denver'
    },
    state: {
      format: '{{user.state}}',
      description: 'User state/province',
      dataType: 'string',
      required: false,
      example: 'CO'
    },
    zipCode: {
      format: '{{user.zipCode}}',
      description: 'User ZIP/postal code',
      dataType: 'string',
      required: false,
      example: '80202'
    }
  },

  /**
   * CLIENT PLACEHOLDERS
   * Represents the person receiving the card
   * Used in greetings, message body, and personalization
   */
  client: {
    firstName: {
      format: '{{client.firstName}}',
      description: 'Client first name',
      dataType: 'string',
      required: true,
      example: 'Jane'
    },
    lastName: {
      format: '{{client.lastName}}',
      description: 'Client last name',
      dataType: 'string',
      required: true,
      example: 'Doe'
    },
    fullName: {
      format: '{{client.fullName}}',
      description: 'Client full name (first + last)',
      dataType: 'string',
      required: true,
      example: 'Jane Doe'
    },
    email: {
      format: '{{client.email}}',
      description: 'Client email address',
      dataType: 'email',
      required: false,
      example: 'jane@example.com'
    },
    phone: {
      format: '{{client.phone}}',
      description: 'Client phone number',
      dataType: 'phone',
      required: false,
      example: '(555) 987-6543'
    },
    company: {
      format: '{{client.company}}',
      description: 'Client company name',
      dataType: 'string',
      required: false,
      example: 'ABC Construction'
    },
    street: {
      format: '{{client.street}}',
      description: 'Client street address',
      dataType: 'string',
      required: false,
      example: '456 Oak Ave'
    },
    city: {
      format: '{{client.city}}',
      description: 'Client city',
      dataType: 'string',
      required: false,
      example: 'Boulder'
    },
    state: {
      format: '{{client.state}}',
      description: 'Client state/province',
      dataType: 'string',
      required: false,
      example: 'CO'
    },
    zipCode: {
      format: '{{client.zipCode}}',
      description: 'Client ZIP/postal code',
      dataType: 'string',
      required: false,
      example: '80301'
    },
    initials: {
      format: '{{client.initials}}',
      description: 'Client initials (first letter of first and last name)',
      dataType: 'string',
      required: false,
      example: 'JD'
    }
  },

  /**
   * ORGANIZATION PLACEHOLDERS
   * Represents the organization/company
   * Used in signatures, envelopes, and organizational context
   */
  org: {
    name: {
      format: '{{org.name}}',
      description: 'Organization name',
      dataType: 'string',
      required: true,
      example: 'Acme Roofing Inc'
    },
    email: {
      format: '{{org.email}}',
      description: 'Organization email address',
      dataType: 'email',
      required: false,
      example: 'info@acmeroofing.com'
    },
    phone: {
      format: '{{org.phone}}',
      description: 'Organization phone number',
      dataType: 'phone',
      required: false,
      example: '(555) 123-4567'
    },
    website: {
      format: '{{org.website}}',
      description: 'Organization website URL',
      dataType: 'string',
      required: false,
      example: 'www.acmeroofing.com'
    },
    street: {
      format: '{{org.street}}',
      description: 'Organization street address',
      dataType: 'string',
      required: false,
      example: '123 Main St'
    },
    city: {
      format: '{{org.city}}',
      description: 'Organization city',
      dataType: 'string',
      required: false,
      example: 'Denver'
    },
    state: {
      format: '{{org.state}}',
      description: 'Organization state/province',
      dataType: 'string',
      required: false,
      example: 'CO'
    },
    zipCode: {
      format: '{{org.zipCode}}',
      description: 'Organization ZIP/postal code',
      dataType: 'string',
      required: false,
      example: '80202'
    }
  }
};

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get all placeholder formats as a flat array
 * Useful for validation and documentation
 */
export function getAllPlaceholderFormats(): string[] {
  const formats: string[] = [];
  
  Object.values(PLACEHOLDERS).forEach(category => {
    Object.values(category).forEach(field => {
      formats.push(field.format);
    });
  });
  
  return formats;
}

/**
 * Check if a placeholder string is valid
 * @param placeholder - The placeholder string to validate (e.g., "{{user.firstName}}")
 * @returns true if valid, false otherwise
 */
export function isValidPlaceholder(placeholder: string): boolean {
  return getAllPlaceholderFormats().includes(placeholder);
}

/**
 * Extract all placeholders from a text string
 * @param text - The text to search for placeholders
 * @returns Array of placeholder strings found
 */
export function extractPlaceholders(text: string): string[] {
  const regex = /\{\{[\w.]+\}\}/g;
  const matches = text.match(regex) || [];
  return matches;
}

/**
 * Validate all placeholders in a text string
 * @param text - The text to validate
 * @returns Object with validation results
 */
export function validatePlaceholders(text: string): {
  isValid: boolean;
  found: string[];
  invalid: string[];
} {
  const found = extractPlaceholders(text);
  const invalid = found.filter(placeholder => !isValidPlaceholder(placeholder));
  
  return {
    isValid: invalid.length === 0,
    found,
    invalid
  };
}

/**
 * Get placeholder field metadata
 * @param format - The placeholder format (e.g., "{{user.firstName}}")
 * @returns PlaceholderField metadata or null if not found
 */
export function getPlaceholderMetadata(format: string): PlaceholderField | null {
  for (const category of Object.values(PLACEHOLDERS)) {
    for (const field of Object.values(category)) {
      if (field.format === format) {
        return field;
      }
    }
  }
  return null;
}

/**
 * Get all required placeholders for a given object (user, client, org)
 * @param objectName - The object name (e.g., "user", "client", "org")
 * @returns Array of required placeholder formats
 */
export function getRequiredPlaceholders(objectName: keyof PlaceholderStructure): string[] {
  const category = PLACEHOLDERS[objectName];
  if (!category) return [];
  
  return Object.values(category)
    .filter(field => field.required)
    .map(field => field.format);
}

/**
 * Get all optional placeholders for a given object
 * @param objectName - The object name (e.g., "user", "client", "org")
 * @returns Array of optional placeholder formats
 */
export function getOptionalPlaceholders(objectName: keyof PlaceholderStructure): string[] {
  const category = PLACEHOLDERS[objectName];
  if (!category) return [];
  
  return Object.values(category)
    .filter(field => !field.required)
    .map(field => field.format);
}

/**
 * Format placeholder list for UI display
 * @param objectName - The object name (e.g., "user", "client", "org")
 * @returns Array of formatted placeholder options for UI
 */
export function getPlaceholderOptions(objectName: keyof PlaceholderStructure) {
  const category = PLACEHOLDERS[objectName];
  if (!category) return [];
  
  return Object.values(category).map(field => ({
    label: `${field.description} (${field.format})`,
    value: field.format,
    description: field.description,
    example: field.example
  }));
}

/**
 * Export as JSON for other systems
 */
export function exportAsJSON() {
  return JSON.stringify(PLACEHOLDERS, null, 2);
}
