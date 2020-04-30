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
export class Deferred<T> {
  promise: Promise<T>;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  resolve!: (value?: T|PromiseLike<T>) => void;
  reject!: (reason?: {}) => void;
}

/**
 * Makes a failing promise succeed and a successful promise fail.
 *
 * @deprecated Use expectAsync(...).toBeRejectedWith(...) instead.
 *     https://jasmine.github.io/api/3.2/global.html#expectAsync
 */
export function failOnSuccess(promise: Promise<{}|void>) {
  return promise.then(
      () => Promise.reject('Not expected to succeed'), () => {});
}
