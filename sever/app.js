import cors from "cors";
import crypto from "crypto";
import express from "express";
import pool from "./db.js";

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
  }),
);
app.use(express.json({ limit: "1mb" }));

const STATUS_VALUES = new Set(["available", "sold", "rented", "hidden"]);
const PUBLIC_STATUS_VALUES = new Set(["available", "sold", "rented"]);
const TYPE_VALUES = new Set(["sale", "rent"]);
const CONTACT_STATUS_VALUES = new Set(["new", "contacted", "closed"]);
const SORT_OPTIONS = {
  newest: "p.created_at DESC",
  oldest: "p.created_at ASC",
  price_asc: "p.price ASC, p.created_at DESC",
  price_desc: "p.price DESC, p.created_at DESC",
  area_asc: "p.area ASC, p.created_at DESC",
  area_desc: "p.area DESC, p.created_at DESC",
};

const ADMIN_TOKEN_SECRET =
  process.env.ADMIN_TOKEN_SECRET || "change-this-secret-in-env";
const ADMIN_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

let hasAmenitiesColumn = null;

function asyncHandler(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

function cleanText(value) {
  return String(value || "").trim();
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(
  value,
  defaultValue = null,
  { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {},
) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return defaultValue;
  return Math.max(min, Math.min(max, parsed));
}

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  return ["1", "true", "yes", "y", "on"].includes(
    String(value).toLowerCase().trim(),
  );
}

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(String(value || ""))
    .digest("hex");
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const normalized = String(input || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signAdminToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(
    crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(unsigned).digest(),
  );
  return `${unsigned}.${signature}`;
}

function verifyAdminToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64UrlEncode(
    crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(unsigned).digest(),
  );

  if (!safeEqual(expectedSignature, providedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.exp || Date.now() >= Number(payload.exp) * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

function extractBearerToken(req) {
  const authHeader = cleanText(req.headers.authorization);
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

function requireAdmin(req, res, next) {
  const token = extractBearerToken(req);
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res
      .status(401)
      .json({ error: "Phien dang nhap khong hop le hoac da het han." });
  }

  req.adminUser = payload;
  return next();
}

function comparePassword(inputPassword, storedHash) {
  const input = String(inputPassword || "");
  const stored = String(storedHash || "");
  if (!stored) return false;
  if (stored === input) return true;
  return safeEqual(stored, sha256(input));
}

async function ensureAmenitiesColumnFlag() {
  if (hasAmenitiesColumn !== null) return hasAmenitiesColumn;

  try {
    const [rows] = await pool.query(
      "SHOW COLUMNS FROM properties LIKE 'amenities'",
    );
    hasAmenitiesColumn = rows.length > 0;
  } catch (error) {
    console.error("Detect amenities column error:", error);
    hasAmenitiesColumn = false;
  }

  return hasAmenitiesColumn;
}

function normalizeStatus(input) {
  if (!input) return "available";
  const value = String(input).toLowerCase().trim();

  const map = {
    available: "available",
    sold: "sold",
    rented: "rented",
    hidden: "hidden",
    dang_ban: "available",
    cho_thue: "rented",
    da_ban: "sold",
    an: "hidden",
  };

  return map[value] || value;
}

function normalizeType(input) {
  if (!input) return "sale";
  const value = String(input).toLowerCase().trim();

  const map = {
    sale: "sale",
    rent: "rent",
    ban: "sale",
    chothue: "rent",
    cho_thue: "rent",
  };

  return map[value] || value;
}

function normalizeAmenities(body = {}) {
  const { amenities } = body;

  if (Array.isArray(amenities)) {
    return amenities.map((item) => cleanText(item)).filter(Boolean);
  }

  if (typeof amenities === "string") {
    return amenities
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function serializeAmenities(amenities = []) {
  return JSON.stringify(amenities);
}

function parseAmenities(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }

  const text = cleanText(value);
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => cleanText(item)).filter(Boolean);
    }
  } catch {
    // Ignore and fallback to text format
  }

  return text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPropertyPayload(body = {}) {
  return {
    title: cleanText(body.title),
    description: cleanText(body.description) || null,
    slug: cleanText(body.slug),
    type: normalizeType(body.type),
    price: toNullableNumber(body.price),
    area: toNullableNumber(body.area),
    bedrooms: toNullableNumber(body.bedrooms),
    bathrooms: toNullableNumber(body.bathrooms),
    city: cleanText(body.city),
    district: cleanText(body.district),
    ward: cleanText(body.ward),
    address_text: cleanText(body.address_text),
    lat: toNullableNumber(body.lat),
    lng: toNullableNumber(body.lng),
    category_id: toNullableNumber(body.category_id),
    status: normalizeStatus(body.status),
  };
}

function validatePropertyPayload(payload) {
  const missing = [];
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

  requiredFields.forEach((field) => {
    const value = payload[field];
    if (value === null || value === undefined || value === "") {
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    return `Thieu truong bat buoc: ${missing.join(", ")}`;
  }

  if (!TYPE_VALUES.has(payload.type)) {
    return "Loai tin khong hop le. Chi chap nhan: sale, rent.";
  }

  if (!STATUS_VALUES.has(payload.status)) {
    return "Trang thai khong hop le. Chi chap nhan: available, sold, rented, hidden.";
  }

  if (payload.price < 0 || payload.area < 0) {
    return "Gia va dien tich phai lon hon hoac bang 0.";
  }

  return null;
}

function normalizeImageList(body = {}) {
  const { images, image_url, is_cover, sort_order } = body;

  if (Array.isArray(images)) {
    return images
      .map((item, index) => ({
        image_url: cleanText(item?.image_url),
        is_cover: Boolean(item?.is_cover),
        sort_order: toInteger(item?.sort_order, index, { min: 0, max: 10_000 }),
      }))
      .filter((item) => item.image_url);
  }

  if (image_url) {
    return [
      {
        image_url: cleanText(image_url),
        is_cover: Boolean(is_cover),
        sort_order: toInteger(sort_order, 0, { min: 0, max: 10_000 }),
      },
    ];
  }

  return [];
}

function buildContactPayload(body = {}) {
  return {
    property_id: toInteger(body.property_id, null, { min: 1 }),
    name: cleanText(body.name),
    email: cleanText(body.email) || null,
    phone: cleanText(body.phone),
    message: cleanText(body.message) || null,
  };
}

function validateContactPayload(payload) {
  if (!payload.name || !payload.phone) {
    return "Name va phone la bat buoc.";
  }

  if (payload.name.length < 2) {
    return "Ten qua ngan.";
  }

  if (!/^[0-9+\s().-]{8,20}$/.test(payload.phone)) {
    return "So dien thoai khong hop le.";
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Email khong hop le.";
  }

  return null;
}

function parseSort(value) {
  const key = String(value || "newest").toLowerCase();
  return SORT_OPTIONS[key] ? key : "newest";
}

function parsePagination(query = {}) {
  const page = toInteger(query.page, 1, { min: 1, max: 5000 });
  const limit = toInteger(query.limit, 12, { min: 1, max: 60 });
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function buildPublicPropertyFilter(query = {}) {
  const clauses = ["p.status <> 'hidden'"];
  const params = [];

  const q = cleanText(query.q);
  if (q) {
    const like = `%${q}%`;
    clauses.push(
      "(p.title LIKE ? OR p.description LIKE ? OR p.address_text LIKE ?)",
    );
    params.push(like, like, like);
  }

  const location = cleanText(query.location);
  if (location) {
    const like = `%${location}%`;
    clauses.push("(p.city LIKE ? OR p.district LIKE ? OR p.ward LIKE ?)");
    params.push(like, like, like);
  }

  const city = cleanText(query.city);
  if (city) {
    clauses.push("p.city LIKE ?");
    params.push(`%${city}%`);
  }

  const district = cleanText(query.district);
  if (district) {
    clauses.push("p.district LIKE ?");
    params.push(`%${district}%`);
  }

  const type = normalizeType(query.type);
  if (cleanText(query.type) && TYPE_VALUES.has(type)) {
    clauses.push("p.type = ?");
    params.push(type);
  }

  const status = normalizeStatus(query.status);
  if (cleanText(query.status) && PUBLIC_STATUS_VALUES.has(status)) {
    clauses.push("p.status = ?");
    params.push(status);
  }

  const categoryId = toInteger(query.category_id, null, { min: 1 });
  if (categoryId !== null) {
    clauses.push("p.category_id = ?");
    params.push(categoryId);
  }

  const minPrice = toNullableNumber(query.minPrice);
  if (minPrice !== null) {
    clauses.push("p.price >= ?");
    params.push(minPrice);
  }

  const maxPrice = toNullableNumber(query.maxPrice);
  if (maxPrice !== null) {
    clauses.push("p.price <= ?");
    params.push(maxPrice);
  }

  const minArea = toNullableNumber(query.minArea);
  if (minArea !== null) {
    clauses.push("p.area >= ?");
    params.push(minArea);
  }

  const maxArea = toNullableNumber(query.maxArea);
  if (maxArea !== null) {
    clauses.push("p.area <= ?");
    params.push(maxArea);
  }

  const bedrooms = toInteger(query.bedrooms, null, { min: 0 });
  if (bedrooms !== null) {
    clauses.push("COALESCE(p.bedrooms, 0) >= ?");
    params.push(bedrooms);
  }

  const bathrooms = toInteger(query.bathrooms, null, { min: 0 });
  if (bathrooms !== null) {
    clauses.push("COALESCE(p.bathrooms, 0) >= ?");
    params.push(bathrooms);
  }

  if (toBoolean(query.includeHidden, false)) {
    const visibleIndex = clauses.indexOf("p.status <> 'hidden'");
    if (visibleIndex >= 0) {
      clauses.splice(visibleIndex, 1);
    }
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

async function ensurePropertyExists(connection, propertyId) {
  const [rows] = await connection.query(
    "SELECT id FROM properties WHERE id = ? LIMIT 1",
    [propertyId],
  );
  return rows.length > 0;
}

async function ensureCoverImage(connection, propertyId) {
  const [[coverRow]] = await connection.query(
    "SELECT COUNT(*) AS cover_count FROM property_images WHERE property_id = ? AND is_cover = TRUE",
    [propertyId],
  );

  if (Number(coverRow.cover_count) > 0) return;

  await connection.query(
    `
    UPDATE property_images
    SET is_cover = TRUE
    WHERE property_id = ?
    ORDER BY sort_order ASC, id ASC
    LIMIT 1
    `,
    [propertyId],
  );
}

async function insertImages(
  connection,
  propertyId,
  images,
  { resetCover = false } = {},
) {
  if (!Array.isArray(images) || images.length === 0) return;

  const hasCover = images.some((image) => image.is_cover);

  if (resetCover && hasCover) {
    await connection.query(
      "UPDATE property_images SET is_cover = FALSE WHERE property_id = ?",
      [propertyId],
    );
  }

  const normalizedImages = hasCover
    ? images
    : images.map((image, index) => ({ ...image, is_cover: index === 0 }));

  for (const image of normalizedImages) {
    await connection.query(
      `
      INSERT INTO property_images (property_id, image_url, is_cover, sort_order)
      VALUES (?, ?, ?, ?)
      `,
      [
        propertyId,
        image.image_url,
        Boolean(image.is_cover),
        image.sort_order ?? 0,
      ],
    );
  }

  await ensureCoverImage(connection, propertyId);
}

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get(
  "/api/categories",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `
      SELECT id, name, slug
      FROM categories
      ORDER BY name ASC
      `,
    );

    res.json(rows);
  }),
);

app.get(
  "/api/properties/overview",
  asyncHandler(async (req, res) => {
    const [[overview]] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_count,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_count,
        SUM(CASE WHEN status = 'available' AND type = 'sale' THEN 1 ELSE 0 END) AS sale_count,
        SUM(CASE WHEN status = 'available' AND type = 'rent' THEN 1 ELSE 0 END) AS rent_count,
        COUNT(DISTINCT city) AS city_count,
        AVG(CASE WHEN status = 'available' THEN price ELSE NULL END) AS average_price
      FROM properties
      WHERE status <> 'hidden'
      `,
    );

    const [topCities] = await pool.query(
      `
      SELECT city, COUNT(*) AS total
      FROM properties
      WHERE status <> 'hidden'
      GROUP BY city
      ORDER BY total DESC, city ASC
      LIMIT 6
      `,
    );

    res.json({
      overview: {
        total_count: Number(overview.total_count || 0),
        available_count: Number(overview.available_count || 0),
        sale_count: Number(overview.sale_count || 0),
        rent_count: Number(overview.rent_count || 0),
        city_count: Number(overview.city_count || 0),
        average_price: overview.average_price
          ? Number(overview.average_price)
          : null,
      },
      top_cities: topCities,
    });
  }),
);

app.get(
  "/api/properties",
  asyncHandler(async (req, res) => {
    const { whereSql, params } = buildPublicPropertyFilter(req.query);
    const sortKey = parseSort(req.query.sort);
    const { page, limit, offset } = parsePagination(req.query);

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM properties p
      ${whereSql}
      `,
      params,
    );

    const total = Number(countRows[0]?.total || 0);

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.type,
        p.price,
        p.area,
        p.bedrooms,
        p.bathrooms,
        p.city,
        p.district,
        p.ward,
        p.status,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.id
          ORDER BY pi.is_cover DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS cover_image
      FROM properties p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereSql}
      ORDER BY ${SORT_OPTIONS[sortKey]}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    res.json({
      items: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      sort: sortKey,
    });
  }),
);

app.get(
  "/api/properties/:slug/related",
  asyncHandler(async (req, res) => {
    const slug = cleanText(req.params.slug);
    if (!slug) {
      return res.status(400).json({ error: "Slug khong hop le." });
    }

    const limit = toInteger(req.query.limit, 4, { min: 1, max: 12 });

    const [baseRows] = await pool.query(
      `
      SELECT id, city, district, type, category_id
      FROM properties
      WHERE slug = ?
        AND status <> 'hidden'
      LIMIT 1
      `,
      [slug],
    );

    if (baseRows.length === 0) {
      return res.status(404).json({ error: "Khong tim thay bat dong san." });
    }

    const base = baseRows[0];

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.type,
        p.price,
        p.area,
        p.city,
        p.district,
        p.ward,
        p.status,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.id
          ORDER BY pi.is_cover DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS cover_image
      FROM properties p
      WHERE p.id <> ?
        AND p.status <> 'hidden'
      ORDER BY
        (p.city = ?) DESC,
        (p.district = ?) DESC,
        (p.category_id = ?) DESC,
        (p.type = ?) DESC,
        p.created_at DESC
      LIMIT ?
      `,
      [base.id, base.city, base.district, base.category_id, base.type, limit],
    );

    res.json(rows);
  }),
);

app.get(
  "/api/properties/:slug",
  asyncHandler(async (req, res) => {
    const slug = cleanText(req.params.slug);
    const amenitiesAvailable = await ensureAmenitiesColumnFlag();

    const [propertyRows] = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.description,
        p.type,
        p.price,
        p.area,
        p.bedrooms,
        p.bathrooms,
        p.city,
        p.district,
        p.ward,
        p.address_text,
        p.lat,
        p.lng,
        p.status${amenitiesAvailable ? ", p.amenities" : ""},
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM properties p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
        AND p.status <> 'hidden'
      LIMIT 1
      `,
      [slug],
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const property = propertyRows[0];

    const [imageRows] = await pool.query(
      `
      SELECT
        id,
        image_url,
        is_cover,
        sort_order
      FROM property_images
      WHERE property_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [property.id],
    );

    property.images = imageRows;
    property.amenities = amenitiesAvailable
      ? parseAmenities(property.amenities)
      : [];

    res.json(property);
  }),
);

app.post(
  "/api/contacts",
  asyncHandler(async (req, res) => {
    const payload = buildContactPayload(req.body);
    const validationError = validateContactPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (payload.property_id !== null) {
      const [propertyRows] = await pool.query(
        "SELECT id FROM properties WHERE id = ? LIMIT 1",
        [payload.property_id],
      );
      if (propertyRows.length === 0) {
        return res.status(404).json({ error: "Khong tim thay bat dong san." });
      }
    }

    const [result] = await pool.query(
      `
      INSERT INTO contacts (property_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        payload.property_id,
        payload.name,
        payload.email,
        payload.phone,
        payload.message,
      ],
    );

    res.status(201).json({
      message: "Contact submitted successfully",
      contact_id: result.insertId,
    });
  }),
);

app.post(
  "/api/admin/auth/login",
  asyncHandler(async (req, res) => {
    const email = cleanText(req.body?.email).toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Vui long nhap email va mat khau." });
    }

    const [rows] = await pool.query(
      `
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email hoac mat khau khong dung." });
    }

    const user = rows[0];

    if (!comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Email hoac mat khau khong dung." });
    }

    if (!["admin", "editor"].includes(String(user.role || "").toLowerCase())) {
      return res
        .status(403)
        .json({ error: "Tai khoan khong co quyen truy cap khu vuc quan tri." });
    }

    const exp = Math.floor(Date.now() / 1000) + ADMIN_TOKEN_EXPIRES_IN_SECONDS;
    const token = signAdminToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp,
    });

    res.json({
      message: "Dang nhap thanh cong.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      expires_at: exp,
    });
  }),
);

app.get(
  "/api/admin/contacts",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.property_id,
        c.name,
        c.email,
        c.phone,
        c.message,
        c.status,
        c.created_at,
        p.title AS property_title,
        p.slug AS property_slug
      FROM contacts c
      LEFT JOIN properties p ON p.id = c.property_id
      ORDER BY c.created_at DESC
      `,
    );

    res.json(rows);
  }),
);

app.put(
  "/api/admin/contacts/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const contactId = toInteger(req.params.id, null, { min: 1 });
    const nextStatus = cleanText(req.body?.status).toLowerCase();

    if (contactId === null) {
      return res.status(400).json({ error: "ID lien he khong hop le." });
    }

    if (!CONTACT_STATUS_VALUES.has(nextStatus)) {
      return res
        .status(400)
        .json({ error: "Trang thai lien he khong hop le." });
    }

    const [result] = await pool.query(
      "UPDATE contacts SET status = ? WHERE id = ?",
      [nextStatus, contactId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Khong tim thay lien he." });
    }

    res.json({ message: "Cap nhat trang thai lien he thanh cong." });
  }),
);

app.get(
  "/api/admin/properties",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.type,
        p.price,
        p.area,
        p.city,
        p.district,
        p.status,
        p.created_at,
        p.updated_at,
        c.id AS category_id,
        c.name AS category_name,
        (
          SELECT pi.image_url
          FROM property_images pi
          WHERE pi.property_id = p.id
          ORDER BY pi.is_cover DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS cover_image,
        (
          SELECT COUNT(*)
          FROM property_images pi
          WHERE pi.property_id = p.id
        ) AS image_count
      FROM properties p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
      `,
    );

    res.json(rows);
  }),
);

app.get(
  "/api/admin/properties/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const propertyId = toInteger(req.params.id, null, { min: 1 });
    const amenitiesAvailable = await ensureAmenitiesColumnFlag();

    if (propertyId === null) {
      return res.status(400).json({ error: "ID bat dong san khong hop le." });
    }

    const [propertyRows] = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        slug,
        type,
        price,
        area,
        bedrooms,
        bathrooms,
        city,
        district,
        ward,
        address_text,
        lat,
        lng,
        category_id,
        status${amenitiesAvailable ? ", amenities" : ""},
        created_at,
        updated_at
      FROM properties
      WHERE id = ?
      LIMIT 1
      `,
      [propertyId],
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({ error: "Khong tim thay bat dong san." });
    }

    const property = propertyRows[0];

    const [images] = await pool.query(
      `
      SELECT id, property_id, image_url, is_cover, sort_order, created_at
      FROM property_images
      WHERE property_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [propertyId],
    );

    property.images = images;
    property.amenities = amenitiesAvailable
      ? parseAmenities(property.amenities)
      : [];

    res.json(property);
  }),
);

app.post(
  "/api/admin/properties",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = buildPropertyPayload(req.body);
    const validationError = validatePropertyPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const connection = await pool.getConnection();

    try {
      const amenitiesAvailable = await ensureAmenitiesColumnFlag();
      await connection.beginTransaction();

      const insertColumns = [
        "title",
        "description",
        "slug",
        "type",
        "price",
        "area",
        "bedrooms",
        "bathrooms",
        "city",
        "district",
        "ward",
        "address_text",
        "lat",
        "lng",
        "category_id",
        "status",
      ];

      const insertValues = [
        payload.title,
        payload.description,
        payload.slug,
        payload.type,
        payload.price,
        payload.area,
        payload.bedrooms,
        payload.bathrooms,
        payload.city,
        payload.district,
        payload.ward,
        payload.address_text,
        payload.lat,
        payload.lng,
        payload.category_id,
        payload.status,
      ];

      if (amenitiesAvailable) {
        insertColumns.push("amenities");
        insertValues.push(serializeAmenities(normalizeAmenities(req.body)));
      }

      const placeholders = insertColumns.map(() => "?").join(", ");
      const [insertResult] = await connection.query(
        `INSERT INTO properties (${insertColumns.join(", ")}) VALUES (${placeholders})`,
        insertValues,
      );

      const propertyId = insertResult.insertId;
      const images = normalizeImageList(req.body);
      await insertImages(connection, propertyId, images);

      await connection.commit();

      res.status(201).json({
        message: "Tao bat dong san thanh cong.",
        property_id: propertyId,
      });
    } catch (error) {
      await connection.rollback();

      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "Slug da ton tai. Vui long dung slug khac." });
      }

      if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
        return res.status(400).json({
          error:
            "Gia tri trang thai hoac loai tin chua tuong thich voi schema hien tai.",
        });
      }

      if (error.code === "ER_BAD_FIELD_ERROR") {
        return res.status(400).json({
          error:
            "Thieu cot amenities trong bang properties. Vui long chay migration SQL moi.",
        });
      }

      throw error;
    } finally {
      connection.release();
    }
  }),
);

app.put(
  "/api/admin/properties/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const propertyId = toInteger(req.params.id, null, { min: 1 });
    if (propertyId === null) {
      return res.status(400).json({ error: "ID bat dong san khong hop le." });
    }

    const payload = buildPropertyPayload(req.body);
    const validationError = validatePropertyPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const connection = await pool.getConnection();

    try {
      const amenitiesAvailable = await ensureAmenitiesColumnFlag();
      await connection.beginTransaction();

      const updateClauses = [
        "title = ?",
        "description = ?",
        "slug = ?",
        "type = ?",
        "price = ?",
        "area = ?",
        "bedrooms = ?",
        "bathrooms = ?",
        "city = ?",
        "district = ?",
        "ward = ?",
        "address_text = ?",
        "lat = ?",
        "lng = ?",
        "category_id = ?",
        "status = ?",
      ];

      const updateValues = [
        payload.title,
        payload.description,
        payload.slug,
        payload.type,
        payload.price,
        payload.area,
        payload.bedrooms,
        payload.bathrooms,
        payload.city,
        payload.district,
        payload.ward,
        payload.address_text,
        payload.lat,
        payload.lng,
        payload.category_id,
        payload.status,
      ];

      if (amenitiesAvailable) {
        updateClauses.push("amenities = ?");
        updateValues.push(serializeAmenities(normalizeAmenities(req.body)));
      }

      updateClauses.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(propertyId);

      const [result] = await connection.query(
        `UPDATE properties SET ${updateClauses.join(", ")} WHERE id = ?`,
        updateValues,
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res
          .status(404)
          .json({ error: "Khong tim thay bat dong san de cap nhat." });
      }

      await connection.commit();
      res.json({ message: "Cap nhat bat dong san thanh cong." });
    } catch (error) {
      await connection.rollback();

      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "Slug da ton tai. Vui long dung slug khac." });
      }

      if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
        return res.status(400).json({
          error:
            "Gia tri trang thai hoac loai tin chua tuong thich voi schema hien tai.",
        });
      }

      if (error.code === "ER_BAD_FIELD_ERROR") {
        return res.status(400).json({
          error:
            "Thieu cot amenities trong bang properties. Vui long chay migration SQL moi.",
        });
      }

      throw error;
    } finally {
      connection.release();
    }
  }),
);
