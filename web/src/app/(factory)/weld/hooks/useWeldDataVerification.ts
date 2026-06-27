import { useState, useRef, useCallback } from "react";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { useWeldFormData } from "./useWeldFormData";
import { createWeldStatusEvent } from "@/lib/api";

export interface UseWeldDataVerificationProps {
  onWeldProcessed?: (weld: WeldWithContext) => void;
  onError?: (error: string) => void;
}

export function useWeldDataVerification({
  onWeldProcessed,
  onError,
}: UseWeldDataVerificationProps = {}) {
  const [showModal, setShowModal] = useState(false);
  const [currentWeld, setCurrentWeld] = useState<WeldWithContext | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingRef = useRef(false);

  const { wpsOptions, fillerMaterialOptions, loading } = useWeldFormData({
    enabled: showModal,
  });

  const startVerification = useCallback((weld: WeldWithContext) => {
    setCurrentWeld(weld);
    setFormValues({});
    setShowModal(true);
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleContinue = useCallback(async () => {
    if (!currentWeld) return;

    const wpsId = Number(formValues.wps);
    const fillerMaterialId = Number(formValues.fillerMaterial);
    if (!wpsId || !fillerMaterialId) {
      onError?.("Please select both WPS and Filler Material");
      return;
    }

    if (pendingRef.current) return;
    pendingRef.current = true;
    setIsSubmitting(true);
    try {
      const updated = await createWeldStatusEvent(currentWeld.id, {
        status: "done",
        fillerMaterialId,
        wpsId,
      });
      onWeldProcessed?.({ ...updated, spoolInfo: currentWeld.spoolInfo });
      setShowModal(false);
      setCurrentWeld(null);
      setFormValues({});
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to process weld",
      );
    } finally {
      pendingRef.current = false;
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
        .filter((wps) => wps?.id && wps?.internalId)
        .map((wps) => ({
          label: `${wps.internalId} - ${wps.document}`,
          value: String(wps.id),
        })),
    },
    {
      id: "fillerMaterial",
      label: "Filler Material",
      type: "select" as const,
      required: true,
      options: fillerMaterialOptions
        .filter((material) => material?.id && material?.name)
        .map((material) => ({
          label: material.name,
          value: String(material.id),
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
