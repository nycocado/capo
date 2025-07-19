import { useMemo } from "react";
import { CardConfig } from "@components/features/WorkPanel/WorkPanel";

// Generic interface for UI handlers
interface UIHandlers {
  onNextClick: () => void;
  onIsometricClick?: () => void;
  onNoteClick?: () => void;
  onReportClick?: () => void;
  onListClick?: () => void;

  [key: string]: (() => void) | undefined;
}

// Generic interface for modal data
interface ModalData {
  [key: string]: any;
}

// Generic hook for UI configurations
export const useUIConfigurations = <TItem = any, TConfig = any>(
  selectedItem: TItem | null,
  completedItem: TItem | null,
  handlers: UIHandlers,
  configFactories: {
    buttonConfig: (handlers: UIHandlers) => TConfig;
    cardConfigs?: (item: TItem | null, options?: any) => CardConfig[];
    modalConfig?: (item: TItem | null) => ModalData;
  },
  options?: {
    canEdit?: boolean;
    onEditClick?: () => void;
  },
) => {
  // Memoize control buttons
  const controlButtons = useMemo(
    () => configFactories.buttonConfig(handlers),
    [configFactories.buttonConfig, handlers],
  );

  // Memoize card configurations (if available)
  const cards = useMemo(() => {
    if (!configFactories.cardConfigs) return undefined;

    const cardOptions =
      options?.canEdit && options?.onEditClick
        ? { onEditClick: options.onEditClick }
        : undefined;

    return configFactories.cardConfigs(selectedItem, cardOptions);
  }, [configFactories.cardConfigs, selectedItem, options]);

  // Memoize modal data (if available)
  const modalData = useMemo(() => {
    if (!configFactories.modalConfig) return undefined;
    return configFactories.modalConfig(completedItem);
  }, [configFactories.modalConfig, completedItem]);

  return {
    controlButtons,
    cards,
    modalData,
  };
};
