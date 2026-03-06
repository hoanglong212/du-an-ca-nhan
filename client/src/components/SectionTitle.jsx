function SectionTitle({ eyebrow, title, subtitle, centered = false, light = false }) {
  const alignClass = centered ? "text-center mx-auto" : "text-left";
  const titleClass = light ? "text-white" : "text-[#0f1f3a]";
  const subtitleClass = light ? "text-slate-200" : "text-slate-600";
  const eyebrowClass = light ? "text-[#f5eddc]" : "text-[#9a7a41]";

  return (
    <div className={`mb-8 max-w-2xl ${alignClass}`}>
      {eyebrow ? (
        <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${eyebrowClass}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-semibold leading-tight md:text-4xl ${titleClass}`}>{title}</h2>
      {subtitle ? <p className={`mt-3 ${subtitleClass}`}>{subtitle}</p> : null}
    </div>
  );
}

export default SectionTitle;
