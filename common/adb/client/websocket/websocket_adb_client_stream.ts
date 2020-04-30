import {byteArrayToString} from
'google-closure-library/closure/goog/crypt/crypt';
import {Deferred, padLeft, stringToByteArray} from '../../../util';
import {AdbStream, AdbStreamChannel} from '../../adb_stream';
import {AdbClientStreamFactory} from '../adb_client_stream';

const WEBSOCKET_PROXY_PORT = 5038;

/**
 * An AdbClientStreamFactory that opens node sockets to the ADB server.
 */
export class WebsocketAdbClientStreamFactory implements AdbClientStreamFactory {
  async open(stream: AdbStream, target?: {
    transport: string,
  }) {
    if (stream.channel) {
      throw new Error('Cannot reuse stream object');
    }
    const channel = new WebsocketAdbClientStreamChannel(stream, target);
    stream.channel = channel;
    await channel.connect();
  }
}

class WebsocketAdbClientStreamChannel implements AdbStreamChannel {
  private socket: WebSocket|undefined;
  private buffer: Uint8Array[] = [];
  private nextBufferDeferred = new Deferred<void>();
  private flowing = false;
  private closed = false;
  private readonly transport: string|undefined;

  constructor(private readonly stream: AdbStream, target?: {
    transport: string,
  }) {
    if (target) {
      this.transport = target.transport;
    }
  }

  /**
   * Connect the socket to the ADB server, switch transports if required and
   * wait for the stream destination OKAY response.
   */
  async connect() {
    this.socket =
        new WebSocket(`ws://localhost:${WEBSOCKET_PROXY_PORT}`, ['binary']);
        this.socket.binaryType = 'arraybuffer';
    await new Promise((resolve, reject) => {
      this.socket!.addEventListener('open', () => {
        this.socket!.removeEventListener('error', reject);
        resolve();
      });
      this.socket!.addEventListener('error', reject);
    });

    this.socket.addEventListener('close', () => {
      this.closed = true;
      this.nextBufferDeferred.resolve();
      this.stream.onClose();
    });

    this.socket.addEventListener('message', event => {
      const data = new Uint8Array(event.data);
      if (this.flowing) {
        this.stream.onData(data);
      } else {
        this.buffer.push(data);
        this.nextBufferDeferred.resolve();
        this.nextBufferDeferred = new Deferred<void>();
      }
    });

    if (this.transport) {
      await this.sendRequest(this.transport);
      await this.readResponse();
    }

    await this.sendRequest(this.stream.destination);
    await this.readResponse();

    this.flowing = true;
    for (const data of this.buffer) {
      this.stream.onData(data);
    }
  }

  async write(data: Uint8Array) {
    this.socket!.send(data);
  }

  async close() {
    this.socket!.close();
  }

  /**
   * Send a length prefixed request over the channel.
   */
  private async sendRequest(cmd: string) {
    await this.write(stringToByteArray(
        padLeft(cmd.length.toString(16).toUpperCase(), 4, '0') + cmd));
  }

  /**
   * Read a request response (OKAY or FAIL followed by a message).
   */
  private async readResponse() {
    const result = await this.readExactlyBytes(4);
    const resultStr = byteArrayToString(result);
    if (resultStr === 'OKAY') {
      return;
    } else if (resultStr === 'FAIL') {
      const messageLengthHex = await this.readExactlyBytes(4);
      // tslint:disable-next-line:ban force parsing base 16
      const messageLength = parseInt(byteArrayToString(messageLengthHex), 16);
      const message = await this.readExactlyBytes(messageLength);
      throw new Error(byteArrayToString(message));
    } else {
      throw new Error(`Unknown response '${resultStr}'`);
    }
  }

  private async readUpToBytes(size: number): Promise<Uint8Array|undefined> {
    if (this.closed) {
      return undefined;
    }
    if (size === 0) {
      return new Uint8Array(0);
    }

    if (this.buffer.length === 0) {
      await this.nextBufferDeferred.promise;
    }

    if (this.buffer[0].length <= size) {
      return this.buffer.shift()!;
    } else {
      const fullBuffer = this.buffer[0];
      this.buffer[0] = fullBuffer.slice(size);
      return fullBuffer.slice(0, size);
    }
  }

  /**
   * Read exactly size bytes from the stream, leaving the rest in the buffer.
   */
  private async readExactlyBytes(numBytes: number): Promise<Uint8Array> {
    return this.readUpToBytes(numBytes).then(bytes => {
      if (!bytes || bytes.length === numBytes) {
        // end of stream or all bytes were returned by first read
        return bytes || new Uint8Array(0);
      } else {
        const output = new Uint8Array(numBytes);
        output.set(bytes, 0);
        return this.continueReadExactly(numBytes - bytes.length, output);
      }
    });
  }

  private continueReadExactly(bytesRemaining: number, output: Uint8Array):
      Promise<Uint8Array> {
    return this.readUpToBytes(bytesRemaining).then(bytes => {
      const offset = output.length - bytesRemaining;
      if (!bytes) {
        // reached end of stream before reading all requested bytes so just
        // return what we have.
        return output.slice(0, offset);
      }
      output.set(bytes, offset);
      const newBytesRemaining = bytesRemaining - bytes.length;
      if (newBytesRemaining > 0) {
        return this.continueReadExactly(newBytesRemaining, output);
      } else {
        return output;
      }
    });
  }
}
