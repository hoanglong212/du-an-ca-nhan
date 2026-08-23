function asBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

export function buildDbConfig({ includeDatabase = true, multipleStatements = false } = {}) {
  const ca = String(process.env.DB_SSL_CA || "").replace(/\\n/g, "\n").trim();
  const sslEnabled = asBoolean(process.env.DB_SSL, Boolean(ca));

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 3306),
    multipleStatements,
  };

  if (includeDatabase) config.database = process.env.DB_NAME;
  if (sslEnabled) {
    config.ssl = ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false };
  }

  return config;
}
