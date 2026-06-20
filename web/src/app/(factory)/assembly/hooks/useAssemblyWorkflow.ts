import { useCallback, useMemo } from "react";
import { useAssemblyListTable } from "./useAssemblyListTable";
import { useAssemblyMaterialVerification } from "./useAssemblyMaterialVerification";
import { usePDFViewer } from "./usePDFViewer";
import { AssemblyListDto, UserDto } from "@/dtos";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useJointGrid } from "./useJointGrid";
import { useUIConfigurations } from "@/hooks";
import { assemblyButtonConfig } from "@components/features/ControlPanel";
import { WS_EVENTS, WS_ROUTES } from "@/routes";
import {
  claimAssemblyList,
  fetchAssemblyLists,
  getAssemblyListById,
  releaseAssemblyList,
} from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";

/** Configuração da etapa de montagem para o núcleo genérico useWorkStage. */
const assemblyStageConfig: WorkStageConfig<AssemblyListDto> = {
  context: "assembly",
  queryKey: queryKeys.assemblyLists(),
  fetchList: fetchAssemblyLists,
  fetchById: getAssemblyListById,
  claim: claimAssemblyList,
  release: releaseAssemblyList,
  ws: {
    route: WS_ROUTES.assemblyList,
    eventNames: [WS_EVENTS.stage.claimChanged, WS_EVENTS.stage.statusChanged],
  },
};

export interface UseAssemblyWorkflowProps {
  initialItems: AssemblyListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

/**
 * Hook principal da etapa de montagem: compõe o núcleo genérico useWorkStage
 * com a tabela, a verificação de materiais, o grid de joints, o visualizador de
 * PDF (documento do isométrico) e as configurações de UI.
 *
 * @param initialItems Lista prefetchada pelo RSC (seed do cache).
 * @param currentUser Utilizador autenticado (claim/acesso).
 * @param fetchError Erro do prefetch RSC.
 */
export const useAssemblyWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseAssemblyWorkflowProps) => {
  const {
    items,
    selectedDetail: selectedAssemblyList,
    setSelectedId: setSelectedAssemblyListId,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchField,
    setSearchField,
    errorMsg,
    setErrorMsg,
    claim,
  } = useWorkStage<AssemblyListDto>({
    ...assemblyStageConfig,
    initialItems,
    fetchError,
  });

  const openWorkingView = useCallback(
    (assemblyList: AssemblyListDto) => {
      setSelectedAssemblyListId(assemblyList.id);
      setActiveTab(TAB_TYPES.WORKING);
    },
    [setSelectedAssemblyListId, setActiveTab],
  );

  // Reivindica a assembly-list e abre a sua vista de joints.
  const startAssemblyList = useCallback(
    async (id: number): Promise<boolean> => {
      const updated = await claim(id);
      // O claim já define setSelectedId internamente; só muda a aba.
      if (updated) setActiveTab(TAB_TYPES.WORKING);
      return Boolean(updated);
    },
    [claim, setActiveTab],
  );

  const materialVerification = useAssemblyMaterialVerification();

  const assemblyListTable = useAssemblyListTable(
    items,
    search,
    currentUser?.id,
    {
      onAssemblyListSelected: async (assemblyList: AssemblyListDto) => {
        // A lista da tabela é leve (sem a árvore); busca o detalhe completo para
        // a verificação extrair pipe-lengths e fittings dos joints.
        try {
          const detail = await getAssemblyListById(assemblyList.id);
          await materialVerification.startVerification(detail, () => {
            if (detail.progress === "done") {
              openWorkingView(detail);
            } else {
              void startAssemblyList(detail.id);
            }
          });
        } catch {
          setErrorMsg("Failed to start material verification");
        }
      },
      onAssemblyListClaim: async (id) => await startAssemblyList(id),
    },
    searchField,
  );

  // O grid de joints e o PDF derivam do detalhe completo (selectedAssemblyList).
  const weldGrid = useJointGrid({
    assemblyList: selectedAssemblyList ?? null,
    search: activeTab === TAB_TYPES.WORKING ? "" : search,
    onAllFinished: () => {
      setSelectedAssemblyListId(null);
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

  const {
    pdfFile,
    loading: pdfLoading,
    error: pdfError,
  } = usePDFViewer(
    selectedAssemblyList?.isometric?.document ?? null,
    "isometric",
  );

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
    { buttonConfig: assemblyButtonConfig },
  );

  // selectedAssemblyList pode ser undefined (query inativa); normaliza para null.
  const selectedAssemblyListOrNull = selectedAssemblyList ?? null;

  return {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    assemblyListTable,
    materialVerification,
    weldGrid,
    weldItems: weldGrid.weldItems,
    selectedAssemblyList: selectedAssemblyListOrNull,
    pdfFile,
    pdfLoading,
    pdfError,
    controlButtons,
    setActiveTab,
    searchField,
    setSearchField,
  };
};
