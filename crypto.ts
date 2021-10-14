import { Buffer, crypto, ctr256 } from "./deps.ts";
import { bytes } from "./tl_types.ts";

// endregion
export function createDecipheriv(_algorithm: string, key: Buffer, iv: Buffer) {
  return (plaintext: Iterable<number>) =>
    ctr256(Uint8Array.from(plaintext), key, iv);
}

export function createCipheriv(_algorithm: string, key: Buffer, iv: Buffer) {
  return (plaintext: Iterable<number>) =>
    ctr256(Uint8Array.from(plaintext), key, iv);
}

export function randomBytes(count: Buffer): Buffer;
export function randomBytes(count: number): Buffer;
export function randomBytes(count: any) {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return bytes;
}

export class Hash {
  private readonly algorithm: string;
  private data?: Uint8Array;

  constructor(algorithm: string) {
    this.algorithm = algorithm;
  }

  update(data: bytes) {
    //We shouldn't be needing new Uint8Array but it doesn't
    //work without it
    this.data = new Uint8Array(data);
  }

  async digest() {
    if (this.data) {
      if (this.algorithm === "sha1") {
        return Buffer.from(await self.crypto.subtle.digest("SHA-1", this.data));
      } else if (this.algorithm === "sha256") {
        return Buffer.from(
          await self.crypto.subtle.digest("SHA-256", this.data),
        );
      }
    }
  }
}

export async function pbkdf2Sync(password: any, salt: any, iterations: any) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    password,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  return Buffer.from(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-512",
        salt,
        iterations,
      },
      passwordKey,
      512,
    ),
  );
}

export function createHash(algorithm: string) {
  return new Hash(algorithm);
}
