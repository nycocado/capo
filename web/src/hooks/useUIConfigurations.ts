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

/**
 * Memoiza os botões de controle, cards do painel e dados do modal de conclusão
 * a partir de fábricas de configuração e do item selecionado.
 *
 * @param selectedItem Item selecionado na tabela/grid; `null` omite os cards.
 * @param completedItem Item cuja conclusão foi confirmada; alimenta o modal.
 * @param handlers Callbacks dos botões de controle (next, isometric, list, etc.).
 * @param configFactories Fábricas de configuração de botões, cards e modal.
 * @param options Opções de edição (canEdit + onEditClick) para o botão de edição.
 */
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
  // As fábricas são funções estáveis (módulo); destruturá-las dá dependências
  // de identidade própria para os useMemo, sem reagir à literal de configFactories.
  const { buttonConfig, cardConfigs, modalConfig } = configFactories;

  const controlButtons = useMemo(
    () => buttonConfig(handlers),
    [buttonConfig, handlers],
  );

  const cards = useMemo(() => {
    if (!cardConfigs) return undefined;
    // Sem item selecionado o WorkPanel mostra o empty-state, em vez de cards
    // com rótulos e valores em branco.
    if (!selectedItem) return undefined;

    const cardOptions =
      options?.canEdit && options?.onEditClick
        ? { onEditClick: options.onEditClick }
        : undefined;

    return cardConfigs(selectedItem, cardOptions);
  }, [cardConfigs, selectedItem, options]);

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
