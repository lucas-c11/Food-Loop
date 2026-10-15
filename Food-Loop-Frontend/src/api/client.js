const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "foodloop.token";
export const getAuthToken = () => { try { return sessionStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; } };
export const setAuthToken = (token) => { try { token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY); } catch {} };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("Could not reach FoodLoop. Check that the backend is running.", 0);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && getAuthToken()) {
      setAuthToken("");
      window.dispatchEvent(new Event("foodloop:unauthorized"));
    }
    const message = typeof payload === "object" && payload?.message
      ? payload.message
      : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  listRestaurants: () => request("/restaurants"),
  listPantries: () => request("/pantries"),
  listRestaurantDonations: (id) => request(`/donations/restaurant/${id}`),
  listAvailableDonations: () => request("/donations/available"),
  listActiveClaims: (id) => request(`/donations/pantry/${id}/active`),
  createDonation: (body) => request("/donations", { method: "POST", body: JSON.stringify(body) }),
  claimDonation: (id) => request(`/donations/${id}/claim`, { method: "PATCH" }),
  completeDonation: (id) => request(`/donations/${id}/complete`, { method: "PATCH" }),
  releaseDonation: (id) => request(`/donations/${id}/release`, { method: "PATCH" }),
  cancelDonation: (id) => request(`/donations/${id}/cancel`, { method: "PATCH" }),
};
