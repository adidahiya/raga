import { call, type Operation, race, sleep } from "effection";

export function withTimeout<T>(
  operation: Operation<T>,
  timeoutMs: number,
  timeoutMessage?: string,
) {
  return race([
    operation,
    call(function* () {
      yield* sleep(timeoutMs);
      throw new Error(timeoutMessage);
    }),
  ]);
}
