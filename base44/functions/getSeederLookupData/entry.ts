import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * getSeederLookupData
 *
 * Returns existing platform entity data needed by seeder scripts to
 * avoid duplicates and resolve IDs. Super admin only.
 *
 * Response keys:
 *   noteStyleProfiles   — id, name, isDefault
 *   cardDesigns         — id, name, category, isDefault, type  (platform only)
 *   templateCategories  — id, name, slug
 *   existingQuickSends  — id, name, type
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth guard — super_admin only
    const user = await base44.auth.me();
    if (!user || user.appRole !== 'super_admin') {
      return Response.json({ error: 'Forbidden: super_admin access required' }, { status: 403 });
    }

    // Fetch all four datasets in parallel using service role to bypass RLS
    const [noteStyleProfiles, cardDesigns, templateCategories, quickSendTemplates] = await Promise.all([
      base44.asServiceRole.entities.NoteStyleProfile.list(undefined, 500),
      base44.asServiceRole.entities.CardDesign.filter({ type: 'platform' }, undefined, 500),
      base44.asServiceRole.entities.TemplateCategory.list(undefined, 500),
      base44.asServiceRole.entities.QuickSendTemplate.list(undefined, 500),
    ]);

    return Response.json({
      noteStyleProfiles: (noteStyleProfiles || []).map(p => ({
        id: p.id,
        name: p.name,
        isDefault: p.isDefault ?? false,
      })),
      cardDesigns: (cardDesigns || []).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category ?? null,
        isDefault: d.isDefault ?? false,
        type: d.type,
      })),
      templateCategories: (templateCategories || []).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      existingQuickSends: (quickSendTemplates || []).map(t => ({
        id: t.id,
        name: t.name,
        type: t.type ?? null,
      })),
    });

  } catch (error) {
    console.error('[getSeederLookupData] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});