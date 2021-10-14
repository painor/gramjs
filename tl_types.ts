import { BigInteger, Buffer } from "./deps.ts";

export type AnyLiteral = Record<string, any> | void;
export type Client = any; // To be defined.
export type Utils = any; // To be defined.
export type X = unknown;
export type Type = unknown;
export type Bool = boolean;
export type int = number;
export type double = number;
export type float = number;
export type int128 = BigInteger;
export type int256 = BigInteger;
export type long = BigInteger;
export type bytes = Buffer | Uint8Array;
