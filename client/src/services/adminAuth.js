const ADMIN_TOKEN_KEY = "hl_admin_token";
const ADMIN_USER_KEY = "hl_admin_user";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function loginAdmin(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Đăng nhập thất bại.");
  }

  saveAdminSession(payload.token, payload.user);
  return payload;
}

export function saveAdminSession(token, user) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user || null));
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}
