import { API_ROUTES } from "@/routes";
import { WeldListDto } from "@/dtos";
import { browserApi, serverApi } from "./client";

/** Busca as weld-lists (uso no servidor, para o prefetch da página). */
export function getWeldLists(token: string | undefined): Promise<WeldListDto[]> {
  return serverApi(token).get(API_ROUTES.weldLists.base).json<WeldListDto[]>();
}

/** Busca as weld-lists (uso no browser, como queryFn da lista). */
export function fetchWeldLists(): Promise<WeldListDto[]> {
  return browserApi.get(API_ROUTES.weldLists.base).json<WeldListDto[]>();
}

/**
 * Busca o detalhe completo de uma weld-list (uso no browser, para a vista
 * de trabalho; inclui spool→joints→welds).
 *
 * @param id Id da weld-list.
 */
export function getWeldListById(id: number): Promise<WeldListDto> {
  return browserApi.get(API_ROUTES.weldLists.id(id)).json<WeldListDto>();
}

/**
 * Busca o número de weld-lists pendentes (uso no servidor, para o RSC de roles).
 *
 * @param token Token de autenticação do cookie.
 */
export function getWeldListsPendingCount(
  token: string | undefined,
): Promise<{ count: number }> {
  return serverApi(token)
    .get(API_ROUTES.weldLists.pendingCount)
    .json<{ count: number }>();
}

/** Reivindica (claim) uma weld-list para o utilizador atual. */
export function claimWeldList(id: number): Promise<WeldListDto> {
  return browserApi.post(API_ROUTES.weldLists.claim(id)).json<WeldListDto>();
}

/** Liberta (release) o claim de uma weld-list. */
export function releaseWeldList(id: number): Promise<WeldListDto> {
  return browserApi.delete(API_ROUTES.weldLists.claim(id)).json<WeldListDto>();
}

/** Reatribui o claim de uma weld-list a outro utilizador (admin). */
export function reassignWeldList(
  id: number,
  userId: number,
): Promise<WeldListDto> {
  return browserApi
    .put(API_ROUTES.weldLists.claim(id), { json: { userId } })
    .json<WeldListDto>();
}
