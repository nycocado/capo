import { API_ROUTES } from "@/routes";
import { WeldListDto } from "@/dtos";
import { browserApi, serverApi } from "./client";

/**
 * Busca as weld-lists pendentes (uso no servidor, para o prefetch da página).
 *
 * @param token Cookie de sessão da requisição.
 */
export function getToDoWeldLists(
  token: string | undefined,
): Promise<WeldListDto[]> {
  return serverApi(token).get(API_ROUTES.weldLists.toDo).json<WeldListDto[]>();
}

/**
 * Busca as weld-lists pendentes (uso no browser, como queryFn da lista).
 */
export function fetchToDoWeldLists(): Promise<WeldListDto[]> {
  return browserApi.get(API_ROUTES.weldLists.toDo).json<WeldListDto[]>();
}

/**
 * Marca uma weld-list como "working".
 *
 * @param id Id da weld-list.
 */
export function setWeldListWorking(id: number): Promise<WeldListDto> {
  return browserApi
    .patch(API_ROUTES.weldLists.setWorking(id))
    .json<WeldListDto>();
}
