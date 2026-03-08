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
import PropertyCard from "../components/PropertyCard.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { SITE_CONFIG } from "../constants/site.js";
import { fetchPropertyBySlug, fetchRelatedProperties } from "../services/api.js";
import { formatArea, formatLocation, formatPriceVND, formatStatus } from "../utils/format.js";
import { getSafeImage } from "../utils/image.js";

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
      } catch (fetchError) {
        setError(fetchError.message || "Khong the tai chi tiet bat dong san.");
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
        <div className="surface-card rounded-2xl p-6">Dang tai chi tiet bat dong san...</div>
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
        <div className="surface-card rounded-2xl p-6">Khong tim thay bat dong san.</div>
      </section>
    );
  }

  return (
    <section className="container-shell py-12">
      <p className="mb-5 text-sm text-slate-500">
        <Link className="transition-colors hover:text-slate-800" to="/properties">
          Bat dong san
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
                  alt={`Anh bat dong san ${index + 1}`}
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
            <h1 className="text-4xl font-extrabold text-[var(--brand-navy-900)]">{property.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-base text-slate-500">
              <MapPin size={20} />
              {formatLocation(property)}
            </p>
            <p className="mt-5 text-3xl font-extrabold text-[var(--brand-gold-600)]">{formatPriceVND(property.price)}</p>

            <div className="mt-6 grid gap-4 border-y border-slate-200 py-6 md:grid-cols-4">
              <Metric icon={BedDouble} label="Phong ngu" value={property.bedrooms ?? "N/A"} />
              <Metric icon={Bath} label="Phong tam" value={property.bathrooms ?? "N/A"} />
              <Metric icon={Ruler} label="Dien tich" value={formatArea(property.area)} />
              <Metric icon={Calendar} label="Trang thai" value={formatStatus(property.status)} />
            </div>

            <h2 className="mt-8 text-2xl font-bold text-[var(--brand-navy-900)]">Mo ta</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {property.description || "Noi dung mo ta dang duoc cap nhat."}
            </p>

            <h3 className="mt-8 text-2xl font-bold text-[var(--brand-navy-900)]">Tien ich</h3>
            {amenityList.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {amenityList.map((amenity, index) => (
                  <Feature key={`${amenity}-${index}`} text={amenity} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Bat dong san nay chua cap nhat tien ich chi tiet.</p>
            )}
          </article>

          <article className="surface-card rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-[var(--brand-navy-900)]">Vi tri</h3>
            {hasValidCoords ? (
              <div className="mt-5 h-72 overflow-hidden rounded-2xl border border-slate-200">
                <iframe
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={buildOsmEmbedUrl(mapLat, mapLng)}
                  title={`Ban do vi tri ${property.title}`}
                />
              </div>
            ) : (
              <div className="mt-5 grid h-72 place-items-center rounded-2xl bg-slate-200">
                <div className="text-center text-slate-500">
                  <MapPin className="mx-auto mb-2 text-[var(--brand-gold-600)]" size={42} />
                  <p className="text-lg">{formatLocation(property)}</p>
                  <p>Chua co toa do de hien thi ban do</p>
                </div>
              </div>
            )}
          </article>

          <ContactForm
            propertyId={property.id}
            title="Dang ky tu van bat dong san nay"
            subtitle="Chuyen vien se lien he nhanh de tu van va sap lich xem nha."
          />
        </RevealSection>

        <RevealSection className="space-y-6 xl:sticky xl:top-24 xl:h-fit" delayMs={80}>
          <article className="surface-card rounded-3xl p-8 text-center">
            <h3 className="mb-5 text-2xl font-bold text-[var(--brand-navy-900)]">Lien he chuyen vien</h3>
            <span className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-[var(--brand-navy-900)] text-3xl font-bold text-white">
              GD
            </span>
            <h4 className="text-2xl font-bold text-[var(--brand-navy-900)]">{SITE_CONFIG.shortBrandName}</h4>
            <p className="mb-6 text-sm text-slate-500">Don vi bat dong san chuyen nghiep</p>

            <a
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-gold-500)] py-4 text-base font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-[var(--brand-gold-600)]"
              href={`tel:${AGENCY_PHONE}`}
            >
              <Phone size={20} />
              Goi ngay
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
            <h2 className="text-3xl font-bold text-[var(--brand-navy-900)]">San pham lien quan</h2>
            <Link
              to="/properties"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Xem them
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

export default PropertyDetailPage;
