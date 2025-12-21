import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Pencil, Copy, Trash, FileText } from 'lucide-react';
import { Pill, getTypeVariant } from '@/components/ui/Pill';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TemplateGrid({ 
  title, 
  templates, 
  categories = [],
  user, 
  onFavoriteToggle,
  onDuplicateTemplate,
  onDeleteTemplate,
  emptyMessage 
}) {
  const navigate = useNavigate();
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Create a map for quick category lookup
  const categoryMap = React.useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      onDeleteTemplate(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  // Permission check helper
  const canUserEditTemplate = (template) => {
    if (!user) return false;
    
    // Platform templates cannot be edited
    if (template.type === 'platform') return false;
    
    // User can edit their own templates
    if (template.createdByUserId === user.id) return true;
    
    // Organization templates can only be edited by owner or admin
    if (template.type === 'organization') {
      return user.appRole === 'organization_owner' || user.appRole === 'super_admin';
    }
    
    // Super admin can edit anything except platform templates
    if (user.appRole === 'super_admin') return true;
    
    return false;
  };

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
          {templates.map((template, index) => {
            const isFavorite = userFavorites.includes(template.id);
            const canEdit = canUserEditTemplate(template);
            const isHovered = hoveredTemplate === template.id;
            
            // Determine if this card is in the third column (rightmost)
            const isThirdColumn = index % 3 === 2;
            
            // Get category names for this template
            const templateCategories = (template.templateCategoryIds || [])
              .map(catId => categoryMap[catId])
              .filter(Boolean);

            return (
              <div 
                key={template.id}
                className="relative"
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <Card className="hover:shadow-lg transition-shadow group relative">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex-1 pr-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    
                    <div className="flex gap-1">
                      {/* Favorite Button - YELLOW */}
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
                                  : 'text-yellow-400'
                              }`}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Edit Button - INDIGO (only if user can edit) */}
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
                              <Pencil className="w-4 h-4 text-indigo-600" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit template</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Duplicate Button - BLUE (always visible) */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateTemplate(template);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4 text-blue-600" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Duplicate template</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Delete Button - RED (only if user can edit) */}
                      {canEdit && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(template);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Trash className="w-4 h-4 text-red-600" />
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
                    <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
                      {/* Type Pill */}
                      <Pill variant={getTypeVariant(template.type)} size="sm">
                        {template.type === 'organization' ? 'Organization' :
                         template.type === 'personal' ? 'Personal' : 'Platform'}
                      </Pill>
                      
                      {/* Category Pills */}
                      {templateCategories.map((categoryName, idx) => (
                        <Pill key={idx} variant="tag" size="sm">
                          {categoryName}
                        </Pill>
                      ))}
                      
                      {template.usageCount > 0 && (
                        <span className="text-gray-400">
                          Used {template.usageCount}x
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Hover Tooltip - Positioned based on column */}
                {isHovered && (
                  <div 
                    className={`absolute top-0 z-50 pointer-events-none animate-in fade-in-0 duration-200 ${
                      isThirdColumn 
                        ? 'right-full mr-2 slide-in-from-right-2' 
                        : 'left-full ml-2 slide-in-from-left-2'
                    }`}
                  >
                    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 w-[520px]">
                      <div className="space-y-2">
                        <p className="font-semibold text-sm">{template.name}</p>
                        <p className="text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                          {template.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}