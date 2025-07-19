import { useState } from "react";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";

// Generic interface for work items
interface WorkItem {
  id: number;
}

// Generic hook for client state management
export const useWorkClientState = <TItem extends WorkItem, TWorking = any>(
  initialItems: TItem[],
  fetchError?: string,
) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);
  const [items, setItems] = useState<TItem[]>(initialItems);
  const [workingItems, setWorkingItems] = useState<TWorking[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.ALL);
  const [search, setSearch] = useState<string>("");

  return {
    errorMsg,
    setErrorMsg,
    items,
    setItems,
    workingItems,
    setWorkingItems,
    activeTab,
    setActiveTab,
    search,
    setSearch,
  };
};
