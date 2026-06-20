"use client";
import { AssemblyListDto, UserDto } from "@/dtos";
import NavBar from "@components/layout/NavBar/NavBar";
import { Col, Container, Row } from "react-bootstrap";
import { WorkTable } from "@components/features/WorkTable";
import { columnsAssemblyList } from "@components/features/WorkTable/WorkTable.columns";
import { MaterialVerificationModal } from "@components/layout/Modals";
import { useAssemblyWorkflow } from "./hooks/useAssemblyWorkflow";
import { memo } from "react";
import { ControlPanel } from "@components/features/ControlPanel";
import {
  TAB_TYPES,
  tabsAllWorking,
  TabType,
  WorkTabs,
} from "@components/features/WorkTabs";
import { WorkGrid } from "@components/features/WorkGrid";
import PDFViewer from "@components/features/PDFViewer/PDFViewer";
import { WeldWithContext } from "@/interfaces";
import { ErrorToast } from "@/components/common/ErrorToast";

export interface AssemblyClientProps {
  initialItems: AssemblyListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

const AssemblyClient = memo(function AssemblyClient(
  props: AssemblyClientProps,
) {
  const { initialItems, currentUser, fetchError } = props;

  const {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    assemblyListTable,
    materialVerification,
    weldGrid,
    weldItems,
    pdfFile,
    pdfLoading,
    pdfError,
    controlButtons,
    setActiveTab,
    searchField,
    setSearchField,
  } = useAssemblyWorkflow({ initialItems, currentUser, fetchError });

  const showError = Boolean(errorMsg);

  return (
    <>
      <NavBar title="Assembly" fixed={true} />
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "calc(100vh - var(--navbar-height))" }}
      >
        <Container fluid className="mx-4">
          <Row className="g-4">
            <Col md={7} className="d-flex flex-column gap-3">
              <PDFViewer
                pdfFile={pdfFile}
                loading={pdfLoading}
                error={pdfError}
              />
              <ControlPanel
                search={search}
                setSearch={setSearch}
                buttons={controlButtons}
                activeTab={activeTab}
                context="assembly"
                searchField={searchField}
                setSearchField={setSearchField}
              />
            </Col>
            <Col md={5} className="d-flex flex-column gap-3">
              <WorkTabs
                tabs={tabsAllWorking}
                activeTab={activeTab}
                setActiveTab={(tab: string) => setActiveTab(tab as TabType)}
              />
              {activeTab === TAB_TYPES.ALL ? (
                <WorkTable
                  key="assemblylist-table"
                  items={assemblyListTable.tableItems}
                  handleRowClick={assemblyListTable.handleRowClick}
                  columns={columnsAssemblyList}
                  rowStates={assemblyListTable.rowStates}
                  rowStateAccessor={assemblyListTable.rowStateAccessor}
                />
              ) : (
                <WorkGrid
                  key="weld-grid"
                  items={weldItems}
                  accessor="number"
                  handleItemClick={weldGrid.handleItemClick}
                  columns={3}
                  itemStates={weldGrid.itemStates}
                  itemStateAccessor={weldGrid.itemStateAccessor}
                  groupBy={(item: WeldWithContext) => item.spoolInfo.internalId}
                  renderGroupTitle={(groupItems, groupIndex) => (
                    <div className="mb-3">
                      <h6 className="text-light mb-2 fw-bold">
                        Spool:{" "}
                        {groupItems[0]?.spoolInfo.internalId ||
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
});

export default AssemblyClient;
