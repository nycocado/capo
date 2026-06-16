import { useMemo } from "react";

/**
 * Expõe os ids dos itens "finished" para a ordenação (finished por último).
 * O estado "finished" vem SEMPRE do backend — o frontend nunca o determina.
 *
 * @param items Itens a inspecionar.
 * @param rowStateAccessor Função que devolve o estado de cada item.
 * @returns `allFinishedIds`/`movedIds` com os ids dos itens finalizados.
 */
export const useFinishedItemsSorting = <T extends { id: number }>(
  items: T[],
  rowStateAccessor: (item: T) => string,
) => {
  const backendFinishedIds = useMemo(() => {
    return items
      .filter((item) => rowStateAccessor(item) === "finished")
      .map((item) => item.id);
  }, [items, rowStateAccessor]);

  return {
    allFinishedIds: backendFinishedIds,
    movedIds: backendFinishedIds,
  };
};
