import { API_ROUTES } from "@/routes";
import { AssemblyListDto } from "@/dtos";
import { browserApi, serverApi } from "./client";

/**
 * Busca as assembly-lists pendentes (uso no servidor, para o prefetch da página).
 *
 * @param token Cookie de sessão da requisição.
 */
export function getToDoAssemblyLists(
  token: string | undefined,
): Promise<AssemblyListDto[]> {
  return serverApi(token)
    .get(API_ROUTES.assemblyLists.toDo)
    .json<AssemblyListDto[]>();
}

/**
 * Busca as assembly-lists pendentes (uso no browser, como queryFn da lista).
 */
export function fetchToDoAssemblyLists(): Promise<AssemblyListDto[]> {
  return browserApi
    .get(API_ROUTES.assemblyLists.toDo)
    .json<AssemblyListDto[]>();
}

/**
 * Marca uma assembly-list como "working".
 *
 * @param id Id da assembly-list.
 */
export function setAssemblyListWorking(id: number): Promise<AssemblyListDto> {
  return browserApi
    .patch(API_ROUTES.assemblyLists.setWorking(id))
    .json<AssemblyListDto>();
}
