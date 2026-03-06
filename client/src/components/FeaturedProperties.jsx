import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "./PropertyCard.jsx";
import RevealSection from "./RevealSection.jsx";

function FeaturedProperties({ properties = [], loading = false }) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return properties;
    if (activeTab === "rent") {
      return properties.filter((item) => String(item.status || "").toLowerCase().includes("rent"));
    }
    return properties.filter((item) => !String(item.status || "").toLowerCase().includes("rent"));
  }, [activeTab, properties]);

  return (
    <section className="container-shell py-20">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-5xl font-extrabold text-[#1f2e43] md:text-6xl">Bất động sản nổi bật</h2>
          <p className="mt-3 text-3xl text-slate-500">Khám phá những sản phẩm nổi bật được lựa chọn kỹ lưỡng</p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1d2f49] px-8 py-4 text-lg font-bold text-white transition duration-300 hover:scale-[1.02]"
          to="/properties"
        >
          Xem tất cả
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          className={`rounded-2xl px-6 py-3 font-semibold ${activeTab === "all" ? "bg-[#1d2f49] text-white" : "bg-slate-100 text-slate-700"}`}
          onClick={() => setActiveTab("all")}
          type="button"
        >
          Tất cả
        </button>
        <button
          className={`rounded-2xl px-6 py-3 font-semibold ${activeTab === "sale" ? "bg-[#1d2f49] text-white" : "bg-slate-100 text-slate-700"}`}
          onClick={() => setActiveTab("sale")}
          type="button"
        >
          Bán
        </button>
        <button
          className={`rounded-2xl px-6 py-3 font-semibold ${activeTab === "rent" ? "bg-[#1d2f49] text-white" : "bg-slate-100 text-slate-700"}`}
          onClick={() => setActiveTab("rent")}
          type="button"
        >
          Cho thuê
        </button>
      </div>

      {loading ? <p className="rounded-2xl bg-white p-6 shadow-soft">Đang tải dữ liệu...</p> : null}

      {!loading && filtered.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 shadow-soft">Không tìm thấy bất động sản phù hợp.</p>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <RevealSection className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filtered.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </RevealSection>
      ) : null}
    </section>
  );
}

export default FeaturedProperties;

