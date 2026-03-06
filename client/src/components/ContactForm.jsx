import { Mail, MessageSquare, Phone, User } from "lucide-react";
import { useState } from "react";
import { submitContact } from "../services/api.js";

function ContactForm({
  propertyId = null,
  title = "Gửi thông tin liên hệ",
  subtitle = "Để lại thông tin, đội ngũ tư vấn sẽ liên hệ với bạn trong thời gian sớm nhất.",
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function onChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }

    try {
      setLoading(true);
      await submitContact({
        property_id: propertyId,
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        message: formData.message.trim() || null,
      });
      setSuccessMessage("Gửi thông tin thành công.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setErrorMessage(error.message || "Không thể gửi thông tin lúc này.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
      <h3 className="text-4xl font-bold text-[#1f2e43]">{title}</h3>
      <p className="mt-2 text-slate-500">{subtitle}</p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-slate-700">
          Họ và tên
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3">
            <User size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent outline-none"
              name="name"
              onChange={onChange}
              placeholder="Nhập họ tên"
              value={formData.name}
            />
          </div>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3">
              <Mail size={18} className="text-slate-400" />
              <input
                className="w-full bg-transparent outline-none"
                name="email"
                onChange={onChange}
                placeholder="your@email.com"
                type="email"
                value={formData.email}
              />
            </div>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Số điện thoại
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3">
              <Phone size={18} className="text-slate-400" />
              <input
                className="w-full bg-transparent outline-none"
                name="phone"
                onChange={onChange}
                placeholder="+84 123 456 789"
                value={formData.phone}
              />
            </div>
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Nội dung
          <div className="mt-2 flex items-start gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3">
            <MessageSquare size={18} className="mt-1 text-slate-400" />
            <textarea
              className="min-h-36 w-full bg-transparent outline-none"
              name="message"
              onChange={onChange}
              placeholder="Nhu cầu của bạn..."
              value={formData.message}
            />
          </div>
        </label>

        {errorMessage ? <p className="text-sm font-semibold text-red-600">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm font-semibold text-emerald-600">{successMessage}</p> : null}

        <button
          className="w-full rounded-2xl bg-[#c7a15a] px-6 py-4 text-lg font-bold text-white transition duration-300 hover:scale-[1.02] hover:bg-[#b8924f] hover:shadow-[0_0_24px_rgba(199,161,90,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Đang gửi..." : "Gửi tin nhắn"}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;

