import { DeadlockException } from "@mikro-orm/core";

const MAX_DEADLOCK_RETRIES = 3;

export async function withDeadlockRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DeadlockException && attempt < MAX_DEADLOCK_RETRIES) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, attempt * 50));
        continue;
      }
      throw error;
    }
  }
}
