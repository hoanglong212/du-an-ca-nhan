import { ADMIN_TOKEN_KEY, request } from "./http.js";

const ADMIN_USER_KEY = "hl_admin_user";

export async function loginAdmin(email, password) {
  const payload = await request("/api/admin/auth/login", {
    method: "POST",
    body: { email, password },
  });

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
