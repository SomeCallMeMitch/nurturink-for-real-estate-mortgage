import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * One-time cleanup function to delete all platform-seeded TemplateCategory
 * and Template records. Run this before re-seeding with the new external
 * data source to clear stale/abbreviated data.
 *
 * Requires admin role. Optionally pass { orgId } to target a specific org,
 * or omit to clean ALL platform records across all orgs.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const targetOrgId = body.orgId || null;

    const filter = { type: 'platform' };
    if (targetOrgId) {
      filter.orgId = targetOrgId;
    }

    console.log(`[Cleanup] Deleting platform templates with filter:`, JSON.stringify(filter));
    const templates = await base44.asServiceRole.entities.Template.filter(filter);
    console.log(`[Cleanup] Found ${templates.length} platform templates to delete.`);

    for (const t of templates) {
      await base44.asServiceRole.entities.Template.delete(t.id);
    }
    console.log(`[Cleanup] Deleted ${templates.length} templates.`);

    console.log(`[Cleanup] Deleting platform categories with filter:`, JSON.stringify(filter));
    const categories = await base44.asServiceRole.entities.TemplateCategory.filter(filter);
    console.log(`[Cleanup] Found ${categories.length} platform categories to delete.`);

    for (const c of categories) {
      await base44.asServiceRole.entities.TemplateCategory.delete(c.id);
    }
    console.log(`[Cleanup] Deleted ${categories.length} categories.`);

    return Response.json({
      success: true,
      message: `Cleanup complete. Deleted ${templates.length} templates and ${categories.length} categories.`,
      targetOrgId: targetOrgId || 'all orgs',
    });

  } catch (error) {
    console.error('[Cleanup] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});