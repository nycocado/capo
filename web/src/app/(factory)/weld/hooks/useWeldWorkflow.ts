import { useCallback, useState, useEffect } from "react";
import { useWeldListTable } from "./useWeldListTable";
import { WeldListDto, UserDto } from "@/dtos";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { getSearchFields } from "@components/features/ControlPanel/ControlPanel.searchConfig";
import {
  useUIConfigurations,
  useWebSocket,
  useWorkClientState,
  useWorkListOperations,
} from "@/hooks";
import { API_ROUTES, WS_EVENTS, WS_ROUTES } from "@/routes";
import { useWeldGrid } from "@/app/(factory)/weld/hooks/useWeldGrid";
import { useWeldDataVerification } from "@/app/(factory)/weld/hooks/useWeldDataVerification";
import { weldButtonConfig } from "@components/features/ControlPanel";
import { weldCardConfigs } from "@components/features/WorkPanel/WorkPanel.cardConfigs";

export interface UseWeldWorkflowProps {
  initialItems: WeldListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

// Main hook for weld workflow
export const useWeldWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseWeldWorkflowProps) => {
  // Client state management
  const state = useWorkClientState<WeldListDto, WeldListDto>(
    initialItems,
    fetchError,
  );
  const {
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
  } = state;

  // Additional state for weld workflow
  const [selectedWeldList, setSelectedWeldList] = useState<WeldListDto | null>(
    null,
  );

  // Search field state
  const [searchField, setSearchField] = useState<string>("id");

  // Handle weld list creation from websocket
  const handleWeldListCreates = useCallback(
    (newWeldLists: WeldListDto[]) => {
      // Update MAIN items array (what's displayed in table)
      setItems((prev) => [...prev, ...newWeldLists]);

      newWeldLists.forEach((weldList) => {
        const workStatus = weldList.workStatus?.name;
        if (workStatus === "working") {
          setWorkingItems((prev) => [...prev, weldList]);
        }
      });
    },
    [setItems],
  );

  // Handle weld list update from websocket
  const handleWeldListUpdate = useCallback(
    (updatedWeldList: WeldListDto) => {
      // Update main items
      setItems((prev) =>
        prev.map((item) =>
          item.id === updatedWeldList.id ? updatedWeldList : item,
        ),
      );

      setWorkingItems((prev) =>
        prev.map((item) =>
          item.id === updatedWeldList.id ? updatedWeldList : item,
        ),
      );

      // Update selected if it matches
      setSelectedWeldList((prev) =>
        prev?.id === updatedWeldList.id ? updatedWeldList : prev,
      );
    },
    [setItems],
  );

  useWebSocket({
    wsRoute: WS_ROUTES.weldList,
    eventHandlers: [
      {
        eventName: WS_EVENTS.weldList.creates,
        handler: handleWeldListCreates,
      },
      {
        eventName: WS_EVENTS.weldList.updatedWorkStatus,
        handler: handleWeldListUpdate,
      },
    ],
    enabled: true,
    connectionName: "WeldList",
  });

  // Work list operations
  const { setWorking } = useWorkListOperations<WeldListDto>(
    API_ROUTES.weldLists.setWorking,
    "setting weld list to working",
    {
      onSuccess: (updated) => {
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );

        setWorkingItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );

        setSelectedWeldList(updated);
        setActiveTab(TAB_TYPES.WORKING);
      },
      onError: setErrorMsg,
    },
  );

  const weldListTable = useWeldListTable(items, search, currentUser?.id, {
    onWeldListSelected: async (weldList) => {
      const currentState = weldList.workStatus?.name || "to-do";
      if (currentState === "to-do") {
        await setWorking(weldList.id);
      } else {
        setSelectedWeldList(weldList);
        setActiveTab(TAB_TYPES.WORKING);
      }
    },
    onWeldListSetWorking: async (id) => await setWorking(id),
  });

  // Weld data verification - similar ao MaterialVerification do assembly
  const weldDataVerification = useWeldDataVerification({
    onWeldProcessed: (weld) => {
      // Quando o weld é processado com sucesso, atualizar o selectedWeldList
      if (selectedWeldList) {
        const updatedWeldList = {
          ...selectedWeldList,
          spool: {
            ...selectedWeldList.spool,
            welds: selectedWeldList.spool.welds?.map((w) =>
              w.id === weld.id
                ? {
                    ...w,
                    workStatus: { name: "finished", notes: null, createdBy: 1 },
                  }
                : w,
            ),
          },
        };
        setSelectedWeldList(updatedWeldList);

        // Também atualizar nos items principais
        setItems((prev) =>
          prev.map((item) =>
            item.id === selectedWeldList.id ? updatedWeldList : item,
          ),
        );
      }
    },
    onError: setErrorMsg,
  });

  // Função para interceptar cliques em welds ANTES da requisição
  const handleWeldClick = useCallback(
    (weld: WeldWithContext) => {
      const currentState = weld.workStatus?.name || "to-do";

      if (currentState === "to-do") {
        // Intercepta ANTES da requisição e abre modal de verificação
        weldDataVerification.startVerification(weld);
      }
      // Se já está finished, apenas seleciona para visualização (sem ação)
    },
    [weldDataVerification],
  );

  const weldGrid = useWeldGrid({
    weldList: selectedWeldList,
    search: activeTab === TAB_TYPES.WORKING ? "" : search,
    onAllFinished: () => {
      setSelectedWeldList(null);
      setActiveTab(TAB_TYPES.ALL);
    },
    onError: setErrorMsg,
    handleWeldClick,
  });

  const handleNextWorkflow = useCallback(async () => {
    if (activeTab === TAB_TYPES.ALL) {
      weldListTable.handleNextWorkflow();
    } else if (activeTab === TAB_TYPES.WORKING) {
      await weldGrid.handleNextWorkflow();
    }
  }, [activeTab, weldListTable, weldGrid]);

  // UI configurations
  const { cards, controlButtons } = useUIConfigurations(
    null,
    null,
    {
      onNextClick: handleNextWorkflow,
    },
    {
      buttonConfig: weldButtonConfig,
      cardConfigs: weldCardConfigs,
    },
  );

  useEffect(() => {
    const searchFields = getSearchFields("weld", activeTab);
    const defaultSearchField = searchFields[0]?.id || "id";
    setSearchField(defaultSearchField);
  }, [activeTab]);

  return {
    // State organized like the client expects
    state: {
      errorMsg,
      activeTab,
      search,
      setSearch,
      setErrorMsg,
    },

    // Table configurations
    weldListTable,

    // Operations
    weldGrid,

    // Data
    weldItems: weldGrid.weldItems,
    selectedWeldList,

    // UI configurations
    cards,
    controlButtons,

    // Handlers
    setActiveTab,
    handleWeldClick, // Função que intercepta ANTES da requisição

    // Search
    searchField,
    setSearchField,

    // Weld Data Verification - similar ao MaterialVerification do assembly
    weldDataVerification,
  };
};
