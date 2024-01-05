import { action, type Operation } from "effection";

/**
 * N.B. it would be nice to use the same implementation from the effection tutorial, but that's
 * proven tricky to get working in client code:
 *
 * ```
 * return race([
 *   operation,
 *   call(function* () {
 *     yield* sleep(timeoutMs);
 *     throw new Error(timeoutMessage);
 *   }),
 * ]);
 * ```
 *
 * @throws if the given operation does not complete within the alotted timeout
 */
export function withTimeout<T>(
  operation: Operation<T>,
  timeoutMs: number,
  timeoutMessage?: string,
) {
  return action<T>(function* (resolve, reject) {
    const timeout = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    try {
      resolve(yield* operation);
    } finally {
      clearTimeout(timeout);
    }
  });
}
