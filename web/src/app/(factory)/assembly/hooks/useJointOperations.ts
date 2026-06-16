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

/**
 * Gerencia o estado e as operações dos joints de uma assembly-list:
 * clique em weld (→ step do joint correspondente), navegação para o próximo
 * e verificação de conclusão de todos os joints.
 *
 * @param selectedAssemblyList Lista de montagem ativa cujos joints são processados.
 * @param onJointProcessed Chamado com o id do joint após cada step bem-sucedido.
 * @param onError Chamado com a mensagem de erro caso a operação falhe.
 * @param onAllFinished Chamado quando todos os joints estão finished.
 */
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

  const getJointStateForWeld = useCallback(
    (weld: WeldWithContext): JointState => {
      if (!selectedAssemblyList) return "to-do";

      const jointId = findJointIdForWeld(selectedAssemblyList, weld.id);
      if (!jointId) return "to-do";

      const localState = stateManagement.jointStates[jointId];
      if (localState) return localState;

      // Estado local ausente: consulta o workStatus do joint na árvore isometric → sheets → spools → joints.
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

  const handleWeldClick = useCallback(
    async (weld: WeldWithContext) => {
      if (!selectedAssemblyList || isSubmitting) return;

      const currentState = getJointStateForWeld(weld);
      setSelectedWeld(weld);

      if (currentState === "finished") return;

      if (currentState === "to-do") {
        const jointId = findJointIdForWeld(selectedAssemblyList, weld.id);

        if (jointId) {
          setProcessingJointId(jointId);
          await processJoint(jointId);
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
