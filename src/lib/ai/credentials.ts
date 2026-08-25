import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function encryptionKey() {
  const value = process.env.AI_ENCRYPTION_KEY;
  if (!value) throw new Error('AI_ENCRYPTION_KEY is not configured on the server.');
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error('AI_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  return key;
}

export function encryptApiKey(plaintext: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
}

export function decryptApiKey(encoded: string) {
  const payload = Buffer.from(encoded, 'base64');
  if (payload.length <= IV_LENGTH + TAG_LENGTH) throw new Error('Invalid encrypted API key.');
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), payload.subarray(0, IV_LENGTH));
  decipher.setAuthTag(payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH));
  return Buffer.concat([decipher.update(payload.subarray(IV_LENGTH + TAG_LENGTH)), decipher.final()]).toString('utf8');
}
