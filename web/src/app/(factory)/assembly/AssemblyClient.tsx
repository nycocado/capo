"use client";
import { AssemblyListDto, UserDto } from "@/dtos";
import { useCallback, useState } from "react";
import {
  TAB_TYPES,
  tabsAllWorking,
  TabType,
  WorkTabs,
} from "@components/features/factory/WorkTabs";
import {
  useAssemblyListOperations,
  useAssemblyListTable,
  useAssemblyWorkingTable,
  useJointOperations,
  useAssemblyMaterialVerification,
  usePDFViewer,
  useWebSocketAssemblyList,
} from "@/app/(factory)/assembly/hooks";
import {
  extractWeldsFromAssemblyList,
  getAvailableSheets,
} from "@/app/(factory)/assembly/utils/assemblyClientUtils";
import NavBar from "@components/layout/NavBar/NavBar";
import { Col, Container, Row } from "react-bootstrap";
import { ControlPanel } from "@components/features/factory/ControlPanel";
import { WorkTable } from "@components/features/WorkTable";
import { WorkGrid } from "@components/features/factory/WorkGrid";
import { columnsAssemblyList } from "@components/features/WorkTable/WorkTable.columns";
import { ErrorToast } from "@components/common/ErrorToast";
import { assemblyButtonConfig } from "@components/features/factory/ControlPanel/ControlPanel.buttonConfig";
import { MaterialVerificationModal } from "@components/layout/Modals";
import PDFViewer from "@components/features/PDFViewer/PDFViewer";
import { WeldWithContext } from "@/interfaces";

export interface AssemblyClientProps {
  initialItems: AssemblyListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

export default function AssemblyClient(props: AssemblyClientProps) {
  const { initialItems, currentUser, fetchError } = props;

  // Main state
  const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);
  const [assemblyLists, setAssemblyLists] =
    useState<AssemblyListDto[]>(initialItems);
  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.ALL);
  const [search, setSearch] = useState<string>("");
  const [selectedAssemblyList, setSelectedAssemblyList] =
    useState<AssemblyListDto | null>(null);
  const [selectedSheetNumber, setSelectedSheetNumber] = useState<number | null>(
    null,
  );

  // WebSocket para atualizações em tempo real
  useWebSocketAssemblyList({
    onAssemblyListUpdate: (updatedAssemblyList) => {
      console.log(
        "Assembly List atualizada via WebSocket:",
        updatedAssemblyList,
      );

      setAssemblyLists((prev) =>
        prev.map((al) =>
          al.id === updatedAssemblyList.id ? updatedAssemblyList : al,
        ),
      );

      // Atualizar também o assembly list selecionado se for o mesmo
      setSelectedAssemblyList((prev) =>
        prev && prev.id === updatedAssemblyList.id ? updatedAssemblyList : prev,
      );
    },
    enabled: true, // Sempre habilitado para receber atualizações
  });

  // Assembly list operations (set-working)
  const { setWorking } = useAssemblyListOperations({
    onSuccess: (updatedAssemblyList) => {
      setAssemblyLists((prev) =>
        prev.map((al) =>
          al.id === updatedAssemblyList.id ? updatedAssemblyList : al,
        ),
      );
    },
    onError: (error) => setErrorMsg(error),
  });

  // Material verification
  const materialVerification = useAssemblyMaterialVerification();

  // Assembly list table hook (ALL tab)
  const assemblyListTable = useAssemblyListTable(
    assemblyLists,
    search,
    currentUser?.id,
    {
      onAssemblyListSelected: async (assemblyList: AssemblyListDto) => {
        // FLUXO CORRETO: Sempre inicia material verification primeiro
        try {
          await materialVerification.startVerification(
            assemblyList, // ← Passa o AssemblyListDto completo
            () => {
              // Callback executado APÓS completar material verification
              // Agora verifica se precisa fazer set-working ou só navegar
              const currentState = assemblyList.workStatus?.name || "to-do";

              if (currentState === "to-do") {
                // Se é to-do, faz set-working primeiro
                setWorking(assemblyList.id).then((success) => {
                  if (success) {
                    // Após set-working bem-sucedido, navega para WORKING
                    setSelectedAssemblyList(assemblyList);
                    const firstSheet = assemblyList.isometric?.sheets?.[0];
                    if (firstSheet) {
                      setSelectedSheetNumber(firstSheet.number);
                    }
                    setActiveTab(TAB_TYPES.WORKING);
                  }
                });
              } else {
                // Se já é working/finished, navega direto para WORKING
                setSelectedAssemblyList(assemblyList);
                const firstSheet = assemblyList.isometric?.sheets?.[0];
                if (firstSheet) {
                  setSelectedSheetNumber(firstSheet.number);
                }
                setActiveTab(TAB_TYPES.WORKING);
              }
            },
          );
        } catch (error) {
          setErrorMsg("Failed to start material verification");
        }
      },
    },
  );

  // Working assembly lists (filtered from main list)
  const workingAssemblyLists = assemblyLists.filter(
    (al) =>
      al.workStatus?.name === "working" || al.workStatus?.name === "finished",
  );

  // Assembly working table hook (WORKING tab)
  const assemblyWorkingTable = useAssemblyWorkingTable(
    workingAssemblyLists,
    search,
    {
      onAssemblyListSelected: (assemblyList: AssemblyListDto) => {
        setSelectedAssemblyList(assemblyList);
        const firstSheet = assemblyList.isometric?.sheets?.[0];
        if (firstSheet) {
          setSelectedSheetNumber(firstSheet.number);
        }
      },
    },
  );

  // Joint operations (renamed from weld operations)
  const jointOperations = useJointOperations({
    selectedAssemblyList,
    onJointProcessed: (jointId) => {
      console.log("Joint processed:", jointId);
    },
    onError: (error) => setErrorMsg(error),
  });

  // Get weld items for current selection (welds são apenas a interface visual)
  const weldItems =
    selectedAssemblyList && selectedSheetNumber !== null
      ? extractWeldsFromAssemblyList(selectedAssemblyList, selectedSheetNumber)
      : [];

  // Get available sheets
  const availableSheets = getAvailableSheets(selectedAssemblyList);

  // PDF Viewer for selected sheet - CORREÇÃO AQUI!
  const currentSheet =
    selectedAssemblyList && selectedSheetNumber !== null
      ? selectedAssemblyList.isometric?.sheets?.find(
          (s) => s.number === selectedSheetNumber,
        )
      : null;

  // Usar currentSheet.document em vez de currentSheet.id
  const {
    pdfFile,
    loading: pdfLoading,
    error: pdfError,
  } = usePDFViewer(currentSheet?.document || null);

  // Handle sheet selection
  const handleSheetSelect = useCallback(
    (sheetNumber: number) => {
      setSelectedSheetNumber(sheetNumber);
      jointOperations.resetJointState();
    },
    [jointOperations],
  );

  // Next button handler
  const handleNextClick = useCallback(() => {
    if (activeTab === TAB_TYPES.ALL) {
      assemblyListTable.handleNextWorkflow();
      return;
    }

    if (activeTab === TAB_TYPES.WORKING) {
      if (jointOperations.areAllJointsFinished(weldItems)) {
        const currentSheetIndex = availableSheets.findIndex(
          (s) => s.number === selectedSheetNumber,
        );
        const nextSheet = availableSheets[currentSheetIndex + 1];

        if (nextSheet) {
          setSelectedSheetNumber(nextSheet.number);
          jointOperations.resetJointState();
        } else {
          setActiveTab(TAB_TYPES.ALL);
          setSelectedAssemblyList(null);
          setSelectedSheetNumber(null);
          jointOperations.resetJointState();
        }
      } else {
        jointOperations.handleNextWeld(weldItems);
      }
    }
  }, [
    activeTab,
    assemblyListTable,
    jointOperations,
    weldItems,
    availableSheets,
    selectedSheetNumber,
  ]);

  // Handle list consultation
  const handleListConsultation = useCallback(async () => {
    if (!selectedAssemblyList) return;

    try {
      await materialVerification.openMaterialsConsultation(
        selectedAssemblyList, // ← Passa o AssemblyListDto completo
      );
    } catch (error) {
      setErrorMsg("Failed to open materials consultation");
    }
  }, [selectedAssemblyList, materialVerification]);

  // Handle isometric viewer
  const handleIsometricClick = useCallback(() => {
    if (!selectedAssemblyList || selectedSheetNumber === null) {
      setErrorMsg("Please select a sheet to view the isometric");
      return;
    }

    const currentSheet = selectedAssemblyList.isometric?.sheets?.find(
      (s) => s.number === selectedSheetNumber,
    );

    if (!currentSheet?.document) {
      setErrorMsg("No document available for this sheet");
      return;
    }

    // Abrir PDF diretamente no navegador em nova aba
    const pdfUrl = `/api/documents/${currentSheet.document}/download`;
    window.open(pdfUrl, "_blank");
  }, [selectedAssemblyList, selectedSheetNumber]);

  // Control buttons configuration
  const controlButtons = assemblyButtonConfig({
    onIsometricClick: handleIsometricClick,
    onListClick: handleListConsultation,
    onNoteClick: () => {},
    onReportClick: () => {},
    onNextClick: handleNextClick,
  });

  const showError = Boolean(errorMsg);

  return (
    <>
      <NavBar title="Assembly" fixed={true} />
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <Container fluid className="mx-4">
          <Row className="g-4">
            <Col md={8} className="d-flex flex-column gap-3">
              <PDFViewer
                pdfFile={pdfFile}
                loading={pdfLoading}
                error={pdfError}
              />
              <ControlPanel
                search={search}
                setSearch={setSearch}
                buttons={controlButtons}
                tag="ASM"
              />
            </Col>

            {/* Coluna central - Tabelas e Grids */}
            <Col md={4} className="d-flex flex-column gap-3">
              <WorkTabs
                tabs={tabsAllWorking}
                activeTab={activeTab}
                setActiveTab={(tab: string) => setActiveTab(tab as TabType)}
              />

              {/* Sheet selector para WORKING tab - ANTES do WorkGrid */}
              {activeTab === TAB_TYPES.WORKING &&
                availableSheets.length > 1 && (
                  <div className="bg-dark p-3 rounded">
                    <h6 className="text-light mb-2">Select Sheet:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {availableSheets.map((sheet) => (
                        <button
                          key={sheet.id}
                          className={`btn ${
                            selectedSheetNumber === sheet.number
                              ? "btn-primary"
                              : "btn-outline-light"
                          } btn-sm`}
                          onClick={() => handleSheetSelect(sheet.number)}
                        >
                          Sheet {sheet.number}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {activeTab === TAB_TYPES.ALL ? (
                <WorkTable
                  key="assembly-all-table"
                  items={assemblyListTable.tableItems}
                  handleRowClick={assemblyListTable.handleRowClick}
                  columns={columnsAssemblyList}
                  rowStates={assemblyListTable.rowStates}
                  rowStateAccessor={assemblyListTable.rowStateAccessor}
                />
              ) : (
                <WorkGrid
                  items={weldItems}
                  accessor="number"
                  handleItemClick={jointOperations.handleWeldClick}
                  columns={3}
                  itemStates={jointOperations.itemStates}
                  itemStateAccessor={jointOperations.itemStateAccessor}
                  groupBy={(item: WeldWithContext) => item.spool.internalId}
                  renderGroupTitle={(groupItems, groupIndex) => (
                    <div className="mb-3">
                      <h6 className="text-light mb-2 fw-bold">
                        Spool:{" "}
                        {groupItems[0]?.spool.internalId ||
                          `Group ${groupIndex + 1}`}
                      </h6>
                      <div className="border-bottom border-secondary mb-3"></div>
                    </div>
                  )}
                />
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Material Verification Modal */}
      <MaterialVerificationModal
        showModal={materialVerification.showModal}
        currentStep={materialVerification.currentStep}
        currentStepData={materialVerification.currentStepData}
        currentStepTitle={materialVerification.currentStepTitle}
        canContinue={materialVerification.canContinue}
        canGoToPrevious={materialVerification.canGoToPrevious}
        canGoToNext={materialVerification.canGoToNext}
        loading={materialVerification.loading}
        error={materialVerification.error}
        isConsultationMode={materialVerification.isConsultationMode}
        handlePipeLengthClick={materialVerification.handlePipeLengthClick}
        handleFittingClick={materialVerification.handleFittingClick}
        handleContinue={materialVerification.handleContinue}
        handleNext={materialVerification.handleNext}
        handlePrevious={materialVerification.handlePrevious}
        handleCancel={materialVerification.handleCancel}
        getPipeLengthState={materialVerification.getPipeLengthState}
        getFittingState={materialVerification.getFittingState}
      />

      <ErrorToast
        show={showError}
        message={errorMsg || ""}
        onClose={() => setErrorMsg(null)}
      />
    </>
  );
}
