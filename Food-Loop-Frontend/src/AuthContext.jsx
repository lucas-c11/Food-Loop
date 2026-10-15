import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getAuthToken, setAuthToken } from "./api/client";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAuthToken()));
  const [error, setError] = useState("");
  const accept = useCallback((result) => { setAuthToken(result.token); setUser(result.user); setError(""); }, []);
  const login = useCallback(async (body) => accept(await api.login(body)), [accept]);
  const register = useCallback(async (body) => accept(await api.register(body)), [accept]);
  const logout = useCallback(() => { setAuthToken(""); setUser(null); setError(""); }, []);
  useEffect(() => {
    const onUnauthorized = () => { setUser(null); setLoading(false); setError("Your session expired. Please sign in again."); };
    window.addEventListener("foodloop:unauthorized", onUnauthorized);
    return () => window.removeEventListener("foodloop:unauthorized", onUnauthorized);
  }, []);
  useEffect(() => {
    if (!getAuthToken()) return;
    let active = true;
    api.me().then((result) => { if (active) setUser(result.user); })
      .catch((cause) => { if (active) { setAuthToken(""); setError(cause.message); } })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({ user, loading, error, setError, login, register, logout }), [user, loading, error, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; }
