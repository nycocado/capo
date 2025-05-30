import {FillerMaterial} from "@models/filler-material.interface";
import {Wps} from "@models/wps.interface";

export interface UseWeldOperationsProps {
    onSuccess?: (weldId: number, wpsData: Wps | null, fillerData: FillerMaterial | null) => void;
    onError?: (error: string) => void;
}