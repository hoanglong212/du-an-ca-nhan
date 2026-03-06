import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import PropertyCard from "../components/PropertyCard.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { fetchProperties } from "../services/api.js";

function PropertiesPage() {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
  });

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const data = await fetchProperties();
        setProperties(data);
      } catch (fetchError) {
        setError(fetchError.message || "Không thể tải danh sách bất động sản.");
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters((prev) => ({
      ...prev,
      status: params.get("status") || "",
      location: params.get("location") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      minArea: params.get("minArea") || "",
      maxArea: params.get("maxArea") || "",
    }));
  }, [location.search]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const statusMatches = filters.status ? String(property.status || "").toLowerCase() === filters.status : true;
      const locationText = `${property.city || ""} ${property.district || ""}`.toLowerCase();
      const locationMatches = filters.location ? locationText.includes(filters.location.toLowerCase()) : true;

      const priceValue = Number(property.price || 0);
      const minPriceMatches = filters.minPrice ? priceValue >= Number(filters.minPrice) : true;
      const maxPriceMatches = filters.maxPrice ? priceValue <= Number(filters.maxPrice) : true;

      const areaValue = Number(property.area || 0);
      const minAreaMatches = filters.minArea ? areaValue >= Number(filters.minArea) : true;
      const maxAreaMatches = filters.maxArea ? areaValue <= Number(filters.maxArea) : true;

      return (
        statusMatches &&
        locationMatches &&
        minPriceMatches &&
        maxPriceMatches &&
        minAreaMatches &&
        maxAreaMatches
      );
    });
  }, [filters, properties]);

  return (
    <>
      <RevealSection className="border-b border-slate-200 bg-white py-16">
        <div className="container-shell">
          <h1 className="text-6xl font-extrabold text-[#1f2e43] md:text-7xl">Danh sách bất động sản</h1>
          <p className="mt-4 text-3xl text-slate-500">{filteredProperties.length} sản phẩm đang hiển thị</p>
        </div>
      </RevealSection>

      <RevealSection className="container-shell py-14">
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="mb-6 flex items-center gap-2 text-4xl font-bold text-[#1f2e43]">
              <SlidersHorizontal size={26} className="text-[#c7a15a]" />
              Bộ lọc
            </h2>

            <FilterField label="Trạng thái">
              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-slate-400"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Bán</option>
                <option value="rented">Cho thuê</option>
                <option value="sold">Đã bán</option>
              </select>
            </FilterField>

            <FilterField label="Vị trí">
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-slate-400"
                placeholder="Nhập quận huyện hoặc thành phố"
                value={filters.location}
                onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
              />
            </FilterField>

            <FilterField label="Khoảng giá (VND)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-slate-400"
                  placeholder="Từ"
                  type="number"
                  value={filters.minPrice}
                  onChange={(event) => setFilters((prev) => ({ ...prev, minPrice: event.target.value }))}
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-slate-400"
                  placeholder="Đến"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))}
                />
              </div>
            </FilterField>

            <FilterField label="Diện tích (m²)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-slate-400"
                  placeholder="Từ"
                  type="number"
                  value={filters.minArea}
                  onChange={(event) => setFilters((prev) => ({ ...prev, minArea: event.target.value }))}
                />
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition duration-300 focus:border-slate-400"
                  placeholder="Đến"
                  type="number"
                  value={filters.maxArea}
                  onChange={(event) => setFilters((prev) => ({ ...prev, maxArea: event.target.value }))}
                />
              </div>
            </FilterField>
          </aside>

          <div>
            {loading ? <p className="rounded-2xl bg-white p-6 shadow-soft">Đang tải dữ liệu...</p> : null}
            {!loading && error ? <p className="rounded-2xl bg-red-50 p-6 text-red-600 shadow-soft">{error}</p> : null}
            {!loading && !error && filteredProperties.length === 0 ? (
              <p className="rounded-2xl bg-white p-6 shadow-soft">Không tìm thấy sản phẩm phù hợp.</p>
            ) : null}

            {!loading && !error && filteredProperties.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {filteredProperties.map((property, index) => (
                  <RevealSection key={property.id} delayMs={Math.min(index * 50, 220)}>
                    <PropertyCard property={property} />
                  </RevealSection>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </RevealSection>
    </>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="mb-6 block text-sm font-semibold text-slate-700">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export default PropertiesPage;
