import {Column} from "./WorkTable.types";
import {PipeLength} from "@models/pipe-length.interface";
import {IsoItem} from "@/app/(factory)/assembly/useAssemblyTable";
import {AssemblyRow} from "@/app/(factory)/assembly/AssemblyClient";

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