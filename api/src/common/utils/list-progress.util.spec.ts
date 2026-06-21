import { deriveListProgress } from "@common/utils/list-progress.util";
import { ListProgress } from "@shared/types";

describe("deriveListProgress", () => {
  it("DONE quando todos os itens estão concluídos", () => {
    expect(deriveListProgress({ total: 5, done: 5, inProgress: 0 })).toBe(
      ListProgress.DONE,
    );
  });

  it("TO_DO quando nada começou", () => {
    expect(deriveListProgress({ total: 5, done: 0, inProgress: 0 })).toBe(
      ListProgress.TO_DO,
    );
  });

  it("IN_PROGRESS com alguns concluídos, mas não todos", () => {
    expect(deriveListProgress({ total: 5, done: 2, inProgress: 0 })).toBe(
      ListProgress.IN_PROGRESS,
    );
  });

  it("IN_PROGRESS com algum item em progresso", () => {
    expect(deriveListProgress({ total: 5, done: 0, inProgress: 1 })).toBe(
      ListProgress.IN_PROGRESS,
    );
  });

  it("TO_DO para uma lista vazia (total 0 não é DONE)", () => {
    expect(deriveListProgress({ total: 0, done: 0, inProgress: 0 })).toBe(
      ListProgress.TO_DO,
    );
  });
});
