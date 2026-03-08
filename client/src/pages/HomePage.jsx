import { Award, Building2, ChartNoAxesCombined, MapPin, Search, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactForm from "../components/ContactForm.jsx";
import FeaturedProperties from "../components/FeaturedProperties.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { SITE_CONFIG } from "../constants/site.js";
import { fetchMarketOverview, fetchProperties } from "../services/api.js";
import { formatPriceVND } from "../utils/format.js";

const TRUST_ITEMS = [
  {
    icon: Award,
    title: "15+ nam kinh nghiem",
    text: "Am hieu thi truong bat dong san Viet Nam va kinh nghiem tu van thuc te.",
  },
  {
    icon: UsersRound,
    title: "2000+ khach hang hai long",
    text: "Phong cach phuc vu tan tam, cham soc theo nhu cau thuc te cua tung gia dinh.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "500+ giao dich thanh cong",
    text: "Ho so giao dich minh bach, quy trinh ro rang, dong hanh xuyen suot.",
  },
  {
    icon: ShieldCheck,
    title: "Uy tin va an toan",
    text: "Ho tro phap ly day du, thong tin duoc xac minh va cap nhat lien tuc.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      '"Doi ngu tu van rat chuyen nghiep, hieu nhu cau gia dinh toi va de xuat san pham phu hop ngay tu lan gap dau tien."',
    name: "Nguyen Van Anh",
    role: "Chu nha",
  },
  {
    quote:
      '"Kha nang phan tich thi truong tot, thong tin ro rang. Toi ra quyet dinh dau tu nhanh va an tam hon rat nhieu."',
    name: "Tran Minh Hoa",
    role: "Nha dau tu",
  },
  {
    quote:
      '"Lan dau mua nha nen toi kha lo lang, nhung qua trinh duoc huong dan rat chi tiet, minh bach va de hieu."',
    name: "Le Quang Minh",
    role: "Khach mua lan dau",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [searchForm, setSearchForm] = useState({
    keyword: "",
    location: "",
    priceRange: "",
    propertyType: "",
    areaRange: "",
  });

  useEffect(() => {
    async function loadPageData() {
      try {
        const [propertyPayload, overviewPayload] = await Promise.all([
          fetchProperties({ page: 1, limit: 8, status: "available", sort: "newest" }),
          fetchMarketOverview(),
        ]);

        setFeaturedProperties(propertyPayload?.items || []);
        setOverview(overviewPayload || null);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, []);

  useEffect(() => {
    function onScroll() {
      setParallaxY(window.scrollY * 0.22);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();

    if (searchForm.keyword.trim()) {
      params.set("q", searchForm.keyword.trim());
    }

    if (searchForm.location.trim()) {
      params.set("location", searchForm.location.trim());
    }

    if (searchForm.propertyType) {
      params.set("type", searchForm.propertyType);
    }

    if (searchForm.priceRange === "under-3b") params.set("maxPrice", "3000000000");
    if (searchForm.priceRange === "3b-7b") {
      params.set("minPrice", "3000000000");
      params.set("maxPrice", "7000000000");
    }
    if (searchForm.priceRange === "over-7b") params.set("minPrice", "7000000000");

    if (searchForm.areaRange === "under-80") params.set("maxArea", "80");
    if (searchForm.areaRange === "80-150") {
      params.set("minArea", "80");
      params.set("maxArea", "150");
    }
    if (searchForm.areaRange === "over-150") params.set("minArea", "150");

    navigate(`/properties?${params.toString()}`);
  }

  const overviewData = overview?.overview;
  const topCities = overview?.top_cities || [];

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="relative min-h-[760px] bg-cover bg-center transition-[background-position] duration-300"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(10,24,45,0.85), rgba(12,58,86,0.78)), url('https://images.unsplash.com/photo-1605146768851-eda79da39897?auto=format&fit=crop&w=1920&q=80')",
            backgroundPosition: `center ${-parallaxY}px`,
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(235,193,111,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(127,196,255,0.15),transparent_38%)]" />

          <RevealSection className="container-shell relative z-10 pt-16 pb-20 text-white">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide">
              <Sparkles size={16} />
              He thong bat dong san da nang cap
            </p>

            <h1 className="mt-6 max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl">
              Tim ngoi nha mo uoc
              <span className="block text-[var(--brand-gold-300)]">nhanh hon va ro rang hon</span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg text-slate-100 md:text-xl">
              Tim kiem, loc, so sanh va de lai thong tin tu van tren mot quy trinh don gian. Du lieu duoc cap nhat
              lien tuc theo khu vuc.
            </p>

            <div className="mt-10 rounded-3xl border border-white/20 bg-white/95 p-5 text-left text-slate-800 shadow-soft backdrop-blur md:p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SearchField
                  icon={Search}
                  label="Tu khoa"
                  placeholder="VD: can ho, nha pho..."
                  value={searchForm.keyword}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, keyword: value }))}
                />
                <SearchField
                  icon={MapPin}
                  label="Vi tri"
                  placeholder="Quan, huyen, thanh pho"
                  value={searchForm.location}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, location: value }))}
                />
                <SearchSelect
                  icon={Building2}
                  label="Loai hinh"
                  value={searchForm.propertyType}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, propertyType: value }))}
                  options={[
                    { value: "", label: "Tat ca" },
                    { value: "sale", label: "Mua ban" },
                    { value: "rent", label: "Cho thue" },
                  ]}
                />
                <SearchSelect
                  icon={ChartNoAxesCombined}
                  label="Khoang gia"
                  value={searchForm.priceRange}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, priceRange: value }))}
                  options={[
                    { value: "", label: "Tat ca" },
                    { value: "under-3b", label: "Duoi 3 ty" },
                    { value: "3b-7b", label: "3 ty - 7 ty" },
                    { value: "over-7b", label: "Tren 7 ty" },
                  ]}
                />
                <SearchSelect
                  icon={ChartNoAxesCombined}
                  label="Dien tich"
                  value={searchForm.areaRange}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, areaRange: value }))}
                  options={[
                    { value: "", label: "Tat ca" },
                    { value: "under-80", label: "Duoi 80 m2" },
                    { value: "80-150", label: "80 - 150 m2" },
                    { value: "over-150", label: "Tren 150 m2" },
                  ]}
                />
              </div>

              <button
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--brand-gold-500)] to-[var(--brand-gold-600)] py-4 text-lg font-bold text-white transition duration-300 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(194,145,72,0.35)]"
                type="button"
                onClick={handleSearch}
              >
                Tim kiem bat dong san
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Tong san pham" value={overviewData?.total_count || 0} />
              <StatCard title="Dang mo ban" value={overviewData?.available_count || 0} />
              <StatCard title="Tinh/TP dang co tin" value={overviewData?.city_count || 0} />
              <StatCard
                title="Gia trung binh"
                value={overviewData?.average_price ? formatPriceVND(overviewData.average_price) : "Dang cap nhat"}
              />
            </div>

            {topCities.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {topCities.map((city) => (
                  <button
                    key={city.city}
                    type="button"
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                    onClick={() => navigate(`/properties?city=${encodeURIComponent(city.city)}`)}
                  >
                    {city.city} ({city.total})
                  </button>
                ))}
              </div>
            ) : null}
          </RevealSection>
        </div>
      </section>

      <RevealSection>
        <FeaturedProperties loading={loading} properties={featuredProperties} />
      </RevealSection>

      <RevealSection className="container-shell py-20">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <h2 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-6xl">Tai sao chon chung toi</h2>
          <p className="mt-5 text-lg text-slate-600">
            Cam ket phuc vu chuyen nghiep, minh bach va tan tam trong tung giao dich.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <article
              key={item.title}
              className="surface-card rounded-3xl p-7 text-center transition duration-500 hover:-translate-y-1"
            >
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]">
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--brand-navy-900)]">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="container-shell py-20">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <h2 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-6xl">Khach hang noi gi</h2>
          <p className="mt-5 text-lg text-slate-600">Nhung chia se thuc te tu khach hang da giao dich cung {SITE_CONFIG.shortBrandName}.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <article key={item.name} className="surface-card rounded-3xl p-7">
              <p className="text-lg leading-relaxed text-slate-600">{item.quote}</p>
              <div className="mt-8">
                <h3 className="text-xl font-bold text-[var(--brand-navy-900)]">{item.name}</h3>
                <p className="text-sm text-slate-500">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="container-shell py-20">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <h2 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-6xl">Lien he voi chung toi</h2>
          <p className="mt-5 text-lg text-slate-600">Can ho tro nhanh? Goi dien, gui email hoac nhan tin Zalo de duoc tu van.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <ContactForm propertyId={null} />
          <aside className="space-y-6">
            <div className="rounded-3xl bg-[var(--brand-navy-900)] p-8 text-white shadow-soft">
              <h3 className="mb-5 text-2xl font-bold">Thong tin lien he nhanh</h3>
              <div className="space-y-4">
                <InfoCard title="Dien thoai" value={SITE_CONFIG.phoneDisplay} subtitle="Thu 2 - Thu 7: 8:00 - 18:00" />
                <InfoCard title="Email" value={SITE_CONFIG.email} subtitle="Phan hoi trong 24h" />
                <InfoCard title="Zalo" value="Nhan tin voi chung toi" subtitle="Phan hoi nhanh" />
              </div>
            </div>
            <div className="surface-card rounded-3xl p-8">
              <h3 className="mb-4 text-2xl font-bold text-[var(--brand-navy-900)]">Gio lam viec</h3>
              <p className="mb-2 flex justify-between text-sm">
                <span>Thu 2 - Thu 6</span>
                <span>8:00 - 18:00</span>
              </p>
              <p className="mb-2 flex justify-between text-sm">
                <span>Thu 7</span>
                <span>9:00 - 17:00</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Chu nhat</span>
                <span>Hen truoc</span>
              </p>
            </div>
          </aside>
        </div>
      </RevealSection>
    </>
  );
}

function SearchField({ icon, label, placeholder, value, onChange }) {
  const IconComponent = icon;

  return (
    <label className="block text-sm font-semibold text-slate-600">
      {label}
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition duration-300 hover:border-slate-300">
        <IconComponent size={18} className="text-slate-400" />
        <input
          className="w-full bg-transparent text-sm text-slate-700 outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function SearchSelect({ icon, label, value, onChange, options }) {
  const IconComponent = icon;

  return (
    <label className="block text-sm font-semibold text-slate-600">
      {label}
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition duration-300 hover:border-slate-300">
        <IconComponent size={18} className="text-slate-400" />
        <select
          className="w-full bg-transparent text-sm text-slate-700 outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function StatCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </article>
  );
}

function InfoCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl bg-white/12 p-5 transition duration-300 hover:bg-white/18">
      <h4 className="text-lg font-bold">{title}</h4>
      <p className="mt-1 text-sm">{value}</p>
      <p className="text-xs text-slate-300">{subtitle}</p>
    </div>
  );
}

export default HomePage;
