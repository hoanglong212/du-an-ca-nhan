import {
  Award,
  Building2,
  ChartNoAxesCombined,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactForm from "../components/ContactForm.jsx";
import FeaturedProperties from "../components/FeaturedProperties.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { SITE_CONFIG } from "../constants/site.js";
import {
  fetchMarketOverview,
  fetchProperties,
  fetchPropertyBySlug,
} from "../services/api.js";
import { formatPriceVND } from "../utils/format.js";
import {
  getRecentViewedSlugs,
  subscribePropertyPrefs,
} from "../utils/propertyPrefs.js";

const TRUST_ITEMS = [
  {
    icon: Award,
    title: "15+ năm kinh nghiệm",
    text: "Am hiểu thị trường bất động sản Việt Nam và kinh nghiệm tư vấn thực tế.",
  },
  {
    icon: UsersRound,
    title: "2000+ khách hàng hài lòng",
    text: "Phong cách phục vụ tận tâm, chăm sóc theo nhu cầu thực tế của từng gia đình.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "500+ giao dịch thành công",
    text: "Hồ sơ giao dịch minh bạch, quy trình rõ ràng, đồng hành xuyên suốt.",
  },
  {
    icon: ShieldCheck,
    title: "Uy tín và an toàn",
    text: "Hỗ trợ pháp lý đầy đủ, thông tin được xác minh và cập nhật liên tục.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      '"Đội ngũ tư vấn rất chuyên nghiệp, hiểu nhu cầu gia đình tôi và đề xuất sản phẩm phù hợp ngay từ lần gặp đầu tiên."',
    name: "Nguyễn Văn Anh",
    role: "Chủ nhà",
  },
  {
    quote:
      '"Khả năng phân tích thị trường tốt, thông tin rõ ràng. Tôi ra quyết định đầu tư nhanh và an tâm hơn rất nhiều."',
    name: "Trần Minh Hòa",
    role: "Nhà đầu tư",
  },
  {
    quote:
      '"Lần đầu mua nhà nên tôi khá lo lắng, nhưng quá trình được hướng dẫn rất chi tiết, minh bạch và dễ hiểu."',
    name: "Lê Quang Minh",
    role: "Khách mua lần đầu",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recentViewedProperties, setRecentViewedProperties] = useState([]);
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

  const loadRecentViewed = useCallback(async () => {
    const recentSlugs = getRecentViewedSlugs().slice(0, 4);
    if (recentSlugs.length === 0) {
      setRecentViewedProperties([]);
      return;
    }

    const recentRows = await Promise.all(
      recentSlugs.map(async (slug) => {
        try {
          return await fetchPropertyBySlug(slug);
        } catch {
          return null;
        }
      }),
    );

    setRecentViewedProperties(recentRows.filter(Boolean));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadPageData() {
      try {
        const [propertyPayload, overviewPayload] = await Promise.all([
          fetchProperties({ page: 1, limit: 8, status: "available", sort: "newest" }),
          fetchMarketOverview(),
        ]);

        if (!mounted) return;
        setFeaturedProperties(propertyPayload?.items || []);
        setOverview(overviewPayload || null);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPageData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function syncRecentViewed() {
      try {
        await loadRecentViewed();
      } catch {
        if (active) {
          setRecentViewedProperties([]);
        }
      }
    }

    syncRecentViewed();
    const unsubscribe = subscribePropertyPrefs(syncRecentViewed);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadRecentViewed]);

  useEffect(() => {
    function onScroll() {
      setParallaxY(window.scrollY * 0.2);
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
          <div className="bg-mesh pointer-events-none absolute inset-0" />
          <div className="hero-glow pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full" />
          <div className="hero-glow pointer-events-none absolute -right-16 bottom-6 h-80 w-80 rounded-full" />

          <RevealSection className="container-shell relative z-10 pt-16 pb-20 text-white">
            <p className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-wide">
              <Sparkles size={16} />
              Hệ thống bất động sản đã nâng cấp
            </p>

            <h1 className="mt-6 max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl">
              Tìm ngôi nhà mơ ước
              <span className="block text-[var(--brand-gold-300)]">nhanh hơn và rõ ràng hơn</span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg text-slate-100 md:text-xl">
              Tìm kiếm, lọc, so sánh và để lại thông tin tư vấn trên một quy trình đơn giản. Dữ liệu được cập nhật liên
              tục theo khu vực.
            </p>

            <div className="glass-panel mt-10 rounded-3xl p-5 text-left text-slate-800 shadow-soft md:p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <SearchField
                  icon={Search}
                  label="Từ khóa"
                  placeholder="VD: căn hộ, nhà phố..."
                  value={searchForm.keyword}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, keyword: value }))}
                />
                <SearchField
                  icon={MapPin}
                  label="Vị trí"
                  placeholder="Quận, huyện, thành phố"
                  value={searchForm.location}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, location: value }))}
                />
                <SearchSelect
                  icon={Building2}
                  label="Loại hình"
                  value={searchForm.propertyType}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, propertyType: value }))}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "sale", label: "Mua bán" },
                    { value: "rent", label: "Cho thuê" },
                  ]}
                />
                <SearchSelect
                  icon={ChartNoAxesCombined}
                  label="Khoảng giá"
                  value={searchForm.priceRange}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, priceRange: value }))}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "under-3b", label: "Dưới 3 tỷ" },
                    { value: "3b-7b", label: "3 tỷ - 7 tỷ" },
                    { value: "over-7b", label: "Trên 7 tỷ" },
                  ]}
                />
                <SearchSelect
                  icon={ChartNoAxesCombined}
                  label="Diện tích"
                  value={searchForm.areaRange}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, areaRange: value }))}
                  options={[
                    { value: "", label: "Tất cả" },
                    { value: "under-80", label: "Dưới 80 m²" },
                    { value: "80-150", label: "80 - 150 m²" },
                    { value: "over-150", label: "Trên 150 m²" },
                  ]}
                />
              </div>

              <button
                className="btn-glow mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--brand-gold-500)] to-[var(--brand-gold-600)] py-4 text-lg font-bold text-white transition duration-300 hover:scale-[1.01]"
                type="button"
                onClick={handleSearch}
              >
                Tìm kiếm bất động sản
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Tổng sản phẩm" value={overviewData?.total_count || 0} />
              <StatCard title="Đang mở bán" value={overviewData?.available_count || 0} />
              <StatCard title="Tỉnh/TP đang có tin" value={overviewData?.city_count || 0} />
              <StatCard
                title="Giá trung bình"
                value={overviewData?.average_price ? formatPriceVND(overviewData.average_price) : "Đang cập nhật"}
              />
            </div>

            {topCities.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {topCities.map((city) => (
                  <button
                    key={city.city}
                    type="button"
                    className="glass-panel rounded-full px-4 py-2 text-sm font-medium hover:bg-white/20"
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

      {recentViewedProperties.length > 0 ? (
        <RevealSection className="container-shell py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-extrabold text-[var(--brand-navy-900)]">Bạn đã xem gần đây</h2>
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Clock3 size={16} />
              Tự động lưu lịch sử xem
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {recentViewedProperties.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </RevealSection>
      ) : null}

      <RevealSection className="container-shell py-20">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <h2 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-6xl">Tại sao chọn chúng tôi</h2>
          <p className="mt-5 text-lg text-slate-600">
            Cam kết phục vụ chuyên nghiệp, minh bạch và tận tâm trong từng giao dịch.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <article key={item.title} className="surface-card hover-lift rounded-3xl p-7 text-center">
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
          <h2 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-6xl">Khách hàng nói gì</h2>
          <p className="mt-5 text-lg text-slate-600">
            Những chia sẻ thực tế từ khách hàng đã giao dịch cùng {SITE_CONFIG.shortBrandName}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <article key={item.name} className="surface-card hover-lift rounded-3xl p-7">
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
          <h2 className="text-4xl font-extrabold text-[var(--brand-navy-900)] md:text-6xl">Liên hệ với chúng tôi</h2>
          <p className="mt-5 text-lg text-slate-600">
            Cần hỗ trợ nhanh? Gọi điện, gửi email hoặc nhắn tin Zalo để được tư vấn.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <ContactForm propertyId={null} />
          <aside className="space-y-6">
            <div className="rounded-3xl bg-[var(--brand-navy-900)] p-8 text-white shadow-soft">
              <h3 className="mb-5 text-2xl font-bold">Thông tin liên hệ nhanh</h3>
              <div className="space-y-4">
                <InfoCard
                  title="Điện thoại"
                  value={SITE_CONFIG.phoneDisplay}
                  subtitle="Thứ 2 - Thứ 7: 8:00 - 18:00"
                />
                <InfoCard title="Email" value={SITE_CONFIG.email} subtitle="Phản hồi trong 24h" />
                <InfoCard title="Zalo" value="Nhắn tin với chúng tôi" subtitle="Phản hồi nhanh" />
              </div>
            </div>
            <div className="surface-card rounded-3xl p-8">
              <h3 className="mb-4 text-2xl font-bold text-[var(--brand-navy-900)]">Giờ làm việc</h3>
              <p className="mb-2 flex justify-between text-sm">
                <span>Thứ 2 - Thứ 6</span>
                <span>8:00 - 18:00</span>
              </p>
              <p className="mb-2 flex justify-between text-sm">
                <span>Thứ 7</span>
                <span>9:00 - 17:00</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Chủ nhật</span>
                <span>Hẹn trước</span>
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
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-300 hover:border-slate-300">
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
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-300 hover:border-slate-300">
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
    <article className="glass-panel rounded-2xl px-4 py-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-100">{title}</p>
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
