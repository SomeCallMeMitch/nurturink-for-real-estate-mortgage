# NurturInk Deployment Guide

## Overview

This guide walks through deploying NurturInk's automated card-sending system to the Base44 platform. The deployment includes entity definitions, backend functions, seed data, and configuration.

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All 8 backend functions are implemented and committed
- [ ] All 7 entity definitions are created
- [ ] Database schema documentation is complete
- [ ] Seed functions are tested locally
- [ ] Scribe API credentials are configured
- [ ] Base44 project is accessible
- [ ] User has admin access to Base44 project

---

## Deployment Steps

### Step 1: Verify Entity Definitions

The following entity definitions must be uploaded to Base44:

```
entities/
├── AutomationHistory.json
├── Client.json
├── AutomationRule.json
├── TriggerType.json
├── Template.json
├── CardDesign.json
└── NoteStyleProfile.json
```

**Action:** Upload each JSON file to Base44's entity management interface.

**Expected Result:** All 7 entities appear in Base44 admin panel with correct field definitions.

---

### Step 2: Deploy Backend Functions

All backend functions must be deployed to Base44's function runtime:

**Seed Functions (Run First):**
1. `seedDefaultTriggerTypes.js` - Creates 4 trigger types
2. `seedDefaultTemplatesAndDesigns.js` - Creates 4 default templates
3. `seedDefaultAutomationRules.js` - Creates 4 default automation rules

**Core Automation Functions (Deploy to Runtime):**
1. `checkAndSendAutomatedCards.js` - Main automation engine
2. `getUpcomingAutomatedCampaigns.js` - Dashboard preview
3. `addClientFromZapier.js` - Zapier integration
4. `getClientAutomationHistory.js` - Audit trail
5. `updateAutomationRule.js` - Rule configuration
6. `pauseAutomationRule.js` - Quick disable
7. `getAutomationRuleStats.js` - Analytics
8. `getAutomationRuleDetails.js` - Rule details

**Action:** Upload each function file to Base44's backend function management.

**Expected Result:** All functions appear in Base44 admin with correct HTTP methods and endpoints.

---

### Step 3: Configure Scribe API Integration

NurturInk requires Scribe API integration for card fulfillment.

**Configuration Steps:**

1. **Obtain Scribe API Credentials:**
   - Contact Scribe support for API key and endpoint
   - Obtain list of available card designs
   - Obtain list of available note style profiles

2. **Add to Base44 Secrets:**
   - `SCRIBE_API_KEY`: Your Scribe API key
   - `SCRIBE_API_URL`: Scribe API endpoint URL
   - `SCRIBE_API_TIMEOUT`: Request timeout in milliseconds (default: 30000)

3. **Test Integration:**
   - Call Scribe test endpoint to verify credentials
   - Verify card design catalog is accessible
   - Verify note style profiles are accessible

**Expected Result:** Backend functions can successfully call Scribe API.

---

### Step 4: Run Seed Functions

Initialize the database with default data.

**Execution Order:**

```
1. POST /functions/seedDefaultTriggerTypes
   ✓ Creates 4 trigger types
   ✓ Response: { success: true, created: 4 }

2. POST /functions/seedDefaultTemplatesAndDesigns
   ✓ Creates 4 templates with "Thank you - Plain White" design
   ✓ Creates 1 card design
   ✓ Creates 1 note style profile
   ✓ Response: { success: true, created: 4 }

3. POST /functions/seedDefaultAutomationRules
   ✓ Creates 4 automation rules
   ✓ Response: { success: true, created: 4 }
```

**Expected Result:** Database contains default trigger types, templates, and automation rules.

---

### Step 5: Create Database Indexes

For optimal performance, create recommended indexes:

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

**Action:** Execute SQL commands in Base44 database management interface.

**Expected Result:** Indexes are created and visible in database schema.

---

### Step 6: Configure Scheduled Jobs

Set up automated execution of `checkAndSendAutomatedCards`.

**Configuration:**

```
Function: checkAndSendAutomatedCards
Schedule: Daily at 8:00 AM (configurable)
Timezone: User's timezone
Retry Policy: 3 retries on failure
Timeout: 5 minutes
```

**Action:** Configure scheduled job in Base44 admin panel.

**Expected Result:** Function runs automatically at scheduled time.

---

### Step 7: Set Up Monitoring & Alerting

Configure monitoring for production reliability.

**Metrics to Monitor:**

- Function execution success rate
- Average execution time
- Scribe API error rate
- AutomationHistory record creation rate
- Failed send count

**Alerts to Configure:**

- Function execution fails (> 5% failure rate)
- Scribe API timeout (> 3 consecutive timeouts)
- Unusual spike in failed sends (> 10% of daily sends)
- Function execution exceeds timeout (> 1 minute)

**Action:** Configure monitoring in Base44 or external monitoring service.

**Expected Result:** Alerts are sent when thresholds are exceeded.

---

## Testing Procedures

### Unit Testing

Test each function independently:

**1. Test seedDefaultTriggerTypes:**
```bash
curl -X POST https://your-base44-instance/functions/seedDefaultTriggerTypes
# Expected: { success: true, created: 4 }
```

**2. Test seedDefaultTemplatesAndDesigns:**
```bash
curl -X POST https://your-base44-instance/functions/seedDefaultTemplatesAndDesigns
# Expected: { success: true, created: 4 }
```

**3. Test seedDefaultAutomationRules:**
```bash
curl -X POST https://your-base44-instance/functions/seedDefaultAutomationRules
# Expected: { success: true, created: 4 }
```

**4. Test addClientFromZapier:**
```bash
curl -X POST https://your-base44-instance/functions/addClientFromZapier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "test@example.com",
    "birthday": "1990-05-15",
    "trigger": "new_client_welcome"
  }'
# Expected: { success: true, clientId: "uuid", automationTriggered: true }
```

**5. Test getUpcomingAutomatedCampaigns:**
```bash
curl -X GET "https://your-base44-instance/functions/getUpcomingAutomatedCampaigns?days=30"
# Expected: { success: true, campaigns: [...], summary: {...} }
```

**6. Test getClientAutomationHistory:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=<client-id>"
# Expected: { success: true, history: [...], pagination: {...} }
```

**7. Test updateAutomationRule:**
```bash
curl -X PUT https://your-base44-instance/functions/updateAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "<rule-id>",
    "daysBefore": 7,
    "frequencyCap": "annually"
  }'
# Expected: { success: true, updates: {...} }
```

**8. Test getAutomationRuleStats:**
```bash
curl -X GET "https://your-base44-instance/functions/getAutomationRuleStats?days=90"
# Expected: { success: true, stats: {...} }
```

### Integration Testing

Test complete automation workflows:

**Workflow 1: Birthday Automation**
1. Add client with birthday = today
2. Run `checkAndSendAutomatedCards`
3. Verify AutomationHistory record created
4. Verify Scribe API was called
5. Verify card status is "sent"

**Workflow 2: New Client Welcome**
1. Add new client via `addClientFromZapier` with trigger
2. Verify AutomationHistory record created immediately
3. Verify card was sent to Scribe API
4. Verify status is "sent"

**Workflow 3: Renewal Reminder**
1. Add client with renewal_date = 7 days from now
2. Run `checkAndSendAutomatedCards`
3. Verify no card is sent (not yet due)
4. Wait 7 days (or simulate)
5. Run `checkAndSendAutomatedCards` again
6. Verify card is sent

**Workflow 4: Rule Modification**
1. Fetch automation rule details
2. Update rule (e.g., change daysBefore)
3. Verify update succeeded
4. Verify next execution uses new settings

**Workflow 5: Rule Pausing**
1. Pause an automation rule
2. Verify rule is_active = false
3. Run `checkAndSendAutomatedCards`
4. Verify no cards sent for paused rule
5. Resume rule
6. Verify rule is_active = true

### Performance Testing

Test system performance under load:

**Test 1: Large Client Count**
- Create 1000 test clients
- Run `checkAndSendAutomatedCards`
- Measure execution time
- Expected: < 5 minutes

**Test 2: Large History**
- Generate 10,000 AutomationHistory records
- Run `getClientAutomationHistory` with pagination
- Measure query time
- Expected: < 1 second per page

**Test 3: Concurrent Requests**
- Send 100 concurrent requests to different functions
- Measure response times
- Expected: No timeouts, < 2 second average

**Test 4: Batch Submission**
- Submit batch of 100 cards to Scribe API
- Measure submission time
- Expected: < 10 seconds

---

## Verification Checklist

After deployment, verify:

- [ ] All 7 entities are created in Base44
- [ ] All 8 backend functions are deployed
- [ ] Seed functions completed successfully
- [ ] Database indexes are created
- [ ] Scheduled job is running
- [ ] Monitoring/alerting is configured
- [ ] Unit tests pass for all functions
- [ ] Integration tests pass for all workflows
- [ ] Performance tests meet requirements
- [ ] Documentation is complete

---

## Rollback Procedure

If deployment fails or issues are discovered:

**Step 1: Stop Scheduled Jobs**
- Disable `checkAndSendAutomatedCards` scheduled job
- Prevent new automations from running

**Step 2: Identify Issue**
- Check function logs for errors
- Review recent AutomationHistory records
- Check Scribe API integration

**Step 3: Rollback Functions**
- Revert to previous function version
- Or fix and redeploy corrected version

**Step 4: Verify Fix**
- Run unit tests again
- Run integration tests again
- Monitor for errors

**Step 5: Resume Operations**
- Re-enable scheduled job
- Monitor closely for first 24 hours

---

## Monitoring & Maintenance

### Daily Monitoring

- Check function execution logs
- Verify scheduled job ran successfully
- Monitor Scribe API response times
- Check for failed sends in AutomationHistory

### Weekly Maintenance

- Review automation statistics
- Check for error patterns
- Optimize slow queries
- Review user feedback

### Monthly Optimization

- Analyze performance metrics
- Identify bottlenecks
- Optimize database queries
- Update documentation

---

## Support & Troubleshooting

### Common Issues

**Issue: Seed functions fail with "Template not found"**
- Ensure seed functions run in correct order
- Verify templates were created by seedDefaultTemplatesAndDesigns
- Check database connection

**Issue: Scribe API returns 401 Unauthorized**
- Verify SCRIBE_API_KEY is correct
- Check API key hasn't expired
- Verify API endpoint URL is correct

**Issue: Automation rules not executing**
- Verify scheduled job is enabled
- Check function logs for errors
- Verify client data matches trigger requirements
- Check frequency caps aren't preventing sends

**Issue: High latency on getClientAutomationHistory**
- Verify database indexes are created
- Check for missing indexes on sentDate, clientId
- Consider archiving old history records
- Optimize query with date range filter

### Getting Help

- Check function logs in Base44 admin panel
- Review DATABASE_SCHEMA.md for entity structure
- Review WEEK2_IMPLEMENTATION_SUMMARY.md for function details
- Contact Base44 support for platform issues
- Contact Scribe support for API issues

---

## Conclusion

Following this deployment guide ensures a successful rollout of NurturInk's automated card-sending system. All components are tested, monitored, and ready for production use.

**Next Steps:**
1. Follow deployment steps in order
2. Complete testing procedures
3. Verify all checklist items
4. Monitor system for 24 hours
5. Proceed to frontend development

