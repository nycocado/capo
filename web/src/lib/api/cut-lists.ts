import { API_ROUTES } from "@/routes";
import { CutListDto } from "@/dtos";
import { browserApi, serverApi } from "./client";

/** Busca as cut-lists (uso no servidor, para o prefetch da página). */
export function getCutLists(token: string | undefined): Promise<CutListDto[]> {
  return serverApi(token).get(API_ROUTES.cutLists.base).json<CutListDto[]>();
}

/** Busca as cut-lists (uso no browser, como queryFn da lista). */
export function fetchCutLists(): Promise<CutListDto[]> {
  return browserApi.get(API_ROUTES.cutLists.base).json<CutListDto[]>();
}

/**
 * Busca o detalhe completo de uma cut-list (uso no browser, para a vista
 * de trabalho; inclui a árvore isometric→spools→joints→parts).
 *
 * @param id Id da cut-list.
 */
export function getCutListById(id: number): Promise<CutListDto> {
  return browserApi.get(API_ROUTES.cutLists.id(id)).json<CutListDto>();
}

/**
 * Busca o número de cut-lists pendentes (uso no servidor, para o RSC de roles).
 *
 * @param token Token de autenticação do cookie.
 */
export function getCutListsPendingCount(
  token: string | undefined,
): Promise<{ count: number }> {
  return serverApi(token)
    .get(API_ROUTES.cutLists.pendingCount)
    .json<{ count: number }>();
}

/** Reivindica (claim) uma cut-list para o utilizador atual. */
export function claimCutList(id: number): Promise<CutListDto> {
  return browserApi.post(API_ROUTES.cutLists.claim(id)).json<CutListDto>();
}

/** Liberta (release) o claim de uma cut-list. */
export function releaseCutList(id: number): Promise<CutListDto> {
  return browserApi.delete(API_ROUTES.cutLists.claim(id)).json<CutListDto>();
}

/** Reatribui o claim de uma cut-list a outro utilizador (admin). */
export function reassignCutList(
  id: number,
  userId: number,
): Promise<CutListDto> {
  return browserApi
    .put(API_ROUTES.cutLists.claim(id), { json: { userId } })
    .json<CutListDto>();
}
