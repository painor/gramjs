import { MemorySession } from "./Memory.ts";
import store from "store2";
import { AuthKey } from "../crypto/AuthKey.ts";

export class StoreSession extends MemorySession {
    private readonly sessionName: string;
    private store: store.StoreAPI;

    constructor(sessionName: string) {
        super();
        if (typeof localStorage === "undefined" || localStorage === null) {
            const LocalStorage = require("node-localstorage").LocalStorage;
            this.store = store.area("fs", new LocalStorage("./" + sessionName));
        } else {
            this.store = store.area("fs", localStorage);
        }
        this.sessionName = sessionName + ":";
    }

    async load() {
        let authKey = this.store.get(this.sessionName + "authKey");
        if (authKey && typeof authKey === "object") {
            this._authKey = new AuthKey();
            if ("data" in authKey) {
                authKey = Buffer.from(authKey.data);
            }
            await this._authKey.setKey(authKey);
        }

        const dcId = this.store.get(this.sessionName + "dcId");
        if (dcId) {
            this._dcId = dcId;
        }

        const port = this.store.get(this.sessionName + "port");
        if (port) {
            this._port = port;
        }
        const serverAddress = this.store.get(
            this.sessionName + "serverAddress"
        );
        if (serverAddress) {
            this._serverAddress = serverAddress;
        }
    }

    setDC(dcId: number, serverAddress: string, port: number) {
        this.store.set(this.sessionName + "dcId", dcId);
        this.store.set(this.sessionName + "port", port);
        this.store.set(this.sessionName + "serverAddress", serverAddress);
        super.setDC(dcId, serverAddress, port);
    }

    set authKey(value: AuthKey | undefined) {
        this._authKey = value;
        this.store.set(this.sessionName + "authKey", value?.getKey());
    }

    get authKey() {
        return this._authKey;
    }

    processEntities(tlo: any) {
        const rows = this._entitiesToRows(tlo);
        if (!rows) {
            return;
        }
        for (const row of rows) {
            row.push(new Date().getTime());
            this.store.set(this.sessionName + row[0], row);
        }
    }

    getEntityRowsById(id: number, exact: boolean = true): any {
        return this.store.get(this.sessionName + id);
    }
}
