import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/adminAuth.js";

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/admin/properties";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      await loginAdmin(email, password);
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-shell py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-4xl font-extrabold text-[#1f2e43]">Đăng nhập quản trị</h1>
        <p className="mt-2 text-slate-500">Sử dụng email và mật khẩu để truy cập trang quản trị.</p>

        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#c7a15a]"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Mật khẩu</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#c7a15a]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            className="w-full rounded-xl bg-[#c7a15a] px-6 py-3 font-bold text-white transition hover:bg-[#b69252] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AdminLoginPage;
