import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Pencil, 
  Copy, 
  Trash, 
  Zap,
  Star
} from 'lucide-react';
import { PURPOSE_CONFIG, TYPE_CONFIG } from '@/components/utils/quickSendConstants';

/**
 * QuickSendTemplateCard Component
 * Card display for a single Quick Send Template
 * 
 * @param {Object} template - QuickSendTemplate object
 * @param {string} thumbnailUrl - Card design thumbnail URL
 * @param {string} previewSnippet - Message preview text
 * @param {boolean} canEdit - Whether user can edit this template
 * @param {Function} onEdit - Callback for edit action
 * @param {Function} onDuplicate - Callback for duplicate action
 * @param {Function} onDelete - Callback for delete action
 */
export default function QuickSendTemplateCard({
  template,
  thumbnailUrl,
  previewSnippet,
  canEdit,
  onEdit,
  onDuplicate,
  onDelete
}) {
  const purposeConfig = PURPOSE_CONFIG[template.purpose] || PURPOSE_CONFIG.custom;
  const PurposeIcon = purposeConfig.icon;
  const typeConfig = TYPE_CONFIG[template.type] || TYPE_CONFIG.personal;

  return (
    <Card className="hover:shadow-lg transition-shadow group overflow-hidden">
      <div className="flex">
        {/* Card Design Thumbnail */}
        <div className="w-24 flex-shrink-0 bg-gray-100">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Card design"
              className="w-full h-full object-cover"
              style={{ minHeight: '160px' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ minHeight: '160px' }}>
              <Zap className="w-8 h-8" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4">
          {/* Header with name and actions */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {template.name}
            </h3>
            
            <div className="flex gap-1 ml-2">
              {/* Edit */}
              {canEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(); }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-indigo-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edit QuickSend</TooltipContent>
                </Tooltip>
              )}
              
              {/* Duplicate */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-blue-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Duplicate QuickSend</TooltipContent>
              </Tooltip>
              
              {/* Delete */}
              {canEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Delete QuickSend</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Purpose badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${purposeConfig.bgColor} ${purposeConfig.textColor}`}>
              <PurposeIcon className="w-3 h-3" />
              {purposeConfig.label}
            </span>
            
            {/* Type badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bgColor} ${typeConfig.textColor}`}>
              {typeConfig.label}
            </span>
            
            {/* Default badge */}
            {template.isDefault && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                Default
              </span>
            )}
          </div>
          
          {/* Message preview */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {previewSnippet || 'No message content'}
          </p>
          
          {/* Usage stats */}
          {template.usageCount > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Configs imported from centralized constants file