import cors from "cors";
import crypto from "crypto";
import express from "express";
import pool from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

const STATUS_VALUES = new Set(["available", "sold", "rented", "hidden"]);
const TYPE_VALUES = new Set(["sale", "rent"]);
const CONTACT_STATUS_VALUES = new Set(["new", "contacted", "closed"]);
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || "change-this-secret-in-env";
const ADMIN_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
let hasAmenitiesColumn = null;

async function ensureAmenitiesColumnFlag() {
  if (hasAmenitiesColumn !== null) return hasAmenitiesColumn;

  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM properties LIKE 'amenities'");
    hasAmenitiesColumn = rows.length > 0;
  } catch (error) {
    console.error("Detect amenities column error:", error);
    hasAmenitiesColumn = false;
  }

  return hasAmenitiesColumn;
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function signAdminToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(unsigned).digest());
  return `${unsigned}.${signature}`;
}

function verifyAdminToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64UrlEncode(crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(unsigned).digest());

  if (providedSignature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.exp || Date.now() >= Number(payload.exp) * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

function requireAdmin(req, res, next) {
  const token = extractBearerToken(req);
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
  }

  req.adminUser = payload;
  return next();
}

function comparePassword(inputPassword, storedHash) {
  const input = String(inputPassword || "");
  const stored = String(storedHash || "");
  if (!stored) return false;
  if (stored === input) return true;
  if (stored === sha256(input)) return true;
  return false;
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

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildPropertyPayload(body = {}) {
  return {
    title: String(body.title || "").trim(),
    description: body.description?.trim() || null,
    slug: String(body.slug || "").trim(),
    type: normalizeType(body.type),
    price: toNullableNumber(body.price),
    area: toNullableNumber(body.area),
    bedrooms: toNullableNumber(body.bedrooms),
    bathrooms: toNullableNumber(body.bathrooms),
    city: String(body.city || "").trim(),
    district: String(body.district || "").trim(),
    ward: String(body.ward || "").trim(),
    address_text: String(body.address_text || "").trim(),
    lat: toNullableNumber(body.lat),
    lng: toNullableNumber(body.lng),
    category_id: toNullableNumber(body.category_id),
    status: normalizeStatus(body.status),
  };
}

function normalizeAmenities(body = {}) {
  const { amenities } = body;

  if (Array.isArray(amenities)) {
    return amenities.map((item) => String(item || "").trim()).filter(Boolean);
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
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  const text = String(value).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    // fallback for old plain text format
  }

  return text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
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
    return `Thiếu trường bắt buộc: ${missing.join(", ")}`;
  }

  if (!TYPE_VALUES.has(payload.type)) {
    return "Loại tin không hợp lệ. Chỉ chấp nhận: sale, rent.";
  }

  if (!STATUS_VALUES.has(payload.status)) {
    return "Trạng thái không hợp lệ. Chỉ chấp nhận: available, sold, rented, hidden.";
  }

  if (payload.price < 0 || payload.area < 0) {
    return "Giá và diện tích phải lớn hơn hoặc bằng 0.";
  }

  return null;
}

function normalizeImageList(body = {}) {
  const { images, image_url, is_cover, sort_order } = body;

  if (Array.isArray(images)) {
    return images
      .map((item, index) => ({
        image_url: String(item?.image_url || "").trim(),
        is_cover: Boolean(item?.is_cover),
        sort_order: toNullableNumber(item?.sort_order) ?? index,
      }))
      .filter((item) => item.image_url);
  }

  if (image_url) {
    return [
      {
        image_url: String(image_url).trim(),
        is_cover: Boolean(is_cover),
        sort_order: toNullableNumber(sort_order) ?? 0,
      },
    ];
  }

  return [];
}

async function ensurePropertyExists(connection, propertyId) {
  const [rows] = await connection.query("SELECT id FROM properties WHERE id = ? LIMIT 1", [propertyId]);
  return rows.length > 0;
}

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT id, name, slug
      FROM categories
      ORDER BY name ASC
      `,
    );
    res.json(rows);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    res.status(500).json({ error: "Lỗi truy vấn danh mục." });
  }
});

app.get("/api/properties", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.price,
        p.area,
        p.city,
        p.district,
        p.status,
        i.image_url AS cover_image
      FROM properties p
      LEFT JOIN property_images i
        ON p.id = i.property_id
        AND i.is_cover = TRUE
      ORDER BY p.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/properties/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
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

    property.amenities = amenitiesAvailable ? parseAmenities(property.amenities) : [];

    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/contacts", async (req, res) => {
  try {
    const body = req.body || {};
    const { property_id, name, email, phone, message } = body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO contacts (property_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?)
      `,
      [property_id || null, name, email || null, phone, message || null],
    );

    res.status(201).json({
      message: "Contact submitted successfully",
      contact_id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/contacts error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu." });
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
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    const user = rows[0];
    if (!comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    if (!["admin", "editor"].includes(String(user.role || "").toLowerCase())) {
      return res.status(403).json({ error: "Tài khoản không có quyền truy cập khu vực quản trị." });
    }

    const exp = Math.floor(Date.now() / 1000) + ADMIN_TOKEN_EXPIRES_IN_SECONDS;
    const token = signAdminToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp,
    });

    return res.json({
      message: "Đăng nhập thành công.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      expires_at: exp,
    });
  } catch (error) {
    console.error("POST /api/admin/auth/login error:", error);
    return res.status(500).json({ error: "Không thể đăng nhập lúc này." });
  }
});

app.get("/api/admin/contacts", requireAdmin, async (req, res) => {
  try {
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
  } catch (error) {
    console.error("GET /api/admin/contacts error:", error);
    res.status(500).json({ error: "Không thể tải danh sách liên hệ." });
  }
});

app.put("/api/admin/contacts/:id/status", requireAdmin, async (req, res) => {
  try {
    const contactId = Number(req.params.id);
    const nextStatus = String(req.body?.status || "")
      .trim()
      .toLowerCase();

    if (Number.isNaN(contactId)) {
      return res.status(400).json({ error: "ID liên hệ không hợp lệ." });
    }

    if (!CONTACT_STATUS_VALUES.has(nextStatus)) {
      return res.status(400).json({ error: "Trạng thái liên hệ không hợp lệ." });
    }

    const [result] = await pool.query("UPDATE contacts SET status = ? WHERE id = ?", [nextStatus, contactId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy liên hệ." });
    }

    res.json({ message: "Cập nhật trạng thái liên hệ thành công." });
  } catch (error) {
    console.error("PUT /api/admin/contacts/:id/status error:", error);
    res.status(500).json({ error: "Không thể cập nhật trạng thái liên hệ." });
  }
});

app.get("/api/admin/properties", requireAdmin, async (req, res) => {
  try {
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
        i.image_url AS cover_image,
        (
          SELECT COUNT(*)
          FROM property_images pi
          WHERE pi.property_id = p.id
        ) AS image_count
      FROM properties p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN property_images i
        ON i.property_id = p.id
        AND i.is_cover = TRUE
      ORDER BY p.created_at DESC
      `,
    );

    res.json(rows);
  } catch (error) {
    console.error("GET /api/admin/properties error:", error);
    res.status(500).json({ error: "Không thể tải danh sách bất động sản." });
  }
});

app.get("/api/admin/properties/:id", requireAdmin, async (req, res) => {
  try {
    const propertyId = Number(req.params.id);
    const amenitiesAvailable = await ensureAmenitiesColumnFlag();
    if (Number.isNaN(propertyId)) {
      return res.status(400).json({ error: "ID bất động sản không hợp lệ." });
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
      return res.status(404).json({ error: "Không tìm thấy bất động sản." });
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

    property.amenities = amenitiesAvailable ? parseAmenities(property.amenities) : [];

    res.json(property);
  } catch (error) {
    console.error("GET /api/admin/properties/:id error:", error);
    res.status(500).json({ error: "Không thể tải chi tiết bất động sản." });
  }
});

app.post("/api/admin/properties", requireAdmin, async (req, res) => {
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

    if (images.length > 0) {
      const hasCover = images.some((image) => image.is_cover);
      const normalizedImages = hasCover
        ? images
        : images.map((image, index) => ({ ...image, is_cover: index === 0 }));

      for (const image of normalizedImages) {
        await connection.query(
          `
          INSERT INTO property_images (property_id, image_url, is_cover, sort_order)
          VALUES (?, ?, ?, ?)
          `,
          [propertyId, image.image_url, Boolean(image.is_cover), image.sort_order ?? 0],
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: "Tạo bất động sản thành công.",
      property_id: propertyId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("POST /api/admin/properties error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Slug đã tồn tại. Vui lòng dùng slug khác." });
    }

    if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
      return res.status(400).json({
        error:
          "Giá trị trạng thái hoặc loại tin chưa tương thích với schema hiện tại. Kiểm tra ENUM trong bảng properties.",
      });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(400).json({
        error: "Thiếu cột amenities trong bảng properties. Vui lòng chạy migration SQL mới.",
      });
    }

    res.status(500).json({ error: "Không thể tạo bất động sản." });
  } finally {
    connection.release();
  }
});

app.put("/api/admin/properties/:id", requireAdmin, async (req, res) => {
  const propertyId = Number(req.params.id);
  if (Number.isNaN(propertyId)) {
    return res.status(400).json({ error: "ID bất động sản không hợp lệ." });
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
      return res.status(404).json({ error: "Không tìm thấy bất động sản để cập nhật." });
    }

    await connection.commit();

    res.json({ message: "Cập nhật bất động sản thành công." });
  } catch (error) {
    await connection.rollback();
    console.error("PUT /api/admin/properties/:id error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Slug đã tồn tại. Vui lòng dùng slug khác." });
    }

    if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
      return res.status(400).json({
        error:
          "Giá trị trạng thái hoặc loại tin chưa tương thích với schema hiện tại. Kiểm tra ENUM trong bảng properties.",
      });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(400).json({
        error: "Thiếu cột amenities trong bảng properties. Vui lòng chạy migration SQL mới.",
      });
    }

    res.status(500).json({ error: "Không thể cập nhật bất động sản." });
  } finally {
    connection.release();
  }
});

app.delete("/api/admin/properties/:id", requireAdmin, async (req, res) => {
  try {
    const propertyId = Number(req.params.id);
    if (Number.isNaN(propertyId)) {
      return res.status(400).json({ error: "ID bất động sản không hợp lệ." });
    }

    const [result] = await pool.query("DELETE FROM properties WHERE id = ?", [propertyId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy bất động sản để xóa." });
    }

    res.json({ message: "Xóa bất động sản thành công." });
  } catch (error) {
    console.error("DELETE /api/admin/properties/:id error:", error);
    res.status(500).json({ error: "Không thể xóa bất động sản." });
  }
});

app.post("/api/admin/properties/:id/images", requireAdmin, async (req, res) => {
  const propertyId = Number(req.params.id);
  if (Number.isNaN(propertyId)) {
    return res.status(400).json({ error: "ID bất động sản không hợp lệ." });
  }

  const images = normalizeImageList(req.body);
  if (images.length === 0) {
    return res.status(400).json({ error: "Danh sách ảnh không hợp lệ." });
  }

  const connection = await pool.getConnection();

  try {
    const propertyExists = await ensurePropertyExists(connection, propertyId);
    if (!propertyExists) {
      return res.status(404).json({ error: "Không tìm thấy bất động sản." });
    }

    await connection.beginTransaction();

    const hasCoverInRequest = images.some((image) => image.is_cover);
    if (hasCoverInRequest) {
      await connection.query("UPDATE property_images SET is_cover = FALSE WHERE property_id = ?", [propertyId]);
    }

    for (const image of images) {
      await connection.query(
        `
        INSERT INTO property_images (property_id, image_url, is_cover, sort_order)
        VALUES (?, ?, ?, ?)
        `,
        [propertyId, image.image_url, Boolean(image.is_cover), image.sort_order ?? 0],
      );
    }

    if (!hasCoverInRequest) {
      const [[coverCountRow]] = await connection.query(
        "SELECT COUNT(*) AS cover_count FROM property_images WHERE property_id = ? AND is_cover = TRUE",
        [propertyId],
      );

      if (coverCountRow.cover_count === 0) {
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
    }

    await connection.commit();
    res.status(201).json({ message: "Thêm ảnh thành công." });
  } catch (error) {
    await connection.rollback();
    console.error("POST /api/admin/properties/:id/images error:", error);
    res.status(500).json({ error: "Không thể thêm ảnh." });
  } finally {
    connection.release();
  }
});

app.delete("/api/admin/images/:id", requireAdmin, async (req, res) => {
  const imageId = Number(req.params.id);
  if (Number.isNaN(imageId)) {
    return res.status(400).json({ error: "ID ảnh không hợp lệ." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [imageRows] = await connection.query(
      "SELECT id, property_id, is_cover FROM property_images WHERE id = ? LIMIT 1",
      [imageId],
    );

    if (imageRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Không tìm thấy ảnh." });
    }

    const image = imageRows[0];
    await connection.query("DELETE FROM property_images WHERE id = ?", [imageId]);

    if (image.is_cover) {
      await connection.query(
        `
        UPDATE property_images
        SET is_cover = TRUE
        WHERE property_id = ?
        ORDER BY sort_order ASC, id ASC
        LIMIT 1
        `,
        [image.property_id],
      );
    }

    await connection.commit();
    res.json({ message: "Xóa ảnh thành công." });
  } catch (error) {
    await connection.rollback();
    console.error("DELETE /api/admin/images/:id error:", error);
    res.status(500).json({ error: "Không thể xóa ảnh." });
  } finally {
    connection.release();
  }
});

app.put("/api/admin/images/:id/cover", requireAdmin, async (req, res) => {
  const imageId = Number(req.params.id);
  if (Number.isNaN(imageId)) {
    return res.status(400).json({ error: "ID ảnh không hợp lệ." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [imageRows] = await connection.query(
      "SELECT id, property_id FROM property_images WHERE id = ? LIMIT 1",
      [imageId],
    );

    if (imageRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Không tìm thấy ảnh." });
    }

    const propertyId = imageRows[0].property_id;
    await connection.query("UPDATE property_images SET is_cover = FALSE WHERE property_id = ?", [propertyId]);
    await connection.query("UPDATE property_images SET is_cover = TRUE WHERE id = ?", [imageId]);

    await connection.commit();
    res.json({ message: "Cập nhật ảnh đại diện thành công." });
  } catch (error) {
    await connection.rollback();
    console.error("PUT /api/admin/images/:id/cover error:", error);
    res.status(500).json({ error: "Không thể cập nhật ảnh đại diện." });
  } finally {
    connection.release();
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
