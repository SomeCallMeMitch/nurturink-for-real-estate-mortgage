# Access Control P1-B — Scheduled Send Authorization Review

## Summary
- Added authentication checks (`base44.auth.me()`) at the start of all scheduled-send service-role functions in scope.
- Enforced tenant isolation by deriving org scope exclusively from the authenticated user.
- Added owner/manager authorization checks for approve, cancel, and retry endpoints.
- Updated cross-tenant handling to return not-found style behavior for IDs outside the caller’s org.
- Kept response payload shapes intact for UI compatibility.

## Changed Files
- base44/functions/approveScheduledSend/entry.ts
- base44/functions/cancelScheduledSend/entry.ts
- base44/functions/getScheduledSendsForOrg/entry.ts
- base44/functions/retryFailedSends/entry.ts

## Full Diff
```diff
diff --git a/base44/functions/approveScheduledSend/entry.ts b/base44/functions/approveScheduledSend/entry.ts
index ce2dcdf..9f75d09 100644
--- a/base44/functions/approveScheduledSend/entry.ts
+++ b/base44/functions/approveScheduledSend/entry.ts
@@ -18,6 +18,17 @@ import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
 Deno.serve(async (req) => {
   try {
     const base44 = createClientFromRequest(req);
+    const user = await base44.auth.me();
+    if (!user) {
+      return Response.json({ error: 'Unauthorized' }, { status: 401 });
+    }
+
+    const userOrgId = user.orgId;
+    const isOwnerOrManager = ['organization_owner', 'organization_manager'].includes(user.role) || user.isOrgOwner === true;
+    if (!userOrgId || !isOwnerOrManager) {
+      return Response.json({ error: 'Forbidden' }, { status: 403 });
+    }
+
     const { scheduledSendId, scheduledSendIds } = await req.json();
 
     // Support single or bulk approval
@@ -50,6 +61,11 @@ Deno.serve(async (req) => {
 
       const send = sends[0];
 
+      if (send.orgId !== userOrgId) {
+        results.notFound.push(id);
+        continue;
+      }
+
       if (send.status !== 'awaiting_approval') {
         results.notApprovable.push({
           id,
@@ -67,6 +83,12 @@ Deno.serve(async (req) => {
 
     // Second pass: check credits per org and approve/reject accordingly
     for (const [orgId, sends] of sendsByOrg) {
+      if (orgId !== userOrgId) {
+        for (const send of sends) {
+          results.notFound.push(send.id);
+        }
+        continue;
+      }
       // Get organization's credit pool balance
       const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
       if (!orgs || orgs.length === 0) {
diff --git a/base44/functions/cancelScheduledSend/entry.ts b/base44/functions/cancelScheduledSend/entry.ts
index b9302c5..d7ca34c 100644
--- a/base44/functions/cancelScheduledSend/entry.ts
+++ b/base44/functions/cancelScheduledSend/entry.ts
@@ -16,6 +16,17 @@ import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
 Deno.serve(async (req) => {
   try {
     const base44 = createClientFromRequest(req);
+    const user = await base44.auth.me();
+    if (!user) {
+      return Response.json({ error: 'Unauthorized' }, { status: 401 });
+    }
+
+    const userOrgId = user.orgId;
+    const isOwnerOrManager = ['organization_owner', 'organization_manager'].includes(user.role) || user.isOrgOwner === true;
+    if (!userOrgId || !isOwnerOrManager) {
+      return Response.json({ error: 'Forbidden' }, { status: 403 });
+    }
+
     const { scheduledSendId, scheduledSendIds } = await req.json();
 
     // Support single or bulk cancellation
@@ -44,6 +55,11 @@ Deno.serve(async (req) => {
 
       const send = sends[0];
 
+      if (send.orgId !== userOrgId) {
+        results.notFound.push(id);
+        continue;
+      }
+
       if (!cancellableStatuses.includes(send.status)) {
         results.notCancellable.push({
           id,
diff --git a/base44/functions/getScheduledSendsForOrg/entry.ts b/base44/functions/getScheduledSendsForOrg/entry.ts
index 36fd8d0..da923af 100644
--- a/base44/functions/getScheduledSendsForOrg/entry.ts
+++ b/base44/functions/getScheduledSendsForOrg/entry.ts
@@ -20,8 +20,12 @@ import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
 Deno.serve(async (req) => {
   try {
     const base44 = createClientFromRequest(req);
+    const user = await base44.auth.me();
+    if (!user) {
+      return Response.json({ error: 'Unauthorized' }, { status: 401 });
+    }
+
     const { 
-      orgId, 
       status, 
       campaignId, 
       dateFrom, 
@@ -29,12 +33,15 @@ Deno.serve(async (req) => {
       limit = 100 
     } = await req.json();
 
-    if (!orgId) {
-      return Response.json({ error: 'orgId is required' }, { status: 400 });
+    const userOrgId = user.orgId;
+    if (!userOrgId) {
+      return Response.json({ error: 'User organization not found' }, { status: 403 });
     }
 
+    const isOwnerOrManager = ['organization_owner', 'organization_manager'].includes(user.role) || user.isOrgOwner === true;
+
     // Build filter query
-    const filter = { orgId };
+    const filter = { orgId: userOrgId };
     
     if (campaignId) {
       filter.campaignId = campaignId;
@@ -43,6 +50,13 @@ Deno.serve(async (req) => {
     // Get all sends matching base filter
     let sends = await base44.asServiceRole.entities.ScheduledSend.filter(filter);
 
+    if (!isOwnerOrManager) {
+      sends = sends.filter(s => {
+        const ownerId = s.userId || s.createdBy || s.ownerId || s.createdById;
+        return ownerId === user.id;
+      });
+    }
+
     // Apply status filter (can be string or array)
     if (status) {
       const statusArray = Array.isArray(status) ? status : [status];
diff --git a/base44/functions/retryFailedSends/entry.ts b/base44/functions/retryFailedSends/entry.ts
index 35468d5..0cec967 100644
--- a/base44/functions/retryFailedSends/entry.ts
+++ b/base44/functions/retryFailedSends/entry.ts
@@ -19,9 +19,20 @@ import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
 Deno.serve(async (req) => {
   try {
     const base44 = createClientFromRequest(req);
-    const { scheduledSendId, orgId, resetDateToToday = true } = await req.json();
+    const user = await base44.auth.me();
+    if (!user) {
+      return Response.json({ error: 'Unauthorized' }, { status: 401 });
+    }
+
+    const userOrgId = user.orgId;
+    const isOwnerOrManager = ['organization_owner', 'organization_manager'].includes(user.role) || user.isOrgOwner === true;
+    if (!userOrgId || !isOwnerOrManager) {
+      return Response.json({ error: 'Forbidden' }, { status: 403 });
+    }
+
+    const { scheduledSendId, orgId: _ignoredOrgId, resetDateToToday = true } = await req.json();
 
-    if (!scheduledSendId && !orgId) {
+    if (!scheduledSendId && !_ignoredOrgId) {
       return Response.json({ 
         error: 'Either scheduledSendId or orgId is required' 
       }, { status: 400 });
@@ -42,6 +53,10 @@ Deno.serve(async (req) => {
       }
 
       const send = sends[0];
+
+      if (send.orgId !== userOrgId) {
+        return Response.json({ error: 'ScheduledSend not found' }, { status: 404 });
+      }
       
       // Only allow retry of failed or insufficient_credits sends
       if (!['failed', 'insufficient_credits'].includes(send.status)) {
@@ -64,10 +79,10 @@ Deno.serve(async (req) => {
       retriedCount = 1;
       retriedIds.push(send.id);
 
-    } else if (orgId) {
+    } else if (_ignoredOrgId) {
       // Retry all failed sends for an organization
       const failedSends = await base44.asServiceRole.entities.ScheduledSend.filter({
-        orgId: orgId
+        orgId: userOrgId
       });
 
       // Filter to only failed or insufficient_credits
```

Use command:
`git diff HEAD~1 HEAD -- base44/functions/approveScheduledSend/entry.ts base44/functions/cancelScheduledSend/entry.ts base44/functions/getScheduledSendsForOrg/entry.ts base44/functions/retryFailedSends/entry.ts`

## Validation
- `git diff --name-only`

```text
```

- `git diff --check`

```text
```

- `npm run build` result

```text
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.

> base44-app@0.0.0 build
> vite build

[base44] Proxy not enabled (VITE_BASE44_APP_BASE_URL not set)
vite v6.3.6 building for production...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
transforming...
Browserslist: browsers data (caniuse-lite) is 8 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ 3377 modules transformed.
[esbuild css minify]
▲ [WARNING] Expected identifier but found "-" [css-syntax-error]

    <stdin>:4816:2:
      4816 │   -: T.;
           ╵   ^


rendering chunks...
computing gzip size...
dist/index.html                     0.48 kB │ gzip:   0.31 kB
dist/assets/index-CdJ6z2ew.css    142.72 kB │ gzip:  22.12 kB
dist/assets/index-C8YC5fWy.js   2,337.63 kB │ gzip: 621.16 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 35.50s
```

- lint/typecheck results if run: Not run.
