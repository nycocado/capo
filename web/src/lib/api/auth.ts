import { API_ROUTES } from "@/routes";
import { HasRoleDto, ValidateResDto } from "@/dtos";
import { publicApi, serverApi } from "./client";

export interface LoginCredentials {
  internalId: string;
  password: string;
}

/**
 * Autentica o usuário; o backend devolve o token no cookie de sessão.
 *
 * @param credentials Identificador interno e senha.
 */
export async function login(credentials: LoginCredentials): Promise<void> {
  await publicApi.post(API_ROUTES.auth.login, { json: credentials });
}

/**
 * Valida a sessão atual (uso no proxy/servidor).
 *
 * @param token Cookie de sessão da requisição.
 */
export function validateSession(
  token: string | undefined,
): Promise<ValidateResDto> {
  return serverApi(token).get(API_ROUTES.auth.validate).json<ValidateResDto>();
}

/**
 * Verifica se a sessão atual possui o papel informado.
 *
 * @param role Papel a checar.
 * @param token Cookie de sessão da requisição.
 */
export function hasRole(
  role: string,
  token: string | undefined,
): Promise<HasRoleDto> {
  return serverApi(token).get(API_ROUTES.auth.hasRole(role)).json<HasRoleDto>();
}
