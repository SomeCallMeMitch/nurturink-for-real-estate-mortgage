import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles } from 'lucide-react';

/**
 * TemplateLibrary Component
 * Displays a scrollable list of message templates
 * 
 * @param {Array} templates - Array of template objects
 * @param {Function} onTemplateSelect - Callback when template is clicked: (template) => void
 */
export default function TemplateLibrary({ templates, onTemplateSelect }) {
  
  if (!templates || templates.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No templates available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Templates
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Click to apply a template
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {templates.map((template) => {
            const preview = template.content.length > 80 
              ? template.content.slice(0, 80) + '...' 
              : template.content;
            
            const isPlatform = template.type === 'platform';
            
            return (
              <button
                key={template.id}
                onClick={() => onTemplateSelect(template)}
                className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-indigo-700 text-sm">
                    {template.name}
                  </h4>
                  {isPlatform && (
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {preview}
                </p>
                {template.usageCount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}