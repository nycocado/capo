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

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setLoading(true);

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
  };
}
