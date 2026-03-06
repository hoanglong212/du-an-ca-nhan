import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell.jsx";
import PropertyForm from "../../components/admin/PropertyForm.jsx";
import { addPropertyImages, createAdminProperty, fetchCategories } from "../../services/adminApi.js";

function AdminCreatePropertyPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [imageUrlsInput, setImageUrlsInput] = useState("");
  const [coverIndex, setCoverIndex] = useState(0);

  const parsedUrls = useMemo(
    () =>
      imageUrlsInput
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [imageUrlsInput],
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (apiError) {
        setError(apiError.message);
      }
    }

    loadCategories();
  }, []);

  async function handleSubmit(propertyPayload) {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const result = await createAdminProperty(propertyPayload);
      const propertyId = result.property_id;

      if (parsedUrls.length > 0) {
        const images = parsedUrls.map((url, index) => ({
          image_url: url,
          is_cover: index === coverIndex,
          sort_order: index,
        }));
        await addPropertyImages(propertyId, images);
      }

      setMessage("Đăng tin mới thành công.");
      setTimeout(() => {
        navigate("/admin/properties");
      }, 700);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell title="Đăng tin mới" subtitle="Nhập thông tin đầy đủ để đăng bất động sản lên hệ thống.">
      {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p> : null}
      {message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600">{message}</p> : null}

      <div className="space-y-6">
        <PropertyForm categories={categories} loading={loading} onSubmit={handleSubmit} submitLabel="Lưu tin mới" />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-2xl font-bold text-[#1f2e43]">Hình ảnh ban đầu</h2>

          <label className="mb-2 block text-sm font-semibold text-slate-700">URL ảnh (mỗi dòng một URL)</label>
          <textarea
            className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            placeholder="https://example.com/anh-1.jpg"
            value={imageUrlsInput}
            onChange={(event) => setImageUrlsInput(event.target.value)}
          />

          {parsedUrls.length > 0 ? (
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
              Ảnh đại diện:
              <select
                className="rounded-lg border border-slate-300 px-2 py-1"
                value={coverIndex}
                onChange={(event) => setCoverIndex(Number(event.target.value))}
              >
                {parsedUrls.map((_, index) => (
                  <option key={index} value={index}>
                    Ảnh {index + 1}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Bạn có thể thêm ảnh URL sau khi tạo tin.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

export default AdminCreatePropertyPage;
