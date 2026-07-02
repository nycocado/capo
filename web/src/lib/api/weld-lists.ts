import { API_ROUTES } from "@/routes";
import { WeldListDto } from "@dtos";
import { makeListApi } from "./make-list-api";

const api = makeListApi<WeldListDto>(API_ROUTES.weldLists);

export const getWeldLists = api.getList;
export const fetchWeldLists = api.fetchList;
export const getWeldListById = api.getById;
export const getWeldListsPendingCount = api.getPendingCount;
export const fetchWeldListsPendingCount = api.fetchPendingCount;
export const claimWeldList = api.claim;
export const releaseWeldList = api.release;
