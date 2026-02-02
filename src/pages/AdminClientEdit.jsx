import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Star, X, Tag, Upload, Calendar, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function AdminClientEdit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get client ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  const isNew = clientId === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Favorites state
  const [isFavorited, setIsFavorited] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  
  // Tags state
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    // Campaign automation date fields
    birthday: '',
    policy_start_date: '',
    renewal_date: ''
  });
  
  // Import metadata (read-only display for imported clients)
  const [importMetadata, setImportMetadata] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load all available tags from organization's clients
      const allClients = await base44.entities.Client.filter({ orgId: currentUser.orgId });
      const tagsSet = new Set();
      allClients.forEach(client => {
        if (client.tags && Array.isArray(client.tags)) {
          client.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      setAvailableTags(Array.from(tagsSet).sort());
      
      if (!isNew && clientId) {
        setLoading(true);
        
        // Load client and favorite status in parallel
        const [clients, favoritesList] = await Promise.all([
          base44.entities.Client.filter({ id: clientId }),
          base44.entities.FavoriteClient.filter({ userId: currentUser.id, clientId: clientId })
        ]);
        
        if (clients.length === 0) {
          setError('Client not found');
          return;
        }
        
        const client = clients[0];
        setFormData({
          firstName: client.firstName || '',
          lastName: client.lastName || '',
          company: client.company || '',
          email: client.email || '',
          phone: client.phone || '',
          street: client.street || '',
          address2: client.address2 || '',
          city: client.city || '',
          state: client.state || '',
          zipCode: client.zipCode || '',
          // Campaign automation date fields
          birthday: client.birthday || '',
          policy_start_date: client.policy_start_date || '',
          renewal_date: client.renewal_date || ''
        });
        
        // Set selected tags from client
        setSelectedTags(client.tags || []);
        
        // Set favorite status
        setIsFavorited(favoritesList.length > 0);
        
        // Set import metadata if client was imported
        if (client.source === 'file_upload' || client.source === 'csv_import') {
          setImportMetadata({
            source: client.source,
            uploadedAt: client.uploadedAt,
            importBatchId: client.importBatchId
          });
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleToggleFavorite = async () => {
    if (isNew) {
      toast({
        title: 'Save Client First',
        description: 'Please save the client before adding to favorites',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setTogglingFavorite(true);
      
      const response = await base44.functions.invoke('toggleFavoriteClient', {
        clientId: clientId
      });
      
      if (response.data.success) {
        setIsFavorited(response.data.isFavorited);
        toast({
          title: response.data.isFavorited ? 'Added to Favorites! ⭐' : 'Removed from Favorites',
          description: response.data.isFavorited 
            ? 'This client has been added to your favorites' 
            : 'This client has been removed from your favorites',
          className: response.data.isFavorited ? 'bg-green-50 border-green-200 text-green-900' : ''
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      toast({
        title: 'Failed to Update Favorite',
        description: err.response?.data?.error || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setTogglingFavorite(false);
    }
  };
  
  const handleAddTag = (tag) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    if (selectedTags.includes(trimmedTag)) {
      toast({
        title: 'Tag Already Added',
        description: 'This tag is already assigned to this client',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedTags(prev => [...prev, trimmedTag]);
    setCustomTagInput('');
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  const handleCustomTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(customTagInput);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First name and last name are required');
      return;
    }
    
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      alert('Address fields (street, city, state, ZIP) are required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const clientData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        orgId: user.orgId,
        ownerId: user.id,
        tags: selectedTags,
        // Only include date fields if they have values (avoid sending empty strings)
        birthday: formData.birthday || null,
        policy_start_date: formData.policy_start_date || null,
        renewal_date: formData.renewal_date || null
      };
      
      if (isNew) {
        await base44.entities.Client.create(clientData);
      } else {
        await base44.entities.Client.update(clientId, clientData);
      }
      
      navigate(createPageUrl('AdminClients'));
    } catch (err) {
      console.error('Failed to save client:', err);
      setError('Failed to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(createPageUrl('AdminClients'))}>
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('AdminClients'))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create Client' : 'Edit Client'}
            </h1>
            {!isNew && (
              <Button
                variant={isFavorited ? "default" : "outline"}
                onClick={handleToggleFavorite}
                disabled={togglingFavorite}
                className={`gap-2 ${isFavorited ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
              >
                {togglingFavorite ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                )}
                {isFavorited ? 'Favorited' : 'Add to Favorites'}
              </Button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="space-y-6">
            {/* Client Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="ABC Roofing Co"
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4">Mailing Address</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="street">
                        Street Address <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                        placeholder="123 Main Street"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input
                        id="address2"
                        value={formData.address2}
                        onChange={(e) => handleChange('address2', e.target.value)}
                        placeholder="Apt, Suite, Unit, etc."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="city">
                          City <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          placeholder="Denver"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">
                          State <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                          placeholder="CO"
                          maxLength={2}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-1/3">
                      <Label htmlFor="zipCode">
                        ZIP Code <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleChange('zipCode', e.target.value)}
                        placeholder="80202"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Automation Dates Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Campaign Automation Dates
                </CardTitle>
                <CardDescription>
                  These dates are used for automated card campaigns (birthday wishes, welcome cards, renewal reminders)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleChange('birthday', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">For birthday card campaigns</p>
                  </div>
                  <div>
                    <Label htmlFor="policy_start_date">Policy Start Date</Label>
                    <Input
                      id="policy_start_date"
                      type="date"
                      value={formData.policy_start_date}
                      onChange={(e) => handleChange('policy_start_date', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">For welcome card campaigns</p>
                  </div>
                  <div>
                    <Label htmlFor="renewal_date">Renewal Date</Label>
                    <Input
                      id="renewal_date"
                      type="date"
                      value={formData.renewal_date}
                      onChange={(e) => handleChange('renewal_date', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">For renewal reminder campaigns</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Import Metadata Card (only for imported clients) */}
            {importMetadata && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <FileSpreadsheet className="w-5 h-5" />
                    Import Information
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    This client was added via file import
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Source:</span>
                      <p className="text-blue-900 capitalize">{importMetadata.source?.replace('_', ' ') || 'File Upload'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Imported:</span>
                      <p className="text-blue-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {importMetadata.uploadedAt 
                          ? format(new Date(importMetadata.uploadedAt), 'MMM d, yyyy h:mm a')
                          : 'Unknown'}
                      </p>
                    </div>
                    {importMetadata.importBatchId && (
                      <div className="col-span-2">
                        <span className="text-blue-700 font-medium">Batch ID:</span>
                        <p className="text-blue-900 font-mono text-xs">{importMetadata.importBatchId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags & Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Selected Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="default"
                          className="bg-indigo-600 hover:bg-indigo-700 gap-2 pr-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:bg-indigo-800 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Available Tags */}
                {availableTags.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Available Tags (click to add)</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter(tag => !selectedTags.includes(tag))
                        .map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleAddTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Custom Tag Input */}
                <div>
                  <Label htmlFor="customTag">Add Custom Tag</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="customTag"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyPress={handleCustomTagKeyPress}
                      placeholder="Type tag name and press Enter"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddTag(customTagInput)}
                      disabled={!customTagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Press Enter or click Add to create a new tag
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(createPageUrl('AdminClients'))}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}