import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
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
  const pendingRef = useRef(false);

  const { wpsOptions, fillerMaterialOptions, loading } = useWeldFormData({
    enabled: showModal,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (vars: {
      weld: WeldWithContext;
      fillerMaterialId: number;
      wpsId: number;
    }) =>
      createWeldStatusEvent(vars.weld.id, {
        status: "done",
        fillerMaterialId: vars.fillerMaterialId,
        wpsId: vars.wpsId,
      }),
    onSuccess: (updated, vars) => {
      onWeldProcessed?.({ ...updated, spoolInfo: vars.weld.spoolInfo });
      setShowModal(false);
      setCurrentWeld(null);
      setFormValues({});
    },
    onError: (error) =>
      onError?.(
        error instanceof Error ? error.message : "Failed to process weld",
      ),
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
    try {
      await mutateAsync({ weld: currentWeld, fillerMaterialId, wpsId });
    } catch {
      return;
    } finally {
      pendingRef.current = false;
    }
  }, [currentWeld, formValues, mutateAsync, onError]);

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
    isSubmitting: isPending,
    modalFields,
    formValues,
    modalTitle: `Welding Details - ${currentWeld?.number || ""}`,
    startVerification,
    handleFieldChange,
    handleContinue,
    handleCancel,
  };
}
