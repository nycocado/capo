import { useState } from "react";

// Generic hook for modal state management
export const useModalState = <T = any>() => {
  const [inputShow, setInputShow] = useState(false);
  const [pendingItem, setPendingItem] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedItem, setCompletedItem] = useState<T | null>(null);

  // Reset modal state
  const resetModalState = () => {
    setInputShow(false);
    setPendingItem(null);
    setIsEditing(false);
    setInputValue("");
  };

  // Reset completion modal
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
