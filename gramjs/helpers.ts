import * as crypto from "./crypto/mod.ts";
import { bytes } from "./tl/types.ts";
import { bigInt, BigInteger, Buffer } from "./deps.ts";

export async function sha1(data: bytes): Promise<Buffer> {
  const shaSum = crypto.createHash("sha1");
  shaSum.update(data);
  return (await shaSum.digest())!;
}

export function modExp(
  a: BigInteger,
  b: BigInteger,
  n: BigInteger,
): BigInteger {
  a = a.remainder(n);
  let result = BigInteger.one;
  let x = a;
  while (b.greater(BigInteger.zero)) {
    const leastSignificantBit = b.remainder(BigInt(2));
    b = b.divide(BigInt(2));
    if (leastSignificantBit.eq(BigInteger.one)) {
      result = result.multiply(x);
      result = result.remainder(n);
    }
    x = x.multiply(x);
    x = x.remainder(n);
  }
  return result;
}

export function readBufferFromBigInt(
  bigIntVar: BigInteger,
  bytesNumber: number,
  little = true,
  signed = false,
): Buffer {
  bigIntVar = bigInt(bigIntVar);
  const bitLength = bigIntVar.bitLength().toJSNumber();

  const bytes = Math.ceil(bitLength / 8);
  if (bytesNumber < bytes) {
    throw new Error("OverflowError: int too big to convert");
  }
  if (!signed && bigIntVar.lesser(BigInt(0))) {
    throw new Error("Cannot convert to unsigned");
  }
  let below = false;
  if (bigIntVar.lesser(BigInt(0))) {
    below = true;
    bigIntVar = bigIntVar.abs();
  }

  const hex = bigIntVar.toString(16).padStart(bytesNumber * 2, "0");
  let littleBuffer = Buffer.from(hex, "hex");
  if (little) {
    littleBuffer = littleBuffer.reverse() as Buffer;
  }

  if (signed && below) {
    if (little) {
      let reminder = false;
      if (littleBuffer[0] !== 0) {
        littleBuffer[0] -= 1;
      }
      for (let i = 0; i < littleBuffer.length; i++) {
        if (littleBuffer[i] === 0) {
          reminder = true;
          continue;
        }
        if (reminder) {
          littleBuffer[i] -= 1;
          reminder = false;
        }
        littleBuffer[i] = 255 - littleBuffer[i];
      }
    } else {
      littleBuffer[littleBuffer.length - 1] = 256 -
        littleBuffer[littleBuffer.length - 1];
      for (let i = 0; i < littleBuffer.length - 1; i++) {
        littleBuffer[i] = 255 - littleBuffer[i];
      }
    }
  }
  return littleBuffer;
}

export function serializeDate(dt: number | Date) {
  if (!dt) {
    return Buffer.alloc(4).fill(0);
  }
  if (dt instanceof Date) {
    dt = Math.floor((Date.now() - dt.getTime()) / 1000);
  }
  if (typeof dt == "number") {
    const t = Buffer.alloc(4);
    t.writeInt32LE(dt, 0);
    return t;
  }
  throw Error(`Cannot interpret "${dt}" as a date`);
}

export function toSignedLittleBuffer(big: BigInteger, number = 8): Buffer {
  const bigNumber = bigInt(big);
  const byteArray = [];
  for (let i = 0; i < number; i++) {
    byteArray[i] = bigNumber.shiftRight(8 * i).and(255);
  }
  // smh hacks
  return Buffer.from(byteArray as unknown as number[]);
}

export function serializeBytes(data: Buffer | string | any) {
  if (!(data instanceof Buffer)) {
    if (typeof data == "string") {
      data = Buffer.from(data);
    } else {
      throw Error(`Bytes or str expected, not ${data.constructor.name}`);
    }
  }
  const r = [];
  let padding;
  if (data.length < 254) {
    padding = (data.length + 1) % 4;
    if (padding !== 0) {
      padding = 4 - padding;
    }
    r.push(Buffer.from([data.length]));
    r.push(data);
  } else {
    padding = data.length % 4;
    if (padding !== 0) {
      padding = 4 - padding;
    }
    r.push(
      Buffer.from([
        254,
        data.length % 256,
        (data.length >> 8) % 256,
        (data.length >> 16) % 256,
      ]),
    );
    r.push(data);
  }
  r.push(Buffer.alloc(padding).fill(0));

  return Buffer.concat(r);
}

export function readBigIntFromBuffer(
  buffer: Buffer,
  little = true,
  signed = false,
): BigInteger {
  let randBuffer: any = Buffer.from(buffer);
  const bytesNumber = randBuffer.length;
  if (little) {
    randBuffer = randBuffer.reverse();
  }
  let bigIntVar = bigInt(randBuffer.toString("hex"), 16) as BigInteger;

  if (signed && Math.floor(bigIntVar.toString(2).length / 8) >= bytesNumber) {
    bigIntVar = bigIntVar.subtract(bigInt(2).pow(bigInt(bytesNumber * 8)));
  }
  return bigIntVar;
}

const CORE_TYPES = new Set([
  0xbc799737, // boolFalse#bc799737 = Bool;
  0x997275b5, // boolTrue#997275b5 = Bool;
  0x3fedd339, // true#3fedd339 = True;
  0xc4b9f9bb, // error#c4b9f9bb code:int text:string = Error;
  0x56730bcc, // null#56730bcc = Null;
]);

const AUTH_KEY_TYPES = new Set([
  0x05162463, // resPQ,
  0x83c95aec, // p_q_inner_data
  0xa9f55f95, // p_q_inner_data_dc
  0x3c6a84d4, // p_q_inner_data_temp
  0x56fddf88, // p_q_inner_data_temp_dc
  0xd0e8075c, // server_DH_params_ok
  0xb5890dba, // server_DH_inner_data
  0x6643b654, // client_DH_inner_data
  0xd712e4be, // req_DH_params
  0xf5045f1f, // set_client_DH_params
  0x3072cfa1, // gzip_packed
]);

export function generateRandomBytes(count: number) {
  return Buffer.from(crypto.randomBytes(count));
}

export function isArrayLike<T>(x: any): x is Array<T> {
  return (
    x &&
    typeof x.length === "number" &&
    typeof x !== "function" &&
    typeof x !== "string"
  );
}
const findAll = (regex: RegExp, str: string, matches: any = []) => {
  if (!regex.flags.includes("g")) {
    regex = new RegExp(regex.source, "g");
  }

  const res = regex.exec(str);

  if (res) {
    matches.push(res.slice(1));
    findAll(regex, str, matches);
  }

  return matches;
};

// Taken from https://stackoverflow.com/questions/18638900/javascript-crc32/18639999#18639999
function makeCRCTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

const snakeToCamelCase = (name: string) => {
  const result = name.replace(/(?:^|_)([a-z])/g, (_, g) => g.toUpperCase());
  return result.replace(/_/g, "");
};

let crcTable: number[] | undefined = undefined;

export function crc32(buf: Buffer | string) {
  if (!crcTable) {
    crcTable = makeCRCTable();
  }
  if (!Buffer.isBuffer(buf)) {
    buf = Buffer.from(buf);
  }
  let crc = -1;

  for (let index = 0; index < buf.length; index++) {
    const byte = buf[index];
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

export function variableSnakeToCamelCase(str: string) {
  return str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase().replace("-", "").replace("_", ""),
  );
}

export function buildArgConfig(name: string, argType: string) {
  name = name === "self" ? "is_self" : name;
  // Default values
  const currentConfig: any = {
    isVector: false,
    isFlag: false,
    skipConstructorId: false,
    flagIndex: -1,
    flagIndicator: true,
    type: null,
    useVectorId: null,
  };

  // Special case: some types can be inferred, which makes it
  // less annoying to type. Currently the only type that can
  // be inferred is if the name is 'random_id', to which a
  // random ID will be assigned if left as None (the default)
  const canBeInferred = name === "random_id";

  // The type can be an indicator that other arguments will be flags
  if (argType !== "#") {
    currentConfig.flagIndicator = false;
    // Strip the exclamation mark always to have only the name
    currentConfig.type = argType.replace(/^!+/, "");

    // The type may be a flag (flags.IDX?REAL_TYPE)
    // Note that 'flags' is NOT the flags name; this
    // is determined by a previous argument
    // However, we assume that the argument will always be called 'flags'
    // @ts-ignore
    const flagMatch = currentConfig.type.match(/flags.(\d+)\?([\w<>.]+)/);

    if (flagMatch) {
      currentConfig.isFlag = true;
      currentConfig.flagIndex = Number(flagMatch[1]);
      // Update the type to match the exact type, not the "flagged" one
      [, , currentConfig.type] = flagMatch;
    }

    // Then check if the type is a Vector<REAL_TYPE>
    // @ts-ignore
    const vectorMatch = currentConfig.type.match(/[Vv]ector<([\w\d.]+)>/);

    if (vectorMatch) {
      currentConfig.isVector = true;

      // If the type's first letter is not uppercase, then
      // it is a constructor and we use (read/write) its ID.
      // @ts-ignore
      currentConfig.useVectorId = currentConfig.type.charAt(0) === "V";

      // Update the type to match the one inside the vector
      [, currentConfig.type] = vectorMatch;
    }

    // See use_vector_id. An example of such case is ipPort in
    // help.configSpecial
    // @ts-ignore
    if (/^[a-z]$/.test(currentConfig.type.split(".").pop().charAt(0))) {
      currentConfig.skipConstructorId = true;
    }

    // The name may contain "date" in it, if this is the case and
    // the type is "int", we can safely assume that this should be
    // treated as a "date" object. Note that this is not a valid
    // Telegram object, but it's easier to work with
    // if (
    //     this.type === 'int' &&
    //     (/(\b|_)([dr]ate|until|since)(\b|_)/.test(name) ||
    //         ['expires', 'expires_at', 'was_online'].includes(name))
    // ) {
    //     this.type = 'date';
    // }
  }
  return currentConfig;
}

const fromLine = (line: string, isFunction: boolean) => {
  const match = line.match(
    /([\w.]+)(?:#([0-9a-fA-F]+))?(?:\s{?\w+:[\w\d<>#.?!]+}?)*\s=\s([\w\d<>#.?]+);$/,
  );
  if (!match) {
    // Probably "vector#1cb5c415 {t:Type} # [ t ] = Vector t;"
    throw new Error(`Cannot parse TLObject ${line}`);
  }

  const argsMatch = findAll(/({)?(\w+):([\w\d<>#.?!]+)}?/, line);
  const currentConfig: any = {
    name: match[1],
    constructorId: parseInt(match[2], 16),
    argsConfig: {},
    subclassOfId: crc32(match[3]),
    result: match[3],
    isFunction: isFunction,
    namespace: undefined,
  };
  if (!currentConfig.constructorId) {
    const hexId = "";
    let args;

    if (Object.values(currentConfig.argsConfig).length) {
      args = ` ${
        Object.keys(currentConfig.argsConfig)
          .map((arg) => arg.toString())
          .join(" ")
      }`;
    } else {
      args = "";
    }

    const representation =
      `${currentConfig.name}${hexId}${args} = ${currentConfig.result}`
        .replace(/(:|\?)bytes /g, "$1string ")
        .replace(/</g, " ")
        .replace(/>|{|}/g, "")
        .replace(/ \w+:flags\.\d+\?true/g, "");

    if (currentConfig.name === "inputMediaInvoice") {
      // eslint-disable-next-line no-empty
      if (currentConfig.name === "inputMediaInvoice") {
      }
    }

    currentConfig.constructorId = crc32(Buffer.from(representation, "utf8"));
  }
  for (const [brace, name, argType] of argsMatch) {
    if (brace === undefined) {
      // @ts-ignore
      currentConfig.argsConfig[variableSnakeToCamelCase(name)] = buildArgConfig(
        name,
        argType,
      );
    }
  }
  if (currentConfig.name.includes(".")) {
    [currentConfig.namespace, currentConfig.name] = currentConfig.name.split(
      /\.(.+)/,
    );
  }
  currentConfig.name = snakeToCamelCase(currentConfig.name);
  /*
  for (const arg in currentConfig.argsConfig){
    if (currentConfig.argsConfig.hasOwnProperty(arg)){
      if (currentConfig.argsConfig[arg].flagIndicator){
        delete  currentConfig.argsConfig[arg]
      }
    }
  }*/
  return currentConfig;
};

export const parseTl = function* (
  content: string,
  layer: string,
  methods: any[] = [],
  ignoreIds = CORE_TYPES,
) {
  const methodInfo = (methods || []).reduce(
    (o, m) => ({ ...o, [m.name]: m }),
    {},
  );
  const objAll = [];
  const objByName: any = {};
  const objByType: any = {};

  const file = content;

  let isFunction = false;

  for (let line of file.split("\n")) {
    const commentIndex = line.indexOf("//");

    if (commentIndex !== -1) {
      line = line.slice(0, commentIndex);
    }

    line = line.trim();

    if (!line) {
      continue;
    }

    const match = line.match(/---(\w+)---/);

    if (match) {
      const [, followingTypes] = match;
      isFunction = followingTypes === "functions";
      continue;
    }

    try {
      const result = fromLine(line, isFunction);

      if (ignoreIds.has(result.constructorId)) {
        continue;
      }

      objAll.push(result);

      if (!result.isFunction) {
        if (!objByType[result.result]) {
          objByType[result.result] = [];
        }

        objByName[result.name] = result;
        objByType[result.result].push(result);
      }
    } catch (e: any) {
      if (!e.toString().includes("vector#1cb5c415")) {
        throw e;
      }
    }
  }

  // Once all objects have been parsed, replace the
  // string type from the arguments with references
  for (const obj of objAll) {
    if (AUTH_KEY_TYPES.has(obj.constructorId)) {
      for (const arg in obj.argsConfig) {
        if (obj.argsConfig[arg].type === "string") {
          obj.argsConfig[arg].type = "bytes";
        }
      }
    }
  }

  for (const obj of objAll) {
    yield obj;
  }
};
