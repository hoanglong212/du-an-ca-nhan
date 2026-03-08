import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "./PropertyCard.jsx";
import RevealSection from "./RevealSection.jsx";

function FeaturedProperties({ properties = [], loading = false }) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return properties;
    return properties.filter((item) => String(item.type || "").toLowerCase() === activeTab);
  }, [activeTab, properties]);

  return (
    <section className="container-shell py-20">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-5xl">Bat dong san noi bat</h2>
          <p className="mt-3 text-base text-slate-600">Kham pha nhung san pham duoc cap nhat moi nhat tu he thong.</p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-navy-900)] px-8 py-4 text-sm font-bold text-white transition duration-300 hover:scale-[1.02]"
          to="/properties"
        >
          Xem tat ca
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          className={`rounded-2xl px-6 py-3 font-semibold ${activeTab === "all" ? "bg-[var(--brand-navy-900)] text-white" : "bg-slate-100 text-slate-700"}`}
          onClick={() => setActiveTab("all")}
          type="button"
        >
          Tat ca
        </button>
        <button
          className={`rounded-2xl px-6 py-3 font-semibold ${activeTab === "sale" ? "bg-[var(--brand-navy-900)] text-white" : "bg-slate-100 text-slate-700"}`}
          onClick={() => setActiveTab("sale")}
          type="button"
        >
          Mua ban
        </button>
        <button
          className={`rounded-2xl px-6 py-3 font-semibold ${activeTab === "rent" ? "bg-[var(--brand-navy-900)] text-white" : "bg-slate-100 text-slate-700"}`}
          onClick={() => setActiveTab("rent")}
          type="button"
        >
          Cho thue
        </button>
      </div>

      {loading ? <p className="surface-card rounded-2xl p-6">Dang tai du lieu...</p> : null}

      {!loading && filtered.length === 0 ? (
        <p className="surface-card rounded-2xl p-6">Khong tim thay bat dong san phu hop.</p>
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
