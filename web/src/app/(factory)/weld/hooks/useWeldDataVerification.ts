import { useState, useCallback } from "react";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { useWeldFormData } from "./useWeldFormData";
import { API_ROUTES } from "@/routes";

export interface UseWeldDataVerificationProps {
  onWeldProcessed?: (weld: WeldWithContext) => void;
  onError?: (error: string) => void;
}

export function useWeldDataVerification({
  onWeldProcessed,
  onError,
}: UseWeldDataVerificationProps = {}) {
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentWeld, setCurrentWeld] = useState<WeldWithContext | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar dados para o modal
  const { wpsOptions, fillerMaterialOptions, loading } = useWeldFormData({
    enabled: showModal,
  });

  // Start verification process
  const startVerification = useCallback((weld: WeldWithContext) => {
    setCurrentWeld(weld);
    setFormValues({});
    setShowModal(true);
  }, []);

  // Handle field changes
  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  // Handle verification completion
  const handleContinue = useCallback(async () => {
    if (!currentWeld) return;

    const { wps, fillerMaterial } = formValues;

    if (!wps || !fillerMaterial) {
      onError?.("Please select both WPS and Filler Material");
      return;
    }

    setIsSubmitting(true);

    try {
      const ky = (await import("ky")).default;
      const response = await ky.patch(
        API_ROUTES.welds.step(currentWeld.id),
        {
          credentials: "include",
          searchParams: {
            wps,
            fillerMaterial,
          },
        },
      );

      // Parse weld atualizado da API
      const updated = await response.json<any>();
      const updatedWithContext: WeldWithContext = {
        ...updated,
        // preserva o contexto do spool para uso no WorkPanel/grid
        spoolInfo: currentWeld.spoolInfo,
      };

      // Success - notify parent com objeto atualizado
      onWeldProcessed?.(updatedWithContext);

      // Close modal
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

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowModal(false);
    setCurrentWeld(null);
    setFormValues({});
  }, []);

  // Modal configuration
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
    // Modal state
    showModal,
    currentWeld,
    loading,
    isSubmitting,

    // Modal config
    modalFields,
    formValues,
    modalTitle: `Welding Details - ${currentWeld?.number || ""}`,

    // Actions
    startVerification,
    handleFieldChange,
    handleContinue,
    handleCancel,
  };
}
