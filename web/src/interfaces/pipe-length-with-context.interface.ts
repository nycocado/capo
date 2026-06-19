import { PipeLengthDto } from "@/dtos";

/**
 * Pipe-length pronto para as tabelas/seleção: tem `id` (= id do part, já que o
 * PipeLengthDto identifica-se por `part`) e o contexto do isométrico.
 */
export interface PipeLengthWithContext extends PipeLengthDto {
  id: number;
  isometricInfo?: {
    internalId: string;
  };
}
