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
