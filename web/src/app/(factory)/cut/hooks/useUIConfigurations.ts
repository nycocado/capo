import { PipeLengthWithContext } from "@/interfaces";
import { PipeLengthDto } from "@/dtos";
import { useMemo } from "react";
import { cutCompletionModalConfig } from "@components/layout/Modals/ComponentLabelModal.valueConfig";
import { cutCardConfigs } from "@components/features/WorkPanel/WorkPanel.cardConfigs";
import { cutButtonConfig } from "@components/features/ControlPanel";

// Hook to manage UI configurations for cards, buttons, modals
export const useUIConfigurations = (
  enrichedSelectedItem: PipeLengthWithContext | null,
  completedItem: PipeLengthDto | null,
  canEditHeatNumber: boolean,
  handlers: {
    onHeatNumberEdit: () => void;
    onNextClick: () => void;
  },
) => {
  // Memoize card configurations
  const cards = useMemo(
    () =>
      cutCardConfigs(enrichedSelectedItem, {
        onHeatNumberClick: canEditHeatNumber
          ? handlers.onHeatNumberEdit
          : undefined,
      }),
    [enrichedSelectedItem, canEditHeatNumber, handlers.onHeatNumberEdit],
  );

  // Memoize control buttons
  const controlButtons = useMemo(
    () =>
      cutButtonConfig({
        onIsometricClick: () => {},
        onNoteClick: () => {},
        onReportClick: () => {},
        onNextClick: handlers.onNextClick,
      }),
    [handlers.onNextClick],
  );

  // Memoize modal data
  const modalData = useMemo(
    () => cutCompletionModalConfig(completedItem),
    [completedItem],
  );

  return {
    cards,
    controlButtons,
    modalData,
  };
};
