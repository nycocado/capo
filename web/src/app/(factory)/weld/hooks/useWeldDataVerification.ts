import { useState, useCallback } from "react";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { useWeldFormData } from "./useWeldFormData";
import { stepWeld } from "@/lib/api";

export interface UseWeldDataVerificationProps {
  onWeldProcessed?: (weld: WeldWithContext) => void;
  onError?: (error: string) => void;
}

/**
 * Controla o fluxo de verificação de dados antes do step de um weld:
 * abre modal com campos WPS e filler material, submete o step e notifica o resultado.
 *
 * @param onWeldProcessed Chamado com o weld atualizado após step bem-sucedido.
 * @param onError Chamado com a mensagem de erro caso a operação falhe.
 */
export function useWeldDataVerification({
  onWeldProcessed,
  onError,
}: UseWeldDataVerificationProps = {}) {
  const [showModal, setShowModal] = useState(false);
  const [currentWeld, setCurrentWeld] = useState<WeldWithContext | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { wpsOptions, fillerMaterialOptions, loading } = useWeldFormData({
    enabled: showModal,
  });

  const startVerification = useCallback((weld: WeldWithContext) => {
    setCurrentWeld(weld);
    setFormValues({});
    setShowModal(true);
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  const handleContinue = useCallback(async () => {
    if (!currentWeld) return;

    const { wps, fillerMaterial } = formValues;

    if (!wps || !fillerMaterial) {
      onError?.("Please select both WPS and Filler Material");
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await stepWeld(currentWeld.id, { wps, fillerMaterial });
      const updatedWithContext: WeldWithContext = {
        ...updated,
        // preserva o contexto do spool para uso no WorkPanel/grid
        spoolInfo: currentWeld.spoolInfo,
      };

      onWeldProcessed?.(updatedWithContext);
      setShowModal(false);
      setCurrentWeld(null);
      setFormValues({});
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to process weld",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [currentWeld, formValues, onWeldProcessed, onError]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setCurrentWeld(null);
    setFormValues({});
  }, []);

  const modalFields = [
    {
      id: "wps",
      label: "WPS",
      type: "select" as const,
      required: true,
      options: wpsOptions
        .filter((wps) => wps?.internalId && wps?.document)
        .map((wps) => ({
          label: `${wps.internalId} - ${wps.document}`,
          value: wps.internalId,
        })),
    },
    {
      id: "fillerMaterial",
      label: "Filler Material",
      type: "select" as const,
      required: true,
      options: fillerMaterialOptions
        .filter((material) => material?.name)
        .map((material) => ({
          label: material.name,
          value: material.name,
        })),
    },
  ];

  return {
    showModal,
    currentWeld,
    loading,
    isSubmitting,
    modalFields,
    formValues,
    modalTitle: `Welding Details - ${currentWeld?.number || ""}`,
    startVerification,
    handleFieldChange,
    handleContinue,
    handleCancel,
  };
}
