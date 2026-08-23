import crypto from "crypto";

const SCRYPT_NAME = "scrypt";
const KEY_LENGTH = 64;
const DEFAULT_COST = 16384;
const DEFAULT_BLOCK_SIZE = 8;
const DEFAULT_PARALLELIZATION = 1;

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function validScryptParameters(cost, blockSize, parallelization) {
  const costIsPowerOfTwo = Number.isInteger(cost) && cost >= 2 && cost <= 2 ** 20 && (cost & (cost - 1)) === 0;
  return (
    costIsPowerOfTwo &&
    Number.isInteger(blockSize) &&
    blockSize >= 1 &&
    blockSize <= 32 &&
    Number.isInteger(parallelization) &&
    parallelization >= 1 &&
    parallelization <= 32
  );
}

function derive(password, salt, cost, blockSize, parallelization) {
  const maxmem = Math.max(32 * 1024 * 1024, 128 * cost * blockSize + 2 * 1024 * 1024);
  return crypto.scryptSync(String(password), salt, KEY_LENGTH, {
    N: cost,
    r: blockSize,
    p: parallelization,
    maxmem,
  });
}

export function hashPassword(
  password,
  {
    cost = DEFAULT_COST,
    blockSize = DEFAULT_BLOCK_SIZE,
    parallelization = DEFAULT_PARALLELIZATION,
    salt = crypto.randomBytes(16),
  } = {},
) {
  if (String(password).length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  if (!validScryptParameters(cost, blockSize, parallelization)) {
    throw new Error("Invalid scrypt parameters.");
  }

  const saltBuffer = Buffer.from(salt);
  const key = derive(password, saltBuffer, cost, blockSize, parallelization);
  return [SCRYPT_NAME, cost, blockSize, parallelization, saltBuffer.toString("hex"), key.toString("hex")].join("$");
}

export function verifyPassword(password, encodedHash) {
  const stored = String(encodedHash || "").trim();
  if (!stored) return false;

  if (/^[a-f0-9]{64}$/iu.test(stored)) {
    const actual = crypto.createHash("sha256").update(String(password)).digest();
    return safeEqual(actual, Buffer.from(stored, "hex"));
  }

  const [name, costText, blockSizeText, parallelizationText, saltHex, keyHex, ...extra] = stored.split("$");
  if (name !== SCRYPT_NAME || extra.length > 0) return false;
  if (!/^[a-f0-9]{32,128}$/iu.test(saltHex || "") || !/^[a-f0-9]{128}$/iu.test(keyHex || "")) {
    return false;
  }

  const cost = Number(costText);
  const blockSize = Number(blockSizeText);
  const parallelization = Number(parallelizationText);
  if (!validScryptParameters(cost, blockSize, parallelization)) return false;

  try {
    const expected = Buffer.from(keyHex, "hex");
    const actual = derive(password, Buffer.from(saltHex, "hex"), cost, blockSize, parallelization);
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
}

