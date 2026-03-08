import { request } from "./http.js";

export async function fetchProperties(query = {}) {
  return request("/api/properties", { query });
}

export async function fetchMarketOverview() {
  return request("/api/properties/overview");
}

export async function fetchPropertyBySlug(slug) {
  return request(`/api/properties/${slug}`);
}

export async function fetchRelatedProperties(slug, query = {}) {
  return request(`/api/properties/${slug}/related`, { query });
}

export async function submitContact(payload) {
  return request("/api/contacts", {
    method: "POST",
    body: payload,
  });
}
