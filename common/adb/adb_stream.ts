import {stringToByteArray} from '../util';

/**
 * A channel that an AdbStream can use to send messages back to the remote
 * device.
 */
export interface AdbStreamChannel {
  close(): Promise<void>;
  write(data: Uint8Array): Promise<void>;
}

/**
 * Base class for a stream to the remote device.
 *
 * NOTE: All public methods on the class are not expected to be called outside
 * an AdbStreamChannel.
 */
export abstract class AdbStream {
  channel?: AdbStreamChannel;

  constructor(readonly destination: string) {}

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
  }

  async write(data: Uint8Array|string) {
    if (!this.channel) {
      throw new Error('Stream is not open');
    }
    if (typeof data === 'string') {
      return this.channel.write(stringToByteArray(data));
    } else {
      return this.channel.write(data);
    }
  }

  /**
   * Called when the remote side sends a data payload.
   */
  abstract onData(data: Uint8Array): void;

  /**
   * Called when the remote closes the stream. This will not be called as a
   * result of a local close or an error.
   */
  abstract onClose(): void;
}
