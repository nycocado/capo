import React, { useEffect, useRef, useCallback } from "react";
import { Button } from "react-bootstrap";
import { BaseModal } from "@components/layout/Modals/BaseModal";
import { Column, WorkTable } from "@components/features/WorkTable/WorkTable";
import {
  columnsPipeLengthVerification,
  columnsFittingVerification,
} from "@components/features/WorkTable/WorkTable.columns";
import { PipeLengthDto } from "@/dtos/pipe-length.dto";
import { FittingDto } from "@/dtos/fitting.dto";

// Os dois passos de verificação partilham a mesma tabela; o item é de um dos tipos.
type MaterialItem = PipeLengthDto | FittingDto;

export interface MaterialVerificationModalProps {
  showModal: boolean;
  currentStep: "pipeLength" | "fitting";
  currentStepData: MaterialItem[];
  currentStepTitle: string;
  canContinue: boolean;
  canGoToPrevious: boolean;
  canGoToNext: boolean;
  loading: boolean;
  error: string | null;
  isConsultationMode: boolean;
  handlePipeLengthClick: (pipeLength: PipeLengthDto) => void;
  handleFittingClick: (fitting: FittingDto) => void;
  handleContinue: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleCancel: () => void;
  getPipeLengthState: (pipeLength: PipeLengthDto) => "initial" | "finished";
  getFittingState: (fitting: FittingDto) => "initial" | "finished";
}

/**
 * Modal de verificação/consulta de materiais (pipe-lengths e fittings) em dois
 * passos. Em modo verificação o operador marca cada item; em modo consulta os
 * itens são só de leitura.
 */
export function MaterialVerificationModal(
  props: MaterialVerificationModalProps,
) {
  const {
    showModal,
    currentStep,
    currentStepData,
    currentStepTitle,
    canContinue,
    canGoToPrevious,
    canGoToNext,
    loading,
    error,
    isConsultationMode,
    handlePipeLengthClick,
    handleFittingClick,
    handleContinue,
    handleNext,
    handlePrevious,
    handleCancel,
    getPipeLengthState,
    getFittingState,
  } = props;

  // Ref para controlar o scroll do modal body
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Função para forçar scroll para o topo
  const scrollToTop = useCallback(() => {
    if (modalBodyRef.current) {
      // Múltiplas tentativas para garantir que o scroll funcione
      modalBodyRef.current.scrollTop = 0;

      // Usar requestAnimationFrame para garantir que a DOM foi atualizada
      requestAnimationFrame(() => {
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTop = 0;

          // Segunda tentativa com pequeno delay
          setTimeout(() => {
            if (modalBodyRef.current) {
              modalBodyRef.current.scrollTop = 0;
            }
          }, 10);
        }
      });
    }
  }, []);

  // Scroll para o topo quando mudar de step
  useEffect(() => {
    if (showModal) {
      scrollToTop();
    }
  }, [currentStep, showModal, scrollToTop]);

  // Também scroll quando os dados mudarem
  useEffect(() => {
    if (showModal && currentStepData) {
      // Delay maior para garantir que a tabela foi renderizada
      const timer = setTimeout(scrollToTop, 200);
      return () => clearTimeout(timer);
    }
  }, [currentStepData, showModal, scrollToTop]);

  // Filtrar dados inválidos
  const validData =
    currentStepData?.filter((item) => item && (item.internalId || item.id)) ||
    [];

  const handleMaterialClick = (item: MaterialItem) => {
    if (isConsultationMode || !item?.internalId) return;

    if (currentStep === "pipeLength") {
      handlePipeLengthClick(item as PipeLengthDto);
    } else {
      handleFittingClick(item as FittingDto);
    }
  };

  const materialRowStates = {
    initial: {
      className: "bg-dark text-light",
      onClick: isConsultationMode ? undefined : handleMaterialClick,
    },
    finished: {
      className: "bg-success text-white",
      onClick: isConsultationMode ? undefined : handleMaterialClick,
    },
  };

  const materialRowStateAccessor = (item: MaterialItem) => {
    if (!item?.internalId) return "initial";

    // Em modo consulta todos os itens ficam "initial" (sem destaque verde).
    if (isConsultationMode) return "initial";

    return currentStep === "pipeLength"
      ? getPipeLengthState(item as PipeLengthDto)
      : getFittingState(item as FittingDto);
  };

  const currentColumns = (
    currentStep === "pipeLength"
      ? columnsPipeLengthVerification
      : columnsFittingVerification
  ) as Column<MaterialItem>[];

  if (loading) {
    return (
      <BaseModal
        show={showModal}
        onHide={handleCancel}
        title="Loading Materials..."
        size="lg"
      >
        <BaseModal.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 mb-0">Fetching material information...</p>
        </BaseModal.Body>
      </BaseModal>
    );
  }

  if (error) {
    return (
      <BaseModal
        show={showModal}
        onHide={handleCancel}
        title="Error Loading Materials"
        size="lg"
      >
        <BaseModal.Body className="text-center py-4">
          <div className="text-danger mb-3">
            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
          </div>
          <p className="mb-0">{error}</p>
        </BaseModal.Body>
        <BaseModal.Footer className="border-0 justify-content-center">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="btn-lg px-4 text-white border-4"
          >
            Close
          </Button>
        </BaseModal.Footer>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      show={showModal}
      onHide={handleCancel}
      title={currentStepTitle}
      size="xl"
      contentClassName="bg-tertiary text-light rounded-3"
    >
      <BaseModal.Body className="p-0" ref={modalBodyRef}>
        <div className="bg-dark rounded-3 m-3">
          <WorkTable
            items={validData}
            handleRowClick={() => {}} // Handler vazio: a interação vem de rowStates.onClick.
            columns={currentColumns}
            defaultSortColumn={currentStep === "pipeLength" ? "id" : "type"}
            defaultSortDirection={null}
            hover={false}
            rowStates={materialRowStates}
            rowStateAccessor={materialRowStateAccessor}
          />
        </div>
      </BaseModal.Body>

      <BaseModal.Footer className="border-0 justify-content-between">
        <Button
          variant="secondary"
          onClick={canGoToPrevious ? handlePrevious : handleCancel}
          className="btn-lg px-4 text-white border-4"
        >
          {canGoToPrevious
            ? "Previous"
            : isConsultationMode
              ? "Close"
              : "Cancel"}
        </Button>

        {isConsultationMode ? (
          canGoToNext ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="btn-lg px-4 text-black border-4"
            >
              View Fittings
            </Button>
          ) : null
        ) : (
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!canContinue}
            className="btn-lg px-4 text-black border-4"
          >
            {currentStep === "pipeLength" && validData.length > 0
              ? "Continue to Fittings"
              : "Start Working"}
          </Button>
        )}
      </BaseModal.Footer>
    </BaseModal>
  );
}
