import { API_ROUTES } from "@/routes";
import { RoleDto } from "@/dtos";
import { serverApi } from "./client";

/**
 * Busca os papéis do usuário autenticado (uso no servidor).
 *
 * @param token Cookie de sessão da requisição.
 */
export function getMyRoles(token: string | undefined): Promise<RoleDto[]> {
  return serverApi(token).get(API_ROUTES.roles.me).json<RoleDto[]>();
}
