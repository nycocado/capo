import { API_ROUTES } from "@/routes";
import { CutListDto } from "@dtos";
import { makeListApi } from "./make-list-api";

const api = makeListApi<CutListDto>(API_ROUTES.cutLists);

export const getCutLists = api.getList;
export const fetchCutLists = api.fetchList;
export const getCutListById = api.getById;
export const getCutListsPendingCount = api.getPendingCount;
export const fetchCutListsPendingCount = api.fetchPendingCount;
export const claimCutList = api.claim;
export const releaseCutList = api.release;
