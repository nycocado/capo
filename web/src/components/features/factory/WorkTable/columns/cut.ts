import {Column} from "../types"
import {PipeLength} from "@models/PipeLenght"

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
