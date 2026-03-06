import { Home, Menu, Phone } from "lucide-react";
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
      setIsScrolled(window.scrollY > 10);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur transition-shadow duration-300 ${
        isScrolled ? "shadow-[0_8px_30px_rgba(15,31,58,0.10)]" : ""
      }`}
    >
      <div className="container-shell flex h-24 items-center justify-between">
        <Link className="flex items-center gap-4" to="/">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-700 text-[#d2b06a] shadow-soft">
            <Home size={24} />
          </span>
          <span>
            <strong className="block text-2xl font-bold text-slate-800">{SITE_CONFIG.shortBrandName}</strong>
            <small className="text-xs font-bold uppercase tracking-[0.06em] text-[#c7a15a]">Đơn vị gia đình uy tín</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-lg font-semibold transition ${isActive ? "text-slate-900" : "text-slate-700 hover:text-slate-900"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            className="inline-flex items-center gap-2 rounded-2xl bg-[#c7a15a] px-8 py-4 text-xl font-bold text-white shadow-soft transition duration-300 hover:scale-[1.02] hover:bg-[#b8924f] hover:shadow-[0_0_24px_rgba(199,161,90,0.35)]"
            href={`tel:${SITE_CONFIG.phoneRaw}`}
          >
            <Phone size={20} />
            Gọi ngay
          </a>
        </div>

        <button
          className="rounded-xl border border-slate-300 p-3 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          type="button"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-shell py-4">
            <div className="flex flex-col gap-3">
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
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#c7a15a] px-4 py-3 font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(199,161,90,0.35)]"
                href={`tel:${SITE_CONFIG.phoneRaw}`}
              >
                <Phone size={18} />
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
