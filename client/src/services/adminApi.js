const API_BASE_URL = "http://localhost:5000";

function getAdminHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("hl_admin_token") || "";
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Yêu cầu thất bại.");
  }
  return payload;
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  return readJson(response);
}

export async function fetchAdminProperties() {
  const response = await fetch(`${API_BASE_URL}/api/admin/properties`, {
    headers: getAdminHeaders(),
  });
  return readJson(response);
}

export async function fetchAdminPropertyById(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/properties/${id}`, {
    headers: getAdminHeaders(),
  });
  return readJson(response);
}

export async function createAdminProperty(payload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/properties`, {
    method: "POST",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return readJson(response);
}

export async function updateAdminProperty(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/admin/properties/${id}`, {
    method: "PUT",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return readJson(response);
}

export async function deleteAdminProperty(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/properties/${id}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });
  return readJson(response);
}

export async function addPropertyImages(propertyId, images) {
  const response = await fetch(`${API_BASE_URL}/api/admin/properties/${propertyId}/images`, {
    method: "POST",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ images }),
  });
  return readJson(response);
}

export async function deletePropertyImage(imageId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/images/${imageId}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });
  return readJson(response);
}

export async function setPropertyCoverImage(imageId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/images/${imageId}/cover`, {
    method: "PUT",
    headers: getAdminHeaders(),
  });
  return readJson(response);
}

export async function fetchAdminContacts() {
  const response = await fetch(`${API_BASE_URL}/api/admin/contacts`, {
    headers: getAdminHeaders(),
  });
  return readJson(response);
}

export async function updateAdminContactStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/api/admin/contacts/${id}/status`, {
    method: "PUT",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  return readJson(response);
}
