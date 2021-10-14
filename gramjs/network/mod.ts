export { MTProtoPlainSender } from "./MTProtoPlainSender.ts";
export { doAuthentication } from "./Authenticator.ts";
export { MTProtoSender } from "./MTProtoSender.ts";

interface states {
    disconnected: -1;
    connected: 1;
    broken: 0;
}

export class UpdateConnectionState {
    static disconnected = -1;

    static connected = 1;

    static broken = 0;
    state: number;

    constructor(state: number) {
        this.state = state;
    }
}

export {
    Connection,
    ConnectionTCPFull,
    ConnectionTCPAbridged,
    ConnectionTCPObfuscated,
} from "./connection";
