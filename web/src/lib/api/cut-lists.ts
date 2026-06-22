import { API_ROUTES } from "@/routes";
import { CutListDto } from "@dtos";
import { browserApi, serverApi } from "./client";

export function getCutLists(token: string | undefined): Promise<CutListDto[]> {
  return serverApi(token).get(API_ROUTES.cutLists.base).json<CutListDto[]>();
}

export function fetchCutLists(): Promise<CutListDto[]> {
  return browserApi.get(API_ROUTES.cutLists.base).json<CutListDto[]>();
}

export function getCutListById(id: number): Promise<CutListDto> {
  return browserApi.get(API_ROUTES.cutLists.id(id)).json<CutListDto>();
}

export function getCutListsPendingCount(
  token: string | undefined,
): Promise<{ count: number }> {
  return serverApi(token)
    .get(API_ROUTES.cutLists.pendingCount)
    .json<{ count: number }>();
}

export function fetchCutListsPendingCount(): Promise<{ count: number }> {
  return browserApi
    .get(API_ROUTES.cutLists.pendingCount)
    .json<{ count: number }>();
}

export function claimCutList(id: number): Promise<CutListDto> {
  return browserApi.post(API_ROUTES.cutLists.claim(id)).json<CutListDto>();
}

export function releaseCutList(id: number): Promise<CutListDto> {
  return browserApi.delete(API_ROUTES.cutLists.claim(id)).json<CutListDto>();
}

export function reassignCutList(
  id: number,
  userId: number,
): Promise<CutListDto> {
  return browserApi
    .put(API_ROUTES.cutLists.claim(id), { json: { userId } })
    .json<CutListDto>();
}
