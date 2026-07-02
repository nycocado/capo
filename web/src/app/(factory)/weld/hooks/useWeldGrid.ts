import { useCallback, useMemo } from "react";
import { WeldListDto } from "@dtos";
import { filterBySearch } from "@hooks";
import { extractWeldsFromWeldList } from "../utils/weldUtils";
import { WeldWithContext } from "@interfaces";

const getWeldState = (weld: WeldWithContext): "to-do" | "finished" =>
  weld.status === "done" ? "finished" : "to-do";

const itemStates = {
  "to-do": { className: "bg-secondary text-light" },
  finished: { className: "bg-success text-white" },
};

export interface UseWeldGridProps {
  weldList: WeldListDto | null;
  search: string;
  onAllFinished?: () => void;
  handleWeldClick: (weld: WeldWithContext) => void;
}

export function useWeldGrid({
  weldList,
  search,
  onAllFinished,
  handleWeldClick,
}: UseWeldGridProps) {
  const weldItems = useMemo(() => {
    if (!weldList) return [];
    return filterBySearch(extractWeldsFromWeldList(weldList), search, "number");
  }, [weldList, search]);

  const handleItemClick = useCallback(
    (weld: WeldWithContext) => handleWeldClick(weld),
    [handleWeldClick],
  );

  const handleNextWorkflow = useCallback(async () => {
    const next = weldItems.find((w) => getWeldState(w) === "to-do");
    if (next) handleWeldClick(next);
    else onAllFinished?.();
  }, [weldItems, handleWeldClick, onAllFinished]);

  const itemStateAccessor = useCallback(
    (item: WeldWithContext) => getWeldState(item),
    [],
  );

  return {
    weldItems,
    handleItemClick,
    itemStates,
    itemStateAccessor,
    handleNextWorkflow,
  };
}
