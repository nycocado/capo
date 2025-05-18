import {Column} from "../types"
import {PipeLength} from "@models/PipeLenght"

export const columnsPipeLength: Column<PipeLength>[ ] = [
    {
        id: 'id',
        header: 'ID',
        accessor: item => `PL${item.id}`,
        className: 'text-center',
        sortable: true
    },
    {
        id: 'isometric',
        header: 'ISOMETRIC',
        accessor: 'isometric',
        className: 'text-center',
        sortable: true
    },
    {
        id: 'sheet',
        header: 'SHEET',
        accessor: 'sheet',
        className: 'text-center',
        sortable: true
    },
    {
        id: 'part',
        header: 'PART',
        accessor: 'part',
        className: 'text-center',
        sortable: true
    },
    {
        id: 'dimension',
        header: 'DIMENSION',
        subheader: 'mm',
        accessor: 'dimension',
        className: 'text-center',
        sortable: true
    },
    {
        id: 'diameter',
        header: 'Ø',
        subheader: 'DN',
        accessor: 'diameter',
        className: 'text-center',
        sortable: true
    }
]
