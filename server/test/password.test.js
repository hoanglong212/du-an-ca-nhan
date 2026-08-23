import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { hashPassword, verifyPassword } from "../security/password.js";

test("scrypt passwords verify without storing plaintext", () => {
  const encoded = hashPassword("portfolio-password", { salt: Buffer.alloc(16, 7) });

  assert.match(encoded, /^scrypt\$16384\$8\$1\$/u);
  assert.equal(encoded.includes("portfolio-password"), false);
  assert.equal(verifyPassword("portfolio-password", encoded), true);
  assert.equal(verifyPassword("wrong-password", encoded), false);
});

test("malformed or plaintext values fail closed", () => {
  assert.equal(verifyPassword("password", "password"), false);
  assert.equal(verifyPassword("password", "scrypt$999999999$8$1$00$00"), false);
  assert.equal(verifyPassword("password", ""), false);
});

test("legacy SHA-256 hashes remain available for account migration", () => {
  const legacy = crypto.createHash("sha256").update("legacy-password").digest("hex");

  assert.equal(verifyPassword("legacy-password", legacy), true);
  assert.equal(verifyPassword("wrong-password", legacy), false);
});

