import { TLMessage } from "./TLMessage.ts";
import { RPCResult } from "./RPCResult.ts";
import { MessageContainer } from "./MessageContainer.ts";
import { GZIPPacked } from "./GZIPPacked.ts";

export const coreObjects = new Map<number, Function>([
    [RPCResult.CONSTRUCTOR_ID, RPCResult],
    [GZIPPacked.CONSTRUCTOR_ID, GZIPPacked],
    [MessageContainer.CONSTRUCTOR_ID, MessageContainer],
]);
export { RPCResult, TLMessage, MessageContainer, GZIPPacked };
