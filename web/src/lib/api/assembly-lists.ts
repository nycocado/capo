import { API_ROUTES } from "@/routes";
import { AssemblyListDto } from "@/dtos";
import { serverApi } from "./client";

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
