import {Column} from "./WorkTable.types";
import {PipeLength} from "@models/pipe-length.interface";
import {Fitting} from "@models/fitting.interface";
import {AssemblyRow} from "@/app/(factory)/assembly/AssemblyClient.types";
import {WeldRow} from "@/app/(factory)/weld/useWeldTable.types";

export const columnsPipeLength: Column<PipeLength>[] = [
    {
        id: 'id',
        header: 'ID',
        accessor: item => item.internalId,
        className: 'text-center',
        sortable: true
    },
    {
        id: 'isometric',
        header: 'ISOMETRIC',
        accessor: item => item.isometric.internalId,
        className: 'text-center',
        sortable: true
    },
    {
        id: 'sheet',
        header: 'SHEET',
        accessor: item => item.isometric.sheet.map(s => s.number).join(', '),
        className: 'text-center',
        sortable: true
    },
    {
        id: 'part',
        header: 'PART',
        accessor: item => item.part.number,
        className: 'text-center',
        sortable: true
    },
    {
        id: 'length',
        header: 'LENGTH',
        subheader: 'mm',
        accessor: item => item.length,
        className: 'text-center',
        sortable: true
    },
    {
        id: 'diameter',
        header: 'Ø',
        subheader: 'DN',
        accessor: item => item.diameter.nominalMm,
        className: 'text-center',
        sortable: true
    }
];

export const columnsAssembly: Column<AssemblyRow>[] = [
    {
        id: 'internalId',
        header: 'ISOMETRIC',
        accessor: row => row.internalId,
        className: 'text-center',
        sortable: true
    },
    {
        id: 'sheet',
        header: 'SHEET',
        accessor: row => row.sheetNumber,
        className: 'text-center',
        sortable: true
    }
];

export const columnsWeld: Column<WeldRow>[] = [
    {
        id: 'spoolInternalId',
        header: 'Spool',
        accessor: (item: WeldRow) => item.spoolInternalId,
        sortable: true,
    },
    {
        id: 'isoInternalId',
        header: 'Isometric',
        accessor: (item: WeldRow) => item.isoInternalId,
        sortable: true,
    },
    {
        id: 'sheetNumber',
        header: 'Sheet',
        accessor: (item: WeldRow) => item.sheetNumber,
        sortable: true,
    },
    {
        id: 'weldCount',
        header: 'Welds',
        accessor: (item: WeldRow) => item.weldCount.toString(),
        sortable: true,
    },
];

export const columnsPipeLengthVerification: Column<PipeLength>[] = [
    {
        id: 'id',
        header: 'ID',
        accessor: item => item.internalId,
        sortable: true,
    },
    {
        id: 'partNumber',
        header: 'Part',
        accessor: (item) => item.part.number,
        sortable: true,
    },
    {
        id: 'length',
        header: 'Length (mm)',
        accessor: (item) => item.length.toString(),
        sortable: true,
    },
    {
        id: 'diameter',
        header: 'Ø',
        accessor: (item) => `${item.diameter.nominalMm}mm (${item.diameter.nominalInch}")`,
        sortable: false,
    }
];

export const columnsFittingVerification: Column<Fitting>[] = [
    {
        id: 'type',
        header: 'Type',
        accessor: (item) => item.fittingType.name,
        sortable: true,
    },
    {
        id: 'description',
        header: 'Description',
        accessor: 'description',
        sortable: false,
    },
    {
        id: 'diameter1',
        header: 'Ø 1',
        accessor: (item) => {
            const port1 = item.ports.find(p => p.number === 1);
            return port1 ? `${port1.diameter.nominalInch}" (${port1.diameter.nominalMm}mm)` : '-';
        },
        sortable: false,
    },
    {
        id: 'diameter2',
        header: 'Ø 2',
        accessor: (item) => {
            const port2 = item.ports.find(p => p.number === 2);
            return port2 ? `${port2.diameter.nominalInch}" (${port2.diameter.nominalMm}mm)` : '-';
        },
        sortable: false,
    },
    {
        id: 'total',
        header: 'Total Ports',
        accessor: (item) => item.ports.length.toString(),
        sortable: true,
    }
];