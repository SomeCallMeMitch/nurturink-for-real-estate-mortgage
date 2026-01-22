# NurturInk Email Receiving Setup Guide

**Status:** ✅ **LIVE AND WORKING**

This guide documents how to receive emails at your custom domain (mitch@nurturink.com) and forward them to your Gmail inbox.

---

## Overview

The email receiving system works in three steps:

1. **Resend receives** emails sent to mitch@nurturink.com
2. **Base44 webhook** processes the email via `processInboundEmail` function
3. **Email forwards** to mitch@lynxecom.com (your Gmail)
4. **Email stored** in IncomingEmail entity for your records

---

## Architecture

```
Customer sends email to mitch@nurturink.com
                    ↓
        Resend receives via MX records
                    ↓
    Resend sends webhook to nurturink.com/api/processInboundEmail
                    ↓
        Base44 processInboundEmail function
                    ↓
        ┌───────────────────────────────┐
        │                               │
    Store in DB          Forward to Gmail
  (IncomingEmail)    (mitch@lynxecom.com)
        │                               │
        └───────────────────────────────┘
```

---

## Configuration

### 1. DNS Records (Already Configured)

Your nurturink.com domain has MX records pointing to Resend:

```
MX Record: inbound-smtp.us-east-1.amazonaws.com
SPF: includes amazonaws.com
DKIM: Configured for Resend
DMARC: Configured for Resend
```

**Status:** ✅ Verified and working

### 2. Resend Webhook Configuration

**Endpoint:** `https://nurturink.com/api/processInboundEmail`

**Event Type:** `email.received`

**Signing Secret:** `RESEND_WEBHOOK_SECRET` (stored in Base44 Secrets)

**Status:** ✅ Configured and receiving emails

### 3. Base44 Backend Function

**File:** `functions/processInboundEmail.ts`

**What it does:**
- Receives webhook from Resend
- Validates signature (if present)
- Forwards email to mitch@lynxecom.com via Resend
- Stores email in IncomingEmail entity
- Returns 200 OK to Resend

**Status:** ✅ Deployed and working

### 4. Base44 Entity

**File:** `entities/IncomingEmail.json`

**Stores:**
- `resendEmailId` - Resend's email ID
- `from` - Sender email
- `to` - Recipient (mitch@nurturink.com)
- `subject` - Email subject
- `text` - Plain text body
- `html` - HTML body
- `attachments` - Any attachments
- `forwardedTo` - Where it was forwarded (mitch@lynxecom.com)
- `forwardedAt` - When it was forwarded
- `receivedAt` - When it was received

**Status:** ✅ Created and storing emails

---

## Testing

### Test 1: Function Test (Completed ✅)

**Payload:**
```json
{
  "type": "email.received",
  "data": {
    "from": "test@example.com",
    "to": "mitch@nurturink.com",
    "subject": "Test Email",
    "text": "This is a test email",
    "html": "<p>This is a test email</p>",
    "email_id": "test-123",
    "created_at": "2026-01-22T00:00:00Z",
    "attachments": []
  }
}
```

**Result:** ✅ Function returned 200 OK

### Test 2: Real Email Test (Completed ✅)

**Sent:** Email from test@example.com to mitch@nurturink.com

**Result:** ✅ Email arrived in Gmail at mitch@lynxecom.com with:
- Subject: "[Forwarded] Test Email"
- From: NurturInk Inbox <notifications@nurturink.com>
- Original email details preserved

---

## How to Use

### Receiving Emails

1. **Customers send emails** to any address @nurturink.com (e.g., mitch@nurturink.com)
2. **Resend receives** the email
3. **Base44 webhook** processes it
4. **You receive** the email in your Gmail (mitch@lynxecom.com)
5. **Email is stored** in your Base44 app's IncomingEmail entity

### Viewing Stored Emails

1. Go to Base44 Dashboard
2. Navigate to Database or Entities
3. Find IncomingEmail entity
4. View all received emails with timestamps and metadata

### Monitoring

**Check Resend Dashboard:**
- Resend → Webhooks → processInboundEmail
- View webhook delivery logs
- See which emails were processed

**Check Base44 Logs:**
- Base44 → Code → Functions → processInboundEmail
- View function execution logs
- Debug any issues

---

## Email Addresses

All NurturInk email addresses use the same forwarding system:

| Address | Purpose | Forwards To |
|---------|---------|-------------|
| mitch@nurturink.com | Support/General | mitch@lynxecom.com |
| hello@nurturink.com | Greeting emails | (Configure as needed) |
| support@nurturink.com | Support tickets | (Configure as needed) |
| notifications@nurturink.com | System notifications | (Configure as needed) |
| billing@nurturink.com | Billing inquiries | (Configure as needed) |

**Current Setup:** Only mitch@nurturink.com is configured to forward

---

## Troubleshooting

### Emails Not Arriving

**Check 1: Resend Webhook Logs**
1. Go to Resend Dashboard
2. Webhooks → processInboundEmail
3. Look for "Attempting" status
4. Check HTTP response code
   - 200 = Success ✅
   - 405 = Method not allowed ❌
   - 502 = Timeout ❌
   - 500 = Server error ❌

**Check 2: Base44 Function Logs**
1. Go to Base44 Dashboard
2. Code → Functions → processInboundEmail
3. Look for error messages
4. Check for "RESEND_WEBHOOK_SECRET value: Set"

**Check 3: Gmail Spam Folder**
- Check if email went to spam
- Mark as "Not Spam" to train Gmail

**Check 4: RESEND_API_KEY**
- Verify in Base44 Secrets
- Should be set and valid

### Function Errors

**"Missing signature or webhook secret"**
- This is normal for test requests
- Real Resend webhooks will include signature

**"Failed to forward email"**
- Check RESEND_API_KEY is valid
- Check mitch@lynxecom.com is a real Gmail address
- Check Resend account has email sending quota

**"Could not store email in entity"**
- IncomingEmail entity may not exist
- Check Base44 Database → Entities
- If missing, create it from IncomingEmail.json

---

## Environment Variables Required

**In Base44 Secrets:**

| Variable | Value | Status |
|----------|-------|--------|
| RESEND_API_KEY | Your Resend API key | ✅ Set |
| RESEND_WEBHOOK_SECRET | Your Resend webhook signing secret | ✅ Set |

---

## Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `functions/processInboundEmail.ts` | ✅ Created | Webhook handler |
| `entities/IncomingEmail.json` | ✅ Created | Email storage schema |

---

## Next Steps

### Optional Enhancements

1. **Multiple email addresses**
   - Create separate webhook routes for different addresses
   - Route to different forwarding addresses based on recipient

2. **Email processing**
   - Parse email content and create support tickets
   - Extract attachments and store in S3
   - Send auto-replies

3. **Email management UI**
   - Build a page to view received emails
   - Search and filter emails
   - Reply from app

4. **Webhook security**
   - Enable signature verification in production
   - Add rate limiting
   - Add IP whitelist for Resend

---

## Support

If you need to:
- **Add more email addresses:** Update Resend webhook to handle multiple routes
- **Change forwarding address:** Update `forwardToEmail` in processInboundEmail.ts
- **Store additional data:** Add fields to IncomingEmail.json entity
- **Debug issues:** Check Base44 function logs and Resend webhook logs

---

**Last Updated:** January 22, 2026
**Status:** ✅ Live and tested
**Tested By:** User
