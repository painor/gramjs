export * as denoflate from "https://deno.land/x/denoflate@1.2.1/mod.ts";
export * as mime from "https://deno.land/x/mime_types@1.0.0/mod.ts";
export * as fs from "https://deno.land/std@0.101.0/fs/mod.ts";
export * as path from "https://deno.land/std@0.101.0/path/mod.ts";
export { Buffer } from "https://deno.land/std@0.101.0/node/buffer.ts";
export { Mixed } from "https://deno.land/x/class_mixins@v0.1.3/index.ts";
export { Mutex } from "https://deno.land/x/semaphore@v1.1.0/mutex.ts";
export { iter } from "https://deno.land/std@0.102.0/io/util.ts";
export {
  Client,
  Event as SocketEvent,
  Packet as SocketPacket,
} from "https://deno.land/x/tcp_socket@0.0.2/mods.ts";

export { Parser as HTMLParser } from "https://deno.land/x/html_parser@v0.1.3/src/mod.ts";
export type { Handler as HTMLParserHandler } from "https://deno.land/x/html_parser@v0.1.3/src/Parser.ts";

export {
  bigInt,
  BigInteger,
} from "https://deno.land/x/biginteger@v0.1.3/mod.ts";
export type { BigNumber } from "https://deno.land/x/biginteger@v0.1.3/mod.ts";

export {
  ctr256,
  igeDecrypt,
  igeEncrypt,
} from "https://deno.land/x/wasm_crypto@v0.1.3/mod.ts";
export { crypto } from "https://cdn.skypack.dev/@stagas/webcrypto-liner";

export { default as struct } from "http://esm.sh/@trungduy1995nd/python-struct";

export const isBrowser = typeof Deno === undefined;
