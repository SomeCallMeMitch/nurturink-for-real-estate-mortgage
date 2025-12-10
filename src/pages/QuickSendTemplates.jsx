import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/components/ui/use-toast';
import {
  Zap,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Star,
  Loader2
} from 'lucide-react';

export default function QuickSendTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const allTemplates = await base44.entities.QuickSendTemplate.list();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Quick Send Templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    // Search filter
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'all') return true;
    if (activeTab === 'personal') return template.type === 'personal' && template.createdByUserId === currentUser?.id;
    if (activeTab === 'organization') return template.type === 'organization';
    if (activeTab === 'platform') return template.type === 'platform';
    
    return true;
  });

  const handleCreate = () => {
    navigate(createPageUrl('EditQuickSendTemplate'));
  };

  const handleEdit = (template) => {
    navigate(createPageUrl(`EditQuickSendTemplate?id=${template.id}`));
  };

  const handleDuplicate = (template) => {
    navigate(createPageUrl(`EditQuickSendTemplate?duplicateFrom=${template.id}`));
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    
    try {
      await base44.entities.QuickSendTemplate.delete(templateToDelete.id);
      toast({
        title: 'Template Deleted',
        description: 'Quick Send Template has been deleted successfully',
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      loadData();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSetDefault = async (template) => {
    try {
      // First, unset any existing default for this purpose and type
      const existingDefaults = templates.filter(t => 
        t.purpose === template.purpose && 
        t.type === template.type && 
        t.isDefault && 
        t.id !== template.id
      );
      
      for (const existingDefault of existingDefaults) {
        await base44.entities.QuickSendTemplate.update(existingDefault.id, {
          isDefault: false
        });
      }
      
      // Set this template as default
      await base44.entities.QuickSendTemplate.update(template.id, {
        isDefault: true
      });
      
      toast({
        title: 'Default Template Set',
        description: `"${template.name}" is now the default for ${formatPurpose(template.purpose)}`,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      loadData();
    } catch (error) {
      console.error('Failed to set default:', error);
      toast({
        title: 'Error',
        description: 'Failed to set default template',
        variant: 'destructive'
      });
    }
  };

  const canEdit = (template) => {
    if (!currentUser) return false;
    if (currentUser.appRole === 'super_admin') return true;
    if (template.type === 'personal') return template.createdByUserId === currentUser.id;
    if (template.type === 'organization') return currentUser.appRole === 'organization_owner' || currentUser.isOrgOwner;
    return false;
  };

  const canDelete = (template) => {
    return canEdit(template);
  };

  const formatPurpose = (purpose) => {
    return purpose.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPurposeColor = (purpose) => {
    const colors = {
      'thank_you': 'bg-blue-100 text-blue-800',
      'referral_request': 'bg-purple-100 text-purple-800',
      'review_request': 'bg-green-100 text-green-800',
      'review_and_referral': 'bg-teal-100 text-teal-800',
      'birthday': 'bg-pink-100 text-pink-800',
      'anniversary': 'bg-rose-100 text-rose-800',
      'holiday': 'bg-red-100 text-red-800',
      'just_because': 'bg-yellow-100 text-yellow-800',
      'custom': 'bg-gray-100 text-gray-800'
    };
    return colors[purpose] || colors['custom'];
  };

  const getTypeLabel = (type) => {
    const labels = {
      'personal': 'Personal',
      'organization': 'Organization',
      'platform': 'Platform'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quick Send Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pre-configured card bundles for faster sending
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates by name or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="personal">My Templates</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Create your first Quick Send Template to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreate} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getPurposeColor(template.purpose)}>
                        {formatPurpose(template.purpose)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(template.type)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit(template) && (
                        <>
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!template.isDefault && template.type !== 'personal' && (
                            <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                              <Star className="w-4 h-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {canDelete(template) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(template)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {template.previewSnippet && (
                  <CardDescription className="line-clamp-2 mt-2">
                    {template.previewSnippet}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  {template.usageCount > 0 && (
                    <div>Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}</div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {template.includeGreeting && (
                      <Badge variant="secondary" className="text-xs">Greeting</Badge>
                    )}
                    {template.includeSignature && (
                      <Badge variant="secondary" className="text-xs">Signature</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {template.returnAddressMode === 'company' ? 'Company Address' : 
                       template.returnAddressMode === 'rep' ? 'Rep Address' : 'No Address'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}