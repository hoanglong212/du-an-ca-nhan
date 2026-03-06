export function formatPriceVND(price) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return "Giá liên hệ";
  }

  const value = Number(price);

  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `${stripDecimal(billions)} tỷ`;
  }

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${stripDecimal(millions)} triệu`;
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
}

export function formatArea(area) {
  if (area === null || area === undefined || Number.isNaN(Number(area))) {
    return "Đang cập nhật";
  }

  return `${stripDecimal(Number(area))} m2`;
}

export function formatLocation(property) {
  const parts = [property?.ward, property?.district, property?.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Đang cập nhật địa chỉ";
}

export function formatStatus(status) {
  if (!status) return "Đang cập nhật";

  const map = {
    available: "Bán",
    sold: "Đã bán",
    rented: "Cho thuê",
    hidden: "Tạm ẩn",
  };

  return map[String(status).toLowerCase()] || status;
}

function stripDecimal(numberValue) {
  return Number(numberValue).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

