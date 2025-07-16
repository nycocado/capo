import { useState } from "react";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";

// Hook for client state in cut
export const useCutClientState = (
  initialItems: CutListDto[],
  fetchError?: string,
) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);
  const [cutLists, setCutLists] = useState<CutListDto[]>(initialItems);
  const [workingPipeLengths, setWorkingPipeLengths] = useState<PipeLengthDto[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.ALL);
  const [search, setSearch] = useState<string>("");

  return {
    errorMsg,
    setErrorMsg,
    cutLists,
    setCutLists,
    workingPipeLengths,
    setWorkingPipeLengths,
    activeTab,
    setActiveTab,
    search,
    setSearch,
  };
};
