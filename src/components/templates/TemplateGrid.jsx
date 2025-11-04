import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Pencil, FileText } from 'lucide-react';

export default function TemplateGrid({ 
  title, 
  templates, 
  user, 
  onFavoriteToggle, 
  onTemplateDeleted,
  emptyMessage 
}) {
  const navigate = useNavigate();

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
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {title} <span className="text-gray-400 font-normal">({templates.length})</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isFavorite = userFavorites.includes(template.id);
          const canEdit = template.createdByUserId === user?.id || user?.appRole === 'super_admin';

          return (
            <Card 
              key={template.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(createPageUrl(`EditTemplate?id=${template.id}`))}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex-1 pr-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </h3>
                </div>
                
                <div className="flex gap-1">
                  {/* Favorite Button */}
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

                  {/* Edit Button (only if user can edit) */}
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl(`EditTemplate?id=${template.id}`));
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                    </button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.content}
                </p>
                
                {/* Template Metadata */}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
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
                  
                  {template.usageCount > 0 && (
                    <span className="text-gray-400">
                      Used {template.usageCount}x
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}