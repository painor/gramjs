import { Buffer, igeDecrypt, igeEncrypt } from "../deps.ts";
import { generateRandomBytes } from "../helpers.ts";
import { bytes } from "../tl/types.ts";

export function encryptIge(plaintext: bytes, key: bytes, iv: bytes) {
  const padding = plaintext.length % 16;
  if (padding) {
    plaintext = Buffer.concat([
      plaintext,
      generateRandomBytes(16 - padding),
    ]);
  }

  return Buffer.from(igeEncrypt(plaintext, key, iv));
}

export function decryptIge(ciphertext: bytes, key: bytes, iv: bytes) {
  return Buffer.from(igeDecrypt(ciphertext, key, iv));
}
