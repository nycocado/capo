import { useState } from "react";
import { PipeLengthDto } from "@/dtos";

// Hook for modal state management
export const useModalState = () => {
  const [inputShow, setInputShow] = useState(false);
  const [pendingItem, setPendingItem] = useState<PipeLengthDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedItem, setCompletedItem] = useState<PipeLengthDto | null>(
    null,
  );

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
