import { Award, ChartNoAxesCombined, MapPin, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactForm from "../components/ContactForm.jsx";
import FeaturedProperties from "../components/FeaturedProperties.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { SITE_CONFIG } from "../constants/site.js";
import { fetchProperties } from "../services/api.js";

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
      '"Đội ngũ tư vấn rất chuyên nghiệp, hiểu nhu cầu gia đình tôi và đề xuất sản phẩm phù hợp từ lần gặp đầu tiên."',
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
  const [loading, setLoading] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);
  const [searchForm, setSearchForm] = useState({
    location: "",
    priceRange: "",
    propertyType: "",
    areaRange: "",
  });

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await fetchProperties();
        setFeaturedProperties(data.slice(0, 8));
      } catch (error) {
        console.error("Failed to load properties:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFeatured();
  }, []);

  useEffect(() => {
    function onScroll() {
      setParallaxY(window.scrollY * 0.25);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();

    if (searchForm.location.trim()) {
      params.set("location", searchForm.location.trim());
    }

    if (searchForm.propertyType === "sale") params.set("status", "available");
    if (searchForm.propertyType === "rent") params.set("status", "rented");

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

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="relative min-h-[820px] bg-cover bg-center transition-[background-position] duration-300"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,33,56,0.72), rgba(20,33,56,0.78)), url('https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1920&q=80')",
            backgroundPosition: `center ${-parallaxY}px`,
          }}
        >
          <RevealSection className="container-shell pt-20 text-center text-white">
            <h1 className="mx-auto max-w-5xl text-6xl font-extrabold leading-tight md:text-8xl">
              Tìm ngôi nhà mơ ước <span className="text-[#d2b06a]">với sự an tâm</span>
            </h1>
            <p className="mx-auto mt-8 max-w-4xl text-2xl text-slate-100 md:text-4xl">
              Đơn vị gia đình đồng hành cùng bạn trên hành trình mua bán bất động sản tại Việt Nam.
            </p>

            <div className="mx-auto mt-14 max-w-6xl rounded-3xl bg-white p-6 text-left shadow-soft">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SearchField
                  icon={MapPin}
                  label="Vị trí"
                  placeholder="Nhập quận huyện hoặc thành phố"
                  value={searchForm.location}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, location: value }))}
                />
                <SearchSelect
                  icon={Search}
                  label="Khoảng giá"
                  value={searchForm.priceRange}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, priceRange: value }))}
                  options={[
                    { value: "", label: "Tất cả mức giá" },
                    { value: "under-3b", label: "Dưới 3 tỷ" },
                    { value: "3b-7b", label: "3 tỷ - 7 tỷ" },
                    { value: "over-7b", label: "Trên 7 tỷ" },
                  ]}
                />
                <SearchSelect
                  icon={Search}
                  label="Loại hình"
                  value={searchForm.propertyType}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, propertyType: value }))}
                  options={[
                    { value: "", label: "Tất cả loại hình" },
                    { value: "sale", label: "Mua bán" },
                    { value: "rent", label: "Cho thuê" },
                  ]}
                />
                <SearchSelect
                  icon={Search}
                  label="Diện tích"
                  value={searchForm.areaRange}
                  onChange={(value) => setSearchForm((prev) => ({ ...prev, areaRange: value }))}
                  options={[
                    { value: "", label: "Tất cả diện tích" },
                    { value: "under-80", label: "Dưới 80 m²" },
                    { value: "80-150", label: "80 m² - 150 m²" },
                    { value: "over-150", label: "Trên 150 m²" },
                  ]}
                />
              </div>
              <button
                className="mt-5 w-full rounded-2xl bg-[#c7a15a] py-4 text-2xl font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#b8924f] hover:shadow-[0_0_24px_rgba(199,161,90,0.35)]"
                type="button"
                onClick={handleSearch}
              >
                Tìm kiếm bất động sản
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

      <RevealSection>
        <FeaturedProperties loading={loading} properties={featuredProperties} />
      </RevealSection>

      <RevealSection className="container-shell py-20">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <h2 className="text-5xl font-extrabold text-[#1f2e43] md:text-7xl">Tại sao chọn chúng tôi</h2>
          <p className="mt-5 text-3xl text-slate-500">
            Chúng tôi cam kết phục vụ chuyên nghiệp, minh bạch và tận tâm trong từng giao dịch.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl bg-white p-8 text-center shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,31,58,0.14)]"
            >
              <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-[#f2ede4] text-[#c7a15a]">
                <item.icon size={38} />
              </div>
              <h3 className="text-4xl font-extrabold text-[#1f2e43]">{item.title}</h3>
              <p className="mt-4 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="container-shell py-20">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <h2 className="text-5xl font-extrabold text-[#1f2e43] md:text-7xl">Khách hàng nói gì về chúng tôi</h2>
          <p className="mt-5 text-3xl text-slate-500">Những chia sẻ thực tế từ khách hàng đã giao dịch cùng {SITE_CONFIG.shortBrandName}.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl bg-white p-8 shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,31,58,0.14)]"
            >
              <p className="text-3xl leading-relaxed text-slate-600">{item.quote}</p>
              <div className="mt-8">
                <h3 className="text-3xl font-bold text-[#1f2e43]">{item.name}</h3>
                <p className="text-slate-500">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="container-shell py-20">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <h2 className="text-5xl font-extrabold text-[#1f2e43] md:text-7xl">Liên hệ với chúng tôi</h2>
          <p className="mt-5 text-3xl text-slate-500">Cần hỗ trợ nhanh? Gọi điện, gửi email hoặc nhắn tin Zalo để được tư vấn.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <ContactForm propertyId={null} />
          <aside className="space-y-6">
            <div className="rounded-3xl bg-[#1d2f49] p-8 text-white shadow-soft">
              <h3 className="mb-5 text-4xl font-bold">Thông tin liên hệ nhanh</h3>
              <div className="space-y-4">
                <InfoCard title="Điện thoại" value={SITE_CONFIG.phoneDisplay} subtitle="Thứ 2 - Thứ 7: 8:00 - 18:00" />
                <InfoCard title="Email" value={SITE_CONFIG.email} subtitle="Phản hồi trong 24h" />
                <InfoCard title="Zalo" value="Nhắn tin với chúng tôi" subtitle="Phản hồi nhanh" />
              </div>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-soft">
              <h3 className="mb-4 text-4xl font-bold text-[#1f2e43]">Giờ làm việc</h3>
              <p className="mb-2 flex justify-between text-xl">
                <span>Thứ 2 - Thứ 6</span>
                <span>8:00 - 18:00</span>
              </p>
              <p className="mb-2 flex justify-between text-xl">
                <span>Thứ 7</span>
                <span>9:00 - 17:00</span>
              </p>
              <p className="flex justify-between text-xl">
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

function SearchField({ icon: Icon, label, placeholder, value, onChange }) {
  return (
    <label className="block text-sm font-semibold text-slate-500">
      {label}
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition duration-300 hover:border-slate-300">
        <Icon size={18} className="text-slate-400" />
        <input
          className="w-full bg-transparent text-lg text-slate-700 outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function SearchSelect({ icon: Icon, label, value, onChange, options }) {
  return (
    <label className="block text-sm font-semibold text-slate-500">
      {label}
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition duration-300 hover:border-slate-300">
        <Icon size={18} className="text-slate-400" />
        <select
          className="w-full bg-transparent text-lg text-slate-700 outline-none"
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

function InfoCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl bg-white/12 p-5 transition duration-300 hover:bg-white/18">
      <h4 className="text-2xl font-bold">{title}</h4>
      <p className="mt-1 text-xl">{value}</p>
      <p className="text-slate-300">{subtitle}</p>
    </div>
  );
}

export default HomePage;
