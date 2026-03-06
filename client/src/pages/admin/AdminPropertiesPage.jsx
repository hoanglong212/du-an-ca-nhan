import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell.jsx";
import { deleteAdminProperty, fetchAdminProperties } from "../../services/adminApi.js";
import { formatArea, formatPriceVND } from "../../utils/format.js";

function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProperties() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminProperties();
      setProperties(data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  async function handleDelete(propertyId) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa tin này?");
    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      await deleteAdminProperty(propertyId);
      setMessage("Xóa tin thành công.");
      await loadProperties();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  return (
    <AdminShell
      title="Quản lý bất động sản"
      subtitle="Xem danh sách tin đăng, chỉnh sửa nội dung và cập nhật trạng thái."
      actions={
        <Link
          className="inline-flex items-center gap-2 rounded-xl bg-[#c7a15a] px-4 py-2 font-semibold text-white transition hover:bg-[#b69252]"
          to="/admin/properties/create"
        >
          <PlusCircle size={18} />
          Thêm tin mới
        </Link>
      }
    >
      {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p> : null}
      {message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600">{message}</p> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        {loading ? (
          <p className="p-6 text-slate-600">Đang tải dữ liệu...</p>
        ) : properties.length === 0 ? (
          <p className="p-6 text-slate-600">Chưa có bất động sản nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Tiêu đề</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Loại tin</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Giá</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Diện tích</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Vị trí</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Trạng thái</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Ảnh</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">Slug: {item.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.type === "rent" ? "Cho thuê" : "Bán"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatPriceVND(item.price)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatArea(item.area)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {[item.district, item.city].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.image_count || 0} ảnh</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                          to={`/admin/properties/${item.id}/edit`}
                        >
                          <Pencil size={14} />
                          Sửa
                        </Link>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                          type="button"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function StatusBadge({ status }) {
  const map = {
    available: { label: "Đang bán", className: "bg-emerald-100 text-emerald-700" },
    rented: { label: "Cho thuê", className: "bg-sky-100 text-sky-700" },
    sold: { label: "Đã bán", className: "bg-amber-100 text-amber-700" },
    hidden: { label: "Ẩn", className: "bg-slate-200 text-slate-700" },
  };

  const item = map[status] || { label: status || "Không rõ", className: "bg-slate-200 text-slate-700" };
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.className}`}>{item.label}</span>;
}

export default AdminPropertiesPage;

