import { DeadlockException } from "@mikro-orm/core";
import { withDeadlockRetry } from "@common/utils/deadlock-retry";

describe("withDeadlockRetry", () => {
  it("retorna o resultado quando não há erro", async () => {
    await expect(withDeadlockRetry(() => Promise.resolve("ok"))).resolves.toBe(
      "ok",
    );
  });

  it("tenta novamente em DeadlockException até ter sucesso", async () => {
    let calls = 0;
    const fn = jest.fn(() => {
      calls++;
      if (calls < 3) {
        return Promise.reject(new DeadlockException(new Error("deadlock")));
      }
      return Promise.resolve("ok");
    });

    await expect(withDeadlockRetry(fn)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("desiste após esgotar as tentativas e propaga o erro", async () => {
    const fn = jest.fn(() =>
      Promise.reject(new DeadlockException(new Error("deadlock"))),
    );

    await expect(withDeadlockRetry(fn)).rejects.toBeInstanceOf(
      DeadlockException,
    );
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it("propaga imediatamente erros que não são deadlock", async () => {
    const error = new Error("other failure");
    const fn = jest.fn(() => Promise.reject(error));

    await expect(withDeadlockRetry(fn)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
