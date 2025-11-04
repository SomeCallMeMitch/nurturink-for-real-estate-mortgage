
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, ArrowRight, Users } from "lucide-react";
import WorkflowSteps from "@/components/mailing/WorkflowSteps";

export default function FindClients() {
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await base44.auth.me();
      
      // Fetch all clients for user's organization
      const clientList = await base44.entities.Client.filter({
        orgId: user.orgId
      }, '-created_date');
      
      setClients(clientList);
    } catch (err) {
      console.error('Failed to load clients:', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return clients;
    }
    
    const query = searchQuery.toLowerCase();
    
    return clients.filter(client => {
      const fullName = (client.fullName || '').toLowerCase();
      const company = (client.company || '').toLowerCase();
      
      return fullName.includes(query) || company.includes(query);
    });
  }, [clients, searchQuery]);

  // Handle individual checkbox toggle
  const handleToggleClient = (clientId) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedClientIds(filteredClients.map(c => c.id));
    } else {
      setSelectedClientIds([]);
    }
  };

  // Check if all filtered clients are selected
  const allSelected = filteredClients.length > 0 && 
    filteredClients.every(client => selectedClientIds.includes(client.id));

  // Handle continue button
  const handleContinue = async () => {
    try {
      setInitializing(true);
      setError(null);
      
      // Call backend function to initialize mailing batch
      const response = await base44.functions.invoke('initializeMailingBatch', {
        clientIds: selectedClientIds
      });
      
      const { mailingBatchId } = response.data;
      
      // Navigate to content creation page - UPDATED TO USE CreateContent
      navigate(createPageUrl(`CreateContent?mailingBatchId=${mailingBatchId}`));
      
    } catch (err) {
      console.error('Failed to initialize mailing batch:', err);
      setError(err.response?.data?.error || 'Failed to start workflow. Please try again.');
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Workflow Steps Header */}
      <WorkflowSteps currentStep={1} creditsLeft={0} />
      
      <div className="max-w-5xl mx-auto p-6">
        {/* The original Header content below was removed as WorkflowSteps replaces it */}
        {/* <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Send a Card</span>
            <span>•</span>
            <span className="text-indigo-600 font-medium">Step 1 of 4</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Recipients</h1>
          <p className="text-gray-600">
            Choose the clients you want to send a notecard to. You can select one or multiple recipients.
          </p>
        </div> */}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
              </CardTitle>
              
              {/* Select All Checkbox */}
              {filteredClients.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All
                  </label>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? 'No clients match your search' : 'No clients found'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => {
                  const isSelected = selectedClientIds.includes(client.id);
                  
                  return (
                    <div
                      key={client.id}
                      onClick={() => handleToggleClient(client.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleClient(client.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {client.fullName || 'Unnamed Client'}
                        </h3>
                        {client.company && (
                          <p className="text-sm text-gray-500">{client.company}</p>
                        )}
                      </div>
                      
                      {client.city && client.state && (
                        <div className="text-sm text-gray-400">
                          {client.city}, {client.state}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-gray-900">{selectedClientIds.length}</span>
            <span className="text-gray-600">
              {' '}{selectedClientIds.length === 1 ? 'client' : 'clients'} selected
            </span>
          </div>
          
          <Button
            onClick={handleContinue}
            disabled={selectedClientIds.length === 0 || initializing}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {initializing ? 'Initializing...' : 'Continue to Content'}
            {!initializing && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
