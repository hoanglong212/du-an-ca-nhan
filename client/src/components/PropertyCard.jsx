import { ArrowRight, Expand, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatArea, formatPriceVND, formatStatus } from "../utils/format.js";
import { getSafeImage } from "../utils/image.js";

function PropertyCard({ property }) {
  const location = [property?.district, property?.city].filter(Boolean).join(", ");

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,31,58,0.16)]">
      <Link className="group block" to={`/properties/${property.slug}`}>
        <div className="relative h-72 overflow-hidden">
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
          <span className="absolute left-6 top-6 rounded-full bg-[#c7a15a] px-5 py-2 text-xl font-bold text-white">
            {formatStatus(property.status)}
          </span>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-4xl font-bold text-[#c7a15a]">{formatPriceVND(property.price)}</p>
          <h3 className="text-2xl font-bold text-[#1f2e43]">{property.title}</h3>
          <p className="flex items-center gap-2 text-slate-500">
            <MapPin size={18} />
            {location || "Đang cập nhật vị trí"}
          </p>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="inline-flex items-center gap-2 text-slate-600">
              <Expand size={18} />
              {formatArea(property.area)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-[#1d2f49] px-5 py-3 font-semibold text-white transition duration-300 group-hover:scale-[1.02]">
              Xem chi tiết
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default PropertyCard;

