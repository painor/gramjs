import * as crypto from "./crypto.ts";
import { Buffer } from "./deps.ts";

export function generateRandomBytes(count: number) {
  return Buffer.from(crypto.randomBytes(count));
}
