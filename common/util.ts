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
