import {FillerMaterial} from "@models/filler-material.interface";
import {Wps} from "@models/wps.interface";

// Estados básicos
export type WeldRowState = 'initial' | 'working' | 'finished';
export type WeldItemState = 'initial' | 'finished';

// Tipos para linhas da tabela
export type WeldRow = {
    spoolId: number;
    spoolInternalId: string;
    isoId: string;
    isoInternalId: string;
    sheetNumber: number;
    revId: number;
    weldCount: number;
    welds: WeldItemWithSpool[];
};

// Tipo para itens de weld com informação do spool
export interface WeldItemWithSpool {
    id: number;
    filler?: FillerMaterial;
    wps?: Wps; // Wps já inclui o TPI
    spoolInternalId: string;
}

// Estruturas hierárquicas
export interface IsoItem {
    id: string;
    internalId: string;
    sheets: SheetItem[];
}

export interface SheetItem {
    number: number;
    revId: number;
    spools: SpoolItem[];
}

export interface SpoolItem {
    id: number;
    internalId: string;
    welds: WeldData[];
}

export interface WeldData {
    id: number;
    filler?: FillerMaterial;
    wps?: Wps; // Wps já inclui o TPI
}

// Estruturas auxiliares para construção dos dados
export interface SpoolData {
    id: number;
    internalId: string;
    welds: Map<number, { filler?: FillerMaterial; wps?: Wps }>;
}

export interface SheetSpools {
    spoolIds: Set<number>;
    revIds: number[];
}

// Ações do reducer
export type WeldAction =
    | { type: 'setRowWorking'; rowKey: string }
    | { type: 'setRowFinished'; rowKey: string }
    | { type: 'setWeldFinished'; weldId: number; finished: boolean }
    | { type: 'updateWeldData'; weldId: number; filler?: FillerMaterial; wps?: Wps }
    | { type: 'selectWeld'; weld: WeldItemWithSpool | null }; // Nova ação para seleção

// Estado do gerenciamento
export interface WeldStateManagement {
    rowStates: Record<string, WeldRowState>;
    weldStates: Record<number, WeldItemState>;
    updatedWelds: Record<number, { filler?: FillerMaterial; wps?: Wps }>;
    selectedWeldId: number | null; // Novo estado para weld selecionado
}

// Interface para callbacks
export interface UseWeldTableCallbacks {
    onWeldProcessed?: (weldId: number) => void;
    onError?: (error: string) => void;
}

// Configurações de estado para componentes
export interface RowStateConfig {
    className: string;
    onClick?: (item: any) => void;
}

export interface ItemStateConfig {
    className: string;
    onClick: (item: any) => void;
}