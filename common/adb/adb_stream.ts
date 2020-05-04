/*
 * Copyright 2020 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
