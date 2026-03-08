import { Building2, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { SITE_CONFIG } from "../constants/site.js";

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/properties", label: "Bất động sản" },
  { to: "/contact", label: "Liên hệ" },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function onResize() {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl transition-shadow duration-300 ${
        isScrolled ? "shadow-[0_12px_28px_rgba(15,31,58,0.10)]" : ""
      }`}
    >
      <div className="container-shell flex h-20 items-center justify-between">
        <Link className="flex items-center gap-3" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-navy-900)] text-[var(--brand-gold-300)]">
            <Building2 size={20} />
          </span>
          <span>
            <strong className="block text-lg font-bold text-slate-800">{SITE_CONFIG.shortBrandName}</strong>
            <small className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-gold-600)]">
              Tư vấn nhà đất
            </small>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${isActive ? "text-[var(--brand-navy-900)]" : "text-slate-600 hover:text-[var(--brand-navy-900)]"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-gold-500)] px-5 py-3 text-sm font-bold text-white shadow-soft transition duration-300 hover:scale-[1.02] hover:bg-[var(--brand-gold-600)]"
            href={`tel:${SITE_CONFIG.phoneRaw}`}
          >
            <Phone size={16} />
            Gọi ngay
          </a>
        </div>

        <button
          className="rounded-xl border border-slate-300 p-2.5 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          type="button"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-shell py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 font-semibold ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-700"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <a
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-gold-500)] px-4 py-3 text-sm font-semibold text-white"
                href={`tel:${SITE_CONFIG.phoneRaw}`}
              >
                <Phone size={16} />
                Gọi ngay
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
