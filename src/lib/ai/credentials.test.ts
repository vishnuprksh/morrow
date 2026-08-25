import { describe, expect, it, vi } from 'vitest';
import { decryptApiKey, encryptApiKey } from './credentials';

describe('AI credential encryption', () => {
  it('round trips API keys without exposing plaintext in ciphertext', () => {
    vi.stubEnv('AI_ENCRYPTION_KEY', Buffer.alloc(32, 7).toString('base64'));
    const encrypted = encryptApiKey('sk-secret-value');
    expect(encrypted).not.toContain('sk-secret-value');
    expect(decryptApiKey(encrypted)).toBe('sk-secret-value');
  });

  it('rejects tampered ciphertext', () => {
    vi.stubEnv('AI_ENCRYPTION_KEY', Buffer.alloc(32, 7).toString('base64'));
    const encrypted = Buffer.from(encryptApiKey('secret'), 'base64');
    encrypted[encrypted.length - 1] ^= 1;
    expect(() => decryptApiKey(encrypted.toString('base64'))).toThrow();
  });
});
