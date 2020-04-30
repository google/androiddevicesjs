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
