import { useCallback, useMemo, useState } from "react";
import { useAssemblyListTable } from "./useAssemblyListTable";
import { useAssemblyMaterialVerification } from "./useAssemblyMaterialVerification";
import { usePDFViewer } from "./usePDFViewer";
import { AssemblyListDto, UserDto } from "@/dtos";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useJointGrid } from "./useJointGrid";
import { useUIConfigurations } from "@/hooks";
import { assemblyButtonConfig } from "@components/features/ControlPanel";
import { WS_EVENTS, WS_ROUTES } from "@/routes";
import { fetchToDoAssemblyLists, setAssemblyListWorking } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { replaceById, upsertById } from "@/domain/logic/upsertById";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";

/** Configuração da etapa de montagem para o núcleo genérico useWorkStage. */
const assemblyStageConfig: WorkStageConfig<AssemblyListDto> = {
  context: "assembly",
  queryKey: queryKeys.assemblyLists(),
  fetchToDo: fetchToDoAssemblyLists,
  setWorking: setAssemblyListWorking,
  ws: {
    route: WS_ROUTES.assemblyList,
    events: [
      {
        name: WS_EVENTS.assemblyList.updateWorkStatus,
        toUpdate: (payload) => (current) =>
          replaceById(current, payload as AssemblyListDto),
      },
      {
        name: WS_EVENTS.assemblyList.create,
        toUpdate: (payload) => (current) =>
          upsertById(current, payload as AssemblyListDto),
      },
    ],
  },
};

export interface UseAssemblyWorkflowProps {
  initialItems: AssemblyListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

/**
 * Hook principal da etapa de montagem: compõe o núcleo genérico useWorkStage
 * com tabela, verificação de materiais, grid de joints, visualizador de PDF
 * e configurações de UI.
 *
 * @param initialItems Lista prefetchada pelo RSC (seed do cache TanStack Query).
 * @param currentUser Usuário autenticado; usado para controle de acesso à assembly-list.
 * @param fetchError Erro do prefetch RSC, exibido até a primeira interação.
 */
export const useAssemblyWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseAssemblyWorkflowProps) => {
  const {
    items,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchField,
    setSearchField,
    errorMsg,
    setErrorMsg,
    setWorking,
  } = useWorkStage<AssemblyListDto>({
    ...assemblyStageConfig,
    initialItems,
    fetchError,
  });

  // A assembly-list selecionada (derivada do cache) alimenta o grid e o PDF.
  const [selectedAssemblyListId, setSelectedAssemblyListId] = useState<
    number | null
  >(null);
  const [selectedSheetNumber, setSelectedSheetNumber] = useState<number | null>(
    null,
  );
  const selectedAssemblyList = useMemo<AssemblyListDto | null>(
    () =>
      selectedAssemblyListId === null
        ? null
        : (items.find((al) => al.id === selectedAssemblyListId) ?? null),
    [items, selectedAssemblyListId],
  );

  // Abre uma assembly-list na aba Working (seleção + primeira sheet)
  const openWorkingView = useCallback((assemblyList: AssemblyListDto) => {
    setSelectedAssemblyListId(assemblyList.id);
    const firstSheet = assemblyList.isometric?.sheets?.[0];
    if (firstSheet) setSelectedSheetNumber(firstSheet.number);
    setActiveTab(TAB_TYPES.WORKING);
  }, [setActiveTab]);

  // Marca a assembly-list como working e abre sua vista de joints
  const startAssemblyList = useCallback(
    async (id: number): Promise<boolean> => {
      const updated = await setWorking(id);
      if (updated) openWorkingView(updated);
      return Boolean(updated);
    },
    [setWorking, openWorkingView],
  );

  const materialVerification = useAssemblyMaterialVerification();

  const assemblyListTable = useAssemblyListTable(items, search, currentUser?.id, {
    onAssemblyListSelected: async (assemblyList: AssemblyListDto) => {
      // Sempre passa pela verificação de material, independente do status da lista.
      try {
        await materialVerification.startVerification(assemblyList, () => {
          const currentState = assemblyList.workStatus?.name || "to-do";
          if (currentState === "to-do") {
            void startAssemblyList(assemblyList.id);
          } else {
            openWorkingView(assemblyList);
          }
        });
      } catch {
        setErrorMsg("Failed to start material verification");
      }
    },
    onAssemblyListSetWorking: async (id) => await startAssemblyList(id),
  });

  const weldGrid = useJointGrid({
    assemblyList: selectedAssemblyList,
    sheetNumber: selectedSheetNumber,
    search: activeTab === TAB_TYPES.WORKING ? "" : search, // Sem busca no working
    onAllFinished: () => {
      setSelectedAssemblyListId(null);
      setSelectedSheetNumber(null);
      setActiveTab(TAB_TYPES.ALL);
    },
    onError: setErrorMsg,
  });

  const handleNextWorkflow = useCallback(async () => {
    if (activeTab === TAB_TYPES.ALL) {
      assemblyListTable.handleNextWorkflow();
    } else if (activeTab === TAB_TYPES.WORKING) {
      await weldGrid.handleNextWorkflow();
    }
  }, [activeTab, assemblyListTable, weldGrid]);

  const currentSheet =
    selectedAssemblyList && selectedSheetNumber !== null
      ? selectedAssemblyList.isometric?.sheets?.find(
          (s) => s.number === selectedSheetNumber,
        )
      : null;

  const {
    pdfFile,
    loading: pdfLoading,
    error: pdfError,
  } = usePDFViewer(currentSheet?.document || null);

  const handleIsometricClick = useCallback(() => {
    if (pdfFile) {
      window.open(pdfFile, "_blank");
    } else {
      setErrorMsg("No PDF loaded");
    }
  }, [pdfFile, setErrorMsg]);

  const handleListClick = useCallback(async () => {
    if (!selectedAssemblyList) {
      setErrorMsg("No assembly list selected");
      return;
    }
    try {
      await materialVerification.openMaterialsConsultation(selectedAssemblyList);
    } catch {
      setErrorMsg("Failed to load materials list");
    }
  }, [selectedAssemblyList, materialVerification, setErrorMsg]);

  const { controlButtons } = useUIConfigurations(
    null,
    null,
    {
      onIsometricClick: handleIsometricClick,
      onListClick: handleListClick,
      onNextClick: handleNextWorkflow,
    },
    {
      buttonConfig: assemblyButtonConfig,
    },
  );

  return {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    assemblyListTable,
    materialVerification,
    weldGrid,
    weldItems: weldGrid.weldItems,
    selectedAssemblyList,
    selectedSheetNumber,
    pdfFile,
    pdfLoading,
    pdfError,
    controlButtons,
    setActiveTab,
    searchField,
    setSearchField,
  };
};
