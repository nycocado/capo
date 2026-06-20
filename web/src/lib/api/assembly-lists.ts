import { API_ROUTES } from "@/routes";
import { AssemblyListDto } from "@/dtos";
import { browserApi, serverApi } from "./client";

export function getAssemblyLists(
  token: string | undefined,
): Promise<AssemblyListDto[]> {
  return serverApi(token)
    .get(API_ROUTES.assemblyLists.base)
    .json<AssemblyListDto[]>();
}

export function fetchAssemblyLists(): Promise<AssemblyListDto[]> {
  return browserApi
    .get(API_ROUTES.assemblyLists.base)
    .json<AssemblyListDto[]>();
}

export function getAssemblyListById(id: number): Promise<AssemblyListDto> {
  return browserApi
    .get(API_ROUTES.assemblyLists.id(id))
    .json<AssemblyListDto>();
}

export function getAssemblyListsPendingCount(
  token: string | undefined,
): Promise<{ count: number }> {
  return serverApi(token)
    .get(API_ROUTES.assemblyLists.pendingCount)
    .json<{ count: number }>();
}

export function fetchAssemblyListsPendingCount(): Promise<{ count: number }> {
  return browserApi
    .get(API_ROUTES.assemblyLists.pendingCount)
    .json<{ count: number }>();
}

export function claimAssemblyList(id: number): Promise<AssemblyListDto> {
  return browserApi
    .post(API_ROUTES.assemblyLists.claim(id))
    .json<AssemblyListDto>();
}

export function releaseAssemblyList(id: number): Promise<AssemblyListDto> {
  return browserApi
    .delete(API_ROUTES.assemblyLists.claim(id))
    .json<AssemblyListDto>();
}

export function reassignAssemblyList(
  id: number,
  userId: number,
): Promise<AssemblyListDto> {
  return browserApi
    .put(API_ROUTES.assemblyLists.claim(id), { json: { userId } })
    .json<AssemblyListDto>();
}
