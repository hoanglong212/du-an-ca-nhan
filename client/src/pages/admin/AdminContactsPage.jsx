import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell.jsx";
import { fetchAdminContacts, updateAdminContactStatus } from "../../services/adminApi.js";

function AdminContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadContacts() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminContacts();
      setContacts(data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  async function handleStatusChange(contactId, status) {
    try {
      setUpdatingId(contactId);
      setError("");
      setMessage("");
      await updateAdminContactStatus(contactId, status);
      setMessage("Cập nhật trạng thái thành công.");
      await loadContacts();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminShell
      title="Tin nhắn liên hệ"
      subtitle="Xem và xử lý các yêu cầu tư vấn từ khách hàng."
      actions={
        <Link
          className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-200"
          to="/admin/properties"
        >
          Quản lý bất động sản
        </Link>
      }
    >
      {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p> : null}
      {message ? (
        <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600">{message}</p>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        {loading ? (
          <p className="p-6 text-slate-600">Đang tải danh sách liên hệ...</p>
        ) : contacts.length === 0 ? (
          <p className="p-6 text-slate-600">Chưa có tin nhắn liên hệ nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Khách hàng</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Liên hệ</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Bất động sản</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Nội dung</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Thời gian</th>
                  <th className="px-4 py-3 text-sm font-semibold text-slate-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">Mã liên hệ: #{item.id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p>{item.phone}</p>
                      <p className="text-slate-500">{item.email || "Không có email"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {item.property_id ? (
                        <>
                          <p className="font-semibold">{item.property_title || `ID ${item.property_id}`}</p>
                          {item.property_slug ? (
                            <p className="text-xs text-slate-500">Slug: {item.property_slug}</p>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-slate-500">Liên hệ chung</span>
                      )}
                    </td>
                    <td className="max-w-[320px] px-4 py-3 text-sm text-slate-700">
                      <p className="line-clamp-3">{item.message || "Không có nội dung."}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatDateTime(item.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#c7a15a] disabled:opacity-60"
                        disabled={updatingId === item.id}
                        value={item.status || "new"}
                        onChange={(event) => handleStatusChange(item.id, event.target.value)}
                      >
                        <option value="new">Mới</option>
                        <option value="contacted">Đã liên hệ</option>
                        <option value="closed">Đã chốt</option>
                      </select>
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

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default AdminContactsPage;
