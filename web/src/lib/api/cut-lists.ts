import { API_ROUTES } from "@/routes";
import { CutListDto } from "@/dtos";
import { browserApi, serverApi } from "./client";

/**
 * Busca as cut-lists pendentes (uso no servidor, para o prefetch da página).
 *
 * @param token Cookie de sessão da requisição.
 */
export function getToDoCutLists(
  token: string | undefined,
): Promise<CutListDto[]> {
  return serverApi(token).get(API_ROUTES.cutLists.toDo).json<CutListDto[]>();
}

/**
 * Busca as cut-lists pendentes (uso no browser, como queryFn da lista).
 */
export function fetchToDoCutLists(): Promise<CutListDto[]> {
  return browserApi.get(API_ROUTES.cutLists.toDo).json<CutListDto[]>();
}

/**
 * Marca uma cut-list como "working".
 *
 * @param id Id da cut-list.
 */
export function setCutListWorking(id: number): Promise<CutListDto> {
  return browserApi.patch(API_ROUTES.cutLists.setWorking(id)).json<CutListDto>();
}
