import { API_ROUTES } from "@/routes";
import { UserDto } from "@/dtos";
import { browserApi, publicApi, serverApi } from "./client";

export interface LoginCredentials {
  internalId: string;
  password: string;
}

export function login(credentials: LoginCredentials): Promise<UserDto> {
  return publicApi
    .post(API_ROUTES.auth.login, { json: credentials })
    .json<UserDto>();
}

export async function logout(): Promise<void> {
  await browserApi.post(API_ROUTES.auth.logout);
}

export function getMe(token: string | undefined): Promise<UserDto> {
  return serverApi(token).get(API_ROUTES.auth.me).json<UserDto>();
}
