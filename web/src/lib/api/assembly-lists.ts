import { API_ROUTES } from "@/routes";
import { AssemblyListDto } from "@dtos";
import { makeListApi } from "./make-list-api";

const api = makeListApi<AssemblyListDto>(API_ROUTES.assemblyLists);

export const getAssemblyLists = api.getList;
export const fetchAssemblyLists = api.fetchList;
export const getAssemblyListById = api.getById;
export const getAssemblyListsPendingCount = api.getPendingCount;
export const fetchAssemblyListsPendingCount = api.fetchPendingCount;
export const claimAssemblyList = api.claim;
export const releaseAssemblyList = api.release;
