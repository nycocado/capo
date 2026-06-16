import { useState } from "react";

/**
 * Centraliza o estado dos modais de input e de conclusão de uma etapa.
 *
 * @returns O estado dos dois modais e os setters/reset correspondentes.
 */
export const useModalState = <T = unknown>() => {
  const [inputShow, setInputShow] = useState(false);
  const [pendingItem, setPendingItem] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedItem, setCompletedItem] = useState<T | null>(null);

  const resetModalState = () => {
    setInputShow(false);
    setPendingItem(null);
    setIsEditing(false);
    setInputValue("");
  };

  const resetCompletionModal = () => {
    setShowCompletionModal(false);
    setCompletedItem(null);
  };

  return {
    inputShow,
    pendingItem,
    isEditing,
    inputValue,
    setInputValue,
    showCompletionModal,
    completedItem,
    setPendingItem,
    setIsEditing,
    setInputShow,
    setShowCompletionModal,
    setCompletedItem,
    resetModalState,
    resetCompletionModal,
  };
};
