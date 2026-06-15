import { API_ROUTES } from "@/routes";
import { PipeLengthDto } from "@/dtos";
import { browserApi, toSearchParams } from "./client";

/**
 * Avança o status de um pipe-length, opcionalmente registrando o heat number.
 *
 * @param id Id do pipe-length.
 * @param heatNumber Heat number a registrar na transição (opcional).
 */
export function stepPipeLength(
  id: number,
  heatNumber?: number,
): Promise<PipeLengthDto> {
  return browserApi
    .patch(API_ROUTES.pipeLengths.step(id), {
      searchParams: toSearchParams({ heatNumber }),
    })
    .json<PipeLengthDto>();
}

/**
 * Edita o heat number de um pipe-length.
 *
 * @param id Id do pipe-length.
 * @param heatNumber Novo heat number.
 */
export function setPipeLengthHeatNumber(
  id: number,
  heatNumber: number,
): Promise<PipeLengthDto> {
  return browserApi
    .patch(API_ROUTES.pipeLengths.heatNumber(id), {
      searchParams: { heatNumber },
    })
    .json<PipeLengthDto>();
}
