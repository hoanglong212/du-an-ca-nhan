import { ArrowRight, Expand, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatArea, formatPriceVND, formatStatus } from "../utils/format.js";
import { getSafeImage } from "../utils/image.js";

function PropertyCard({ property }) {
  const location = [property?.district, property?.city].filter(Boolean).join(", ");
  const typeLabel = property?.type === "rent" ? "Cho thue" : "Mua ban";

  return (
    <article className="surface-card overflow-hidden rounded-3xl transition duration-500 hover:-translate-y-1">
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
        </div>

        <div className="space-y-4 p-5">
          <p className="text-2xl font-bold text-[var(--brand-gold-600)]">{formatPriceVND(property.price)}</p>
          <h3 className="line-clamp-2 text-lg font-bold text-[var(--brand-navy-900)]">{property.title}</h3>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={16} />
            {location || "Dang cap nhat vi tri"}
          </p>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Expand size={16} />
              {formatArea(property.area)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-navy-900)] px-4 py-2 text-sm font-semibold text-white transition duration-300 group-hover:scale-[1.02]">
              Xem chi tiet
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default PropertyCard;
