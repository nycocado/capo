import { API_ROUTES } from "@/routes";
import { WeldListDto } from "@/dtos";
import { serverApi } from "./client";

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
