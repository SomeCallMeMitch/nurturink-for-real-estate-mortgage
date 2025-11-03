
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Star, 
  Edit, 
  Trash2, 
  FileText,
  Loader2
} from "lucide-react";

export default function Templates() {
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentUser = await base44.auth.me();
      console.log('📋 Templates Page - Current User:', currentUser);
      console.log('📋 User orgId:', currentUser.orgId);
      setUser(currentUser);
      
      // Load templates for user's organization
      console.log('🔍 Querying templates with filter:', {
        $or: [
          { orgId: currentUser.orgId },
          { type: 'platform' }
        ]
      });
      
      const templateList = await base44.entities.Template.filter({
        $or: [
          { orgId: currentUser.orgId },
          { type: 'platform' }
        ]
      });
      
      console.log('✅ Templates loaded:', templateList.length, 'templates');
      console.log('📝 Template details:', templateList);
      
      setTemplates(templateList);
      
      // Load categories
      const categoryList = await base44.entities.TemplateCategory.filter({
        $or: [
          { orgId: currentUser.orgId },
          { orgId: null }
        ]
      });
      
      console.log('✅ Categories loaded:', categoryList.length, 'categories');
      
      setCategories(categoryList);
      
    } catch (error) {
      console.error('❌ Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => 
        t.templateCategoryIds?.includes(selectedCategory)
      );
    }
    
    return filtered;
  }, [templates, searchQuery, selectedCategory]);

  // Group templates
  const groupedTemplates = useMemo(() => {
    const favoriteTemplates = filteredTemplates.filter(t => 
      user?.favoriteTemplateIds?.includes(t.id)
    );
    const personalTemplates = filteredTemplates.filter(t => 
      t.createdByUserId === user?.id && !user?.favoriteTemplateIds?.includes(t.id)
    );
    const orgTemplates = filteredTemplates.filter(t => 
      t.type === 'organization' && !user?.favoriteTemplateIds?.includes(t.id)
    );
    const platformTemplates = filteredTemplates.filter(t => 
      t.type === 'platform' && !user?.favoriteTemplateIds?.includes(t.id)
    );
    
    return [
      { name: 'Favorite Templates', templates: favoriteTemplates },
      { name: 'My Personal Templates', templates: personalTemplates },
      { name: 'Organization Templates', templates: orgTemplates },
      { name: 'Platform Templates', templates: platformTemplates }
    ].filter(group => group.templates.length > 0);
  }, [filteredTemplates, user]);

  const handleToggleFavorite = async (templateId) => {
    const newFavorites = user.favoriteTemplateIds?.includes(templateId)
      ? user.favoriteTemplateIds.filter(id => id !== templateId)
      : [...(user.favoriteTemplateIds || []), templateId];
    
    try {
      await base44.auth.updateMe({
        favoriteTemplateIds: newFavorites
      });
      
      setUser(prev => ({ ...prev, favoriteTemplateIds: newFavorites }));
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      await base44.entities.Template.delete(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
    }
  };

  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return null;
    return categoryIds
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Library</h1>
          <p className="text-gray-600">
            Browse, create, and manage your message templates.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by categories..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => navigate(createPageUrl('EditTemplate?id=new'))}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Template Groups */}
        {groupedTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedCategory !== "all" 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by creating your first template'}
                </p>
                <Button 
                  onClick={() => navigate(createPageUrl('EditTemplate?id=new'))}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          groupedTemplates.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {group.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.templates.map((template) => {
                  const isFavorite = user?.favoriteTemplateIds?.includes(template.id);
                  const categoryNames = getCategoryNames(template.templateCategoryIds);
                  
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        {/* Template Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 flex-1">
                            {template.name}
                          </h3>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleToggleFavorite(template.id)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  isFavorite 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-400'
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => navigate(createPageUrl(`EditTemplate?id=${template.id}`))}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                            {template.createdByUserId === user?.id && (
                              <button
                                onClick={() => handleDelete(template.id)}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Template Content */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-4 whitespace-pre-wrap">
                          {template.content}
                        </p>
                        
                        {/* Categories */}
                        {categoryNames && (
                          <div className="flex flex-wrap gap-1 pt-3 border-t border-gray-100">
                            {categoryNames.split(', ').map((catName, idx) => (
                              <span 
                                key={idx}
                                className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded"
                              >
                                {catName}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
