import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, X, Tag, Plus } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";

export default function ClientCreateModal({ open, onOpenChange, onClientCreated, availableTagsFromParent = [] }) {
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  // Tags state - use tags passed from parent (extracted from clients, same as FindClients page)
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Form state
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
    zipCode: ''
  });

  // Load user and tags when modal opens
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Use tags passed from parent if available (same source as FindClients page)
      // These are extracted from existing clients' tags arrays
      if (availableTagsFromParent && availableTagsFromParent.length > 0) {
        setAvailableTags(availableTagsFromParent);
      } else {
        // Fallback: extract tags from all clients (same approach as FindClients)
        try {
          const clients = await base44.entities.Client.filter({ orgId: currentUser.orgId });
          const tagsSet = new Set();
          clients.forEach(client => {
            if (client.tags && Array.isArray(client.tags)) {
              client.tags.forEach(tag => tagsSet.add(tag));
            }
          });
          setAvailableTags(Array.from(tagsSet).sort());
        } catch (err) {
          console.error('Failed to load tags from clients:', err);
          setAvailableTags([]);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // Reset form when modal closes
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      street: '',
      address2: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setSelectedTags([]);
    setCustomTagInput('');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tagName) => {
    const trimmedTag = tagName.trim();
    if (!trimmedTag) return;
    
    if (selectedTags.includes(trimmedTag)) {
      toast({
        title: 'Tag Already Added',
        description: 'This tag is already assigned',
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

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'First name and last name are required',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'Address fields (street, city, state, ZIP) are required',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const createClient = async () => {
    const clientData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      orgId: user.orgId,
      ownerId: user.id,
      tags: selectedTags,
      source: 'manual'
    };
    
    const newClient = await base44.entities.Client.create(clientData);
    
    toast({
      title: 'Client Created',
      description: `${clientData.fullName} has been added successfully`,
      className: 'bg-green-50 border-green-200 text-green-900'
    });
    
    return newClient;
  };

  // Save client and close modal
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const newClient = await createClient();
      onClientCreated?.(newClient);
      handleOpenChange(false);
    } catch (err) {
      console.error('Failed to save client:', err);
      toast({
        title: 'Failed to Create Client',
        description: err.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Client
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
          {/* Two-column layout: Form on left, Tags on right */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Client Information (2/3 width) */}
            <div className="col-span-2 space-y-4">
              {/* Personal Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-sm">
                    First Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Smith"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <Label htmlFor="company" className="text-sm">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="ABC Roofing Co"
                  className="mt-1"
                />
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-3 border-t">
                <h3 className="font-medium text-gray-900 mb-3 text-sm">Mailing Address</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="street" className="text-sm">
                      Street Address <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleChange('street', e.target.value)}
                      placeholder="123 Main Street"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address2" className="text-sm">Address Line 2</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => handleChange('address2', e.target.value)}
                      placeholder="Apt, Suite, Unit, etc."
                      className="mt-1"
                    />
                  </div>

                  {/* City, State, ZIP Row */}
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-3">
                      <Label htmlFor="city" className="text-sm">
                        City <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Denver"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="state" className="text-sm">
                        State <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                        placeholder="CO"
                        maxLength={2}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="zipCode" className="text-sm">
                        ZIP <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleChange('zipCode', e.target.value)}
                        placeholder="80202"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Tags Section (1/3 width) */}
            <div className="col-span-1 space-y-4 border-l pl-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900 text-sm">Tags</h3>
              </div>

              {/* Selected Tags Display - styled like FindClients page */}
              {selectedTags.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">Selected</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-xs bg-amber-50 text-amber-700 border-amber-200 gap-1 pr-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-amber-100 rounded-full p-0.5 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Dropdown - Add Existing Tag */}
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Add Existing Tag</Label>
                <Select
                  value=""
                  onValueChange={(tagName) => {
                    if (tagName && tagName !== "_none") handleAddTag(tagName);
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select a tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.length === 0 ? (
                      <SelectItem value="_none" disabled>No tags available</SelectItem>
                    ) : (
                      availableTags
                        .filter(tag => !selectedTags.includes(tag))
                        .map((tag, index) => (
                          <SelectItem key={`tag-${index}-${tag}`} value={tag}>
                            {tag}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Tag Input */}
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Create New Tag</Label>
                <div className="flex gap-1.5">
                  <Input
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyPress={handleCustomTagKeyPress}
                    placeholder="Tag name"
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(customTagInput)}
                    disabled={!customTagInput.trim()}
                    className="h-9 px-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Footer */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>

        </DialogContent>
    </Dialog>
  );
}