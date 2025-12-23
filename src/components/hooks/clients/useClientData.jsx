import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Loads client-related data for the current user/org.
 * Keeps data-fetching concerns out of the page component.
 */
export function useClientData() {
  const [clients, setClients] = useState([]);
  const [favoriteClientIds, setFavoriteClientIds] = useState(new Set());
  const [availableTags, setAvailableTags] = useState([]);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Fetch org (for credit balance, etc.)
      if (currentUser?.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (Array.isArray(orgList) && orgList.length > 0) setOrganization(orgList[0]);
      } else {
        setOrganization(null);
      }

      const [clientList, favoritesList] = await Promise.all([
        base44.entities.Client.filter({ orgId: currentUser?.orgId }),
        base44.entities.FavoriteClient.filter({ userId: currentUser?.id }),
      ]);

      setClients(Array.isArray(clientList) ? clientList : []);

      const favIds = new Set((Array.isArray(favoritesList) ? favoritesList : []).map((f) => f?.clientId).filter(Boolean));
      setFavoriteClientIds(favIds);

      const tagsSet = new Set();
      (Array.isArray(clientList) ? clientList : []).forEach((client) => {
        if (Array.isArray(client?.tags)) client.tags.forEach((t) => t && tagsSet.add(t));
      });
      setAvailableTags(Array.from(tagsSet).sort());
    } catch (err) {
      console.error("Failed to load clients:", err);
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    clients,
    favoriteClientIds,
    availableTags,
    user,
    organization,
    loading,
    error,
    reload: load,
    setFavoriteClientIds,
  };
}