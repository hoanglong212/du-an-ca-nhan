import {
  Bath,
  BedDouble,
  Calendar,
  Check,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  Ruler,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ContactForm from "../components/ContactForm.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { SITE_CONFIG } from "../constants/site.js";
import { fetchPropertyBySlug } from "../services/api.js";
import { formatArea, formatLocation, formatPriceVND, formatStatus } from "../utils/format.js";
import { getSafeImage } from "../utils/image.js";

const AGENCY_PHONE = SITE_CONFIG.phoneRaw;
const AGENCY_EMAIL = SITE_CONFIG.email;
const AGENCY_ZALO_URL = SITE_CONFIG.zaloUrl;

function PropertyDetailPage() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchPropertyBySlug(slug);
        setProperty(data);
        setActiveImage(getSafeImage(data?.images?.[0]?.image_url));
      } catch (fetchError) {
        setError(fetchError.message || "Không thể tải chi tiết bất động sản.");
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!property?.images || property.images.length === 0) return [getSafeImage(null)];
    return property.images.map((image) => getSafeImage(image.image_url));
  }, [property]);
  const amenityList = useMemo(() => {
    if (!Array.isArray(property?.amenities)) return [];
    return property.amenities.map((item) => String(item || "").trim()).filter(Boolean);
  }, [property]);

  const mapLat = Number(property?.lat);
  const mapLng = Number(property?.lng);
  const hasValidCoords = !Number.isNaN(mapLat) && !Number.isNaN(mapLng);

  if (loading) {
    return (
      <section className="container-shell py-16">
        <div className="rounded-2xl bg-white p-6 shadow-soft">Đang tải chi tiết bất động sản...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container-shell py-16">
        <div className="rounded-2xl bg-red-50 p-6 text-red-600 shadow-soft">{error}</div>
      </section>
    );
  }

  if (!property) {
    return (
      <section className="container-shell py-16">
        <div className="rounded-2xl bg-white p-6 shadow-soft">Không tìm thấy bất động sản.</div>
      </section>
    );
  }

  return (
    <section className="container-shell py-12">
      <p className="mb-5 text-slate-500">
        <Link className="transition-colors hover:text-slate-800" to="/properties">
          Bất động sản
        </Link>{" "}
        / {property.title}
      </p>

      <div className="grid gap-8 xl:grid-cols-[1.45fr_380px]">
        <RevealSection className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
            <img
              alt={property.title}
              className="h-[480px] w-full object-cover transition duration-700 hover:scale-[1.03]"
              src={activeImage}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.src = getSafeImage(null);
              }}
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`overflow-hidden rounded-xl border-2 transition duration-300 ${activeImage === image ? "border-[#c7a15a]" : "border-transparent hover:border-slate-300"}`}
                onClick={() => setActiveImage(image)}
              >
                <img
                  alt={`Ảnh bất động sản ${index + 1}`}
                  className="h-20 w-full object-cover transition duration-500 hover:scale-105"
                  src={image}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = getSafeImage(null);
                  }}
                />
              </button>
            ))}
          </div>

          <article className="rounded-3xl bg-white p-8 shadow-soft">
            <h1 className="text-6xl font-extrabold text-[#1f2e43]">{property.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-2xl text-slate-500">
              <MapPin size={20} />
              {formatLocation(property)}
            </p>
            <p className="mt-5 text-5xl font-extrabold text-[#c7a15a]">{formatPriceVND(property.price)}</p>

            <div className="mt-6 grid gap-4 border-y border-slate-200 py-6 md:grid-cols-4">
              <Metric icon={BedDouble} label="Phòng ngủ" value={property.bedrooms ?? "N/A"} />
              <Metric icon={Bath} label="Phòng tắm" value={property.bathrooms ?? "N/A"} />
              <Metric icon={Ruler} label="Diện tích" value={formatArea(property.area)} />
              <Metric icon={Calendar} label="Trạng thái" value={formatStatus(property.status)} />
            </div>

            <h2 className="mt-8 text-4xl font-bold text-[#1f2e43]">Mô tả</h2>
            <p className="mt-3 text-2xl leading-relaxed text-slate-600">
              {property.description || "Nội dung mô tả đang được cập nhật."}
            </p>

            <h3 className="mt-8 text-4xl font-bold text-[#1f2e43]">Tiện ích</h3>
            {amenityList.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {amenityList.map((amenity, index) => (
                  <Feature key={`${amenity}-${index}`} text={amenity} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xl text-slate-500">Bất động sản này chưa cập nhật tiện ích chi tiết.</p>
            )}
          </article>

          <article className="rounded-3xl bg-white p-8 shadow-soft">
            <h3 className="text-4xl font-bold text-[#1f2e43]">Vị trí</h3>
            {hasValidCoords ? (
              <div className="mt-5 h-72 overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={buildOsmEmbedUrl(mapLat, mapLng)}
                  title={`Bản đồ vị trí ${property.title}`}
                />
              </div>
            ) : (
              <div className="mt-5 grid h-72 place-items-center rounded-2xl bg-slate-200">
                <div className="text-center text-slate-500">
                  <MapPin className="mx-auto mb-2 text-[#c7a15a]" size={42} />
                  <p className="text-2xl">{formatLocation(property)}</p>
                  <p>Chưa có tọa độ để hiển thị bản đồ</p>
                </div>
              </div>
            )}
          </article>

          <ContactForm
            propertyId={property.id}
            title="Đăng ký tư vấn bất động sản này"
            subtitle="Chuyên viên sẽ liên hệ nhanh để tư vấn và sắp lịch xem nhà."
          />
        </RevealSection>

        <RevealSection className="space-y-6 xl:sticky xl:top-28 xl:h-fit" delayMs={80}>
          <article className="rounded-3xl bg-white p-8 text-center shadow-soft">
            <h3 className="mb-5 text-4xl font-bold text-[#1f2e43]">Liên hệ chuyên viên</h3>
            <span className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-[#1d2f49] text-4xl font-bold text-white">
              GD
            </span>
            <h4 className="text-4xl font-bold text-[#1f2e43]">{SITE_CONFIG.shortBrandName}</h4>
            <p className="mb-6 text-slate-500">Đơn vị bất động sản chuyên nghiệp</p>

            <a
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c7a15a] py-4 text-2xl font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#b8924f] hover:shadow-[0_0_24px_rgba(199,161,90,0.35)]"
              href={`tel:${AGENCY_PHONE}`}
            >
              <Phone size={20} />
              Gọi ngay
            </a>
            <a
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#1d2f49] py-4 text-2xl font-bold text-[#1d2f49] transition duration-300 hover:scale-[1.02] hover:bg-slate-50"
              href={`mailto:${AGENCY_EMAIL}`}
            >
              <Mail size={20} />
              Email
            </a>
            <a
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#1d2f49] py-4 text-2xl font-bold text-[#1d2f49] transition duration-300 hover:scale-[1.02] hover:bg-slate-50"
              href={AGENCY_ZALO_URL}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircleMore size={20} />
              Zalo
            </a>
          </article>
        </RevealSection>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-slate-500">
        <Icon size={18} />
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-[#1f2e43]">{value}</p>
    </div>
  );
}

function Feature({ text }) {
  return (
    <p className="flex items-center gap-2 text-2xl text-slate-600">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f2ede4] text-[#c7a15a]">
        <Check size={16} />
      </span>
      {text}
    </p>
  );
}

function buildOsmEmbedUrl(lat, lng) {
  const zoomDelta = 0.01;
  const left = lng - zoomDelta;
  const right = lng + zoomDelta;
  const top = lat + zoomDelta;
  const bottom = lat - zoomDelta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export default PropertyDetailPage;
