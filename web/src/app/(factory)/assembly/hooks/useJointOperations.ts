import { useState, useReducer, useCallback } from "react";
import { useAssemblyOperations } from "./useAssemblyOperations";
import { AssemblyListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";
import { findJointIdForWeld } from "../utils/assemblyUtils";

type JointState = "to-do" | "finished";

type JointAction =
  | { type: "setJointProcessed"; jointId: number }
  | { type: "reset" };

interface JointStateManagement {
  jointStates: Record<number, JointState>;
}

const jointReducer = (
  state: JointStateManagement,
  action: JointAction,
): JointStateManagement => {
  switch (action.type) {
    case "setJointProcessed":
      return {
        ...state,
        jointStates: { ...state.jointStates, [action.jointId]: "finished" },
      };
    case "reset":
      return { jointStates: {} };
    default:
      return state;
  }
};

export interface UseJointOperationsProps {
  selectedAssemblyList: AssemblyListDto | null;
  onJointProcessed?: (jointId: number) => void;
  onError?: (error: string) => void;
  onAllFinished?: () => void;
}

export function useJointOperations({
  selectedAssemblyList,
  onJointProcessed,
  onError,
  onAllFinished,
}: UseJointOperationsProps) {
  const [selectedWeld, setSelectedWeld] = useState<WeldWithContext | null>(
    null,
  );
  const [, setProcessingJointId] = useState<number | null>(null);

  const [stateManagement, dispatch] = useReducer(jointReducer, {
    jointStates: {},
  });

  const { processJoint, isSubmitting } = useAssemblyOperations({
    onSuccess: (updatedJoint) => {
      dispatch({ type: "setJointProcessed", jointId: updatedJoint.id });
      onJointProcessed?.(updatedJoint.id);
      setProcessingJointId(null);
    },
    onError: (error) => {
      setProcessingJointId(null);
      onError?.(error);
    },
  });

  const getJointStateForWeld = useCallback(
    (weld: WeldWithContext): JointState => {
      if (!selectedAssemblyList) return "to-do";

      const jointId = findJointIdForWeld(selectedAssemblyList, weld.id);
      if (!jointId) return "to-do";

      const localState = stateManagement.jointStates[jointId];
      if (localState) return localState;

      let joint = null;
      for (const spool of selectedAssemblyList.isometric.spools ?? []) {
        joint = spool.joints?.find((j) => j.id === jointId) ?? null;
        if (joint) break;
      }
      return joint?.status === "done" ? "finished" : "to-do";
    },
    [selectedAssemblyList, stateManagement.jointStates],
  );

  const handleWeldClick = useCallback(
    async (weld: WeldWithContext) => {
      if (!selectedAssemblyList || isSubmitting) return;

      const currentState = getJointStateForWeld(weld);
      setSelectedWeld(weld);

      if (currentState === "finished") return;

      const jointId = findJointIdForWeld(selectedAssemblyList, weld.id);
      if (jointId) {
        setProcessingJointId(jointId);
        await processJoint(jointId);
      } else {
        onError?.("Could not find joint information for this weld");
      }
    },
    [
      selectedAssemblyList,
      getJointStateForWeld,
      processJoint,
      isSubmitting,
      onError,
    ],
  );

  const handleNextWeld = useCallback(
    async (weldItems: WeldWithContext[]) => {
      const nextWeld = weldItems.find(
        (weld) => getJointStateForWeld(weld) === "to-do",
      );
      if (nextWeld && !isSubmitting) {
        await handleWeldClick(nextWeld);
      } else if (!nextWeld) {
        onAllFinished?.();
      }
    },
    [getJointStateForWeld, handleWeldClick, isSubmitting, onAllFinished],
  );

  const areAllJointsFinished = useCallback(
    (weldItems: WeldWithContext[]) => {
      if (weldItems.length === 0) return false;
      return weldItems.every(
        (weld) => getJointStateForWeld(weld) === "finished",
      );
    },
    [getJointStateForWeld],
  );

  const resetJointState = useCallback(() => {
    dispatch({ type: "reset" });
    setSelectedWeld(null);
    setProcessingJointId(null);
  }, []);

  const itemStates = {
    "to-do": {
      className: isSubmitting
        ? "bg-secondary text-white"
        : "bg-dark text-light",
      onClick: async (item: WeldWithContext) => {
        if (!isSubmitting) await handleWeldClick(item);
      },
    },
    finished: {
      className: "bg-success text-white",
      onClick: (item: WeldWithContext) => setSelectedWeld(item),
    },
  };

  const itemStateAccessor = useCallback(
    (item: WeldWithContext) => getJointStateForWeld(item),
    [getJointStateForWeld],
  );

  return {
    selectedWeld,
    handleJointClick: handleWeldClick,
    handleNextWeld,
    areAllJointsFinished,
    resetJointState,
    isSubmitting,
    itemStates,
    itemStateAccessor,
  };
}
