import { useCallback } from "react";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";

type WeldState = "to-do" | "finished";

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
