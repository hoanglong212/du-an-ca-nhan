import { request } from "./http.js";

export async function fetchCategories() {
  return request("/api/categories");
}

export async function fetchAdminProperties() {
  return request("/api/admin/properties", { auth: true });
}

export async function fetchAdminPropertyById(id) {
  return request(`/api/admin/properties/${id}`, { auth: true });
}

export async function createAdminProperty(payload) {
  return request("/api/admin/properties", {
    method: "POST",
    body: payload,
    auth: true,
  });
}

export async function updateAdminProperty(id, payload) {
  return request(`/api/admin/properties/${id}`, {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

export async function deleteAdminProperty(id) {
  return request(`/api/admin/properties/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function addPropertyImages(propertyId, images) {
  return request(`/api/admin/properties/${propertyId}/images`, {
    method: "POST",
    body: { images },
    auth: true,
  });
}

export async function deletePropertyImage(imageId) {
  return request(`/api/admin/images/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function setPropertyCoverImage(imageId) {
  return request(`/api/admin/images/${imageId}/cover`, {
    method: "PUT",
    auth: true,
  });
}

export async function fetchAdminContacts() {
  return request("/api/admin/contacts", { auth: true });
}

export async function updateAdminContactStatus(id, status) {
  return request(`/api/admin/contacts/${id}/status`, {
    method: "PUT",
    body: { status },
    auth: true,
  });
}
