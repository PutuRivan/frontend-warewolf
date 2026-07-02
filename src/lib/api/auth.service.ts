let accessToken: string | null = null;
let refreshToken: string | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// =========================
// TOKEN
// =========================

export function setAccessToken(token: string) {
  accessToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
}

export function getAccessToken() {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem("access_token");
  }
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}

export function setRefreshToken(token: string) {
  refreshToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("refresh_token", token);
  }
}

export function getRefreshToken() {
  if (!refreshToken && typeof window !== "undefined") {
    refreshToken = localStorage.getItem("refresh_token");
  }
  return refreshToken;
}

export function clearRefreshToken() {
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("refresh_token");
  }
}

// =========================
// REQUEST
// =========================

export async function request(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Token Expiry & Auto-Refresh
  if (
    response.status === 401 &&
    endpoint !== "/auth/signin" &&
    endpoint !== "/auth/signup" &&
    endpoint !== "/auth/refresh"
  ) {
    console.log("Access token expired (401), attempting token refresh...");
    try {
      const newAccessToken = await refresh();
      if (newAccessToken) {
        headers.Authorization = `Bearer ${newAccessToken}`;
        // Retry the original request
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    } catch (refreshErr) {
      console.error("Token refresh failed, logging out:", refreshErr);
      clearAccessToken();
      clearRefreshToken();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}

// =========================
// LOGIN
// =========================

export async function login(data: {
  email: string;
  password: string;
}) {
  const result = await request("/auth/signin", {
    method: "POST",
    body: JSON.stringify(data),
  });

  setAccessToken(result.accessToken);
  setRefreshToken(result.refreshToken);

  return result;
}

// =========================
// REGISTER
// =========================

export async function register(data: {
  username: string;
  email: string;
  password: string;
}) {
  const result = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

  setAccessToken(result.accessToken);
  setRefreshToken(result.refreshToken);

  return result;
}

// =========================
// GET ME
// =========================

export async function getMe() {
  return request("/auth/me");
}

// =========================
// REFRESH
// =========================

export async function refresh() {
  const token = getRefreshToken();
  if (!token) {
    throw new Error("Refresh token tidak tersedia.");
  }

  const result = await request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken: token,
    }),
  });

  setAccessToken(result.accessToken);

  return result.accessToken;
}

// =========================
// LOGOUT
// =========================

export async function logout() {
  clearAccessToken();
  clearRefreshToken();
}
