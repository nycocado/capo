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

// Generic hook for UI configurations
export const useUIConfigurations = <
  TItem = unknown,
  TCompleted = unknown,
  TConfig = unknown,
  TModal = unknown,
>(
  selectedItem: TItem | null,
  completedItem: TCompleted | null,
  handlers: UIHandlers,
  configFactories: {
    buttonConfig: (handlers: UIHandlers) => TConfig;
    cardConfigs?: (
      item: TItem | null,
      options?: Record<string, (() => void) | undefined>,
    ) => CardConfig[];
    modalConfig?: (item: TCompleted | null) => TModal;
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
    // Sem item selecionado o WorkPanel mostra o empty-state, em vez de cards
    // com rótulos e valores em branco.
    if (!selectedItem) return undefined;

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
