import { ArrowLeft, ArrowRight, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { fetchProperties } from "../services/api.js";

const DEFAULT_FILTERS = {
  q: "",
  location: "",
  city: "",
  district: "",
  type: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  bedrooms: "",
  bathrooms: "",
  sort: "newest",
};

function PropertiesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const currentPage = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const page = Number(params.get("page") || 1);
    return Number.isNaN(page) || page < 1 ? 1 : page;
  }, [location.search]);

  useEffect(() => {
    const nextFilters = readFiltersFromUrl(location.search);
    setFilters(nextFilters);
  }, [location.search]);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        setError("");

        const query = {
          ...readFiltersFromUrl(location.search),
          page: currentPage,
          limit: 12,
        };

        const payload = await fetchProperties(query);
        setItems(payload?.items || []);
        setPagination(payload?.pagination || {});
      } catch (fetchError) {
        setError(fetchError.message || "Khong the tai danh sach bat dong san.");
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [location.search, currentPage]);

  function applyFilters() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "") {
        params.set(key, value);
      }
    });
    params.set("page", "1");
    navigate(`/properties?${params.toString()}`);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    navigate("/properties");
  }

  function goToPage(page) {
    const target = Math.max(1, page);
    const params = new URLSearchParams(location.search);
    params.set("page", String(target));
    navigate(`/properties?${params.toString()}`);
  }

  const activeFilterChips = useMemo(() => buildActiveFilterChips(filters), [filters]);

  return (
    <>
      <RevealSection className="border-b border-slate-200 bg-white py-14">
        <div className="container-shell">
          <h1 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-5xl">Danh sach bat dong san</h1>
          <p className="mt-3 text-base text-slate-600">
            {pagination.total || 0} san pham tim thay | Trang {pagination.page || 1}
            {pagination.totalPages ? `/${pagination.totalPages}` : ""}
          </p>
          {activeFilterChips.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {chip.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </RevealSection>

      <RevealSection className="container-shell py-12">
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <aside className="surface-card rounded-3xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[var(--brand-navy-900)]">
              <SlidersHorizontal size={22} className="text-[var(--brand-gold-600)]" />
              Bo loc tim kiem
            </h2>

            <FilterField label="Tu khoa">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-300 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Can ho, nha pho..."
                  value={filters.q}
                  onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
                />
              </div>
            </FilterField>

            <FilterField label="Loai hinh">
              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={filters.type}
                onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="">Tat ca</option>
                <option value="sale">Mua ban</option>
                <option value="rent">Cho thue</option>
              </select>
            </FilterField>

            <FilterField label="Trang thai">
              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="">Tat ca</option>
                <option value="available">Dang mo ban</option>
                <option value="rented">Da cho thue</option>
                <option value="sold">Da ban</option>
              </select>
            </FilterField>

            <FilterField label="Vi tri tong quan">
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                placeholder="Quan/huyen/thanh pho"
                value={filters.location}
                onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
              />
            </FilterField>

            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Thanh pho">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="VD: HCM"
                  value={filters.city}
                  onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))}
                />
              </FilterField>
              <FilterField label="Quan/Huyen">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="VD: Go Vap"
                  value={filters.district}
                  onChange={(event) => setFilters((prev) => ({ ...prev, district: event.target.value }))}
                />
              </FilterField>
            </div>

            <FilterField label="Khoang gia (VND)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Tu"
                  type="number"
                  value={filters.minPrice}
                  onChange={(event) => setFilters((prev) => ({ ...prev, minPrice: event.target.value }))}
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Den"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))}
                />
              </div>
            </FilterField>

            <FilterField label="Dien tich (m2)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Tu"
                  type="number"
                  value={filters.minArea}
                  onChange={(event) => setFilters((prev) => ({ ...prev, minArea: event.target.value }))}
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Den"
                  type="number"
                  value={filters.maxArea}
                  onChange={(event) => setFilters((prev) => ({ ...prev, maxArea: event.target.value }))}
                />
              </div>
            </FilterField>

            <div className="grid grid-cols-2 gap-3">
              <FilterField label="Phong ngu >= ">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="0"
                  type="number"
                  value={filters.bedrooms}
                  onChange={(event) => setFilters((prev) => ({ ...prev, bedrooms: event.target.value }))}
                />
              </FilterField>
              <FilterField label="Phong tam >= ">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  placeholder="0"
                  type="number"
                  value={filters.bathrooms}
                  onChange={(event) => setFilters((prev) => ({ ...prev, bathrooms: event.target.value }))}
                />
              </FilterField>
            </div>

            <FilterField label="Sap xep">
              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={filters.sort}
                onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
              >
                <option value="newest">Moi nhat</option>
                <option value="oldest">Cu nhat</option>
                <option value="price_desc">Gia cao den thap</option>
                <option value="price_asc">Gia thap den cao</option>
                <option value="area_desc">Dien tich lon den nho</option>
                <option value="area_asc">Dien tich nho den lon</option>
              </select>
            </FilterField>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="rounded-2xl bg-[var(--brand-navy-900)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-navy-800)]"
                type="button"
                onClick={applyFilters}
              >
                Ap dung
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={resetFilters}
              >
                <RotateCcw size={16} />
                Dat lai
              </button>
            </div>
          </aside>

          <div>
            {loading ? <p className="surface-card rounded-2xl p-6">Dang tai du lieu...</p> : null}
            {!loading && error ? <p className="rounded-2xl bg-red-50 p-6 text-red-600 shadow-soft">{error}</p> : null}
            {!loading && !error && items.length === 0 ? (
              <p className="surface-card rounded-2xl p-6">Khong tim thay san pham phu hop.</p>
            ) : null}

            {!loading && !error && items.length > 0 ? (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  {items.map((property, index) => (
                    <RevealSection key={property.id} delayMs={Math.min(index * 45, 260)}>
                      <PropertyCard property={property} />
                    </RevealSection>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-600">
                    Hien thi trang {pagination.page || 1}
                    {pagination.totalPages ? ` / ${pagination.totalPages}` : ""} - Tong {pagination.total || 0} ket qua
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      disabled={!pagination.hasPrev}
                      onClick={() => goToPage((pagination.page || 1) - 1)}
                    >
                      <ArrowLeft size={16} />
                      Truoc
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      disabled={!pagination.hasNext}
                      onClick={() => goToPage((pagination.page || 1) + 1)}
                    >
                      Sau
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </RevealSection>
    </>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="mb-4 block text-xs font-semibold uppercase tracking-wide text-slate-600">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function readFiltersFromUrl(search) {
  const params = new URLSearchParams(search);
  return {
    q: params.get("q") || "",
    location: params.get("location") || "",
    city: params.get("city") || "",
    district: params.get("district") || "",
    type: params.get("type") || "",
    status: params.get("status") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    minArea: params.get("minArea") || "",
    maxArea: params.get("maxArea") || "",
    bedrooms: params.get("bedrooms") || "",
    bathrooms: params.get("bathrooms") || "",
    sort: params.get("sort") || "newest",
  };
}

function buildActiveFilterChips(filters) {
  const chips = [];
  if (filters.q) chips.push({ label: `Tu khoa: ${filters.q}` });
  if (filters.location) chips.push({ label: `Vi tri: ${filters.location}` });
  if (filters.type) chips.push({ label: `Loai: ${filters.type === "rent" ? "Cho thue" : "Mua ban"}` });
  if (filters.status) chips.push({ label: `Trang thai: ${filters.status}` });
  if (filters.minPrice) chips.push({ label: `Gia tu: ${Number(filters.minPrice).toLocaleString("vi-VN")}` });
  if (filters.maxPrice) chips.push({ label: `Gia den: ${Number(filters.maxPrice).toLocaleString("vi-VN")}` });
  if (filters.minArea) chips.push({ label: `Dien tich tu: ${filters.minArea} m2` });
  if (filters.maxArea) chips.push({ label: `Dien tich den: ${filters.maxArea} m2` });
  if (filters.bedrooms) chips.push({ label: `Phong ngu >= ${filters.bedrooms}` });
  if (filters.bathrooms) chips.push({ label: `Phong tam >= ${filters.bathrooms}` });
  return chips;
}

export default PropertiesPage;
