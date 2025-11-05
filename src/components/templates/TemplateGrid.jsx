import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Pencil, Copy, Trash, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function TemplateGrid({ 
  title, 
  templates, 
  categories = [],
  user, 
  onFavoriteToggle, 
  onTemplateDeleted,
  emptyMessage 
}) {
  const navigate = useNavigate();

  // Create a map for quick category lookup
  const categoryMap = React.useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  if (!templates || templates.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const userFavorites = user?.favoriteTemplateIds || [];

  return (
    <TooltipProvider>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const isFavorite = userFavorites.includes(template.id);
            const canEdit = template.createdByUserId === user?.id || user?.appRole === 'super_admin';
            
            // Get category names for this template
            const templateCategories = (template.templateCategoryIds || [])
              .map(catId => categoryMap[catId])
              .filter(Boolean);

            return (
              <Tooltip key={template.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Card 
                    className="hover:shadow-lg transition-shadow cursor-pointer group relative"
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {template.name}
                        </h3>
                      </div>
                      
                      <div className="flex gap-1">
                        {/* Favorite Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onFavoriteToggle(template.id);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isFavorite 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-400 hover:text-yellow-400'
                                }`}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Edit Button (only if user can edit) */}
                        {canEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(createPageUrl(`EditTemplate?id=${template.id}`));
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Pencil className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit template</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Duplicate Button (always visible) */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Placeholder - will implement in Phase 2
                                console.log('Duplicate template:', template.id);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Duplicate template</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Delete Button (only if user can edit) */}
                        {canEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Placeholder - will implement in Phase 2
                                  console.log('Delete template:', template.id);
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Trash className="w-4 h-4 text-gray-400 hover:text-red-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete template</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Template content - 2 lines with larger font */}
                      <p className="text-base text-gray-600 line-clamp-2 leading-relaxed">
                        {template.content}
                      </p>
                      
                      {/* Template Metadata */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        {template.type === 'organization' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Organization
                          </span>
                        )}
                        {template.type === 'personal' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            Personal
                          </span>
                        )}
                        {template.type === 'platform' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            Platform
                          </span>
                        )}
                        
                        {/* Category Badges */}
                        {templateCategories.map((categoryName, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded"
                          >
                            {categoryName}
                          </span>
                        ))}
                        
                        {template.usageCount > 0 && (
                          <span className="text-gray-400">
                            Used {template.usageCount}x
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-md">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">{template.name}</p>
                    <p className="text-sm whitespace-pre-wrap">{template.content}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}