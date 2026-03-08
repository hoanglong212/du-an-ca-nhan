const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const ADMIN_TOKEN_KEY = "hl_admin_token";

function toQueryString(query = {}) {
  const search = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

async function parseJson(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload;
}

export async function request(path, { method = "GET", query, body, headers, auth = false, signal } = {}) {
  const token = auth ? localStorage.getItem(ADMIN_TOKEN_KEY) || "" : "";

  const response = await fetch(`${API_BASE_URL}${path}${toQueryString(query)}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  return parseJson(response);
}

export { API_BASE_URL, ADMIN_TOKEN_KEY };
