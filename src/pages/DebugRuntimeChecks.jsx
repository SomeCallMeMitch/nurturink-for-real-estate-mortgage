import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function DebugRuntimeChecks() {
  const [lines, setLines] = useState(['Loading debug checks...']);

  useEffect(() => {
    const runChecks = async () => {
      const output = [];

      const addSection = (label, sectionLines) => {
        output.push(`${label}:`);
        output.push(...sectionLines.map(line => `  ${line}`));
        output.push('');
        setLines([...output]);
      };

      let me = null;

      try {
        me = await base44.auth.me();
        output.push(`me.orgId = ${me?.orgId || 'MISSING'}`);
        output.push('');
        setLines([...output]);
      } catch (error) {
        output.push(`Failed to load current user: ${error.message}`);
        setLines([...output]);
        return;
      }

      try {
        const orgs = await base44.entities.Organization.filter({ id: me.orgId }, undefined, 1);
        const org = orgs?.[0];
        addSection('Org industry value', [
          `industry = ${JSON.stringify(org?.industry ?? null)}`
        ]);
      } catch (error) {
        addSection('Org industry value', [`ERROR: ${error.message}`]);
      }

      try {
        const categories = await base44.entities.TemplateCategory.filter({ orgId: me.orgId });
        const hasReJustSold = categories.some(category => category.slug === 're-just-sold');
        addSection('Frontend TemplateCategory query', [
          `count = ${categories.length}`,
          ...categories.map(category => `slug = ${category.slug}, type = ${category.type}`),
          `has slug 're-just-sold' = ${hasReJustSold}`
        ]);
      } catch (error) {
        addSection('Frontend TemplateCategory query', [`ERROR: ${error.message}`]);
      }

      try {
        const pendingRows = await base44.entities.ScheduledSend.filter({ orgId: me.orgId, status: 'pending' });
        const allOrgRows = await base44.entities.ScheduledSend.filter({ orgId: me.orgId });
        const sectionLines = [
          `pending count = ${pendingRows.length}`,
          `all org count = ${allOrgRows.length}`,
          ...allOrgRows.slice(0, 5).map(row => `status = ${row.status}, scheduledDate = ${row.scheduledDate}, campaignId = ${row.campaignId}`)
        ];

        if (pendingRows.length === 0 && allOrgRows.length === 0) {
          const anyRows = await base44.entities.ScheduledSend.list(undefined, 5);
          sectionLines.push('first 5 rows without org filter:');
          sectionLines.push(...anyRows.map(row => `orgId = ${row.orgId}, status = ${row.status}, campaignId = ${row.campaignId}`));
        }

        addSection('ScheduledSend rows', sectionLines);
      } catch (error) {
        addSection('ScheduledSend rows', [`ERROR: ${error.message}`]);
      }

      try {
        const notes = await base44.entities.Note.filter({ senderUserId: me.id }, '-created_date', 10);
        const clientIds = [...new Set(notes.map(note => note.clientId).filter(Boolean))];
        const sectionLines = [
          ...notes.map(note => `clientId = ${note.clientId || 'MISSING'}, orgId = ${note.orgId}, recipientName = ${note.recipientName}`)
        ];

        let clients = [];
        if (clientIds.length > 0) {
          clients = await base44.entities.Client.filter({ id: { $in: clientIds }, orgId: me.orgId });
        }
        sectionLines.push(`clientIds queried: ${clientIds.length}, clients returned: ${clients.length}`);

        if (clients.length < clientIds.length) {
          const clientsWithoutOrg = await base44.entities.Client.filter({ id: { $in: clientIds } });
          sectionLines.push(`clients returned without orgId condition: ${clientsWithoutOrg.length}`);
          sectionLines.push(...clientsWithoutOrg.map(client => `client orgId = ${client.orgId}`));
        }

        addSection('Dashboard note-to-client join', sectionLines);
      } catch (error) {
        addSection('Dashboard note-to-client join', [`ERROR: ${error.message}`]);
      }
    };

    runChecks();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h1>Debug Runtime Checks</h1>
      <ul>
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  );
}