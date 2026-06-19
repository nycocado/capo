import { API_ROUTES } from "@/routes";
import { UserDto } from "@/dtos";
import { browserApi, publicApi, serverApi } from "./client";

export interface LoginCredentials {
  internalId: string;
  password: string;
}

/**
 * Autentica o utilizador; o backend devolve o utilizador (com papéis) e grava o
 * cookie de sessão httpOnly.
 *
 * @param credentials Identificador interno e senha.
 * @returns O utilizador autenticado com os seus papéis.
 */
export function login(credentials: LoginCredentials): Promise<UserDto> {
  return publicApi
    .post(API_ROUTES.auth.login, { json: credentials })
    .json<UserDto>();
}

/** Encerra a sessão (o servidor limpa o cookie). */
export async function logout(): Promise<void> {
  await browserApi.post(API_ROUTES.auth.logout);
}

/**
 * Busca o utilizador autenticado com os seus papéis (uso no servidor: RSC/proxy).
 *
 * @param token Cookie de sessão da requisição.
 */
export function getMe(token: string | undefined): Promise<UserDto> {
  return serverApi(token).get(API_ROUTES.auth.me).json<UserDto>();
}
