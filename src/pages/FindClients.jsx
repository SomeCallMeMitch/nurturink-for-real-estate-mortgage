import React from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";

import WorkflowSteps from "@/components/mailing/WorkflowSteps";
import ClientImportModal from "@/components/client/ClientImportModal";
import ClientCreateModal from "@/components/client/ClientCreateModal";
import QuickSendPickerModal from "@/components/quicksend/QuickSendPickerModal";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import FindClientsFilters from "@/components/clients/find/FindClientsFilters";
import ClientsTable from "@/components/clients/find/ClientsTable";
import SelectedClientsBar from "@/components/clients/find/SelectedClientsBar";

import { useClientData } from "@/components/hooks/clients/useClientData";
import { useFindClientsUI } from "@/components/hooks/clients/useFindClientsUI";

export default function FindClients() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    clients,
    favoriteClientIds,
    availableTags,
    user,
    organization,
    loading,
    error,
    reload,
    setFavoriteClientIds,
  } = useClientData();

  const totalAvailableCredits =
    (organization?.creditBalance || 0) +
    (organization?.monthlySubscriptionCredits || 0);

  const ui = useFindClientsUI({
    clients,
    favoriteClientIds,
    availableTags,
    navigate,
    toast,
    setFavoriteClientIds,
  });

  const onRowClick = (client) => {
    const id = client?.id;
    if (!id) return;
    ui.toggleClient(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
      <WorkflowSteps
        currentStep={1}
        creditsLeft={totalAvailableCredits}
        pageTitle="Find Clients"
        onBackClick={() => navigate(createPageUrl("Home"))}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{error}</p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FindClientsFilters
              searchQuery={ui.searchQuery}
              onSearchChange={ui.setSearchQuery}
              showFavoritesOnly={ui.showFavoritesOnly}
              onToggleFavoritesOnly={() => ui.setShowFavoritesOnly((v) => !v)}
              availableTags={ui.availableTags}
              selectedTags={ui.selectedTags}
              onToggleTag={ui.toggleTag}
              uploadedFilter={ui.uploadedFilter}
              onUploadedFilterChange={ui.setUploadedFilter}
              hasActiveFilters={ui.hasActiveFilters}
              activeFiltersBadges={ui.activeFiltersBadges}
              onClearFilters={ui.clearFilters}
              onOpenAddClient={() => ui.setShowAddClientModal(true)}
              onOpenImport={() => ui.setShowImportModal(true)}
              onRefresh={reload}
            />

            <div className="border rounded-lg bg-white overflow-hidden">
              <ClientsTable
                clients={ui.processedClients}
                favoriteClientIds={favoriteClientIds}
                sortColumn={ui.sortColumn}
                sortDirection={ui.sortDirection}
                onSort={ui.handleSort}
                onToggleFavorite={ui.toggleFavorite}
                selectedClientIds={ui.selectedClientIds}
                onToggleClient={ui.toggleClient}
                onToggleAllVisible={ui.toggleAllVisible}
                onRowClick={onRowClick}
              />
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      <SelectedClientsBar
        totalSelected={ui.totalSelected}
        initializing={ui.initializing}
        onClearSelection={ui.clearSelection}
        onStartWorkflow={() => ui.startWorkflow()}
      />

      {/* Modals */}
      <ClientImportModal
        open={ui.showImportModal}
        onOpenChange={ui.setShowImportModal}
        onImportComplete={reload}
      />
      <ClientCreateModal
        open={ui.showAddClientModal}
        onOpenChange={ui.setShowAddClientModal}
        onClientAdded={reload}
      />
      <QuickSendPickerModal
        open={ui.showQuickSendModal}
        onOpenChange={ui.setShowQuickSendModal}
        onTemplateSelected={(template) => ui.startWorkflow({ quickSendTemplateId: template?.id })}
      />
    </div>
  );
}