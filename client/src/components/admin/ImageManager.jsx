import { useMemo, useState } from "react";
import {
  addPropertyImages,
  deletePropertyImage,
  setPropertyCoverImage,
} from "../../services/adminApi.js";

function ImageManager({ propertyId, images = [], onChanged }) {
  const [imageUrlsInput, setImageUrlsInput] = useState("");
  const [coverIndex, setCoverIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const parsedUrls = useMemo(
    () =>
      imageUrlsInput
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [imageUrlsInput],
  );

  async function handleAddImages() {
    setError("");
    setMessage("");

    if (parsedUrls.length === 0) {
      setError("Vui lòng nhập ít nhất một URL ảnh.");
      return;
    }

    try {
      setLoading(true);
      const payload = parsedUrls.map((url, index) => ({
        image_url: url,
        is_cover: index === coverIndex,
        sort_order: index,
      }));
      await addPropertyImages(propertyId, payload);
      setMessage("Thêm ảnh thành công.");
      setImageUrlsInput("");
      setCoverIndex(0);
      await onChanged();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetCover(imageId) {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await setPropertyCoverImage(imageId);
      setMessage("Đã cập nhật ảnh đại diện.");
      await onChanged();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(imageId) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa ảnh này?");
    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");
      await deletePropertyImage(imageId);
      setMessage("Đã xóa ảnh.");
      await onChanged();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-2xl font-bold text-[#1f2e43]">Quản lý hình ảnh</h2>

      {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600">{message}</p> : null}

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            URL ảnh (mỗi dòng một URL)
          </label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-[#c7a15a]"
            placeholder="https://example.com/image-1.jpg"
            value={imageUrlsInput}
            onChange={(event) => setImageUrlsInput(event.target.value)}
          />
          {parsedUrls.length > 0 ? (
            <label className="mt-2 block text-sm text-slate-600">
              Chọn ảnh đại diện trong danh sách mới:
              <select
                className="ml-2 rounded-lg border border-slate-300 px-2 py-1"
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
          ) : null}
        </div>
        <div className="flex items-end">
          <button
            className="rounded-xl bg-[#1d2f49] px-5 py-3 font-semibold text-white transition hover:bg-[#152238] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={handleAddImages}
            type="button"
          >
            {loading ? "Đang thêm..." : "Thêm ảnh"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {images.length === 0 ? (
          <p className="text-slate-500">Chưa có ảnh nào cho bất động sản này.</p>
        ) : (
          images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-2xl border border-slate-200">
              <img className="h-40 w-full object-cover" src={image.image_url} alt={`Ảnh ${image.id}`} />
              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-slate-500">{image.image_url}</p>
                <div className="flex items-center justify-between gap-2">
                  <button
                    className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                      image.is_cover
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    type="button"
                    disabled={loading || image.is_cover}
                    onClick={() => handleSetCover(image.id)}
                  >
                    {image.is_cover ? "Ảnh đại diện" : "Đặt làm đại diện"}
                  </button>
                  <button
                    className="rounded-lg bg-red-50 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-100"
                    type="button"
                    disabled={loading}
                    onClick={() => handleDelete(image.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default ImageManager;

