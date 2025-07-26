import { useState, useReducer, useCallback } from "react";
import { useAssemblyOperations } from "./useAssemblyOperations";
import { AssemblyListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";
import { findJointIdForWeld } from "../utils/assemblyUtils";

type JointState = "to-do" | "finished";

type JointAction =
  | { type: "setJointFinished"; jointId: number; finished: boolean }
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
    case "setJointFinished":
      return {
        ...state,
        jointStates: {
          ...state.jointStates,
          [action.jointId]: action.finished ? "finished" : "to-do",
        },
      };
    case "setJointProcessed":
      // Quando um joint é processado com sucesso, marca como finished
      return {
        ...state,
        jointStates: {
          ...state.jointStates,
          [action.jointId]: "finished",
        },
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

  // Assembly operations - quando um joint é processado com sucesso
  const { processJoint, isSubmitting } = useAssemblyOperations({
    onSuccess: (updatedJoint) => {
      // Marca o joint como finished
      dispatch({
        type: "setJointProcessed",
        jointId: updatedJoint.id,
      });
      onJointProcessed?.(updatedJoint.id);
      setProcessingJointId(null);
    },
    onError: (error) => {
      setProcessingJointId(null);
      onError?.(error);
    },
  });

  // Get joint state baseado no weld (weld é apenas a representação visual)
  const getJointStateForWeld = useCallback(
    (weld: WeldWithContext): JointState => {
      if (!selectedAssemblyList) return "to-do";

      const jointId = findJointIdForWeld(selectedAssemblyList, weld.id);
      if (!jointId) return "to-do";

      // Primeiro verifica o estado local (após operações)
      const localState = stateManagement.jointStates[jointId];
      if (localState) return localState;

      // Se não há estado local, verifica o workStatus do JOINT (não do weld)
      // Navega pela estrutura correta: isometric → sheets → spools → joints
      let joint = null;
      for (const sheet of selectedAssemblyList.isometric?.sheets || []) {
        for (const spool of sheet.spools || []) {
          joint = spool.joints?.find((j) => j.id === jointId);
          if (joint) break;
        }
        if (joint) break;
      }

      if (joint?.workStatus) {
        const statusName = joint.workStatus.name?.toLowerCase();
        if (statusName === "finished" || statusName === "completed") {
          return "finished";
        }
      }

      return "to-do";
    },
    [selectedAssemblyList, stateManagement.jointStates],
  );

  // Handle weld click - na verdade, processa o joint correspondente
  const handleWeldClick = useCallback(
    async (weld: WeldWithContext) => {
      if (!selectedAssemblyList || isSubmitting) return;

      const currentState = getJointStateForWeld(weld);
      setSelectedWeld(weld);

      // Se o joint já está finished, apenas seleciona o weld (para visualização)
      if (currentState === "finished") {
        return;
      }

      // Se o joint está initial, processa o joint
      if (currentState === "to-do") {
        const jointId = findJointIdForWeld(selectedAssemblyList, weld.id);

        if (jointId) {
          setProcessingJointId(jointId); // Marca qual joint está sendo processado
          await processJoint(jointId); // Faz step no joint
        } else {
          onError?.("Could not find joint information for this weld");
        }
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

  // Handle next weld - encontra o próximo joint que precisa ser processado
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

  // Check if all joints are finished (através dos welds)
  const areAllJointsFinished = useCallback(
    (weldItems: WeldWithContext[]) => {
      if (weldItems.length === 0) return false;
      return weldItems.every(
        (weld) => getJointStateForWeld(weld) === "finished",
      );
    },
    [getJointStateForWeld],
  );

  // Reset state when assembly list changes
  const resetJointState = useCallback(() => {
    dispatch({ type: "reset" });
    setSelectedWeld(null);
    setProcessingJointId(null);
  }, []);

  // Item states for WorkGrid - baseado no estado do joint
  const itemStates = {
    toDo: {
      className: isSubmitting
        ? "bg-secondary text-white"
        : "bg-dark text-light",
      onClick: async (item: WeldWithContext) => {
        if (!isSubmitting) {
          await handleWeldClick(item);
        }
      },
    },
    finished: {
      className: "bg-success text-white",
      onClick: (item: WeldWithContext) => {
        setSelectedWeld(item);
      },
    },
  };

  const itemStateAccessor = useCallback(
    (item: WeldWithContext) => {
      return getJointStateForWeld(item);
    },
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
