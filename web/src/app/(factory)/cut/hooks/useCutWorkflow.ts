import { useMemo, useState } from "react";
import { useCutOperations } from "./useCutOperations";
import { useCutListTable } from "./useCutListTable";
import { usePipeLengthTable } from "./usePipeLengthTable";
import { usePipeLengthSelection } from "./usePipeLengthSelection";
import {
  enrichPipeLengths,
  extractPipeLengthsFromCutList,
  mergePipeLengthIntoCutLists,
  validateHeatNumber,
} from "../utils/cutUtils";
import { CutListDto, PipeLengthDto, UserDto } from "@/dtos";
import {
  columnsCutList,
  columnsPipeLengthDto,
} from "@components/features/WorkTable/WorkTable.columns";
import { PipeLengthWithContext } from "@/interfaces";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { filterBySearch, useModalState, useUIConfigurations } from "@/hooks";
import { cutButtonConfig } from "@components/features/ControlPanel";
import { cutCardConfigs } from "@components/features/WorkPanel/WorkPanel.cardConfigs";
import { cutCompletionModalConfig } from "@components/layout/Modals/ComponentLabelModal.valueConfig";
import { WORK_STATES } from "@/constants";
import { WS_EVENTS, WS_ROUTES } from "@/routes";
import { fetchToDoCutLists, setCutListWorking } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { replaceById } from "@/domain/logic/upsertById";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";

// Configuração da etapa de corte para o núcleo genérico useWorkStage.
const cutStageConfig: WorkStageConfig<CutListDto> = {
  context: "cut",
  queryKey: queryKeys.cutLists(),
  fetchToDo: fetchToDoCutLists,
  setWorking: setCutListWorking,
  ws: {
    route: WS_ROUTES.cutList,
    events: [
      {
        name: WS_EVENTS.cutList.updateWorkStatus,
        toUpdate: (payload) => (current) =>
          replaceById(current, payload as CutListDto),
      },
    ],
  },
};

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
  // Server/UI state via the generic work-stage engine
  const {
    items: cutLists,
    queryClient,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchField,
    setSearchField,
    errorMsg,
    setErrorMsg,
    setWorking,
  } = useWorkStage<CutListDto>({ ...cutStageConfig, initialItems, fetchError });

  // A cut-list selecionada define os pipe-lengths da aba Working (derivados).
  const [selectedCutListId, setSelectedCutListId] = useState<number | null>(
    null,
  );
  const workingPipeLengths = useMemo<PipeLengthDto[]>(() => {
    if (selectedCutListId === null) return [];
    const cutList = cutLists.find((cl) => cl.id === selectedCutListId);
    return cutList ? extractPipeLengthsFromCutList(cutList) : [];
  }, [cutLists, selectedCutListId]);

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

  // Abre uma cut-list na aba Working (seleção sem mudança de status)
  const openCutList = (cutList: CutListDto) => {
    setSelectedCutListId(cutList.id);
    setActiveTab(TAB_TYPES.WORKING);
  };

  // Marca a cut-list como working e abre sua lista de pipe-lengths
  const startCutList = async (id: number): Promise<boolean> => {
    const updated = await setWorking(id);
    if (updated) {
      setSelectedCutListId(updated.id);
      setActiveTab(TAB_TYPES.WORKING);
    }
    return Boolean(updated);
  };

  // Update pipe length in the cached cut list (Working tab deriva daí)
  const updatePipeLength = (updated: PipeLengthDto) => {
    queryClient.setQueryData<CutListDto[]>(queryKeys.cutLists(), (current = []) =>
      mergePipeLengthIntoCutLists(current, updated),
    );
  };

  // Search field state
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
      onCutListSelected: openCutList,
      onCutListSetWorking: startCutList,
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
        ? (setActiveTab(TAB_TYPES.ALL), setSelectedCutListId(null))
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
    {
      onNextClick: handleNextClick,
    },
    {
      buttonConfig: cutButtonConfig,
      cardConfigs: cutCardConfigs,
      modalConfig: cutCompletionModalConfig,
    },
    {
      canEdit: canEditHeatNumber,
      onEditClick: handleHeatNumberEdit,
    },
  );

  // Return all state and handlers
  return {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    modal,
    cutListTable,
    pipeLengthTable,
    selectedPipeLength,
    isSubmitting,
    cards,
    controlButtons,
    modalData,
    handleInputConfirm,
    handleCompletionModalConfirm,
    setActiveTab,
    searchField,
    setSearchField,
  };
};
