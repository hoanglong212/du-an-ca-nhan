import { Link } from "react-router-dom";

const VARIANT_CLASS = {
  primary:
    "bg-[#0f1f3a] text-white hover:bg-[#1a2f54] shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-[#0f1f3a] border border-slate-200 hover:border-[#c7a15a] hover:text-[#9a7a41]",
  gold: "bg-[#c7a15a] text-white hover:bg-[#b28d49] shadow-sm hover:shadow-md",
};

function Button({
  children,
  to,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const baseClass =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200";
  const colorClass = VARIANT_CLASS[variant] || VARIANT_CLASS.primary;
  const mergedClass = `${baseClass} ${colorClass} ${className}`.trim();

  if (to) {
    return (
      <Link className={mergedClass} to={to} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={mergedClass} type={type} {...props}>
      {children}
    </button>
  );
}

export default Button;

