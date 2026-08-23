import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { buildDbConfig } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const databaseName = String(process.env.DB_NAME || "").trim();
if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error("DB_NAME must contain only letters, numbers, and underscores.");
}

const connection = await mysql.createConnection(
  buildDbConfig({ includeDatabase: false, multipleStatements: true }),
);

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
  );
  await connection.changeUser({ database: databaseName });

  const [existingTables] = await connection.query("SHOW TABLES LIKE 'categories'");
  if (existingTables.length === 0) {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = (await fs.readFile(schemaPath, "utf8"))
      .replace(/CREATE DATABASE IF NOT EXISTS[\s\S]*?;\s*/iu, "")
      .replace(/USE\s+`[^`]+`;\s*/iu, "");
    await connection.query(schema);
  }

  const [categoryCountRows] = await connection.query("SELECT COUNT(*) AS count FROM categories");
  if (Number(categoryCountRows[0].count) === 0) {
    await connection.query(
      `INSERT INTO categories (name, slug) VALUES
        ('Căn hộ', 'can-ho'),
        ('Nhà phố', 'nha-pho'),
        ('Đất nền', 'dat-nen'),
        ('Biệt thự', 'biet-thu')`,
    );
  }

  const [propertyCountRows] = await connection.query("SELECT COUNT(*) AS count FROM properties");
  if (Number(propertyCountRows[0].count) === 0) {
    const [categories] = await connection.query("SELECT id, slug FROM categories");
    const categoryIds = Object.fromEntries(categories.map((item) => [item.slug, item.id]));
    const demoProperties = [
      {
        title: "Căn hộ hiện đại tại trung tâm TP.HCM",
        description: "Dữ liệu minh họa cho portfolio: căn hộ thoáng sáng, gần tiện ích và giao thông công cộng.",
        slug: "can-ho-hien-dai-trung-tam-tphcm",
        type: "sale",
        price: 4200000000,
        area: 82,
        bedrooms: 2,
        bathrooms: 2,
        city: "TP. Hồ Chí Minh",
        district: "Quận 1",
        ward: "Khu trung tâm",
        addressText: "Quận 1, TP. Hồ Chí Minh",
        propertyKind: "Căn hộ",
        legalDocument: "Hồ sơ minh họa",
        amenities: "Ban công\nBảo vệ 24/7\nGần công viên",
        categoryId: categoryIds["can-ho"],
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
      },
      {
        title: "Nhà phố phù hợp gia đình tại Thủ Đức",
        description: "Dữ liệu minh họa cho portfolio: không gian nhiều tầng với khu sinh hoạt chung linh hoạt.",
        slug: "nha-pho-gia-dinh-thu-duc",
        type: "sale",
        price: 7800000000,
        area: 118,
        bedrooms: 4,
        bathrooms: 3,
        city: "TP. Hồ Chí Minh",
        district: "Thành phố Thủ Đức",
        ward: "Khu dân cư",
        addressText: "Thành phố Thủ Đức, TP. Hồ Chí Minh",
        propertyKind: "Nhà phố",
        legalDocument: "Hồ sơ minh họa",
        amenities: "Chỗ đậu xe\nSân thượng\nKhu dân cư yên tĩnh",
        categoryId: categoryIds["nha-pho"],
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
      },
      {
        title: "Căn hộ cho thuê gần khu công nghệ",
        description: "Dữ liệu minh họa cho portfolio: lựa chọn thuê gọn gàng cho chuyên gia và sinh viên.",
        slug: "can-ho-cho-thue-gan-khu-cong-nghe",
        type: "rent",
        price: 15000000,
        area: 62,
        bedrooms: 2,
        bathrooms: 1,
        city: "TP. Hồ Chí Minh",
        district: "Thành phố Thủ Đức",
        ward: "Khu đô thị",
        addressText: "Thành phố Thủ Đức, TP. Hồ Chí Minh",
        propertyKind: "Căn hộ",
        legalDocument: "Hồ sơ minh họa",
        amenities: "Nội thất cơ bản\nHồ bơi\nPhòng gym",
        categoryId: categoryIds["can-ho"],
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
      },
    ];

    for (const item of demoProperties) {
      const [result] = await connection.execute(
        `INSERT INTO properties
          (title, description, slug, type, price, area, bedrooms, bathrooms, city, district, ward,
           address_text, property_kind, legal_document, amenities, category_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
        [
          item.title,
          item.description,
          item.slug,
          item.type,
          item.price,
          item.area,
          item.bedrooms,
          item.bathrooms,
          item.city,
          item.district,
          item.ward,
          item.addressText,
          item.propertyKind,
          item.legalDocument,
          item.amenities,
          item.categoryId,
        ],
      );
      await connection.execute(
        "INSERT INTO property_images (property_id, image_url, is_cover, sort_order) VALUES (?, ?, TRUE, 0)",
        [result.insertId, item.image],
      );
    }
  }

  const [[summary]] = await connection.query(
    "SELECT (SELECT COUNT(*) FROM categories) AS categories, (SELECT COUNT(*) FROM properties) AS properties",
  );
  console.log(`Database bootstrap complete: ${summary.categories} categories, ${summary.properties} properties.`);
} finally {
  await connection.end();
}
