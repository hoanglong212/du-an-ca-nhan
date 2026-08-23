import test from "node:test";
import assert from "node:assert/strict";
import { buildDbConfig } from "../db/config.js";

function withEnvironment(values, callback) {
  const original = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
  try {
    callback();
  } finally {
    Object.entries(original).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

test("database config keeps local connections without TLS by default", () => {
  withEnvironment({ DB_SSL: undefined, DB_SSL_CA: undefined, DB_PORT: "3306" }, () => {
    const config = buildDbConfig();
    assert.equal(config.port, 3306);
    assert.equal(config.ssl, undefined);
  });
});

test("database config verifies a configured CA certificate", () => {
  withEnvironment({ DB_SSL: "true", DB_SSL_CA: "line-one\\nline-two" }, () => {
    const config = buildDbConfig();
    assert.deepEqual(config.ssl, { ca: "line-one\nline-two", rejectUnauthorized: true });
  });
});
