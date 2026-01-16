# NurturInk Database Schema Documentation

## Overview

This document describes the complete database schema for NurturInk's automated card-sending system. All entities are defined as JSON schemas in the `entities/` directory and follow Base44 platform conventions.

---

## Entity Definitions

### 1. AutomationHistory

**Purpose:** Tracks all automated cards sent through the system for auditing and analytics.

**Key Fields:**
- `automationRuleId`: Reference to the rule that triggered this send
- `clientId`: Reference to the recipient client
- `triggerType`: Type of trigger (birthday, new_client_welcome, renewal_reminder, referral_request)
- `templateId`: Reference to the template used
- `sentDate`: ISO 8601 timestamp of when the card was sent
- `scribeBatchId`: Batch ID from Scribe API for fulfillment tracking
- `status`: Current status (sent, failed, pending, cancelled)
- `errorMessage`: Error details if status is 'failed'

**Built-in Fields (Auto-generated):**
- `id`: Unique identifier
- `created_date`: Creation timestamp
- `updated_date`: Last update timestamp
- `created_by`: User who created this record

**Use Cases:**
- Audit trail of all automated sends
- Analytics and reporting
- Troubleshooting failed sends
- Compliance and record-keeping

---

### 2. Client

**Purpose:** Stores client/contact information used for automation targeting and card personalization.

**Key Fields:**
- `name`: Full name of the client
- `email`: Email address (required, unique per user)
- `phone`: Phone number
- `company`: Associated company name
- `street_address`, `city`, `state`, `zip_code`: Mailing address for card fulfillment
- `birthday`: Client's birthday (YYYY-MM-DD) for birthday automation
- `renewal_date`: Renewal date (YYYY-MM-DD) for renewal reminder automation
- `referral_status`: Status of referral (none, pending, completed)
- `automation_status`: Whether automations are active for this client (active, paused, opted_out)
- `last_automation_trigger`: Timestamp of last automation trigger
- `tags`: Array of tags for organizing clients
- `custom_fields`: Object for storing additional data

**Built-in Fields (Auto-generated):**
- `id`: Unique identifier
- `created_date`: Creation timestamp
- `updated_date`: Last update timestamp
- `created_by`: User who created this record

**Use Cases:**
- Target automation rules to specific clients
- Personalize card messages with client data
- Track automation history per client
- Segment clients by tags or custom fields

**Indexes Recommended:**
- `created_by` (filter by user)
- `email` (duplicate detection)
- `birthday` (birthday automation)
- `renewal_date` (renewal automation)
- `tags` (filtering)

---

### 3. AutomationRule

**Purpose:** Configuration for how and when to send automated cards.

**Key Fields:**
- `triggerTypeId`: Reference to the trigger type (birthday, new_client_welcome, etc.)
- `templateId`: Reference to the template to use
- `daysBefore`: Days before trigger date to send (0-365)
- `daysAfter`: Days after trigger date to send (0-365)
- `frequencyCap`: How often to send per client (once, annually, monthly, per_event)
- `isActive`: Whether this rule is currently active
- `customMessage`: Optional custom message to append to template
- `last_run_date`: Timestamp of last execution
- `next_run_date`: Timestamp of next scheduled execution
- `description`: Human-readable description
- `client_filter`: Optional filter to limit which clients this applies to

**Built-in Fields (Auto-generated):**
- `id`: Unique identifier
- `created_date`: Creation timestamp
- `updated_date`: Last update timestamp
- `created_by`: User who created this record

**Use Cases:**
- Define automation workflows
- Control timing and frequency of sends
- Customize messages per trigger type
- Enable/disable automations without deleting

**Indexes Recommended:**
- `created_by` (filter by user)
- `isActive` (find active rules)
- `triggerTypeId` (find rules by trigger)

---

### 4. TriggerType

**Purpose:** Defines the types of events that can trigger automated card sends.

**Key Fields:**
- `name`: Display name (e.g., "Birthday")
- `key`: Unique identifier (e.g., "birthday")
- `description`: When this trigger fires
- `icon`: Icon name for UI
- `isActive`: Whether this trigger type is available
- `defaultDaysBefore`: Default days before to send
- `defaultDaysAfter`: Default days after to send
- `defaultFrequencyCap`: Default frequency cap
- `clientFieldRequired`: Which client field is required (e.g., "birthday")
- `sortOrder`: Display order in UI

**Built-in Fields (Auto-generated):**
- `id`: Unique identifier
- `created_date`: Creation timestamp
- `updated_date`: Last update timestamp
- `created_by`: User who created this record

**Pre-populated Trigger Types:**
1. **Birthday** - Send card on client's birthday
2. **New Client Welcome** - Send card when client is added
3. **Renewal Reminder** - Send card before renewal date
4. **Referral Request** - Send card when client has pending referral

**Use Cases:**
- Define available automation triggers
- Provide default settings for new rules
- Validate trigger type references

---

### 5. Template

**Purpose:** Message templates with placeholder support for personalization.

**Key Fields:**
- `name`: Display name (e.g., "Birthday - Default")
- `key`: Unique identifier (e.g., "birthday_default")
- `content`: Template content with placeholders like {{clientName}}, {{userFullName}}
- `category`: Category (e.g., "Personal", "Professional")
- `cardDesign`: Card design to use (e.g., "Thank you - Plain White")
- `noteStyle`: Style profile (casual, professional, formal)
- `tone`: Tone of message (casual, professional, formal, warm, grateful)
- `description`: When to use this template
- `isDefault`: Whether this is a default template
- `isActive`: Whether available for use
- `placeholders`: List of available placeholders
- `sortOrder`: Display order in UI

**Built-in Fields (Auto-generated):**
- `id`: Unique identifier
- `created_date`: Creation timestamp
- `updated_date`: Last update timestamp
- `created_by`: User who created this record

**Available Placeholders:**
- `{{clientName}}` - Recipient's name
- `{{clientCompany}}` - Recipient's company
- `{{userFullName}}` - Sender's full name
- `{{userCompany}}` - Sender's company

**Pre-populated Templates:**
1. **Birthday - Default** - Casual birthday greeting
2. **New Client Welcome - Default** - Casual welcome message
3. **Renewal Reminder - Default** - Casual renewal reminder
4. **Referral Request - Default** - Casual referral request

**Use Cases:**
- Store reusable message templates
- Support user-created templates
- Provide default templates for quick setup
- Track template usage

---

### 6. CardDesign

**Purpose:** Available card designs for automated sends (provided by Scribe API).

**Key Fields:**
- `name`: Display name (e.g., "Thank you - Plain White")
- `key`: Unique identifier (e.g., "thank_you_plain_white")
- `description`: Description of the design
- `category`: Category (Thank You, Birthday, Congratulations, etc.)
- `imageUrl`: URL to preview image
- `isActive`: Whether available for use
- `isDefault`: Whether this is a default design
- `sortOrder`: Display order in UI

**Built-in Fields (Auto-generated):**
- `id`: Unique identifier
- `created_date`: Creation timestamp
- `updated_date`: Last update timestamp
- `created_by`: User who created this record

**Pre-populated Card Designs:**
- Thank you - Plain White (default for all templates)
- Other designs from Scribe API catalog

**Use Cases:**
- Store available card designs from Scribe
- Allow users to select card designs
- Provide preview images for selection

---

### 7. NoteStyleProfile

**Purpose:** Note style profiles that define handwriting and formatting for cards.

**Key Fields:**
- `name`: Display name (e.g., "Casual")
- `key`: Unique identifier (e.g., "casual")
- `description`: Description of the style
- `handwritingStyle`: Handwriting style from Scribe API
- `fontFamily`: Font family used
- `fontSize`: Font size
- `lineSpacing`: Line spacing
- `alignment`: Text alignment (left, center, right)
- `tone`: Tone conveyed (casual, professional, formal, warm, grateful)
- `isActive`: Whether available for use
- `isDefault`: Whether this is a default profile
- `sortOrder`: Display order in UI

**Built-in Fields (Auto-generated):**
- `id`: Unique identifier
- `created_date`: Creation timestamp
- `updated_date`: Last update timestamp
- `created_by`: User who created this record

**Pre-populated Profiles:**
- Casual (default for all templates)
- Professional
- Formal
- Warm
- Grateful

**Use Cases:**
- Define handwriting styles for cards
- Allow users to select note styles
- Ensure consistency across sends

---

## Entity Relationships

```
User (Base44 built-in)
  ├── AutomationRule (created_by)
  │   ├── TriggerType (triggerTypeId)
  │   ├── Template (templateId)
  │   └── AutomationHistory (automationRuleId)
  │       ├── Client (clientId)
  │       ├── Template (templateId)
  │       └── CardDesign (implied)
  ├── Client (created_by)
  ├── Template (created_by)
  └── CardDesign (created_by)
```

---

## Data Flow

### Creating an Automation Rule

1. User selects a **TriggerType** (e.g., Birthday)
2. User selects a **Template** (e.g., Birthday - Default)
3. User configures timing (daysBefore, daysAfter)
4. User sets frequency cap (e.g., annually)
5. **AutomationRule** is created with these settings

### Running Automation

1. **checkAndSendAutomatedCards** runs (daily)
2. Fetches all active **AutomationRule** records
3. For each rule, fetches matching **Client** records
4. Evaluates trigger condition (e.g., birthday is today)
5. Checks frequency cap against **AutomationHistory**
6. Renders **Template** with client data
7. Submits to Scribe API with **CardDesign** and **NoteStyleProfile**
8. Creates **AutomationHistory** record with status and Scribe batch ID

### Viewing History

1. User navigates to client details
2. **getClientAutomationHistory** fetches all **AutomationHistory** records for that client
3. Results are enriched with **Template**, **TriggerType**, and **CardDesign** details
4. History is displayed sorted by date

---

## Indexing Strategy

### High-Priority Indexes

These indexes significantly improve query performance:

```sql
-- Client indexes
CREATE INDEX idx_client_created_by ON Client(created_by);
CREATE INDEX idx_client_email ON Client(email, created_by);
CREATE INDEX idx_client_birthday ON Client(birthday);
CREATE INDEX idx_client_renewal_date ON Client(renewal_date);

-- AutomationRule indexes
CREATE INDEX idx_automation_rule_created_by ON AutomationRule(created_by);
CREATE INDEX idx_automation_rule_is_active ON AutomationRule(isActive, created_by);
CREATE INDEX idx_automation_rule_trigger_type ON AutomationRule(triggerTypeId);

-- AutomationHistory indexes
CREATE INDEX idx_automation_history_rule_id ON AutomationHistory(automationRuleId);
CREATE INDEX idx_automation_history_client_id ON AutomationHistory(clientId);
CREATE INDEX idx_automation_history_sent_date ON AutomationHistory(sentDate);
CREATE INDEX idx_automation_history_status ON AutomationHistory(status);
```

---

## Migration Path

### Phase 1: Initial Setup
1. Create all entity definitions (JSON schemas)
2. Deploy to Base44 platform
3. Run seed functions to populate default data

### Phase 2: Data Population
1. Run `seedDefaultTriggerTypes.js`
2. Run `seedDefaultTemplatesAndDesigns.js`
3. Run `seedDefaultAutomationRules.js`

### Phase 3: Production Deployment
1. Create database indexes
2. Deploy backend functions
3. Set up scheduled jobs
4. Monitor and optimize

---

## Query Examples

### Find all active automation rules for a user

```javascript
const rules = await base44.entities.AutomationRule.filter({
  created_by: userId,
  isActive: true,
});
```

### Find clients with upcoming birthdays

```javascript
const today = new Date();
const clients = await base44.entities.Client.filter({
  created_by: userId,
  birthday: `${today.getMonth()}-${today.getDate()}`, // Pseudo-code
});
```

### Get automation history for a client

```javascript
const history = await base44.entities.AutomationHistory.filter({
  clientId: clientId,
});
```

### Find failed sends in the last 7 days

```javascript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const failed = await base44.entities.AutomationHistory.filter({
  status: 'failed',
  sentDate: { $gte: sevenDaysAgo.toISOString() },
});
```

---

## Performance Considerations

### Query Optimization

- Always filter by `created_by` to limit data scope
- Use date range filters to reduce result sets
- Paginate results for large queries (limit/offset)
- Avoid full table scans by using indexed fields

### Caching Strategy

- Cache trigger type definitions (rarely change)
- Cache template definitions (rarely change)
- Cache card design catalog (rarely change)
- Cache automation rule definitions (1-hour TTL)
- Don't cache automation history (frequently updated)

### Scaling Considerations

- Partition AutomationHistory by date for large datasets
- Archive old history records (>1 year) to separate table
- Use read replicas for analytics queries
- Implement connection pooling for database access

---

## Security Considerations

### Data Isolation

- All queries filtered by `created_by` to prevent cross-user access
- Users can only see their own rules, clients, and history
- No admin access to other users' data (unless explicitly granted)

### Sensitive Data

- Client addresses stored in plain text (required for card fulfillment)
- No passwords or authentication tokens stored in these entities
- Error messages don't expose sensitive information

### Audit Trail

- All creates/updates tracked with `created_date`, `updated_date`, `created_by`
- AutomationHistory provides complete audit trail of sends
- Consider additional audit logging for compliance

---

## Conclusion

The database schema is designed to support NurturInk's automated card-sending system with flexibility, scalability, and strong data isolation. All entities are properly defined, indexed, and documented for production deployment.

