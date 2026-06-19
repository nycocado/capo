import { useCallback } from "react";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";

type WeldState = "to-do" | "finished";

/**
 * Estado e estilos de cada weld no grid (o avanço propriamente dito é feito pelo
 * modal de dados em {@link useWeldDataVerification}). O estado vem do `status`
 * do weld (binário).
 */
export function useWeldOperations() {
  const getWeldState = useCallback(
    (weld: WeldWithContext): WeldState =>
      weld.status === "done" ? "finished" : "to-do",
    [],
  );

  const areAllWeldsFinished = useCallback(
    (weldItems: WeldWithContext[]) =>
      weldItems.length > 0 &&
      weldItems.every((weld) => getWeldState(weld) === "finished"),
    [getWeldState],
  );

  // onClick omitido: o WorkGrid usa o handleItemClick externo (abre o modal).
  const itemStates = {
    "to-do": { className: "bg-dark text-light" },
    finished: { className: "bg-success text-white" },
  };

  const itemStateAccessor = useCallback(
    (item: WeldWithContext) => getWeldState(item),
    [getWeldState],
  );

  return { getWeldState, areAllWeldsFinished, itemStates, itemStateAccessor };
}
