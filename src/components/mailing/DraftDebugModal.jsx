import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DraftDebugModal({ open, onOpenChange, mailingBatchId, user }) {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [error, setError] = useState(null);

  const diagnosticsText = useMemo(
    () => JSON.stringify(diagnostics || { error }, null, 2),
    [diagnostics, error]
  );

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = user?.id ? user : await base44.auth.me();
      const draftRows = await base44.entities.MailingBatch.filter({
        userId: currentUser.id,
        status: 'draft'
      });

      let activeRows = [];
      if (mailingBatchId) {
        activeRows = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      }

      const rows = (draftRows || []).map(summarizeBatch);
      const explicitRows = rows.filter(row => row.hasExplicitSave && !row.scheduledSendId);

      setDiagnostics({
        checkedAt: new Date().toISOString(),
        currentUser: {
          id: currentUser.id,
          email: currentUser.email || null,
          orgId: currentUser.orgId || null
        },
        mailingBatchIdFromUrl: mailingBatchId || null,
        counts: {
          fetchedDraftRows: rows.length,
          explicitSavedDraftRows: explicitRows.length,
          scheduledDraftRows: rows.filter(row => !!row.scheduledSendId).length,
          rowsMissingExplicitSave: rows.filter(row => !row.hasExplicitSave).length
        },
        visibleSavedDraftIds: explicitRows.map(row => row.id),
        activeBatchRows: (activeRows || []).map(summarizeBatch),
        fetchedDraftRows: rows
      });
    } catch (err) {
      console.error('Draft diagnostics failed:', err);
      setError(err.message || 'Draft diagnostics failed');
      setDiagnostics(null);
    } finally {
      setLoading(false);
    }
  };

  const copyDiagnostics = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(diagnosticsText);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Mailing Draft Diagnostics</DialogTitle>
          <DialogDescription>
            Debug view for saved draft visibility. Open this from Find Clients with ?draftDebug=1.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Button onClick={loadDiagnostics} disabled={loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Load Diagnostics
          </Button>
          <Button variant="outline" onClick={copyDiagnostics} disabled={!diagnostics && !error}>
            Copy JSON
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <pre className="min-h-[360px] overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
          {diagnostics ? diagnosticsText : 'Click Load Diagnostics to fetch draft rows.'}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

function summarizeBatch(batch) {
  return {
    id: batch?.id || null,
    status: batch?.status || null,
    userId: batch?.userId || null,
    organizationId: batch?.organizationId || null,
    scheduledSendId: batch?.scheduledSendId || null,
    selectedClientCount: batch?.selectedClientIds?.length || 0,
    draftCurrentStep: batch?.draftCurrentStep || null,
    draftSavedAt: batch?.draftSavedAt || null,
    draftSavedExplicitlyAt: batch?.draftSavedExplicitlyAt || null,
    hasExplicitSave: !!batch?.draftSavedExplicitlyAt,
    updated_date: batch?.updated_date || null,
    created_date: batch?.created_date || null,
    created_at: batch?.created_at || null,
    processedAt: batch?.processedAt || null,
    totalCreditsUsed: batch?.totalCreditsUsed || 0,
    scribeCampaignCount: batch?.scribeCampaigns?.length || 0
  };
}
