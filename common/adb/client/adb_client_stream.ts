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
import {AdbStream} from '../adb_stream';

export const ADB_SERVER_PORT = 5037;

/**
 * Factory to connect streams to an ADB server.
 */
export interface AdbClientStreamFactory {
  /**
   * Open a new stream, optionally connecting it to a specific transport.
   *
   * @param stream the stream to connect to the server
   * @param target optional parameter to specify a target of the command
   *                  (transport change). If ommited the stream will be directed
   *                  at the host.
   *
   * The transport command is the raw commands sent in order to change the
   * target of the stream.
   * For example:
   *     host:transport:<serial-number>
   *     host:transport-usb
   *     host:transport-local
   */
  open(stream: AdbStream, target?: {
    transport: string,
  }): Promise<void>;
}
