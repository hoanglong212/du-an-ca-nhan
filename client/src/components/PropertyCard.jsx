import { ArrowRight, Expand, Heart, MapPin } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { formatArea, formatPriceVND, formatStatus } from "../utils/format.js";
import { getSafeImage } from "../utils/image.js";
import {
  isFavoriteSlug,
  subscribePropertyPrefs,
  toggleFavoriteSlug,
} from "../utils/propertyPrefs.js";

function PropertyCard({ property }) {
  const slug = String(property?.slug || "");
  const location = [property?.district, property?.city].filter(Boolean).join(", ");
  const typeLabel = property?.property_kind || (property?.type === "rent" ? "Cho thuê" : "Mua bán");
  const isFavorite = useSyncExternalStore(
    subscribePropertyPrefs,
    () => isFavoriteSlug(slug),
    () => false,
  );

  function handleToggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavoriteSlug(slug);
  }

  return (
    <article className="surface-card hover-lift overflow-hidden rounded-3xl">
      <Link className="group block" to={`/properties/${property.slug}`}>
        <div className="relative h-64 overflow-hidden">
          <img
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            src={getSafeImage(property.cover_image)}
            onError={(event) => {
              event.currentTarget.src = getSafeImage(null);
            }}
          />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--brand-gold-500)] px-4 py-1 text-xs font-bold text-white">
              {formatStatus(property.status)}
            </span>
            <span className="rounded-full bg-black/55 px-4 py-1 text-xs font-semibold text-white">{typeLabel}</span>
          </div>

          <button
            type="button"
            aria-label="Yêu thích"
            className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/40 backdrop-blur transition ${
              isFavorite ? "bg-rose-500 text-white" : "bg-white/20 text-white hover:bg-white/35"
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart size={18} className={isFavorite ? "fill-current" : ""} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <h3 className="line-clamp-2 text-lg font-bold text-[var(--brand-navy-900)]">{property.title}</h3>
          <p className="text-2xl font-bold text-[var(--brand-gold-600)]">{formatPriceVND(property.price)}</p>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={16} />
            {location || "Đang cập nhật vị trí"}
          </p>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Expand size={16} />
              {formatArea(property.area)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-navy-900)] px-4 py-2 text-sm font-semibold text-white transition duration-300 group-hover:scale-[1.02]">
              Xem chi tiết
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default PropertyCard;
