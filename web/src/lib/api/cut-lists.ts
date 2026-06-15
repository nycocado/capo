import { API_ROUTES } from "@/routes";
import { CutListDto } from "@/dtos";
import { serverApi } from "./client";

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
