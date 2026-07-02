import { useQuery } from "@tanstack/react-query";
import { getAllFillerMaterials, getAllWps } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export interface UseWeldFormDataProps {
  enabled?: boolean;
}

export function useWeldFormData({ enabled = true }: UseWeldFormDataProps = {}) {
  const wps = useQuery({
    queryKey: queryKeys.wps(),
    queryFn: getAllWps,
    enabled,
  });
  const fillerMaterials = useQuery({
    queryKey: queryKeys.fillerMaterials(),
    queryFn: getAllFillerMaterials,
    enabled,
  });

  return {
    wpsOptions: wps.data ?? [],
    fillerMaterialOptions: fillerMaterials.data ?? [],
    loading: wps.isLoading || fillerMaterials.isLoading,
  };
}
