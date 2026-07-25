import { randomBytes, randomUUID } from 'crypto';

export class IdUtil {
  /**
   * Generates a standard UUID (v4)
   * @returns string e.g., '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
   */
  static generateUuid(): string {
    return randomUUID();
  }

  /**
   * Generates a short, cryptographic random ID of a given length.
   * @param length The length of the generated ID (default 21)
   * @returns string
   */
  static generateShortId(length: number = 21): string {
    // Generate enough bytes to cover the requested length in base64url format
    // Each byte yields ~1.33 characters in base64.
    // For a better nanoid replacement, we can use base64url which is URL-safe.
    const byteLength = Math.ceil((length * 3) / 4);
    return randomBytes(byteLength)
      .toString('base64url')
      .slice(0, length);
  }
}
