# Phase 2: Data Layer Audit

This document examines the data layer of the NurturInk application, focusing on entity schemas, relationships, data validation, and potential integrity issues.

## 1. Entity Schema Review

A detailed review of each entity's schema was conducted to validate its structure, field types, and constraints. The findings are summarized below.

### `Client` Entity

The `Client` entity is well-structured for its purpose, but there are several areas for improvement:

| Field | Finding | Recommendation |
|---|---|---|
| `street_address`, `city`, `state`, `zip_code` | These fields are all optional (`required: false`). This could lead to incomplete addresses, causing failures when sending cards via the ScribeNurture API. | Make these fields required if a physical card is to be sent. Alternatively, implement a validation function that checks for the completeness of the address before attempting to send a card. |
| `birthday`, `renewal_date` | These date fields are stored as strings. While the format is specified as `date`, this relies on application-level enforcement. | Use a proper `date` or `timestamp` type if the database supports it to ensure data consistency and enable easier date-based queries. |
| `custom_fields` | This is a generic `object` type, which offers flexibility but lacks schema enforcement. This could lead to inconsistent data structures for custom fields across different clients. | If there are common custom fields, consider adding them as first-class properties to the schema. For truly dynamic fields, consider a separate `ClientCustomField` entity to better structure this data. |

### `AutomationRule` Entity

The `AutomationRule` entity is central to the automation engine. Its schema is mostly sound, but with a few potential issues:

| Field | Finding | Recommendation |
|---|---|---|
| `daysBefore`, `daysAfter` | These fields define the timing of the automation, but there is no validation to prevent both from being set, which could lead to ambiguous or conflicting rules. | Add a validation rule at the application or database level to ensure that only one of `daysBefore` or `daysAfter` can be set for a given rule. |

### General Observations on All Entities

*   **Missing Timestamps:** None of the entities explicitly include `created_at` or `updated_at` timestamps. While the prompt mentions that Base44 automatically includes `created_date` and `updated_date`, it is good practice to be explicit in the schema if these are critical for business logic or auditing. The prompt states: 

## 2. Relationship Audit

An analysis of the entity schemas reveals several implicit relationships, primarily managed at the application level. The absence of formal foreign key constraints in the JSON schemas means that data integrity is reliant on application logic.

| From Entity | To Entity | Relationship | Potential Issues |
|---|---|---|---|
| `AutomationHistory` | `AutomationRule` | `AutomationHistory.automationRuleId` -> `AutomationRule.id` | If an `AutomationRule` is deleted, the corresponding `AutomationHistory` records will be orphaned, making it difficult to audit past automations. |
| `AutomationHistory` | `Client` | `AutomationHistory.clientId` -> `Client.id` | If a `Client` is deleted, their automation history will be orphaned. |
| `AutomationRule` | `Template` | `AutomationRule.templateId` -> `Template.id` | If a `Template` is deleted, any `AutomationRule` that uses it will be broken. |
| `Invitation` | `User` (Organization) | `Invitation.organizationId` -> `User.id` (of the inviting user) | This seems to be a weak link. It's not clear how organizations are defined outside of the user who creates the invitation. |

### Orphaned Data Scenarios

The most significant risk identified in the relationship audit is the potential for orphaned data. For example:

*   **If a `User` is deleted:** What happens to the `Client` records they created? The schemas do not specify a cascading delete or a mechanism to reassign ownership.
*   **If a `Template` is deleted:** Any `AutomationRule` that relies on that template will fail at runtime. There is no mechanism to prevent the deletion of a template that is in use.

These scenarios highlight a need for more robust relationship management, either through application-level checks or, if the platform supports it, through more formally defined relationships in the data model.
