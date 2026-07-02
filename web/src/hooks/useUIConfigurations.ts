import { useMemo } from "react";
import { CardConfig } from "@components/features/WorkPanel/WorkPanel";

interface UIHandlers {
  onNextClick: () => void;
  onIsometricClick?: () => void;
  onNoteClick?: () => void;
  onReportClick?: () => void;
  onListClick?: () => void;

  [key: string]: (() => void) | undefined;
}

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
) => {
  const { buttonConfig, cardConfigs, modalConfig } = configFactories;

  const controlButtons = useMemo(
    () => buttonConfig(handlers),
    [buttonConfig, handlers],
  );

  const cards = useMemo(() => {
    if (!cardConfigs) return undefined;
    return cardConfigs(selectedItem);
  }, [cardConfigs, selectedItem]);

  const modalData = useMemo(() => {
    if (!modalConfig) return undefined;
    return modalConfig(completedItem);
  }, [modalConfig, completedItem]);

  return {
    controlButtons,
    cards,
    modalData,
  };
};
