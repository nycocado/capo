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
