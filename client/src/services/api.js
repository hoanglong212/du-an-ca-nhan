const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function readJsonResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed");
  }

  return payload;
}

export async function fetchProperties() {
  const response = await fetch(`${API_BASE_URL}/api/properties`);
  return readJsonResponse(response);
}

export async function fetchPropertyBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/api/properties/${slug}`);
  return readJsonResponse(response);
}

export async function submitContact(payload) {
  const response = await fetch(`${API_BASE_URL}/api/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readJsonResponse(response);
}
