import { useCallback, useState, useEffect } from "react";
import { useCutClientState } from "./useCutClientState";
import { useModalState } from "./useModalState";
import { useWebSocketCutList } from "./useWebSocketCutList";
import { useCutListOperations } from "./useCutListOperations";
import { useCutOperations } from "./useCutOperations";
import { useCutListTable } from "./useCutListTable";
import { usePipeLengthTable } from "./usePipeLengthTable";
import { usePipeLengthSelection } from "./usePipeLengthSelection";
import { useUIConfigurations } from "./useUIConfigurations";
import { filterBySearch } from "./useTableUtils";
import {
  enrichPipeLengths,
  extractPipeLengthsFromCutList,
  validateHeatNumber,
} from "../utils/cutClientUtils";
import { TAB_TYPES } from "@components/features/factory/WorkTabs";
import { CutListDto, PipeLengthDto, UserDto } from "@/dtos";
import { WORK_STATES } from "../constants";
import {
  columnsCutList,
  columnsPipeLengthDto,
} from "@components/features/WorkTable/WorkTable.columns";
import { PipeLengthWithContext } from "@/interfaces";

export interface UseCutWorkflowProps {
  initialItems: CutListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

// Main hook for cut workflow
export const useCutWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseCutWorkflowProps) => {
  // Client state management
  const state = useCutClientState(initialItems, fetchError);
  const {
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
  } = state;

  // Modal state management
  const modal = useModalState();
  const {
    pendingItem,
    isEditing,
    setInputValue,
    completedItem,
    setPendingItem,
    setIsEditing,
    setInputShow,
    setShowCompletionModal,
    setCompletedItem,
    resetModalState,
    resetCompletionModal,
  } = modal;

  // Handle cut list update from websocket
  const handleCutListUpdate = useCallback(
    (updatedCutList: CutListDto) => {
      setCutLists((prev) =>
        prev.map((cl) => (cl.id === updatedCutList.id ? updatedCutList : cl)),
      );
      if (activeTab === TAB_TYPES.WORKING) {
        setWorkingPipeLengths((prev) => {
          const belongsToUpdated = prev.some((pl) =>
            extractPipeLengthsFromCutList(updatedCutList).some(
              (newPl) => newPl.id === pl.id,
            ),
          );
          return belongsToUpdated
            ? extractPipeLengthsFromCutList(updatedCutList)
            : prev;
        });
      }
    },
    [activeTab, setCutLists, setWorkingPipeLengths],
  );

  // WebSocket connection
  useWebSocketCutList({ onCutListUpdate: handleCutListUpdate, enabled: true });

  // Update pipe length in state
  const updatePipeLength = (updated: PipeLengthDto) => {
    setWorkingPipeLengths((prev) =>
      prev.map((pl) => (pl.id === updated.id ? updated : pl)),
    );
  };

  // Cut list operations
  const { setWorking } = useCutListOperations({
    onSuccess: (updated) => {
      setCutLists((prev) =>
        prev.map((cl) => (cl.id === updated.id ? updated : cl)),
      );
      setWorkingPipeLengths(extractPipeLengthsFromCutList(updated));
      setActiveTab(TAB_TYPES.WORKING);
    },
    onError: setErrorMsg,
  });

  // Search field state
  const [searchField, setSearchField] = useState<string>("id");

  // Custom search functions
  const cutListSearchFunction = (
    items: CutListDto[],
    search: string,
    searchField: string,
  ) => filterBySearch(items, search, searchField, columnsCutList);
  const pipeLengthSearchFunction = (
    items: PipeLengthDto[],
    search: string,
    searchField: string,
  ) => filterBySearch(items, search, searchField, columnsPipeLengthDto);

  // Table hooks with custom search
  const cutListTable = useCutListTable(
    cutLists,
    search,
    currentUser?.id,
    {
      onCutListSelected: (cutList) => {
        setWorkingPipeLengths(extractPipeLengthsFromCutList(cutList));
        setActiveTab(TAB_TYPES.WORKING);
      },
      onCutListSetWorking: async (id) => await setWorking(id),
    },
    searchField,
    cutListSearchFunction,
  );

  const pipeLengthTable = usePipeLengthTable(
    enrichPipeLengths(workingPipeLengths, cutLists) as PipeLengthWithContext[],
    search,
    {
      onWorkingTransition: (item: PipeLengthDto) => {
        setPendingItem(item);
        setIsEditing(false);
        setInputValue("");
        setInputShow(true);
      },
      onItemCompleted: (item: PipeLengthDto) => {
        setCompletedItem(item);
        setShowCompletionModal(true);
      },
    },
    searchField,
    pipeLengthSearchFunction,
  );

  // Selected pipe length
  const selectedPipeLength =
    activeTab === TAB_TYPES.WORKING ? pipeLengthTable.selectedItem : null;

  // Cut operations
  const { startWork, finishWork, editHeatNumber, isSubmitting } =
    useCutOperations({
      onSuccess: (updated) => {
        updatePipeLength(updated);
        if (!isEditing && pendingItem) {
          pipeLengthTable.proceedToWorking(pendingItem.id);
        }
        resetModalState();
      },
      onError: setErrorMsg,
    });

  // Handle input confirmation
  const handleInputConfirm = async (inputHeatNumber: string) => {
    if (!pendingItem || !validateHeatNumber(inputHeatNumber)) {
      setErrorMsg("Please enter a valid heat number");
      return;
    }
    const heatNumber = parseInt(inputHeatNumber);
    isEditing
      ? await editHeatNumber(pendingItem, heatNumber)
      : await startWork(pendingItem, heatNumber);
  };

  // Handle heat number edit
  const handleHeatNumberEdit = () => {
    if (!selectedPipeLength || activeTab === TAB_TYPES.ALL) return;
    const currentHeat = selectedPipeLength.heatNumber?.toString() || "";
    setPendingItem(selectedPipeLength);
    setIsEditing(true);
    setInputValue(currentHeat);
    setInputShow(true);
  };

  // Handle completion modal confirm
  const handleCompletionModalConfirm = async () => {
    if (!completedItem) return resetCompletionModal();
    await finishWork(completedItem);
    if (completedItem.id === selectedPipeLength?.id)
      pipeLengthTable.clearSelection();
    resetCompletionModal();
  };

  // Handle next click
  const handleNextClick = () => {
    if (activeTab === TAB_TYPES.ALL) return cutListTable.handleNextWorkflow();
    if (activeTab === TAB_TYPES.WORKING) {
      pipeLengthTable.areAllWorkingItemsFinished()
        ? (setActiveTab(TAB_TYPES.ALL), setWorkingPipeLengths([]))
        : pipeLengthTable.handleNextWorkflow();
    }
  };

  // Pipe length selection
  const { enrichedSelectedItem } = usePipeLengthSelection(
    selectedPipeLength,
    cutLists,
    activeTab,
  );

  // Check if heat number can be edited
  const canEditHeatNumber = Boolean(
    selectedPipeLength &&
      activeTab === TAB_TYPES.WORKING &&
      [WORK_STATES.WORKING, WORK_STATES.FINISHED].includes(
        pipeLengthTable.rowStateAccessor(selectedPipeLength) as
          | "working"
          | "finished",
      ),
  );

  // UI configurations
  const { cards, controlButtons, modalData } = useUIConfigurations(
    enrichedSelectedItem,
    completedItem,
    canEditHeatNumber,
    { onHeatNumberEdit: handleHeatNumberEdit, onNextClick: handleNextClick },
  );

  // Initialize search field based on active tab
  useEffect(() => {
    const defaultSearchField =
      activeTab === TAB_TYPES.ALL ? "id" : "heatNumber";
    setSearchField(defaultSearchField);
  }, [activeTab]);

  // Return all state and handlers
  return {
    state,
    modal,
    cutListTable,
    pipeLengthTable,
    selectedPipeLength,
    isSubmitting,
    cards,
    controlButtons,
    modalData,
    errorMsg,
    setErrorMsg,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    handleInputConfirm,
    handleCompletionModalConfirm,
    searchField,
    setSearchField,
  };
};
