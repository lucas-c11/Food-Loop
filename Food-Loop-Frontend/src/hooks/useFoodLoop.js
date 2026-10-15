import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
export function useFoodLoop({ mode, restaurantId, pantryId }) {
  const [restaurantDonations, setRestaurantDonations] = useState([]);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [activeClaims, setActiveClaims] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    let active = true;
    const id = mode === "restaurant" ? restaurantId : pantryId;
    if (!id) { setRestaurantDonations([]); setAvailableDonations([]); setActiveClaims([]); return () => { active = false; }; }
    setLoadingDonations(true);
    const loads = mode === "restaurant"
      ? [api.listRestaurantDonations(id), Promise.resolve([]), Promise.resolve([])]
      : [Promise.resolve([]), api.listAvailableDonations(), api.listActiveClaims(id)];
    Promise.all(loads).then(([own, available, claims]) => {
      if (!active) return;
      setRestaurantDonations(own); setAvailableDonations(available); setActiveClaims(claims); setError("");
    }).catch((cause) => active && setError(cause.message)).finally(() => active && setLoadingDonations(false));
    return () => { active = false; };
  }, [mode, restaurantId, pantryId, refreshKey]);
  const perform = useCallback(async (id, operation) => {
    setBusyId(id || "new"); setError("");
    try { const result = await operation(); setRefreshKey((value) => value + 1); return result; }
    catch (cause) { setError(cause.message); throw cause; }
    finally { setBusyId(null); }
  }, []);
  const createDonation = useCallback((body) => perform("new", () => api.createDonation(body)), [perform]);
  const claimDonation = useCallback((id) => perform(id, () => api.claimDonation(id)), [perform]);
  const completeDonation = useCallback((id) => perform(id, () => api.completeDonation(id)), [perform]);
  const releaseDonation = useCallback((id) => perform(id, () => api.releaseDonation(id)), [perform]);
  const cancelDonation = useCallback((id) => perform(id, () => api.cancelDonation(id)), [perform]);
  return { restaurantDonations, availableDonations, activeClaims, loadingDonations, busyId, error, setError, createDonation, claimDonation, completeDonation, releaseDonation, cancelDonation };
}
