import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mailingBatchId } = await req.json();

    if (!mailingBatchId) {
      return Response.json({ error: 'mailingBatchId is required' }, { status: 400 });
    }

    const batches = await base44.asServiceRole.entities.MailingBatch.filter({ id: mailingBatchId });

    if (!batches?.length) {
      return Response.json({ error: 'Mailing draft not found' }, { status: 404 });
    }

    const batch = batches[0];

    if (batch.userId !== user.id) {
      return Response.json({ error: 'Unauthorized to discard this draft' }, { status: 403 });
    }

    if (batch.status !== 'draft') {
      return Response.json(
        { error: `Only draft batches can be discarded. Current status: ${batch.status || 'unknown'}` },
        { status: 409 }
      );
    }

    if (batch.scheduledSendId) {
      return Response.json(
        { error: 'Scheduled send batches cannot be discarded manually.' },
        { status: 409 }
      );
    }

    await base44.asServiceRole.entities.MailingBatch.delete(mailingBatchId);

    return Response.json({
      success: true,
      mailingBatchId
    });
  } catch (error) {
    console.error('[discardMailingDraft] Error:', error);
    return Response.json(
      { error: error.message || 'Failed to discard mailing draft' },
      { status: 500 }
    );
  }
});
