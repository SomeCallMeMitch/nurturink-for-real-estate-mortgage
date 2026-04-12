// components/quicksend/QuickSendTemplateCard.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Copy, Trash, Zap } from 'lucide-react';
import { PURPOSE_CONFIG, TYPE_CONFIG } from '@/components/utils/quickSendConstants';
import { Pill, getPurposeVariant, getTypeVariant } from '@/components/ui/Pill';

/**
 * QuickSendTemplateCard — Option B layout
 * Badges + management icons top row
 * Thumbnail + name + preview body
 * Full-width Send button at bottom
 */
export default function QuickSendTemplateCard({
  template,
  thumbnailUrl,
  previewSnippet,
  canEdit,
  onSend,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const purposeConfig = PURPOSE_CONFIG[template.purpose] || PURPOSE_CONFIG.custom;
  const PurposeIcon = purposeConfig.icon;
  const typeConfig = TYPE_CONFIG[template.type] || TYPE_CONFIG.personal;

  return (
    <Card className="overflow-hidden flex flex-col">

      {/* ── Top row: badges left, icons right ─────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 gap-2">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          <Pill variant={getPurposeVariant(template.purpose)} size="sm" icon={PurposeIcon}>
            {purposeConfig.label}
          </Pill>
          <Pill variant={getTypeVariant(template.type)} size="sm">
            {typeConfig.label}
          </Pill>
          {template.isDefault && (
            <Pill variant="warning" size="sm">Default</Pill>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <Trash className="w-3.5 h-3.5 text-destructive" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ── Body: thumbnail + name + preview ──────────────────────── */}
      <div className="flex gap-3 px-3 pb-3 flex-1">
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border"
          style={{ width: '72px', height: '52px' }}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Card design" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1 mb-1">
            {template.name}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {previewSnippet || 'No message content'}
          </p>
          {template.usageCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Send button ────────────────────────────────────────────── */}
      <button
        onClick={(e) => { e.stopPropagation(); onSend(); }}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#d15704' }}
      >
        <Zap className="w-4 h-4" />
        Send this card
      </button>

    </Card>
  );
}