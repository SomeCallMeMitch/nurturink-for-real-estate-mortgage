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

export default function MailingBatchDebugModal({
  open,
  onOpenChange,
  mailingBatchId,
  mailingBatch,
  clients,
  user
}) {
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

      const frontendSnapshot = buildFrontendSnapshot({
        mailingBatchId,
        mailingBatch,
        clients,
        user
      });

      const response = await base44.functions.invoke('diagnoseMailingBatch', {
        mailingBatchId
      });

      setDiagnostics({
        checkedAt: new Date().toISOString(),
        frontend: frontendSnapshot,
        backend: response.data
      });
    } catch (err) {
      console.error('Mailing batch diagnostics failed:', err);
      setError({
        message: err.message || 'Mailing batch diagnostics failed',
        responseData: err.response?.data || null
      });
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
          <DialogTitle>Send Diagnostics</DialogTitle>
          <DialogDescription>
            Debug view for Review & Send client lookup and batch processing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Button onClick={loadDiagnostics} disabled={loading || !mailingBatchId} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Load Diagnostics
          </Button>
          <Button variant="outline" onClick={copyDiagnostics} disabled={!diagnostics && !error}>
            Copy JSON
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <pre className="min-h-[360px] overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
          {diagnostics || error ? diagnosticsText : 'Click Load Diagnostics to compare frontend and backend batch/client lookups.'}
        </pre>
      </DialogContent>
    </Dialog>
  );
}

function buildFrontendSnapshot({ mailingBatchId, mailingBatch, clients, user }) {
  const selectedClientIds = (mailingBatch?.selectedClientIds || [])
    .map(id => String(id || '').trim())
    .filter(Boolean);
  const loadedClientIds = (clients || []).map(client => client.id);
  const loadedClientIdSet = new Set(loadedClientIds);

  return {
    url: window.location.href,
    mailingBatchId,
    currentUser: {
      id: user?.id || null,
      email: user?.email || null,
      role: user?.role || null,
      appRole: user?.appRole || null,
      orgId: user?.orgId || null,
      dataOrgId: user?.data?.orgId || null,
      isOrgOwner: user?.isOrgOwner || false
    },
    batch: summarizeBatch(mailingBatch),
    selectedClientIds,
    loadedClientIds,
    counts: {
      selectedClientIds: selectedClientIds.length,
      loadedClients: loadedClientIds.length,
      missingFromFrontendClientLoad: selectedClientIds.filter(id => !loadedClientIdSet.has(id)).length
    },
    missingFromFrontendClientLoad: selectedClientIds.filter(id => !loadedClientIdSet.has(id)),
    loadedClients: (clients || []).map(summarizeClient)
  };
}

function summarizeBatch(batch) {
  if (!batch) return null;
  return {
    id: batch.id || null,
    status: batch.status || null,
    userId: batch.userId || null,
    organizationId: batch.organizationId || null,
    selectedClientIds: batch.selectedClientIds || [],
    selectedClientCount: batch.selectedClientIds?.length || 0,
    selectedCardDesignId: batch.selectedCardDesignId || null,
    selectedNoteStyleProfileId: batch.selectedNoteStyleProfileId || null,
    returnAddressModeGlobal: batch.returnAddressModeGlobal || null,
    draftCurrentStep: batch.draftCurrentStep || null,
    draftSavedAt: batch.draftSavedAt || null,
    draftSavedExplicitlyAt: batch.draftSavedExplicitlyAt || null,
    processedAt: batch.processedAt || null,
    processingErrors: batch.processingErrors || []
  };
}

function summarizeClient(client) {
  const requiredFields = ['fullName', 'street', 'city', 'state', 'zipCode'];
  const missingFields = requiredFields.filter(field => !String(client?.[field] || '').trim());
  return {
    id: client?.id || null,
    orgId: client?.orgId || null,
    ownerId: client?.ownerId || null,
    fullName: client?.fullName || null,
    email: client?.email || null,
    company: client?.company || null,
    city: client?.city || null,
    state: client?.state || null,
    hasStreet: !!String(client?.street || '').trim(),
    hasZipCode: !!String(client?.zipCode || '').trim(),
    missingFields
  };
}
