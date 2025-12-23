import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

/**
 * Encapsulates FindClients UI state:
 * - filters/sort
 * - selection
 * - modal visibility
 * - workflow actions
 */
export function useFindClientsUI({ clients, favoriteClientIds, availableTags, navigate, toast, setFavoriteClientIds }) {
  // Filters + sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("no_notes_first");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadedFilter, setUploadedFilter] = useState("all");

  // Selection
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [initializing, setInitializing] = useState(false);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showQuickSendModal, setShowQuickSendModal] = useState(false);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    showFavoritesOnly ||
    (Array.isArray(selectedTags) && selectedTags.length > 0) ||
    uploadedFilter !== "all" ||
    sortColumn !== "no_notes_first";

  const processedClients = useMemo(() => {
    let result = Array.isArray(clients) ? [...clients] : [];

    // favorites filter
    if (showFavoritesOnly) {
      result = result.filter((c) => favoriteClientIds?.has?.(c?.id));
    }

    // search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((client) => {
        const fullName = `${client?.firstName || ""} ${client?.lastName || ""}`.trim().toLowerCase();
        const company = (client?.company || "").toLowerCase();
        const email = (client?.email || "").toLowerCase();
        const city = (client?.city || "").toLowerCase();
        const state = (client?.state || "").toLowerCase();
        return (
          fullName.includes(q) ||
          company.includes(q) ||
          email.includes(q) ||
          city.includes(q) ||
          state.includes(q)
        );
      });
    }

    // tags filter
    if (Array.isArray(selectedTags) && selectedTags.length > 0) {
      result = result.filter((client) => {
        if (!Array.isArray(client?.tags)) return false;
        return selectedTags.some((tag) => client.tags.includes(tag));
      });
    }

    // uploaded/date filter
    if (uploadedFilter !== "all") {
      const now = new Date();
      result = result.filter((client) => {
        if (uploadedFilter === "manual") return client?.source === "manual" || !client?.source;
        if (uploadedFilter === "imported") return client?.source === "imported";
        const addedDate = client?.created_date ? new Date(client.created_date) : null;
        if (!addedDate) return false;
        const daysDiff = (now - addedDate) / (1000 * 60 * 60 * 24);
        if (uploadedFilter === "today") return daysDiff < 1;
        if (uploadedFilter === "7days") return daysDiff <= 7;
        if (uploadedFilter === "30days") return daysDiff <= 30;
        return true;
      });
    }

    // sort
    const dir = sortDirection === "asc" ? 1 : -1;

    if (sortColumn === "no_notes_first") {
      result.sort((a, b) => {
        const aHas = Boolean(a?.lastNoteSentDate);
        const bHas = Boolean(b?.lastNoteSentDate);
        if (aHas !== bHas) return aHas ? 1 : -1;
        const aLast = (a?.lastName || "").toLowerCase();
        const bLast = (b?.lastName || "").toLowerCase();
        if (aLast !== bLast) return aLast.localeCompare(bLast);
        return (a?.firstName || "").localeCompare(b?.firstName || "");
      });
      return result;
    }

    result.sort((a, b) => {
      const aVal = a?.[sortColumn];
      const bVal = b?.[sortColumn];

      if (sortColumn === "favorite") {
        const aFav = favoriteClientIds?.has?.(a?.id) ? 1 : 0;
        const bFav = favoriteClientIds?.has?.(b?.id) ? 1 : 0;
        return (bFav - aFav) * dir;
      }

      if (sortColumn === "fullName") {
        const aLast = (a?.lastName || "").toLowerCase();
        const bLast = (b?.lastName || "").toLowerCase();
        if (aLast !== bLast) return aLast.localeCompare(bLast) * dir;
        return ((a?.firstName || "").toLowerCase()).localeCompare((b?.firstName || "").toLowerCase()) * dir;
      }

      if (sortColumn === "lastNoteSentDate") {
        const aDate = aVal ? new Date(aVal) : new Date(0);
        const bDate = bVal ? new Date(bVal) : new Date(0);
        return (aDate - bDate) * dir;
      }

      if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
      return String(aVal || "").localeCompare(String(bVal || "")) * dir;
    });

    return result;
  }, [
    clients,
    favoriteClientIds,
    searchQuery,
    selectedTags,
    uploadedFilter,
    showFavoritesOnly,
    sortColumn,
    sortDirection,
  ]);

  const toggleTag = (tag) => {
    if (!tag) return;
    setSelectedTags((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      return p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag];
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setShowFavoritesOnly(false);
    setSelectedTags([]);
    setUploadedFilter("all");
    setSortColumn("no_notes_first");
    setSortDirection("asc");
  };

  const handleSort = (column) => {
    if (!column) return;
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumn(column);
    setSortDirection("asc");
  };

  const isSelected = (clientId) => selectedClientIds.includes(clientId);

  const toggleClient = (clientId) => {
    if (!clientId) return;
    setSelectedClientIds((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      return p.includes(clientId) ? p.filter((id) => id !== clientId) : [...p, clientId];
    });
  };

  const toggleAllVisible = () => {
    const visibleIds = processedClients.map((c) => c?.id).filter(Boolean);
    if (visibleIds.length === 0) return;
    setSelectedClientIds((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      const allSelected = visibleIds.every((id) => p.includes(id));
      return allSelected ? p.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...p, ...visibleIds]));
    });
  };

  const clearSelection = () => setSelectedClientIds([]);

  const startWorkflow = async ({ quickSendTemplateId } = {}) => {
    if (selectedClientIds.length === 0) return;
    try {
      setInitializing(true);

      const response = await base44.functions.invoke("initializeMailingBatch", {
        clientIds: selectedClientIds,
        ...(quickSendTemplateId ? { quickSendTemplateId } : {}),
      });

      const mailingBatchId = response?.data?.mailingBatchId;
      if (!mailingBatchId) throw new Error("Missing mailingBatchId");

      const url = quickSendTemplateId
        ? createPageUrl(`CreateContent?mailingBatchId=${mailingBatchId}&quickSend=true`)
        : createPageUrl(`CreateContent?mailingBatchId=${mailingBatchId}`);

      navigate(url);
    } catch (err) {
      console.error("Failed to initialize mailing batch:", err);
      toast?.({
        title: "Failed to start workflow",
        description: err?.response?.data?.error || err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const toggleFavorite = async (clientId, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (!clientId) return;

    try {
      const response = await base44.functions.invoke("toggleFavoriteClient", { clientId });
      if (response?.data?.success) {
        setFavoriteClientIds?.((prev) => {
          const next = new Set(prev);
          if (response?.data?.isFavorited) next.add(clientId);
          else next.delete(clientId);
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      toast?.({
        title: "Failed to Update Favorite",
        description: err?.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const totalSelected = selectedClientIds.length;

  const activeFiltersBadges = {
    searchQuery,
    showFavoritesOnly,
    selectedTagsCount: Array.isArray(selectedTags) ? selectedTags.length : 0,
    sortColumn,
    uploadedFilter,
  };

  return {
    // Filters
    searchQuery,
    setSearchQuery,
    showFavoritesOnly,
    setShowFavoritesOnly,
    selectedTags,
    setSelectedTags,
    toggleTag,
    uploadedFilter,
    setUploadedFilter,

    // Sort
    sortColumn,
    sortDirection,
    handleSort,

    // Derived
    processedClients,
    hasActiveFilters,
    activeFiltersBadges,
    availableTags: Array.isArray(availableTags) ? availableTags : [],

    // Selection
    selectedClientIds,
    totalSelected,
    isSelected,
    toggleClient,
    toggleAllVisible,
    clearSelection,

    // Modals
    showImportModal,
    setShowImportModal,
    showAddClientModal,
    setShowAddClientModal,
    showQuickSendModal,
    setShowQuickSendModal,

    // Actions
    initializing,
    startWorkflow,
    toggleFavorite,
    clearFilters,
  };
}