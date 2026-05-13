# Base44 Review Packet: Save/Resume Send a Card Drafts

## Prompt For Base44

Please review the actual code changes below for the NurturInk Real Estate / Mortgage Base44 app.

Goal: add persistent Save/Resume Draft behavior to the existing four-step Send a Card workflow without creating a new draft entity.

Please review for:

- Base44 schema compatibility, especially the `MailingBatch` additions.
- Whether the new `discardMailingDraft` function safely prevents deletion of non-draft or scheduled-send batches.
- Whether draft save/resume behavior correctly uses the existing `MailingBatch` record.
- Whether the frontend uses Base44 SDK patterns correctly.
- Whether the Step 1 Save Draft toolbar button is correctly visible but disabled until recipients are selected.
- Whether the visible Save Draft controls in the later bottom action bars are correctly wired.
- Whether the saved drafts panel remains usable without pushing the client table too far down.
- Whether the changes preserve existing send behavior and do not affect processed batches.
- Any concerns with `draftCurrentStep`, `draftSavedAt`, route resume behavior, or step transitions.
- Any runtime issues in Base44 caused by these exact code changes.

Important context:

- The draft metadata fields are intentionally nullable and not required.
- Draft display names are computed from existing batch metadata, not stored.
- Discard uses a backend function rather than frontend SDK delete.
- Scheduled-send `MailingBatch` records are filtered out of the manual draft list and protected from discard.
- Step 1 shows Save Draft in the client toolbar, disabled until at least one recipient is selected.
- Later steps show Save Draft in the existing bottom action bars.
- This does not attempt to fix the separate existing `processMailingBatch` status/schema inconsistency.

## Summary Of Changes

Changed existing files:

- `base44/entities/MailingBatch.jsonc`
- `base44/functions/initializeMailingBatch/entry.ts`
- `src/pages/CreateContent.jsx`
- `src/pages/FindClients.jsx`
- `src/pages/ReviewAndSend.jsx`
- `src/pages/SelectDesign.jsx`

Added new files:

- `base44/functions/discardMailingDraft/entry.ts`
- `src/components/mailing/draftHelpers.js`

Verification performed:

- `npm.cmd run build` passed.
- `node_modules\.bin\eslint.cmd src/pages/FindClients.jsx` passed after the Step 1 UI fix.
- Targeted eslint passed for `src/pages/FindClients.jsx`, `src/pages/SelectDesign.jsx`, `src/pages/ReviewAndSend.jsx`, and `src/components/mailing/WorkflowSteps.jsx` before this follow-up.
- Targeted eslint including `CreateContent.jsx` still reports known pre-existing lint issues in that file.

## Unified Diff For Code Changes

```diff
diff --git a/base44/entities/MailingBatch.jsonc b/base44/entities/MailingBatch.jsonc
index 1ef517a..f1770f5 100644
--- a/base44/entities/MailingBatch.jsonc
+++ b/base44/entities/MailingBatch.jsonc
@@ -25,6 +25,23 @@
       "default": "draft",
       "description": "Current status of the batch workflow. 'pending_review' = awaiting admin approval (REQUIRE_ADMIN_APPROVAL=true). 'pending_credits' = Scribe returned 402."
     },
+    "draftCurrentStep": {
+      "type": "string",
+      "enum": [
+        "find_clients",
+        "create_content",
+        "select_design",
+        "review_send"
+      ],
+      "nullable": true,
+      "description": "Current wizard step for resumable draft batches"
+    },
+    "draftSavedAt": {
+      "type": "string",
+      "format": "date-time",
+      "nullable": true,
+      "description": "Last time the draft was explicitly or automatically saved"
+    },
     "selectedClientIds": {
       "type": "array",
       "items": {
diff --git a/base44/functions/discardMailingDraft/entry.ts b/base44/functions/discardMailingDraft/entry.ts
new file mode 100644
index 0000000..6e9b79c
--- /dev/null
+++ b/base44/functions/discardMailingDraft/entry.ts
@@ -0,0 +1,57 @@
+import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
+
+Deno.serve(async (req) => {
+  try {
+    const base44 = createClientFromRequest(req);
+    const user = await base44.auth.me();
+
+    if (!user) {
+      return Response.json({ error: 'Unauthorized' }, { status: 401 });
+    }
+
+    const { mailingBatchId } = await req.json();
+
+    if (!mailingBatchId) {
+      return Response.json({ error: 'mailingBatchId is required' }, { status: 400 });
+    }
+
+    const batches = await base44.asServiceRole.entities.MailingBatch.filter({ id: mailingBatchId });
+
+    if (!batches?.length) {
+      return Response.json({ error: 'Mailing draft not found' }, { status: 404 });
+    }
+
+    const batch = batches[0];
+
+    if (batch.userId !== user.id) {
+      return Response.json({ error: 'Unauthorized to discard this draft' }, { status: 403 });
+    }
+
+    if (batch.status !== 'draft') {
+      return Response.json(
+        { error: `Only draft batches can be discarded. Current status: ${batch.status || 'unknown'}` },
+        { status: 409 }
+      );
+    }
+
+    if (batch.scheduledSendId) {
+      return Response.json(
+        { error: 'Scheduled send batches cannot be discarded manually.' },
+        { status: 409 }
+      );
+    }
+
+    await base44.asServiceRole.entities.MailingBatch.delete(mailingBatchId);
+
+    return Response.json({
+      success: true,
+      mailingBatchId
+    });
+  } catch (error) {
+    console.error('[discardMailingDraft] Error:', error);
+    return Response.json(
+      { error: error.message || 'Failed to discard mailing draft' },
+      { status: 500 }
+    );
+  }
+});
diff --git a/base44/functions/initializeMailingBatch/entry.ts b/base44/functions/initializeMailingBatch/entry.ts
index 49090bc..cc21639 100644
--- a/base44/functions/initializeMailingBatch/entry.ts
+++ b/base44/functions/initializeMailingBatch/entry.ts
@@ -14,7 +14,7 @@ Deno.serve(async (req) => {
     
     // Parse request body
     const body = await req.json();
-    const { clientIds, quickSendTemplateId } = body;
+    const { clientIds, quickSendTemplateId, draftCurrentStep = 'create_content' } = body;
     
     console.log('[initializeMailingBatch] Received clientIds:', clientIds?.length, 'quickSendTemplateId:', quickSendTemplateId);
     
@@ -83,6 +83,8 @@ Deno.serve(async (req) => {
       userId: user.id,
       organizationId: user.orgId,
       status: 'draft',
+      draftCurrentStep,
+      draftSavedAt: new Date().toISOString(),
       selectedClientIds: clientIds,
       globalMessage: null,
       contentOverrides: null,
@@ -109,4 +111,4 @@ Deno.serve(async (req) => {
       { status: 500 }
     );
   }
-});
\ No newline at end of file
+});
diff --git a/src/components/mailing/draftHelpers.js b/src/components/mailing/draftHelpers.js
new file mode 100644
index 0000000..3ebd617
--- /dev/null
+++ b/src/components/mailing/draftHelpers.js
@@ -0,0 +1,72 @@
+export const DRAFT_STEPS = {
+  FIND_CLIENTS: 'find_clients',
+  CREATE_CONTENT: 'create_content',
+  SELECT_DESIGN: 'select_design',
+  REVIEW_SEND: 'review_send'
+};
+
+export const DRAFT_STEP_LABELS = {
+  [DRAFT_STEPS.FIND_CLIENTS]: 'Find Clients',
+  [DRAFT_STEPS.CREATE_CONTENT]: 'Create Content',
+  [DRAFT_STEPS.SELECT_DESIGN]: 'Select Design',
+  [DRAFT_STEPS.REVIEW_SEND]: 'Review & Send'
+};
+
+export function inferDraftStep(batch) {
+  if (!batch?.selectedClientIds?.length) return DRAFT_STEPS.FIND_CLIENTS;
+  if (!batch.globalMessage && !hasObjectValues(batch.contentOverrides)) return DRAFT_STEPS.CREATE_CONTENT;
+  if (!batch.selectedCardDesignId && !hasObjectValues(batch.cardDesignOverrides)) return DRAFT_STEPS.SELECT_DESIGN;
+  return DRAFT_STEPS.REVIEW_SEND;
+}
+
+export function getDraftStep(batch) {
+  return DRAFT_STEP_LABELS[batch?.draftCurrentStep]
+    ? batch.draftCurrentStep
+    : inferDraftStep(batch);
+}
+
+export function getDraftStepLabel(batch) {
+  return DRAFT_STEP_LABELS[getDraftStep(batch)] || 'Draft';
+}
+
+export function getDraftResumePage(batch) {
+  const step = getDraftStep(batch);
+  const query = `mailingBatchId=${batch.id}`;
+
+  if (step === DRAFT_STEPS.FIND_CLIENTS) return `FindClients?${query}`;
+  if (step === DRAFT_STEPS.SELECT_DESIGN) return `SelectDesign?${query}`;
+  if (step === DRAFT_STEPS.REVIEW_SEND) return `ReviewAndSend?${query}`;
+  return `CreateContent?${query}`;
+}
+
+export function getDraftTimestamp(batch) {
+  return batch?.draftSavedAt || batch?.updated_date || batch?.created_date || batch?.created_at || null;
+}
+
+export function formatDraftLabel(batch) {
+  const timestamp = getDraftTimestamp(batch);
+  const dateText = timestamp ? new Date(timestamp).toLocaleDateString() : 'Unsaved date';
+  const count = batch?.selectedClientIds?.length || 0;
+  const recipientLabel = count === 1 ? 'recipient' : 'recipients';
+  const shortId = batch?.id ? batch.id.slice(-6).toUpperCase() : 'NEW';
+
+  return `Draft - ${dateText} - ${count} ${recipientLabel} - Batch #${shortId}`;
+}
+
+export function formatDraftSavedAt(batch) {
+  const timestamp = getDraftTimestamp(batch);
+  if (!timestamp) return 'Not saved yet';
+  return `Last saved ${new Date(timestamp).toLocaleString()}`;
+}
+
+export function sortDraftsNewestFirst(drafts) {
+  return [...(drafts || [])].sort((a, b) => {
+    const dateA = new Date(getDraftTimestamp(a) || 0);
+    const dateB = new Date(getDraftTimestamp(b) || 0);
+    return dateB - dateA;
+  });
+}
+
+function hasObjectValues(value) {
+  return value && typeof value === 'object' && Object.keys(value).length > 0;
+}
diff --git a/src/pages/CreateContent.jsx b/src/pages/CreateContent.jsx
index c14263e..273bd04 100644
--- a/src/pages/CreateContent.jsx
+++ b/src/pages/CreateContent.jsx
@@ -16,6 +16,8 @@ import PlaceholderModal from "@/components/mailing/PlaceholderModal";
 import TemplateLibrary from "@/components/mailing/TemplateLibrary";
 import CardPreview from "@/components/preview/CardPreview";
 import WorkflowSteps from "@/components/mailing/WorkflowSteps";
+import { DRAFT_STEPS } from "@/components/mailing/draftHelpers";
+import { useToast } from "@/components/ui/use-toast";
 
 // PHASE 2: Import CreditContext hook for global credit state
 import { useCredits } from "../components/context/CreditContext";
@@ -47,6 +49,7 @@ const FALLBACK_SETTINGS = {
 
 export default function CreateContent() {
   const navigate = useNavigate();
+  const { toast } = useToast();
   const textareaRef = useRef(null);
   
   // PHASE 2: Use global credit context
@@ -72,6 +75,7 @@ export default function CreateContent() {
   const [errorDetails, setErrorDetails] = useState(null);
   const [editMode, setEditMode] = useState('bulk');
   const [selectedRecipientId, setSelectedRecipientId] = useState(null);
+  const [savingDraft, setSavingDraft] = useState(false);
 
   // Add state for column widths
   const [columnWidths, setColumnWidths] = useState({ 
@@ -303,7 +307,9 @@ export default function CreateContent() {
     selectedNoteStyleProfileId: localSelectedNoteStyleProfileId,
     greetingOverrides: localGreetingOverrides,
     signatureOverrides: localSignatureOverrides,
-    noteStyleProfileOverrides: localNoteStyleProfileOverrides
+    noteStyleProfileOverrides: localNoteStyleProfileOverrides,
+    draftCurrentStep: DRAFT_STEPS.CREATE_CONTENT,
+    draftSavedAt: new Date().toISOString()
   }), [
     localGlobalMessage, 
     localContentOverrides, 
@@ -480,6 +486,10 @@ export default function CreateContent() {
   const handleContinue = async () => {
     try {
       await saveNow();
+      await base44.entities.MailingBatch.update(mailingBatchId, {
+        draftCurrentStep: DRAFT_STEPS.SELECT_DESIGN,
+        draftSavedAt: new Date().toISOString()
+      });
       navigate(createPageUrl(`SelectDesign?mailingBatchId=${mailingBatchId}`));
     } catch (err) {
       console.error('? Failed to save before navigation:', err);
@@ -492,6 +502,30 @@ export default function CreateContent() {
     navigate(createPageUrl(`FindClients?mailingBatchId=${mailingBatchId}`));
   };
 
+  const handleSaveDraft = async () => {
+    try {
+      setSavingDraft(true);
+      await saveNow();
+      await base44.entities.MailingBatch.update(mailingBatchId, {
+        draftCurrentStep: DRAFT_STEPS.CREATE_CONTENT,
+        draftSavedAt: new Date().toISOString()
+      });
+      toast({
+        title: 'Draft saved',
+        description: 'You can resume this card send later.'
+      });
+    } catch (err) {
+      console.error('Failed to save draft:', err);
+      toast({
+        title: 'Failed to save draft',
+        description: err.message || 'Please try again.',
+        variant: 'destructive'
+      });
+    } finally {
+      setSavingDraft(false);
+    }
+  };
+
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
@@ -781,15 +815,36 @@ export default function CreateContent() {
             {clients.length} clients selected
           </div>
           
-          <Button
-            onClick={handleContinue}
-            className="bg-primary hover:bg-primary/90 gap-2"
-          >
-            Continue to Select Design
-            <ArrowRight className="w-4 h-4" />
-          </Button>
+          <div className="flex items-center gap-3">
+            <Button
+              variant="outline"
+              onClick={handleSaveDraft}
+              disabled={savingDraft || isSaving}
+              className="gap-2"
+            >
+              {savingDraft ? (
+                <>
+                  <Loader2 className="w-4 h-4 animate-spin" />
+                  Saving...
+                </>
+              ) : (
+                <>
+                  <Save className="w-4 h-4" />
+                  Save Draft
+                </>
+              )}
+            </Button>
+
+            <Button
+              onClick={handleContinue}
+              className="bg-primary hover:bg-primary/90 gap-2"
+            >
+              Continue to Select Design
+              <ArrowRight className="w-4 h-4" />
+            </Button>
+          </div>
         </div>
       </div>
     </div>
   );
-}
\ No newline at end of file
+}
diff --git a/src/pages/FindClients.jsx b/src/pages/FindClients.jsx
index 2c33955..e8c8417 100644
--- a/src/pages/FindClients.jsx
+++ b/src/pages/FindClients.jsx
@@ -30,7 +30,12 @@ import {
   ChevronDown,
   Check,
   Upload,
-  Plus
+  Plus,
+  FileText,
+  PlayCircle,
+  Trash2,
+  Save,
+  Loader2
 } from "lucide-react";
 import ClientImportModal from "@/components/client/ClientImportModal";
 import ClientCreateModal from "@/components/client/ClientCreateModal";
@@ -57,6 +62,14 @@ import {
   TooltipTrigger,
 } from "@/components/ui/tooltip";
 import WorkflowSteps from "@/components/mailing/WorkflowSteps";
+import {
+  DRAFT_STEPS,
+  formatDraftLabel,
+  formatDraftSavedAt,
+  getDraftResumePage,
+  getDraftStepLabel,
+  sortDraftsNewestFirst
+} from "@/components/mailing/draftHelpers";
 import { useToast } from "@/components/ui/use-toast";
 
 // PHASE 2: Import CreditContext hook for global credit state
@@ -65,6 +78,8 @@ import { useCredits } from "../components/context/CreditContext";
 export default function FindClients() {
   const navigate = useNavigate();
   const { toast } = useToast();
+  const urlParams = new URLSearchParams(window.location.search);
+  const mailingBatchId = urlParams.get('mailingBatchId') || urlParams.get('mailingbatchid');
   
   // PHASE 2: Use global credit context for user, organization, and credits
   const { user, organization, totalCredits, refreshCredits } = useCredits();
@@ -79,6 +94,10 @@ export default function FindClients() {
   // Selection state
   const [selectedClientIds, setSelectedClientIds] = useState([]);
   const [initializing, setInitializing] = useState(false);
+  const [activeMailingBatchId, setActiveMailingBatchId] = useState(null);
+  const [savedDrafts, setSavedDrafts] = useState([]);
+  const [savingDraft, setSavingDraft] = useState(false);
+  const [discardingDraftId, setDiscardingDraftId] = useState(null);
 
   // Filter state
   const [searchQuery, setSearchQuery] = useState("");
@@ -131,6 +150,26 @@ export default function FindClients() {
 
       setClients(clientList);
 
+      const draftList = await base44.entities.MailingBatch.filter({
+        userId: currentUser.id,
+        status: 'draft'
+      });
+      const manualDrafts = (draftList || []).filter(draft => !draft.scheduledSendId);
+      const sortedDrafts = sortDraftsNewestFirst(manualDrafts);
+      setSavedDrafts(sortedDrafts);
+
+      const activeDraft = mailingBatchId
+        ? sortedDrafts.find(draft => draft.id === mailingBatchId)
+        : null;
+
+      if (activeDraft) {
+        setActiveMailingBatchId(activeDraft.id);
+        setSelectedClientIds(activeDraft.selectedClientIds || []);
+      } else if (mailingBatchId) {
+        setActiveMailingBatchId(null);
+        setSelectedClientIds([]);
+      }
+
       // Create a Set of favorited client IDs for fast lookup
       const favIds = new Set(favoritesList.map(f => f.clientId));
       setFavoriteClientIds(favIds);
@@ -393,8 +432,19 @@ export default function FindClients() {
       console.log('Current user:', user);
       console.log('Current organization:', organization);
 
+      if (activeMailingBatchId) {
+        await base44.entities.MailingBatch.update(activeMailingBatchId, {
+          selectedClientIds,
+          draftCurrentStep: DRAFT_STEPS.CREATE_CONTENT,
+          draftSavedAt: new Date().toISOString()
+        });
+        navigate(createPageUrl(`CreateContent?mailingBatchId=${activeMailingBatchId}`));
+        return;
+      }
+
       const response = await base44.functions.invoke('initializeMailingBatch', {
-        clientIds: selectedClientIds
+        clientIds: selectedClientIds,
+        draftCurrentStep: DRAFT_STEPS.CREATE_CONTENT
       });
 
       console.log('initializeMailingBatch response:', response);
@@ -424,7 +474,8 @@ export default function FindClients() {
 
       const response = await base44.functions.invoke('initializeMailingBatch', {
         clientIds: selectedClientIds,
-        quickSendTemplateId: template.id
+        quickSendTemplateId: template.id,
+        draftCurrentStep: DRAFT_STEPS.CREATE_CONTENT
       });
 
       const { mailingBatchId } = response.data;
@@ -438,6 +489,121 @@ export default function FindClients() {
     }
   };
 
+  const handleSaveDraft = async () => {
+    if (selectedClientIds.length === 0) {
+      toast({
+        title: 'Select recipients first',
+        description: 'Choose at least one recipient before saving a draft.',
+        variant: 'destructive'
+      });
+      return;
+    }
+
+    try {
+      setSavingDraft(true);
+      const savedAt = new Date().toISOString();
+
+      if (activeMailingBatchId) {
+        await base44.entities.MailingBatch.update(activeMailingBatchId, {
+          selectedClientIds,
+          draftCurrentStep: DRAFT_STEPS.FIND_CLIENTS,
+          draftSavedAt: savedAt
+        });
+
+        setSavedDrafts(prev => sortDraftsNewestFirst(prev.map(draft =>
+          draft.id === activeMailingBatchId
+            ? { ...draft, selectedClientIds, draftCurrentStep: DRAFT_STEPS.FIND_CLIENTS, draftSavedAt: savedAt }
+            : draft
+        )));
+      } else {
+        const currentUser = user || await base44.auth.me();
+        const response = await base44.functions.invoke('initializeMailingBatch', {
+          clientIds: selectedClientIds,
+          draftCurrentStep: DRAFT_STEPS.FIND_CLIENTS
+        });
+        const newMailingBatchId = response.data.mailingBatchId;
+
+        setActiveMailingBatchId(newMailingBatchId);
+        setSavedDrafts(prev => sortDraftsNewestFirst([
+          {
+            id: newMailingBatchId,
+            userId: currentUser.id,
+            organizationId: currentUser.orgId,
+            status: 'draft',
+            selectedClientIds,
+            draftCurrentStep: DRAFT_STEPS.FIND_CLIENTS,
+            draftSavedAt: savedAt
+          },
+          ...prev
+        ]));
+        navigate(createPageUrl(`FindClients?mailingBatchId=${newMailingBatchId}`), { replace: true });
+      }
+
+      toast({
+        title: 'Draft saved',
+        description: 'You can resume this card send later.'
+      });
+    } catch (err) {
+      console.error('Failed to save draft:', err);
+      toast({
+        title: 'Failed to save draft',
+        description: err.response?.data?.error || err.message || 'Please try again.',
+        variant: 'destructive'
+      });
+    } finally {
+      setSavingDraft(false);
+    }
+  };
+
+  const handleResumeDraft = (draft) => {
+    const resumePage = getDraftResumePage(draft);
+    if (resumePage.startsWith('FindClients')) {
+      setActiveMailingBatchId(draft.id);
+      setSelectedClientIds(draft.selectedClientIds || []);
+    }
+    navigate(createPageUrl(resumePage));
+  };
+
+  const handleStartNewDraft = () => {
+    setActiveMailingBatchId(null);
+    setSelectedClientIds([]);
+    navigate(createPageUrl('FindClients'), { replace: true });
+  };
+
+  const handleDiscardDraft = async (draft) => {
+    const shouldDiscard = window.confirm('Discard this saved draft? This cannot be undone.');
+    if (!shouldDiscard) return;
+
+    try {
+      setDiscardingDraftId(draft.id);
+      await base44.functions.invoke('discardMailingDraft', {
+        mailingBatchId: draft.id
+      });
+
+      setSavedDrafts(prev => prev.filter(item => item.id !== draft.id));
+
+      if (activeMailingBatchId === draft.id) {
+        setActiveMailingBatchId(null);
+        setSelectedClientIds([]);
+        navigate(createPageUrl('FindClients'), { replace: true });
+      }
+
+      toast({
+        title: 'Draft discarded',
+        description: 'The saved card draft was removed.'
+      });
+    } catch (err) {
+      console.error('Failed to discard draft:', err);
+      toast({
+        title: 'Failed to discard draft',
+        description: err.response?.data?.error || err.message || 'Please try again.',
+        variant: 'destructive'
+      });
+    } finally {
+      setDiscardingDraftId(null);
+    }
+  };
+
   // Handle tag filter toggle
   const handleToggleTag = (tag) => {
     setSelectedTags(prev => {
@@ -524,6 +690,73 @@ export default function FindClients() {
             </div>
           )}
 
+          {savedDrafts.length > 0 && (
+            <Card className="mb-3 border-amber-200 bg-amber-50/60">
+              <CardContent className="py-3">
+                <div className="flex items-start justify-between gap-4">
+                  <div className="min-w-0">
+                    <div className="flex items-center gap-2 mb-2">
+                      <FileText className="w-4 h-4 text-amber-700" />
+                      <h2 className="text-sm font-semibold text-amber-900">Saved drafts</h2>
+                      <span className="text-xs text-amber-700">({savedDrafts.length})</span>
+                    </div>
+                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
+                      {savedDrafts.map(draft => {
+                        const isActive = activeMailingBatchId === draft.id;
+                        return (
+                          <div
+                            key={draft.id}
+                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 bg-white ${
+                              isActive ? 'border-amber-500' : 'border-amber-200'
+                            }`}
+                          >
+                            <div className="min-w-0">
+                              <div className="text-sm font-medium text-foreground truncate max-w-[320px]">
+                                {formatDraftLabel(draft)}
+                              </div>
+                              <div className="text-xs text-muted-foreground">
+                                {getDraftStepLabel(draft)} - {formatDraftSavedAt(draft)}
+                              </div>
+                            </div>
+                            <Button
+                              variant="outline"
+                              size="sm"
+                              onClick={() => handleResumeDraft(draft)}
+                              className="gap-1"
+                            >
+                              <PlayCircle className="w-3.5 h-3.5" />
+                              Resume
+                            </Button>
+                            <Button
+                              variant="ghost"
+                              size="icon"
+                              onClick={() => handleDiscardDraft(draft)}
+                              disabled={discardingDraftId === draft.id}
+                              className="text-muted-foreground hover:text-destructive"
+                              aria-label="Discard draft"
+                            >
+                              <Trash2 className="w-4 h-4" />
+                            </Button>
+                          </div>
+                        );
+                      })}
+                    </div>
+                  </div>
+                  {activeMailingBatchId && (
+                    <Button
+                      variant="outline"
+                      size="sm"
+                      onClick={handleStartNewDraft}
+                      className="shrink-0"
+                    >
+                      Start New Card
+                    </Button>
+                  )}
+                </div>
+              </CardContent>
+            </Card>
+          )}
+
           <Card className="shadow-none border-0">
             <CardContent className="py-2 space-y-2">
             <div className="flex gap-3">
@@ -632,6 +865,25 @@ export default function FindClients() {
                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
               </Button>
 
+              <Button
+                variant="outline"
+                onClick={handleSaveDraft}
+                disabled={selectedClientIds.length === 0 || savingDraft || initializing}
+                className="gap-2"
+              >
+                {savingDraft ? (
+                  <>
+                    <Loader2 className="w-4 h-4 animate-spin" />
+                    Saving...
+                  </>
+                ) : (
+                  <>
+                    <Save className="w-4 h-4" />
+                    Save Draft
+                  </>
+                )}
+              </Button>
+
               {/* Add Client Dropdown */}
               <div className="border-l pl-3">
                 <DropdownMenu>
@@ -1012,4 +1264,4 @@ export default function FindClients() {
       />
     </div>
   );
-}
\ No newline at end of file
+}
diff --git a/src/pages/ReviewAndSend.jsx b/src/pages/ReviewAndSend.jsx
index 62111bf..78c328b 100644
--- a/src/pages/ReviewAndSend.jsx
+++ b/src/pages/ReviewAndSend.jsx
@@ -4,7 +4,7 @@ import { useNavigate } from "react-router-dom";
 import { createPageUrl } from "@/utils";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
-import { Loader2, AlertTriangle, Send, AlertCircle } from "lucide-react";
+import { Loader2, AlertTriangle, Send, AlertCircle, Save } from "lucide-react";
 import { debounce } from "lodash";
 import { useToast } from "@/components/ui/use-toast";
 import { Pill } from "@/components/ui/Pill";
@@ -27,6 +27,7 @@ import {
   getAddressPreviewText
 } from "@/components/utils/addressHelpers";
 import { getSelectionStyles } from "@/components/utils/selectionStyles";
+import { DRAFT_STEPS } from "@/components/mailing/draftHelpers";
 
 // PHASE 2: Import CreditContext hook for global credit state
 import { useCredits } from "../components/context/CreditContext";
@@ -56,6 +57,7 @@ export default function ReviewAndSend() {
   const [editMode, setEditMode] = useState('bulk');
   const [selectedRecipientId, setSelectedRecipientId] = useState(null);
   const [saving, setSaving] = useState(false);
+  const [savingDraft, setSavingDraft] = useState(false);
   
   // Local state for return address configuration
   const [localReturnAddressModeGlobal, setLocalReturnAddressModeGlobal] = useState('company');
@@ -206,7 +208,9 @@ export default function ReviewAndSend() {
         setSaving(true);
         await base44.entities.MailingBatch.update(mailingBatchId, {
           returnAddressModeGlobal: modeGlobal,
-          returnAddressModeOverrides: modeOverrides
+          returnAddressModeOverrides: modeOverrides,
+          draftCurrentStep: DRAFT_STEPS.REVIEW_SEND,
+          draftSavedAt: new Date().toISOString()
         });
         setSaving(false);
       } catch (error) {
@@ -263,6 +267,31 @@ export default function ReviewAndSend() {
     }
   };
 
+  const handleSaveDraft = async () => {
+    try {
+      setSavingDraft(true);
+      await base44.entities.MailingBatch.update(mailingBatchId, {
+        returnAddressModeGlobal: localReturnAddressModeGlobal,
+        returnAddressModeOverrides: localReturnAddressModeOverrides,
+        draftCurrentStep: DRAFT_STEPS.REVIEW_SEND,
+        draftSavedAt: new Date().toISOString()
+      });
+      toast({
+        title: 'Draft saved',
+        description: 'You can resume this card send later.'
+      });
+    } catch (err) {
+      console.error('Failed to save draft:', err);
+      toast({
+        title: 'Failed to save draft',
+        description: err.message || 'Please try again.',
+        variant: 'destructive'
+      });
+    } finally {
+      setSavingDraft(false);
+    }
+  };
+
   // Get current client
   const getCurrentClient = useMemo(() => {
     if (editMode === 'individual' && selectedRecipientId) {
@@ -408,6 +437,13 @@ export default function ReviewAndSend() {
       }
       
       setSaving(true);
+
+      await base44.entities.MailingBatch.update(mailingBatchId, {
+        returnAddressModeGlobal: localReturnAddressModeGlobal,
+        returnAddressModeOverrides: localReturnAddressModeOverrides,
+        draftCurrentStep: DRAFT_STEPS.REVIEW_SEND,
+        draftSavedAt: new Date().toISOString()
+      });
       
       // Validate that we have necessary data
       if (!noteStyleProfile) {
@@ -712,23 +748,44 @@ export default function ReviewAndSend() {
             )}
           </div>
           
-          <Button
-            onClick={handleSend}
-            className={`gap-2 text-lg px-8 py-6 ${
-              creditSummary && !creditSummary.sufficient
-                ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
-                : ''
-            }`}
-            disabled={saving || checkingCredits || (creditCheckResult && !creditCheckResult.available)}
-          >
-            {saving ? (
-              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</>
-            ) : checkingCredits ? (
-              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Checking Credits...</>
-            ) : (
-              <><Send className="w-5 h-5" />Send Notes</>
-            )}
-          </Button>
+          <div className="flex items-center gap-3">
+            <Button
+              variant="outline"
+              onClick={handleSaveDraft}
+              disabled={savingDraft || saving}
+              className="gap-2"
+            >
+              {savingDraft ? (
+                <>
+                  <Loader2 className="w-4 h-4 animate-spin" />
+                  Saving...
+                </>
+              ) : (
+                <>
+                  <Save className="w-4 h-4" />
+                  Save Draft
+                </>
+              )}
+            </Button>
+
+            <Button
+              onClick={handleSend}
+              className={`gap-2 text-lg px-8 py-6 ${
+                creditSummary && !creditSummary.sufficient
+                  ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
+                  : ''
+              }`}
+              disabled={saving || checkingCredits || (creditCheckResult && !creditCheckResult.available)}
+            >
+              {saving ? (
+                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</>
+              ) : checkingCredits ? (
+                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Checking Credits...</>
+              ) : (
+                <><Send className="w-5 h-5" />Send Notes</>
+              )}
+            </Button>
+          </div>
         </div>
       </div>
 
diff --git a/src/pages/SelectDesign.jsx b/src/pages/SelectDesign.jsx
index 7cea4c0..cf4e8f0 100644
--- a/src/pages/SelectDesign.jsx
+++ b/src/pages/SelectDesign.jsx
@@ -6,7 +6,7 @@ import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
-import { Star, Search, Loader2, ArrowRight, Check, AlertTriangle, ArrowLeft } from "lucide-react";
+import { Star, Search, Loader2, ArrowRight, Check, AlertTriangle, ArrowLeft, Save } from "lucide-react";
 import { Pill } from "@/components/ui/Pill";
 import { debounce } from "lodash";
 import { useToast } from "@/components/ui/use-toast";
@@ -18,6 +18,7 @@ import CardDetailsModal from "@/components/card/CardDetailsModal";
 import { getSelectionStyles } from "@/components/utils/selectionStyles";
 import { getBestOutsideUrl } from "@/components/utils/imageHelpers";
 import { FALLBACK_PREVIEW } from "@/components/campaigns/campaignWizardConfig";
+import { DRAFT_STEPS } from "@/components/mailing/draftHelpers";
 
 // PHASE 2: Import CreditContext hook for global credit state
 import { useCredits } from "../components/context/CreditContext";
@@ -53,6 +54,7 @@ export default function SelectDesign() {
   const [selectedRecipientId, setSelectedRecipientId] = useState(null);
   const [favoriteIds, setFavoriteIds] = useState([]);
   const [saving, setSaving] = useState(false);
+  const [savingDraft, setSavingDraft] = useState(false);
   const [hoveredDesignId, setHoveredDesignId] = useState(null);
   
   // Modal state
@@ -194,7 +196,9 @@ export default function SelectDesign() {
         setSaving(true);
         await base44.entities.MailingBatch.update(mailingBatchId, {
           selectedCardDesignId: designId,
-          cardDesignOverrides: overrides
+          cardDesignOverrides: overrides,
+          draftCurrentStep: DRAFT_STEPS.SELECT_DESIGN,
+          draftSavedAt: new Date().toISOString()
         });
         setSaving(false);
       } catch (error) {
@@ -353,7 +357,7 @@ export default function SelectDesign() {
   };
 
   // Handle continue
-  const handleContinue = () => {
+  const handleContinue = async () => {
     if (!localSelectedDesignId) {
       toast({
         title: 'No design selected',
@@ -363,8 +367,48 @@ export default function SelectDesign() {
       });
       return;
     }
-    
-    navigate(createPageUrl(`ReviewAndSend?mailingBatchId=${mailingBatchId}`));
+
+    try {
+      await base44.entities.MailingBatch.update(mailingBatchId, {
+        selectedCardDesignId: localSelectedDesignId,
+        cardDesignOverrides: localDesignOverrides,
+        draftCurrentStep: DRAFT_STEPS.REVIEW_SEND,
+        draftSavedAt: new Date().toISOString()
+      });
+      navigate(createPageUrl(`ReviewAndSend?mailingBatchId=${mailingBatchId}`));
+    } catch (err) {
+      console.error('Failed to save design before navigation:', err);
+      toast({
+        title: 'Failed to save design',
+        description: err.message || 'Please try again.',
+        variant: 'destructive'
+      });
+    }
+  };
+
+  const handleSaveDraft = async () => {
+    try {
+      setSavingDraft(true);
+      await base44.entities.MailingBatch.update(mailingBatchId, {
+        selectedCardDesignId: localSelectedDesignId,
+        cardDesignOverrides: localDesignOverrides,
+        draftCurrentStep: DRAFT_STEPS.SELECT_DESIGN,
+        draftSavedAt: new Date().toISOString()
+      });
+      toast({
+        title: 'Draft saved',
+        description: 'You can resume this card send later.'
+      });
+    } catch (err) {
+      console.error('Failed to save draft:', err);
+      toast({
+        title: 'Failed to save draft',
+        description: err.message || 'Please try again.',
+        variant: 'destructive'
+      });
+    } finally {
+      setSavingDraft(false);
+    }
   };
 
   // Favorite count
@@ -713,16 +757,37 @@ export default function SelectDesign() {
             )}
           </div>
           
-          <Button
-            onClick={handleContinue}
-            disabled={!localSelectedDesignId}
-            className="bg-primary hover:bg-primary/90 gap-2"
-          >
-            Continue to Review
-            <ArrowRight className="w-4 h-4" />
-          </Button>
+          <div className="flex items-center gap-3">
+            <Button
+              variant="outline"
+              onClick={handleSaveDraft}
+              disabled={savingDraft || saving}
+              className="gap-2"
+            >
+              {savingDraft ? (
+                <>
+                  <Loader2 className="w-4 h-4 animate-spin" />
+                  Saving...
+                </>
+              ) : (
+                <>
+                  <Save className="w-4 h-4" />
+                  Save Draft
+                </>
+              )}
+            </Button>
+
+            <Button
+              onClick={handleContinue}
+              disabled={!localSelectedDesignId}
+              className="bg-primary hover:bg-primary/90 gap-2"
+            >
+              Continue to Review
+              <ArrowRight className="w-4 h-4" />
+            </Button>
+          </div>
         </div>
       </div>
     </div>
   );
-}
\ No newline at end of file
+}
```
