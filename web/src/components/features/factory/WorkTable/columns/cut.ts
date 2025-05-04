import {Column} from "../types"
import {PipeLength} from "@models/PipeLenght"

export const columnsPipeLength: Column<PipeLength>[ ] = [
    {
        header: 'ID',
        accessor: item => `PL${item.id}`,
        className: 'text-center'
    },
    {
        header: 'ISOMETRIC',
        accessor: 'isometric',
        className: 'text-center'
    },
    {
        header: 'SHEET',
        accessor: 'sheet',
        className: 'text-center'
    },
    {
        header: 'PART',
        accessor: 'part',
        className: 'text-center'
    },
    {
        header: 'DIMENSION',
        subheader: 'mm',
        accessor: 'dimension',
        className: 'text-center'
    },
    {
        header: 'Ø',
        subheader: 'DN',
        accessor: 'diameter',
        className: 'text-center'
    }
]