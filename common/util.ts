import {byteArrayToString} from 'google-closure-library/closure/goog/crypt/crypt';
import {Deferred} from './promise';
import {padLeft} from './text';

/**
 * Convert an ascii string to a byte array.
 */
export function stringToByteArray(str: string) {
  const data = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    data[i] = str.charCodeAt(i);
  }
  return data;
}

export {Deferred, padLeft};
