import { API_ROUTES } from "@/routes";
import { AssemblyListDto } from "@/dtos";
import { browserApi, serverApi } from "./client";

/** Busca as assembly-lists (uso no servidor, para o prefetch da página). */
export function getAssemblyLists(
  token: string | undefined,
): Promise<AssemblyListDto[]> {
  return serverApi(token)
    .get(API_ROUTES.assemblyLists.base)
    .json<AssemblyListDto[]>();
}

/** Busca as assembly-lists (uso no browser, como queryFn da lista). */
export function fetchAssemblyLists(): Promise<AssemblyListDto[]> {
  return browserApi.get(API_ROUTES.assemblyLists.base).json<AssemblyListDto[]>();
}

/**
 * Busca o detalhe completo de uma assembly-list (uso no browser, para a vista
 * de trabalho; inclui isometric→spools→joints→welds).
 *
 * @param id Id da assembly-list.
 */
export function getAssemblyListById(id: number): Promise<AssemblyListDto> {
  return browserApi.get(API_ROUTES.assemblyLists.id(id)).json<AssemblyListDto>();
}

/**
 * Busca o número de assembly-lists pendentes (uso no servidor, para o RSC de
 * roles).
 *
 * @param token Token de autenticação do cookie.
 */
export function getAssemblyListsPendingCount(
  token: string | undefined,
): Promise<{ count: number }> {
  return serverApi(token)
    .get(API_ROUTES.assemblyLists.pendingCount)
    .json<{ count: number }>();
}

/** Reivindica (claim) uma assembly-list para o utilizador atual. */
export function claimAssemblyList(id: number): Promise<AssemblyListDto> {
  return browserApi
    .post(API_ROUTES.assemblyLists.claim(id))
    .json<AssemblyListDto>();
}

/** Liberta (release) o claim de uma assembly-list. */
export function releaseAssemblyList(id: number): Promise<AssemblyListDto> {
  return browserApi
    .delete(API_ROUTES.assemblyLists.claim(id))
    .json<AssemblyListDto>();
}

/** Reatribui o claim de uma assembly-list a outro utilizador (admin). */
export function reassignAssemblyList(
  id: number,
  userId: number,
): Promise<AssemblyListDto> {
  return browserApi
    .put(API_ROUTES.assemblyLists.claim(id), { json: { userId } })
    .json<AssemblyListDto>();
}
