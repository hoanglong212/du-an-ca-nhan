import { Facebook, Mail, MapPin, MessageCircleMore, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../constants/site.js";

function Footer() {
  return (
    <footer className="mt-16 bg-[linear-gradient(145deg,#0f1f3a,#132b4f)] text-slate-100">
      <div className="container-shell py-16">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-gold-500)] text-[var(--brand-navy-900)]">
                <MapPin size={18} />
              </span>
              <h3 className="text-2xl font-bold">{SITE_CONFIG.shortBrandName}</h3>
            </div>
            <p className="max-w-sm text-sm text-slate-300">
              {SITE_CONFIG.brandName} đồng hành để bạn tìm được bất động sản phù hợp với sự an tâm và minh bạch.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-base font-bold text-[var(--brand-gold-300)]">Liên kết nhanh</h4>
            <div className="space-y-2 text-sm">
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
            <h4 className="mb-5 text-base font-bold text-[var(--brand-gold-300)]">Loại hình tiêu biểu</h4>
            <ul className="space-y-2 text-sm text-slate-200">
              <li>Biệt thự cao cấp</li>
              <li>Nhà phố gia đình</li>
              <li>Căn hộ</li>
              <li>Nhà liền kề</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-base font-bold text-[var(--brand-gold-300)]">Liên hệ</h4>
            <div className="space-y-3 text-sm text-slate-200">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5" size={16} />
                {SITE_CONFIG.officeAddress}, {SITE_CONFIG.officeCity}
              </p>
              <a className="flex items-center gap-3 hover:text-white" href={`tel:${SITE_CONFIG.phoneRaw}`}>
                <Phone size={16} />
                {SITE_CONFIG.phoneDisplay}
              </a>
              <a className="flex items-center gap-3 hover:text-white" href={`mailto:${SITE_CONFIG.email}`}>
                <Mail size={16} />
                {SITE_CONFIG.email}
              </a>
            </div>
            <div className="mt-6 flex gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-gold-500)] text-[var(--brand-navy-900)]">
                <Facebook size={16} />
              </span>
              <a
                className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-gold-500)] text-[var(--brand-navy-900)]"
                href={SITE_CONFIG.zaloUrl}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircleMore size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8 text-center text-xs text-slate-400">
          © 2026 {SITE_CONFIG.shortBrandName}. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
