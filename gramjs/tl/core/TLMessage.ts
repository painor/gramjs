import { BigInteger } from "https://deno.land/x/biginteger/mod.ts";

export class TLMessage {
    static SIZE_OVERHEAD = 12;
    static classType = "constructor";
    msgId: BigInteger;
    private classType: string;
    private seqNo: number;
    obj: any;

    constructor(msgId: BigInteger, seqNo: number, obj: any) {
        this.msgId = msgId;
        this.seqNo = seqNo;
        this.obj = obj;
        this.classType = "constructor";
    }
}
