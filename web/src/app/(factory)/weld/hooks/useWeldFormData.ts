import { useState, useEffect } from "react";
import { FillerMaterialDto, WpsDto } from "@/dtos";
import { getAllFillerMaterials, getAllWps } from "@/lib/api";

export interface UseWeldFormDataProps {
  enabled?: boolean;
}

export function useWeldFormData({ enabled = true }: UseWeldFormDataProps = {}) {
  const [wpsOptions, setWpsOptions] = useState<WpsDto[]>([]);
  const [fillerMaterialOptions, setFillerMaterialOptions] = useState<
    FillerMaterialDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar WPS e FillerMaterials em paralelo
        const [wpsData, fillerMaterialData] = await Promise.all([
          getAllWps(),
          getAllFillerMaterials(),
        ]);

        setWpsOptions(wpsData);
        setFillerMaterialOptions(fillerMaterialData);
      } catch (err) {
        console.error("Error fetching weld form data:", err);
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enabled]);

  return {
    wpsOptions,
    fillerMaterialOptions,
    loading,
    error,
    refetch: () => {
      if (enabled) {
        // Trigger refetch by forcing useEffect to run again
        setLoading(true);
      }
    },
  };
}
