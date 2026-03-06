import { Facebook, Mail, MapPin, MessageCircleMore, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../constants/site.js";

function Footer() {
  return (
    <footer className="mt-16 bg-[#1d2f49] text-slate-100">
      <div className="container-shell py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#c7a15a] text-[#1d2f49]">
                <MapPin size={20} />
              </span>
              <h3 className="text-3xl font-bold">{SITE_CONFIG.shortBrandName}</h3>
            </div>
            <p className="max-w-sm text-slate-300">
              {SITE_CONFIG.brandName} đồng hành để bạn tìm được bất động sản phù hợp với sự an tâm và minh bạch.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-xl font-bold text-[#d2b06a]">Liên kết nhanh</h4>
            <div className="space-y-3">
              <Link className="block transition-colors hover:text-white" to="/">
                Trang chủ
              </Link>
              <Link className="block transition-colors hover:text-white" to="/properties">
                Bất động sản
              </Link>
              <Link className="block transition-colors hover:text-white" to="/contact">
                Liên hệ
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xl font-bold text-[#d2b06a]">Loại hình bất động sản</h4>
            <ul className="space-y-3 text-slate-200">
              <li>Biệt thự cao cấp</li>
              <li>Nhà phố gia đình</li>
              <li>Căn hộ</li>
              <li>Nhà liền kề</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-xl font-bold text-[#d2b06a]">Liên hệ</h4>
            <div className="space-y-4 text-slate-200">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5" size={18} />
                {SITE_CONFIG.officeAddress}, {SITE_CONFIG.officeCity}
              </p>
              <a className="flex items-center gap-3 hover:text-white" href={`tel:${SITE_CONFIG.phoneRaw}`}>
                <Phone size={18} />
                {SITE_CONFIG.phoneDisplay}
              </a>
              <a className="flex items-center gap-3 hover:text-white" href={`mailto:${SITE_CONFIG.email}`}>
                <Mail size={18} />
                {SITE_CONFIG.email}
              </a>
            </div>
            <div className="mt-6 flex gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#c7a15a] text-[#1d2f49]">
                <Facebook size={18} />
              </span>
              <a
                className="grid h-11 w-11 place-items-center rounded-full bg-[#c7a15a] text-[#1d2f49]"
                href={SITE_CONFIG.zaloUrl}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircleMore size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8 text-center text-slate-400">
          © 2026 {SITE_CONFIG.shortBrandName}. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
