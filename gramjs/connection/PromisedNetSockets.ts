import { Buffer, Client, Mutex, SocketEvent, SocketPacket } from "../deps.ts";

const mutex = new Mutex();

const closeError = new Error("NetSocket was closed");

export class PromisedNetSockets {
  private client?: Client;
  private closed: boolean;
  private stream: Buffer;
  private canRead?: boolean | Promise<boolean>;
  // deno-lint-ignore no-explicit-any
  private resolveRead: ((value?: any) => void) | undefined;

  constructor() {
    this.client = undefined;
    this.closed = true;
    this.stream = Buffer.alloc(0);
  }

  async readExactly(number: number) {
    let readData = Buffer.alloc(0);
    while (true) {
      const thisTime = await this.read(number);
      readData = Buffer.concat([readData, thisTime]);
      number = number - thisTime.length;
      if (!number) {
        return readData;
      }
    }
  }

  async read(number: number) {
    if (this.closed) {
      throw closeError;
    }
    await this.canRead;
    if (this.closed) {
      throw closeError;
    }
    const toReturn = this.stream.slice(0, number);
    this.stream = this.stream.slice(number);
    if (this.stream.length === 0) {
      this.canRead = new Promise((resolve) => {
        this.resolveRead = resolve;
      });
    }

    return toReturn;
  }

  async readAll() {
    if (this.closed || !(await this.canRead)) {
      throw closeError;
    }
    const toReturn = this.stream;
    this.stream = Buffer.alloc(0);
    this.canRead = new Promise((resolve) => {
      this.resolveRead = resolve;
    });
    return toReturn;
  }

  /**
   * Creates a new connection
   * @param port
   * @param ip
   * @returns {Promise<void>}
   */
  // deno-lint-ignore require-await
  async connect(port: number, ip: string) {
    this.stream = Buffer.alloc(0);

    this.client = new Client({ hostname: ip, port: port });
    this.canRead = new Promise((resolve) => {
      this.resolveRead = resolve;
    });
    this.closed = false;
    return new Promise((resolve, reject) => {
      if (this.client) {
        this.client.on(SocketEvent.connect, (_client: Client) => {
          this.receive();
          resolve(this);
        });
        this.client.on(SocketEvent.error, reject);
        this.client.on(SocketEvent.close, () => {
          if (this.client && !this.client.isOpen) {
            if (this.resolveRead) {
              this.resolveRead(false);
            }
            this.closed = true;
          }
        });
        this.client.connect();
      }
    });
  }

  write(data: Buffer) {
    if (this.closed) {
      throw closeError;
    }
    if (this.client) {
      this.client.write(data);
    }
  }

  // deno-lint-ignore require-await
  async close() {
    if (this.client) {
      this.client.close();
    }
    this.closed = true;
  }

  // deno-lint-ignore require-await
  async receive() {
    if (this.client) {
      this.client.on(
        SocketEvent.receive,
        async (_client: Client, data: SocketPacket) => {
          const release = await mutex.acquire();
          try {
            //CONTEST BROWSER
            this.stream = Buffer.concat([
              this.stream,
              data.toData(),
            ]);
            if (this.resolveRead) {
              this.resolveRead(true);
            }
          } finally {
            release();
          }
        },
      );
    }
  }
}
