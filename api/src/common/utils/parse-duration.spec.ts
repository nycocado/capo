import { durationToMs } from "@common/utils/parse-duration";

describe("durationToMs", () => {
  it("converte segundos, minutos, horas e dias", () => {
    expect(durationToMs("45s")).toBe(45_000);
    expect(durationToMs("30m")).toBe(30 * 60_000);
    expect(durationToMs("8h")).toBe(8 * 60 * 60_000);
    expect(durationToMs("7d")).toBe(7 * 24 * 60 * 60_000);
  });

  it("ignora espaços à volta", () => {
    expect(durationToMs(" 8h ")).toBe(8 * 60 * 60_000);
  });

  it("rejeita unidade desconhecida", () => {
    expect(() => durationToMs("8x")).toThrow();
  });

  it("rejeita valor sem unidade", () => {
    expect(() => durationToMs("8")).toThrow();
  });

  it("rejeita string vazia", () => {
    expect(() => durationToMs("")).toThrow();
  });
});
