import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageManager from "../../components/admin/ImageManager.jsx";
import AdminShell from "../../components/admin/AdminShell.jsx";
import PropertyForm from "../../components/admin/PropertyForm.jsx";
import {
  fetchAdminPropertyById,
  fetchCategories,
  updateAdminProperty,
} from "../../services/adminApi.js";

function AdminEditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadPropertyDetail() {
    try {
      setLoading(true);
      setError("");
      const [categoryData, propertyData] = await Promise.all([
        fetchCategories(),
        fetchAdminPropertyById(id),
      ]);
      setCategories(categoryData);
      setProperty(propertyData);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPropertyDetail();
  }, [id]);

  const initialValues = useMemo(() => {
    if (!property) return undefined;
    return {
      title: property.title ?? "",
      slug: property.slug ?? "",
      description: property.description ?? "",
      type: property.type ?? "sale",
      price: property.price ?? "",
      area: property.area ?? "",
      bedrooms: property.bedrooms ?? "",
      bathrooms: property.bathrooms ?? "",
      city: property.city ?? "",
      district: property.district ?? "",
      ward: property.ward ?? "",
      address_text: property.address_text ?? "",
      lat: property.lat ?? "",
      lng: property.lng ?? "",
      category_id: property.category_id ?? "",
      status: property.status ?? "available",
      amenities: property.amenities ?? [],
    };
  }, [property]);

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await updateAdminProperty(id, payload);
      setMessage("Cập nhật tin thành công.");
      await loadPropertyDetail();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Chỉnh sửa tin"
      subtitle="Cập nhật thông tin và quản lý hình ảnh cho bất động sản."
      actions={
        <button
          className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
          type="button"
          onClick={() => navigate("/admin/properties")}
        >
          Quay lại danh sách
        </button>
      }
    >
      {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p> : null}
      {message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600">{message}</p> : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">Đang tải dữ liệu...</div>
      ) : property ? (
        <div className="space-y-6">
          <PropertyForm
            key={property.id}
            categories={categories}
            initialValues={initialValues}
            loading={saving}
            onSubmit={handleSubmit}
            submitLabel="Lưu thay đổi"
          />
          <ImageManager propertyId={property.id} images={property.images || []} onChanged={loadPropertyDetail} />
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          Không tìm thấy bất động sản.
        </div>
      )}
    </AdminShell>
  );
}

export default AdminEditPropertyPage;
