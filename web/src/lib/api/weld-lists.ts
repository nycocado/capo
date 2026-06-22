import { API_ROUTES } from "@/routes";
import { WeldListDto } from "@dtos";
import { browserApi, serverApi } from "./client";

export function getWeldLists(
  token: string | undefined,
): Promise<WeldListDto[]> {
  return serverApi(token).get(API_ROUTES.weldLists.base).json<WeldListDto[]>();
}

export function fetchWeldLists(): Promise<WeldListDto[]> {
  return browserApi.get(API_ROUTES.weldLists.base).json<WeldListDto[]>();
}

export function getWeldListById(id: number): Promise<WeldListDto> {
  return browserApi.get(API_ROUTES.weldLists.id(id)).json<WeldListDto>();
}

export function getWeldListsPendingCount(
  token: string | undefined,
): Promise<{ count: number }> {
  return serverApi(token)
    .get(API_ROUTES.weldLists.pendingCount)
    .json<{ count: number }>();
}

export function fetchWeldListsPendingCount(): Promise<{ count: number }> {
  return browserApi
    .get(API_ROUTES.weldLists.pendingCount)
    .json<{ count: number }>();
}

export function claimWeldList(id: number): Promise<WeldListDto> {
  return browserApi.post(API_ROUTES.weldLists.claim(id)).json<WeldListDto>();
}

export function releaseWeldList(id: number): Promise<WeldListDto> {
  return browserApi.delete(API_ROUTES.weldLists.claim(id)).json<WeldListDto>();
}

export function reassignWeldList(
  id: number,
  userId: number,
): Promise<WeldListDto> {
  return browserApi
    .put(API_ROUTES.weldLists.claim(id), { json: { userId } })
    .json<WeldListDto>();
}
