import { Building2, MessageSquareText, PlusCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { clearAdminSession, getAdminUser } from "../../services/adminAuth.js";

function AdminShell({ title, subtitle, actions, children }) {
  const location = useLocation();
  const adminUser = getAdminUser();

  function handleLogout() {
    clearAdminSession();
    window.location.href = "/admin/login";
  }

  return (
    <section className="container-shell py-10">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#c7a15a]">Khu vực quản trị</p>
            <h1 className="mt-2 text-3xl font-bold text-[#1f2e43]">{title}</h1>
            {subtitle ? <p className="mt-2 text-slate-500">{subtitle}</p> : null}
          </div>

          <div className="flex items-center gap-2">
            {adminUser?.email ? (
              <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">{adminUser.email}</span>
            ) : null}
            <button
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              type="button"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
            {actions}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${
              location.pathname.startsWith("/admin/properties")
                ? "bg-[#1d2f49] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            to="/admin/properties"
          >
            <Building2 size={18} />
            Bất động sản
          </Link>

          <Link
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${
              location.pathname === "/admin/properties/create"
                ? "bg-[#1d2f49] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            to="/admin/properties/create"
          >
            <PlusCircle size={18} />
            Đăng tin mới
          </Link>

          <Link
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${
              location.pathname.startsWith("/admin/contacts")
                ? "bg-[#1d2f49] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            to="/admin/contacts"
          >
            <MessageSquareText size={18} />
            Tin nhắn liên hệ
          </Link>
        </div>
      </div>

      {children}
    </section>
  );
}

export default AdminShell;
