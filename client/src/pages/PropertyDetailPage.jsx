import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Check,
  FileCheck2,
  Heart,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  Ruler,
  Share2,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link, useParams } from "react-router-dom";
import ContactForm from "../components/ContactForm.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { SITE_CONFIG } from "../constants/site.js";
import { fetchPropertyBySlug, fetchRelatedProperties } from "../services/api.js";
import { formatArea, formatLocation, formatPriceVND, formatStatus } from "../utils/format.js";
import { getSafeImage } from "../utils/image.js";
import {
  isFavoriteSlug,
  pushRecentViewedSlug,
  subscribePropertyPrefs,
  toggleFavoriteSlug,
} from "../utils/propertyPrefs.js";

const AGENCY_PHONE = SITE_CONFIG.phoneRaw;
const AGENCY_EMAIL = SITE_CONFIG.email;
const AGENCY_ZALO_URL = SITE_CONFIG.zaloUrl;

function PropertyDetailPage() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [copied, setCopied] = useState(false);
  const isFavorite = useSyncExternalStore(
    subscribePropertyPrefs,
    () => isFavoriteSlug(slug),
    () => false,
  );

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const [propertyData, relatedData] = await Promise.all([
          fetchPropertyBySlug(slug),
          fetchRelatedProperties(slug, { limit: 4 }),
        ]);

        setProperty(propertyData);
        setRelatedProperties(Array.isArray(relatedData) ? relatedData : []);
        setActiveImage(getSafeImage(propertyData?.images?.[0]?.image_url));
        pushRecentViewedSlug(slug);
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

  const detailRows = useMemo(
    () => [
      {
        icon: Building2,
        label: "Loại hình",
        value: property?.property_kind || (property?.type === "rent" ? "Cho thuê" : "Mua bán"),
      },
      {
        icon: Ruler,
        label: "Diện tích đất",
        value: formatArea(property?.area),
      },
      {
        icon: Calendar,
        label: "Giá/m2",
        value: formatPricePerSquareMeter(property?.price, property?.area),
      },
      {
        icon: FileCheck2,
        label: "Giấy tờ pháp lý",
        value: property?.legal_document || "Đang cập nhật",
      },
      {
        icon: Ruler,
        label: "Đơn vị",
        value: "m2",
      },
    ],
    [property],
  );

  const mapLat = Number(property?.lat);
  const mapLng = Number(property?.lng);
  const hasValidCoords = !Number.isNaN(mapLat) && !Number.isNaN(mapLng);

  function handleToggleFavorite() {
    toggleFavoriteSlug(slug);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  if (loading) {
    return (
      <section className="container-shell py-16">
        <div className="surface-card rounded-2xl p-6">Đang tải chi tiết bất động sản...</div>
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
        <div className="surface-card rounded-2xl p-6">Không tìm thấy bất động sản.</div>
      </section>
    );
  }

  return (
    <section className="container-shell py-12">
      <p className="mb-5 text-sm text-slate-500">
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
              className="h-[460px] w-full object-cover transition duration-700 hover:scale-[1.03]"
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
                className={`overflow-hidden rounded-xl border-2 transition duration-300 ${activeImage === image ? "border-[var(--brand-gold-500)]" : "border-transparent hover:border-slate-300"}`}
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

          <article className="surface-card rounded-3xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-[var(--brand-navy-900)]">{property.title}</h1>
                <p className="mt-3 flex items-center gap-2 text-base text-slate-500">
                  <MapPin size={20} />
                  {formatLocation(property)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    isFavorite
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={handleToggleFavorite}
                >
                  <Heart size={16} className={isFavorite ? "fill-current" : ""} />
                  {isFavorite ? "Đã yêu thích" : "Yêu thích"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={handleCopyLink}
                >
                  <Share2 size={16} />
                  {copied ? "Đã sao chép" : "Chia sẻ"}
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              {detailRows.map((row, index) => {
                const IconComponent = row.icon;
                return (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[200px_1fr] items-center gap-3 px-4 py-3 text-sm ${index !== detailRows.length - 1 ? "border-b border-slate-200" : ""}`}
                  >
                    <p className="flex items-center gap-2 text-slate-600">
                      <IconComponent size={16} />
                      {row.label}
                    </p>
                    <p className="font-semibold text-slate-800">{row.value}</p>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[var(--brand-gold-600)]">{formatPriceVND(property.price)}</p>

            <div className="mt-6 grid gap-4 border-y border-slate-200 py-6 md:grid-cols-4">
              <Metric icon={BedDouble} label="Phòng ngủ" value={property.bedrooms ?? "N/A"} />
              <Metric icon={Bath} label="Phòng tắm" value={property.bathrooms ?? "N/A"} />
              <Metric icon={Ruler} label="Diện tích" value={formatArea(property.area)} />
              <Metric icon={Calendar} label="Trạng thái" value={formatStatus(property.status)} />
            </div>

            <h2 className="mt-8 text-2xl font-bold text-[var(--brand-navy-900)]">Mô tả</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {property.description || "Nội dung mô tả đang được cập nhật."}
            </p>

            <h3 className="mt-8 text-2xl font-bold text-[var(--brand-navy-900)]">Tiện ích</h3>
            {amenityList.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {amenityList.map((amenity, index) => (
                  <Feature key={`${amenity}-${index}`} text={amenity} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Bất động sản này chưa cập nhật tiện ích chi tiết.</p>
            )}
          </article>

          <article className="surface-card rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-[var(--brand-navy-900)]">Vị trí</h3>
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
                  <MapPin className="mx-auto mb-2 text-[var(--brand-gold-600)]" size={42} />
                  <p className="text-lg">{formatLocation(property)}</p>
                  <p>Chưa có tọa độ để hiển thị bản đồ.</p>
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

        <RevealSection className="space-y-6 xl:sticky xl:top-24 xl:h-fit" delayMs={80}>
          <article className="surface-card rounded-3xl p-8 text-center">
            <h3 className="mb-5 text-2xl font-bold text-[var(--brand-navy-900)]">Liên hệ chuyên viên</h3>
            <span className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-[var(--brand-navy-900)] text-3xl font-bold text-white">
              GD
            </span>
            <h4 className="text-2xl font-bold text-[var(--brand-navy-900)]">{SITE_CONFIG.shortBrandName}</h4>
            <p className="mb-6 text-sm text-slate-500">Đơn vị bất động sản chuyên nghiệp</p>

            <a
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-gold-500)] py-4 text-base font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-[var(--brand-gold-600)]"
              href={`tel:${AGENCY_PHONE}`}
            >
              <Phone size={20} />
              Gọi ngay
            </a>
            <a
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--brand-navy-900)] py-4 text-base font-bold text-[var(--brand-navy-900)] transition duration-300 hover:scale-[1.02] hover:bg-slate-50"
              href={`mailto:${AGENCY_EMAIL}`}
            >
              <Mail size={20} />
              Email
            </a>
            <a
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--brand-navy-900)] py-4 text-base font-bold text-[var(--brand-navy-900)] transition duration-300 hover:scale-[1.02] hover:bg-slate-50"
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

      {relatedProperties.length > 0 ? (
        <RevealSection className="mt-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-[var(--brand-navy-900)]">Sản phẩm liên quan</h2>
            <Link
              to="/properties"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Xem thêm
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {relatedProperties.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </RevealSection>
      ) : null}
    </section>
  );
}

function Metric({ icon, label, value }) {
  const IconComponent = icon;

  return (
    <div>
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <IconComponent size={18} />
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[var(--brand-navy-900)]">{value}</p>
    </div>
  );
}

function Feature({ text }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-600">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]">
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

function formatPricePerSquareMeter(price, area) {
  const priceValue = Number(price);
  const areaValue = Number(area);

  if (!Number.isFinite(priceValue) || !Number.isFinite(areaValue) || areaValue <= 0) {
    return "Đang cập nhật";
  }

  const value = priceValue / areaValue;

  if (value >= 1_000_000) {
    const million = value / 1_000_000;
    return `${million.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })} triệu/m2`;
  }

  return `${Math.round(value).toLocaleString("vi-VN")} VND/m2`;
}

export default PropertyDetailPage;
