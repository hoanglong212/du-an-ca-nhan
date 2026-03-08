export function formatPriceVND(price) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return "Gia lien he";
  }

  const value = Number(price);

  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `${stripDecimal(billions)} ty`;
  }

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${stripDecimal(millions)} trieu`;
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
}

export function formatArea(area) {
  if (area === null || area === undefined || Number.isNaN(Number(area))) {
    return "Dang cap nhat";
  }

  return `${stripDecimal(Number(area))} m2`;
}

export function formatLocation(property) {
  const parts = [property?.ward, property?.district, property?.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Dang cap nhat dia chi";
}

export function formatStatus(status) {
  if (!status) return "Dang cap nhat";

  const map = {
    available: "Dang mo ban",
    sold: "Da ban",
    rented: "Da cho thue",
    hidden: "Tam an",
  };

  return map[String(status).toLowerCase()] || status;
}

function stripDecimal(numberValue) {
  return Number(numberValue).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}
