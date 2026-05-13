export const DRAFT_STEPS = {
  FIND_CLIENTS: 'find_clients',
  CREATE_CONTENT: 'create_content',
  SELECT_DESIGN: 'select_design',
  REVIEW_SEND: 'review_send'
};

export const DRAFT_STEP_LABELS = {
  [DRAFT_STEPS.FIND_CLIENTS]: 'Find Clients',
  [DRAFT_STEPS.CREATE_CONTENT]: 'Create Content',
  [DRAFT_STEPS.SELECT_DESIGN]: 'Select Design',
  [DRAFT_STEPS.REVIEW_SEND]: 'Review & Send'
};

export function inferDraftStep(batch) {
  if (!batch?.selectedClientIds?.length) return DRAFT_STEPS.FIND_CLIENTS;
  if (!batch.globalMessage && !hasObjectValues(batch.contentOverrides)) return DRAFT_STEPS.CREATE_CONTENT;
  if (!batch.selectedCardDesignId && !hasObjectValues(batch.cardDesignOverrides)) return DRAFT_STEPS.SELECT_DESIGN;
  return DRAFT_STEPS.REVIEW_SEND;
}

export function getDraftStep(batch) {
  return DRAFT_STEP_LABELS[batch?.draftCurrentStep]
    ? batch.draftCurrentStep
    : inferDraftStep(batch);
}

export function getDraftStepLabel(batch) {
  return DRAFT_STEP_LABELS[getDraftStep(batch)] || 'Draft';
}

export function getDraftResumePage(batch) {
  const step = getDraftStep(batch);
  const query = `mailingBatchId=${batch.id}`;

  if (step === DRAFT_STEPS.FIND_CLIENTS) return `FindClients?${query}`;
  if (step === DRAFT_STEPS.SELECT_DESIGN) return `SelectDesign?${query}`;
  if (step === DRAFT_STEPS.REVIEW_SEND) return `ReviewAndSend?${query}`;
  return `CreateContent?${query}`;
}

export function getDraftTimestamp(batch) {
  return batch?.draftSavedAt || batch?.updated_date || batch?.created_date || batch?.created_at || null;
}

export function formatDraftLabel(batch) {
  const timestamp = getDraftTimestamp(batch);
  const dateText = timestamp ? new Date(timestamp).toLocaleDateString() : 'Unsaved date';
  const count = batch?.selectedClientIds?.length || 0;
  const recipientLabel = count === 1 ? 'recipient' : 'recipients';
  const shortId = batch?.id ? batch.id.slice(-6).toUpperCase() : 'NEW';

  return `Draft - ${dateText} - ${count} ${recipientLabel} - Batch #${shortId}`;
}

export function formatDraftSavedAt(batch) {
  const timestamp = getDraftTimestamp(batch);
  if (!timestamp) return 'Not saved yet';
  return `Last saved ${new Date(timestamp).toLocaleString()}`;
}

export function sortDraftsNewestFirst(drafts) {
  return [...(drafts || [])].sort((a, b) => {
    const dateA = new Date(getDraftTimestamp(a) || 0);
    const dateB = new Date(getDraftTimestamp(b) || 0);
    return dateB - dateA;
  });
}

function hasObjectValues(value) {
  return value && typeof value === 'object' && Object.keys(value).length > 0;
}
