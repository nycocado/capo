import { API_ROUTES } from "@/routes";
import { UserDto } from "@/dtos";
import { serverApi } from "./client";

/**
 * Busca o usuário autenticado (uso no servidor).
 *
 * @param token Cookie de sessão da requisição.
 */
export function getCurrentUser(token: string | undefined): Promise<UserDto> {
  return serverApi(token).get(API_ROUTES.users.me).json<UserDto>();
}
