import { Clock3, Mail, MapPin, MessageCircleMore, Phone } from "lucide-react";
import ContactForm from "../components/ContactForm.jsx";
import RevealSection from "../components/RevealSection.jsx";
import { SITE_CONFIG } from "../constants/site.js";

function ContactPage() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(`${SITE_CONFIG.officeAddress}, ${SITE_CONFIG.officeCity}`)}&output=embed`;

  return (
    <section className="container-shell py-20">
      <RevealSection className="mx-auto mb-14 max-w-5xl text-center">
        <h1 className="text-6xl font-extrabold text-[#1f2e43] md:text-7xl">Liên hệ với chúng tôi</h1>
        <p className="mt-5 text-3xl text-slate-500">
          Cần hỗ trợ? Gọi điện, gửi email hoặc nhắn tin Zalo để được tư vấn nhanh.
        </p>
      </RevealSection>

      <RevealSection className="grid gap-7 xl:grid-cols-[1.45fr_1fr]">
        <ContactForm propertyId={null} />

        <div className="space-y-6">
          <div className="rounded-3xl bg-[#1d2f49] p-8 text-white shadow-soft">
            <h2 className="mb-5 text-4xl font-bold">Liên hệ nhanh</h2>
            <div className="space-y-4">
              <QuickItem icon={Phone} title="Điện thoại" value={SITE_CONFIG.phoneDisplay} subtitle="Thứ 2 - Thứ 7: 8:00 - 18:00" href={`tel:${SITE_CONFIG.phoneRaw}`} />
              <QuickItem icon={Mail} title="Email" value={SITE_CONFIG.email} subtitle="Phản hồi trong 24h" href={`mailto:${SITE_CONFIG.email}`} />
              <QuickItem icon={MessageCircleMore} title="Zalo" value="Nhắn tin với chúng tôi" subtitle="Phản hồi nhanh" href={SITE_CONFIG.zaloUrl} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <h3 className="mb-4 flex items-center gap-3 text-4xl font-bold text-[#1f2e43]">
              <Clock3 className="text-[#c7a15a]" size={28} />
              Giờ làm việc
            </h3>
            <div className="space-y-2 text-xl text-slate-600">
              <p className="flex justify-between">
                <span>Thứ 2 - Thứ 6</span>
                <span>8:00 - 18:00</span>
              </p>
              <p className="flex justify-between">
                <span>Thứ 7</span>
                <span>9:00 - 17:00</span>
              </p>
              <p className="flex justify-between">
                <span>Chủ nhật</span>
                <span>Hẹn trước</span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <h3 className="mb-4 flex items-center gap-3 text-4xl font-bold text-[#1f2e43]">
              <MapPin className="text-[#c7a15a]" size={28} />
              Văn phòng
            </h3>
            <p className="text-xl text-slate-600">{SITE_CONFIG.officeAddress}</p>
            <p className="text-xl text-slate-600">{SITE_CONFIG.officeCity}</p>
            <p className="text-xl text-slate-600">{SITE_CONFIG.officeCountry}</p>

            <div className="mt-5 h-64 overflow-hidden rounded-2xl border border-slate-200">
              <iframe title="Bản đồ văn phòng" className="h-full w-full" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}

function QuickItem({ icon, title, value, subtitle, href }) {
  const IconComponent = icon;

  return (
    <a className="block rounded-2xl bg-white/12 p-4 transition duration-300 hover:bg-white/18" href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c7a15a] text-white">
          <IconComponent size={22} />
        </span>
        <div>
          <h4 className="text-2xl font-bold">{title}</h4>
          <p className="text-xl">{value}</p>
          <p className="text-slate-300">{subtitle}</p>
        </div>
      </div>
    </a>
  );
}

export default ContactPage;
