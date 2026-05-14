import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function normalizeIds(ids) {
  return (ids || []).map(id => String(id || '').trim()).filter(Boolean);
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function summarizeClient(client) {
  if (!client) return null;
  const requiredFields = ['fullName', 'street', 'city', 'state', 'zipCode'];
  const missingFields = requiredFields.filter(field => !String(client[field] || '').trim());
  return {
    id: client.id,
    orgId: client.orgId || null,
    ownerId: client.ownerId || null,
    fullName: client.fullName || null,
    email: client.email || null,
    company: client.company || null,
    city: client.city || null,
    state: client.state || null,
    hasStreet: !!String(client.street || '').trim(),
    hasZipCode: !!String(client.zipCode || '').trim(),
    missingFields
  };
}

function summarizeBatch(batch) {
  if (!batch) return null;
  return {
    id: batch.id,
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

async function safeLookup(label, selectedClientIds, lookupFn) {
  try {
    const rows = await lookupFn();
    const ids = new Set((rows || []).map(row => row.id));
    return {
      label,
      ok: true,
      count: rows?.length || 0,
      matchedSelectedIds: selectedClientIds.filter(id => ids.has(id)),
      missingSelectedIds: selectedClientIds.filter(id => !ids.has(id)),
      rows: (rows || []).map(summarizeClient)
    };
  } catch (error) {
    return {
      label,
      ok: false,
      error: error.message || String(error)
    };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const mailingBatchId = body.mailingBatchId;
    if (!mailingBatchId) {
      return Response.json({ error: 'mailingBatchId is required' }, { status: 400 });
    }

    const [serviceBatches, userVisibleBatches] = await Promise.all([
      base44.asServiceRole.entities.MailingBatch.filter({ id: mailingBatchId }),
      base44.entities.MailingBatch.filter({ id: mailingBatchId }).catch(error => ({ error }))
    ]);

    const batch = serviceBatches?.[0];
    if (!batch) {
      return Response.json({ error: 'Mailing batch not found by service role' }, { status: 404 });
    }

    if (batch.userId !== user.id && batch.organizationId !== user.orgId) {
      return Response.json({ error: 'Unauthorized to diagnose this mailing batch' }, { status: 403 });
    }

    const selectedClientIds = normalizeIds(batch.selectedClientIds);
    const orgCandidates = unique([
      batch.organizationId,
      user.orgId,
      user.data?.orgId
    ]);

    const lookups = [];
    lookups.push(await safeLookup(
      'serviceRole Client.filter({ id: { $in: selectedClientIds } })',
      selectedClientIds,
      () => base44.asServiceRole.entities.Client.filter({ id: { $in: selectedClientIds } })
    ));
    lookups.push(await safeLookup(
      'user Client.filter({ id: { $in: selectedClientIds } })',
      selectedClientIds,
      () => base44.entities.Client.filter({ id: { $in: selectedClientIds } })
    ));

    for (const orgId of orgCandidates) {
      lookups.push(await safeLookup(
        `serviceRole Client.filter({ orgId: "${orgId}" })`,
        selectedClientIds,
        () => base44.asServiceRole.entities.Client.filter({ orgId })
      ));
      lookups.push(await safeLookup(
        `user Client.filter({ orgId: "${orgId}" })`,
        selectedClientIds,
        () => base44.entities.Client.filter({ orgId })
      ));
    }

    const bestServiceOrgLookup = lookups.find(lookup =>
      lookup.ok &&
      lookup.label.startsWith('serviceRole Client.filter({ orgId:') &&
      lookup.matchedSelectedIds?.length === selectedClientIds.length
    );

    const addressErrors = (bestServiceOrgLookup?.rows || [])
      .filter(client => selectedClientIds.includes(client.id) && client.missingFields?.length);

    return Response.json({
      checkedAt: new Date().toISOString(),
      currentUser: {
        id: user.id,
        email: user.email || null,
        role: user.role || null,
        appRole: user.appRole || null,
        orgId: user.orgId || null,
        dataOrgId: user.data?.orgId || null,
        isOrgOwner: user.isOrgOwner || false
      },
      batch: summarizeBatch(batch),
      userVisibleBatch: Array.isArray(userVisibleBatches)
        ? {
            count: userVisibleBatches.length,
            rows: userVisibleBatches.map(summarizeBatch)
          }
        : {
            error: userVisibleBatches?.error?.message || 'User-scoped batch lookup failed'
          },
      selectedClientIds,
      orgCandidates,
      lookups,
      conclusions: {
        selectedClientCount: selectedClientIds.length,
        hasServiceOrgLookupWithAllSelected: !!bestServiceOrgLookup,
        addressErrorCount: addressErrors.length,
        addressErrors
      }
    });
  } catch (error) {
    console.error('diagnoseMailingBatch error:', error);
    return Response.json(
      { error: error.message || 'Failed to diagnose mailing batch' },
      { status: 500 }
    );
  }
});
