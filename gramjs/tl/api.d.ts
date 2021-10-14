// import { EntityLike, MessageIDLike } from "./define.d.ts";
// import { Buffer, BigInteger } from "./deps.ts";

// export namespace Api {
//     type AnyLiteral = Record<string, any> | void;
//     type Reader = any; // To be defined.
//     type Client = any; // To be defined.
//     type Utils = any; // To be defined.
//     type X = unknown;
//     type Type = unknown;
//     type Bool = boolean;
//     type int = number;
//     type double = number;
//     type float = number;
//     type int128 = BigInteger;
//     type int256 = BigInteger;
//     type long = BigInteger;
//     type bytes = Buffer;

//     export class VirtualClass<Args extends AnyLiteral> {
//         static CONSTRUCTOR_ID: number;
//         static SUBCLASS_OF_ID: number;
//         static className: string;
//         static classType: "constructor" | "request";

//         static serializeBytes(data: Buffer | string): Buffer;
//         static serializeDate(date: Date | number): Buffer;

//         getBytes(): Buffer;

//         CONSTRUCTOR_ID: number;
//         SUBCLASS_OF_ID: number;
//         className: string;
//         classType: "constructor" | "request";

//         constructor(args: Args);
//     }

//     export class Request<Args, Response> extends VirtualClass<Partial<Args>> {
//         static readResult(reader: Reader): Buffer;
//         resolve(client: Client, utils: Utils): Promise<void>;

//         __response: Response;
//     }
// }
