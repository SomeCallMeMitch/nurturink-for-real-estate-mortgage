import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MANUAL_SCHEDULING_NOT_IMPLEMENTED =
  'Activation blocked: Campaign Type requires manual scheduling which is not yet implemented.';
const CALENDAR_SCHEDULING_INVALID =
  'Campaign Type requires valid calendar scheduling configuration.';

function isClientAutomationEligible(client) {
  return client.automation_status == null || client.automation_status === 'active';
}

function formatDateOnly(date) {
  return date.toISOString().split('T')[0];
}

function parseDateOnly(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function todayDateOnly() {
  return formatDateOnly(new Date());
}

function normalizeScheduleMonths(months) {
  if (!Array.isArray(months)) return [];
  return [...new Set(months.map(Number))]
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
    .sort((a, b) => a - b);
}

function calculateNextCalendarRunDate(scheduleMonths, scheduleDayOfMonth, fromDateStr = todayDateOnly()) {
  const months = normalizeScheduleMonths(scheduleMonths);
  const dayOfMonth = Number(scheduleDayOfMonth);
  const fromDate = parseDateOnly(fromDateStr) || parseDateOnly(todayDateOnly());
  if (months.length === 0 || !Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31 || !fromDate) {
    return null;
  }

  const fromYear = fromDate.getUTCFullYear();
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const year = fromYear + yearOffset;
    for (const month of months) {
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const day = Math.min(dayOfMonth, lastDay);
      const candidate = new Date(Date.UTC(year, month - 1, day));
      if (candidate >= fromDate) return formatDateOnly(candidate);
    }
  }

  return null;
}

function isCalendarScheduleValid({ scheduleMode, scheduleFrequency, scheduleMonths, scheduleDayOfMonth }) {
  return (
    scheduleMode === 'calendar' &&
    scheduleFrequency === 'quarterly' &&
    normalizeScheduleMonths(scheduleMonths).length > 0 &&
    Number.isInteger(Number(scheduleDayOfMonth)) &&
    Number(scheduleDayOfMonth) >= 1 &&
    Number(scheduleDayOfMonth) <= 31
  );
}

function buildCalendarScheduleFields(body, campaignStatus, campaignType) {
  const {
    scheduleMode,
    scheduleFrequency,
    scheduleMonths,
    scheduleDayOfMonth,
    nextRunDate,
    lastRunDate
  } = body;
  const isManual = campaignType?.triggerMode === 'manual';
  const hasCalendarFields = scheduleMode || scheduleFrequency || scheduleMonths || scheduleDayOfMonth || nextRunDate || lastRunDate;

  if (!isManual && !hasCalendarFields) return { isCalendarCampaign: false, fields: {} };
  if (!isManual) {
    return {
      isCalendarCampaign: false,
      fields: {
        scheduleMode: scheduleMode || null,
        scheduleFrequency: scheduleFrequency || null,
        scheduleMonths: Array.isArray(scheduleMonths) ? normalizeScheduleMonths(scheduleMonths) : scheduleMonths,
        scheduleDayOfMonth: scheduleDayOfMonth ?? null,
        nextRunDate: nextRunDate || null,
        lastRunDate: lastRunDate || null
      }
    };
  }

  if (campaignStatus !== 'active') {
    return {
      isCalendarCampaign: scheduleMode === 'calendar',
      fields: {
        scheduleMode: scheduleMode || null,
        scheduleFrequency: scheduleFrequency || null,
        scheduleMonths: Array.isArray(scheduleMonths) ? normalizeScheduleMonths(scheduleMonths) : scheduleMonths,
        scheduleDayOfMonth: scheduleDayOfMonth ?? null,
        nextRunDate: nextRunDate || null,
        lastRunDate: lastRunDate || null
      }
    };
  }

  if (!isCalendarScheduleValid({ scheduleMode, scheduleFrequency, scheduleMonths, scheduleDayOfMonth })) {
    return { isCalendarCampaign: false, error: CALENDAR_SCHEDULING_INVALID };
  }

  const normalizedMonths = normalizeScheduleMonths(scheduleMonths);
  const normalizedDay = Number(scheduleDayOfMonth);
  const today = todayDateOnly();
  const nextRun = parseDateOnly(nextRunDate) && nextRunDate >= today
    ? nextRunDate
    : calculateNextCalendarRunDate(normalizedMonths, normalizedDay, today);

  if (!nextRun) return { isCalendarCampaign: false, error: CALENDAR_SCHEDULING_INVALID };

  return {
    isCalendarCampaign: true,
    fields: {
      scheduleMode: 'calendar',
      scheduleFrequency,
      scheduleMonths: normalizedMonths,
      scheduleDayOfMonth: normalizedDay,
      nextRunDate: nextRun,
      lastRunDate: lastRunDate || null
    }
  };
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      type,
      triggerTypeId,
      triggerField: requestedTriggerField,
      dateField,
      enrollmentMode = 'opt_out',
      requiresApproval = false,
      returnAddressMode = 'company',
      status: campaignStatus = 'draft',
      scheduleMode,
      scheduleFrequency,
      scheduleMonths,
      scheduleDayOfMonth,
      nextRunDate,
      lastRunDate,
      steps = []
    } = body;
    const safeSteps = Array.isArray(steps) ? steps : [];
    // DEBUG ADDED: request-scoped backend logging without dumping full client records.
    console.error('[createCampaign][DIAG] request received', {
      requestId,
      userId: user.id,
      orgId: user.orgId || null,
      type,
      triggerTypeId: triggerTypeId || null,
      requestedTriggerField: requestedTriggerField || null,
      dateField: dateField || null,
      campaignStatus,
      stepsIsArray: Array.isArray(steps),
      stepsCount: safeSteps.length,
      hasName: !!name,
      scheduleMode: scheduleMode || null,
    });

    // Sprint 3: Validate type against CampaignType entity instead of TriggerType
    let campaignType = null;
    if (triggerTypeId) {
      try {
        campaignType = await base44.entities.CampaignType.get(triggerTypeId);
      } catch (e) {
        // CampaignType not found by ID — fall through to slug lookup
      }
    }
    if (!campaignType && type) {
      const matches = await base44.entities.CampaignType.filter({ slug: type, isActive: true });
      campaignType = matches[0] || null;
    }
    if (!campaignType) {
      console.error('[createCampaign][DIAG] invalid campaign type', { requestId, type, triggerTypeId: triggerTypeId || null });
      return Response.json({
        success: false,
        error: 'Invalid campaign type. Please select a valid campaign type.'
      }, { status: 400 });
    }

    console.error('[createCampaign][DIAG] campaign type resolved', {
      requestId,
      campaignTypeId: campaignType.id,
      slug: campaignType.slug,
      triggerField: campaignType.triggerField || null,
      triggerMode: campaignType.triggerMode || null,
    });

    const calendarSchedule = buildCalendarScheduleFields({
      scheduleMode,
      scheduleFrequency,
      scheduleMonths,
      scheduleDayOfMonth,
      nextRunDate,
      lastRunDate
    }, campaignStatus, campaignType);

    if (calendarSchedule.error) {
      return Response.json({
        success: false,
        error: calendarSchedule.error
      }, { status: 400 });
    }

    // Resolve the trigger field from the CampaignType record
    const triggerField = requestedTriggerField || dateField || campaignType.triggerField || null;
    if (!triggerField) {
      if (campaignType.triggerMode === 'manual' && (campaignStatus === 'draft' || calendarSchedule.isCalendarCampaign)) {
        // Manual/null-trigger drafts and valid calendar campaigns do not require triggerField.
      } else if (campaignType.triggerMode === 'manual' && campaignStatus === 'active') {
        return Response.json({
          success: false,
          error: MANUAL_SCHEDULING_NOT_IMPLEMENTED
        }, { status: 400 });
      } else {
        return Response.json({
          success: false,
          error: 'Campaign type is missing a triggerField configuration. Contact your administrator.'
        }, { status: 400 });
      }
    }

    const orgId = user.orgId;
    if (!orgId) {
      return Response.json({
        success: false,
        error: 'User is not associated with an organization'
      }, { status: 400 });
    }

    // Validate and pre-build step records BEFORE writing anything to the database
    // This prevents the bug where Campaign is created but steps fail validation,
    // leaving an orphaned Campaign record and showing a false error to the user.
    const preValidatedSteps = safeSteps.length > 0 ? safeSteps.map((step, index) => ({
      stepOrder: step.stepOrder || index + 1,
      cardDesignId: step.cardDesignId,
      templateId: step.templateId || null,
      messageText: step.messageText || '',
      timingDays: step.timingDays,
      timingReference: step.timingReference || 'trigger_date',
      isEnabled: step.isEnabled !== false
    })) : [];

    for (let i = 0; i < preValidatedSteps.length; i++) {
      const step = preValidatedSteps[i];
      if (!step.cardDesignId) {
        return Response.json({
          success: false,
          error: `Step ${i + 1} is missing required cardDesignId`
        }, { status: 400 });
      }
      if (step.timingDays === undefined || step.timingDays === null) {
        return Response.json({
          success: false,
          error: `Step ${i + 1} is missing required timingDays`
        }, { status: 400 });
      }
      if (campaignStatus !== 'draft' && !step.templateId && !step.messageText) {
        return Response.json({
          success: false,
          error: `Step ${i + 1} requires either a template or a custom message`
        }, { status: 400 });
      }
    }

    // All validation passed — now write to the database
    console.error('[createCampaign][DIAG] creating campaign record', {
      requestId,
      orgId,
      ownerId: user.id,
      triggerField,
      status: campaignStatus,
      preValidatedStepsCount: preValidatedSteps.length,
    });
    const campaign = await base44.entities.Campaign.create({
      name: name || `${campaignType.name} Campaign`,
      type: campaignType.slug,
      triggerTypeId: campaignType.id,
      triggerField,
      // Transitional compatibility: legacy reads may still use dateField.
      dateField: triggerField,
      ...calendarSchedule.fields,
      enrollmentMode,
      requiresApproval,
      returnAddressMode,
      status: campaignStatus,
      orgId,
      ownerId: user.id,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    });

    console.error('[createCampaign][DIAG] campaign record created', { requestId, campaignId: campaign.id });

    // Create campaign steps (already validated above)
    if (preValidatedSteps.length > 0) {
      const stepRecords = preValidatedSteps.map(step => ({ campaignId: campaign.id, ...step }));
      await base44.entities.CampaignStep.bulkCreate(stepRecords);
    }

    // Auto-enroll eligible clients if opt_out mode AND status is active
    let enrolledCount = 0;
    if (enrollmentMode === 'opt_out' && campaignStatus === 'active') {
      try {
        const allClients = await base44.entities.Client.filter({
          orgId,
          ownerId: user.id
        });

        const eligibleClients = allClients.filter((client) => {
          const hasFieldValue = calendarSchedule.isCalendarCampaign || (client[triggerField] && client[triggerField] !== '');
          return hasFieldValue && isClientAutomationEligible(client);
        });

        if (eligibleClients.length > 0) {
          const existingEnrollments = await base44.entities.CampaignEnrollment.filter({ campaignId: campaign.id });
          const existingClientIds = new Set(existingEnrollments.map((enrollment) => enrollment.clientId));
          const clientsToEnroll = eligibleClients.filter((client) => !existingClientIds.has(client.id));

          const enrollmentRecords = clientsToEnroll.map((client) => ({
            campaignId: campaign.id,
            orgId,
            clientId: client.id,
            status: 'enrolled',
            enrolledAt: new Date().toISOString()
          }));

          if (clientsToEnroll.length > 0) {
            await base44.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);
            enrolledCount = clientsToEnroll.length;
          }

          // FIX #10: Concurrent tag updates instead of sequential loop
          const campaignTag = `${campaignType.name} Campaign`;
          const tagUpdatePromises = clientsToEnroll
            .filter((client) => {
              const existingTags = Array.isArray(client.tags) ? client.tags : [];
              return !existingTags.includes(campaignTag);
            })
            .map((client) => {
              const existingTags = Array.isArray(client.tags) ? client.tags : [];
              return base44.entities.Client.update(client.id, {
                tags: [...existingTags, campaignTag]
              });
            });
          await Promise.all(tagUpdatePromises);
        }
      } catch (enrollmentError) {
        console.error('Error during auto-enrollment:', enrollmentError);
      }
    }

    return Response.json({
      success: true,
      requestId,
      campaignId: campaign.id,
      stepsCreated: safeSteps.length,
      enrolledCount,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('[createCampaign] unhandled error', {
      requestId,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return Response.json({
      success: false,
      requestId,
      error: error.message || 'An error occurred while creating the campaign'
    }, { status: 500 });
  }
});
