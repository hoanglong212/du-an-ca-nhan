import { useEffect, useMemo, useState } from "react";

const DEFAULT_FORM = {
  title: "",
  slug: "",
  description: "",
  type: "sale",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  city: "",
  district: "",
  ward: "",
  address_text: "",
  lat: "",
  lng: "",
  category_id: "",
  status: "available",
  amenities_text: "",
};

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toAmenityText(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join("\n");
  }
  return String(value || "");
}

function PropertyForm({
  categories = [],
  initialValues = DEFAULT_FORM,
  onSubmit,
  submitLabel = "Lưu",
  loading = false,
}) {
  const [values, setValues] = useState({
    ...DEFAULT_FORM,
    ...initialValues,
    amenities_text: toAmenityText(initialValues?.amenities_text ?? initialValues?.amenities),
  });
  const [error, setError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const categoryOptions = useMemo(() => categories || [], [categories]);

  useEffect(() => {
    setValues({
      ...DEFAULT_FORM,
      ...initialValues,
      amenities_text: toAmenityText(initialValues?.amenities_text ?? initialValues?.amenities),
    });
  }, [initialValues]);

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const requiredFields = [
      "title",
      "slug",
      "type",
      "price",
      "area",
      "city",
      "district",
      "ward",
      "address_text",
      "category_id",
      "status",
    ];

    const missing = requiredFields.filter((field) => !String(values[field] ?? "").trim());
    if (missing.length > 0) {
      return `Vui lòng nhập đầy đủ các trường bắt buộc: ${missing.join(", ")}`;
    }

    if (Number(values.price) < 0 || Number(values.area) < 0) {
      return "Giá và diện tích phải lớn hơn hoặc bằng 0.";
    }

    return "";
  }

  async function handleGeocode() {
    const fullAddress = [values.address_text, values.ward, values.district, values.city]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(", ");

    if (!fullAddress) {
      setGeoError("Vui lòng nhập địa chỉ trước khi lấy tọa độ.");
      return;
    }

    try {
      setGeoLoading(true);
      setGeoError("");

      const params = new URLSearchParams({
        q: fullAddress,
        format: "jsonv2",
        limit: "1",
        countrycodes: "vn",
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Không thể lấy tọa độ lúc này.");
      }

      const rows = await response.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("Không tìm thấy tọa độ phù hợp cho địa chỉ này.");
      }

      const first = rows[0];
      setField("lat", Number(first.lat).toFixed(7));
      setField("lng", Number(first.lon).toFixed(7));
    } catch (geoFetchError) {
      setGeoError(geoFetchError.message || "Không thể lấy tọa độ lúc này.");
    } finally {
      setGeoLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    const amenities = values.amenities_text
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    await onSubmit({
      ...values,
      price: Number(values.price),
      area: Number(values.area),
      bedrooms: toNullableNumber(values.bedrooms),
      bathrooms: toNullableNumber(values.bathrooms),
      lat: toNullableNumber(values.lat),
      lng: toNullableNumber(values.lng),
      category_id: Number(values.category_id),
      amenities,
    });
  }

  return (
    <form className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
      <h2 className="mb-5 text-2xl font-bold text-[#1f2e43]">Thông tin bất động sản</h2>

      {error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Tiêu đề *">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
          />
        </Field>
        <Field label="Slug *">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.slug}
            onChange={(e) => setField("slug", e.target.value)}
          />
        </Field>
      </div>

      <Field className="mt-4" label="Mô tả">
        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </Field>

      <Field className="mt-4" label="Tiện ích (mỗi dòng một tiện ích)">
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
          placeholder={"Ví dụ:\nGần trường học\nKhu dân cư an ninh\nCó sân đậu xe"}
          value={values.amenities_text}
          onChange={(e) => setField("amenities_text", e.target.value)}
        />
      </Field>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Field label="Loại tin *">
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.type}
            onChange={(e) => setField("type", e.target.value)}
          >
            <option value="sale">Bán</option>
            <option value="rent">Cho thuê</option>
          </select>
        </Field>
        <Field label="Trạng thái *">
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="available">Đang mở bán</option>
            <option value="rented">Đang cho thuê</option>
            <option value="sold">Đã giao dịch</option>
            <option value="hidden">Ẩn tin</option>
          </select>
        </Field>
        <Field label="Danh mục *">
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.category_id}
            onChange={(e) => setField("category_id", e.target.value)}
          >
            <option value="">Chọn danh mục</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Field label="Giá *">
          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.price}
            onChange={(e) => setField("price", e.target.value)}
          />
        </Field>
        <Field label="Diện tích (m2) *">
          <input
            type="number"
            step="0.01"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.area}
            onChange={(e) => setField("area", e.target.value)}
          />
        </Field>
        <Field label="Phòng ngủ">
          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.bedrooms}
            onChange={(e) => setField("bedrooms", e.target.value)}
          />
        </Field>
        <Field label="Phòng tắm">
          <input
            type="number"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.bathrooms}
            onChange={(e) => setField("bathrooms", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field label="Thành phố *">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.city}
            onChange={(e) => setField("city", e.target.value)}
          />
        </Field>
        <Field label="Quận/Huyện *">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.district}
            onChange={(e) => setField("district", e.target.value)}
          />
        </Field>
        <Field label="Phường/Xã *">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.ward}
            onChange={(e) => setField("ward", e.target.value)}
          />
        </Field>
      </div>

      <Field className="mt-4" label="Địa chỉ chi tiết *">
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
          value={values.address_text}
          onChange={(e) => setField("address_text", e.target.value)}
        />
      </Field>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Vĩ độ (lat)">
          <input
            type="number"
            step="0.0000001"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.lat}
            onChange={(e) => setField("lat", e.target.value)}
          />
        </Field>
        <Field label="Kinh độ (lng)">
          <input
            type="number"
            step="0.0000001"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            value={values.lng}
            onChange={(e) => setField("lng", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={geoLoading}
          type="button"
          onClick={handleGeocode}
        >
          {geoLoading ? "Đang lấy tọa độ..." : "Lấy tọa độ từ địa chỉ"}
        </button>
        <span className="text-xs text-slate-500">Có thể để trống lat/lng nếu chưa cần hiển thị bản đồ.</span>
      </div>
      {geoError ? <p className="mt-2 text-sm font-medium text-amber-700">{geoError}</p> : null}

      <button
        className="mt-6 rounded-xl bg-[#c7a15a] px-6 py-3 font-bold text-white transition hover:bg-[#b69252] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Đang xử lý..." : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export default PropertyForm;
