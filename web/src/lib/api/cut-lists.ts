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
