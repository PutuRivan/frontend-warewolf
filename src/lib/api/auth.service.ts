let accessToken: string | null = null;
let refreshToken: string | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// =========================
// TOKEN
// =========================

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export function setRefreshToken(token: string) {
  refreshToken = token;
}

export function getRefreshToken() {
  return refreshToken;
}

export function clearRefreshToken() {
  refreshToken = null;
}

// =========================
// REQUEST
// =========================

export async function request(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
  if (!refreshToken) {
    throw new Error("Refresh token tidak tersedia.");
  }

  const result = await request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken,
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
