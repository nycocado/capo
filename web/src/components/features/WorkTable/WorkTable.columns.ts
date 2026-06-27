import {
  AssemblyListDto,
  CutListDto,
  FittingDto,
  PipeLengthDto,
  WeldListDto,
} from "@dtos";
import { PipeLengthWithContext } from "@interfaces";
import { Column } from "@components/features/WorkTable/WorkTable";

export const columnsCutList: Column<CutListDto>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    className: "text-center",
    sortable: true,
  },
  {
    id: "isometric",
    header: "ISOMETRIC",
    accessor: (item) => item.isometric.internalId,
    className: "text-center",
    sortable: true,
  },
  {
    id: "pipeCount",
    header: "PIPES",
    accessor: (item) => (item.pipeCount ?? 0).toString(),
    className: "text-center",
    sortable: true,
    searchable: false,
  },
];

export const columnsPipeLengthDto: Column<PipeLengthWithContext>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    className: "text-center",
    sortable: true,
  },
  {
    id: "description",
    header: "DESCRIPTION",
    accessor: (item) => item.description,
    className: "text-center",
    sortable: true,
  },
  {
    id: "isometric",
    header: "ISOMETRIC",
    accessor: (item) => item.isometricInfo?.internalId || "-",
    className: "text-center",
    sortable: true,
  },
  {
    id: "length",
    header: "LENGTH",
    accessor: (item) => item.length.toString(),
    className: "text-center",
    sortable: true,
  },
  {
    id: "diameter",
    header: "Ø",
    accessor: (item) => item.diameter.nominalMm.toString(),
    className: "text-center",
    sortable: true,
  },
  {
    id: "material",
    header: "MATERIAL",
    accessor: (item) => item.material.name,
    className: "text-center",
    sortable: true,
  },
];

export const columnsAssemblyList: Column<AssemblyListDto>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    className: "text-center",
    sortable: true,
  },
  {
    id: "isometric",
    header: "ISOMETRIC",
    accessor: (item) => item.isometric?.internalId || "-",
    className: "text-center",
    sortable: true,
  },
  {
    id: "spoolCount",
    header: "SPOOLS",
    accessor: (item) => (item.spoolCount ?? 0).toString(),
    className: "text-center",
    sortable: true,
    searchable: false,
  },
  {
    id: "weldCount",
    header: "WELDS",
    accessor: (item) => (item.weldCount ?? 0).toString(),
    className: "text-center",
    sortable: true,
    searchable: false,
  },
];

export const columnsWeldList: Column<WeldListDto>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    className: "text-center",
    sortable: true,
  },
  {
    id: "spool",
    header: "SPOOL",
    accessor: (item) => item.spool?.internalId || "-",
    className: "text-center",
    sortable: true,
  },
  {
    id: "weldCount",
    header: "WELDS",
    accessor: (item) => (item.weldCount ?? 0).toString(),
    className: "text-center",
    sortable: true,
    searchable: false,
  },
];

export const columnsPipeLengthVerification: Column<PipeLengthDto>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    sortable: true,
  },
  {
    id: "description",
    header: "DESCRIPTION",
    accessor: (item) => item.description,
    sortable: false,
  },
  {
    id: "length",
    header: "LENGTH (mm)",
    accessor: (item) => item.length.toString(),
    sortable: true,
  },
  {
    id: "diameter",
    header: "Ø",
    accessor: (item) =>
      `${item.diameter.nominalMm}mm (${item.diameter.nominalInch}")`,
    sortable: false,
  },
  {
    id: "material",
    header: "MATERIAL",
    accessor: (item) => item.material.name,
    sortable: true,
  },
];

export const columnsFittingVerification: Column<FittingDto>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    sortable: true,
  },
  {
    id: "type",
    header: "TYPE",
    accessor: (item) => item.fittingType.name,
    sortable: true,
  },
  {
    id: "description",
    header: "DESCRIPTION",
    accessor: (item) => item.description,
    sortable: false,
  },
  {
    id: "diameter1",
    header: "Ø 1",
    accessor: (item) => {
      const port1 = item.ports?.find((p) => p.number === 1);
      return port1
        ? `${port1.diameter.nominalInch}" (${port1.diameter.nominalMm}mm)`
        : "-";
    },
    sortable: false,
  },
  {
    id: "diameter2",
    header: "Ø 2",
    accessor: (item) => {
      const port2 = item.ports?.find((p) => p.number === 2);
      return port2
        ? `${port2.diameter.nominalInch}" (${port2.diameter.nominalMm}mm)`
        : "-";
    },
    sortable: false,
  },
  {
    id: "material",
    header: "MATERIAL",
    accessor: (item) => item.material.name,
    sortable: true,
  },
  {
    id: "total",
    header: "TOTAL PORTS",
    accessor: (item) => item.ports?.length.toString() || "0",
    sortable: true,
  },
];
