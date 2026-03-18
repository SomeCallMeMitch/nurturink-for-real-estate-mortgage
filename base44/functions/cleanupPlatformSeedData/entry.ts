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

    // Helper: delete in batches with delay to avoid rate limits
    async function batchDelete(entity, records, label) {
      let deleted = 0;
      for (const r of records) {
        await entity.delete(r.id);
        deleted++;
        if (deleted % 20 === 0) {
          console.log(`[Cleanup] Deleted ${deleted}/${records.length} ${label}...`);
          await new Promise(res => setTimeout(res, 2000));
        }
      }
      return deleted;
    }

    // Delete templates first (they reference categories)
    console.log(`[Cleanup] Fetching platform templates with filter:`, JSON.stringify(filter));
    const templates = await base44.asServiceRole.entities.Template.filter(filter);
    console.log(`[Cleanup] Found ${templates.length} platform templates to delete.`);
    const deletedTemplates = await batchDelete(base44.asServiceRole.entities.Template, templates, 'templates');

    // Then delete categories
    console.log(`[Cleanup] Fetching platform categories with filter:`, JSON.stringify(filter));
    const categories = await base44.asServiceRole.entities.TemplateCategory.filter(filter);
    console.log(`[Cleanup] Found ${categories.length} platform categories to delete.`);
    const deletedCategories = await batchDelete(base44.asServiceRole.entities.TemplateCategory, categories, 'categories');

    return Response.json({
      success: true,
      message: `Cleanup complete. Deleted ${deletedTemplates} templates and ${deletedCategories} categories.`,
      targetOrgId: targetOrgId || 'all orgs',
    });

  } catch (error) {
    console.error('[Cleanup] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});