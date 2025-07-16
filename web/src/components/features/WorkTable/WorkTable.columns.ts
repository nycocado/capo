import { AssemblyListDto, CutListDto, FittingDto, PipeLengthDto } from "@/dtos";
import { WeldRow } from "@/app/(factory)/weld/useWeldTable.types";
import { PipeLengthWithContext } from "@/interfaces";
import { Column } from "@components/features/WorkTable/WorkTable";

export const columnsCutList: Column<CutListDto>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "isometric",
    header: "ISOMETRIC",
    accessor: (item) => item.isometric.internalId,
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "sheets",
    header: "SHEETS",
    accessor: (item) => {
      return item.isometric.sheets?.map((s) => s.number).join(", ") || "-";
    },
    className: "text-center",
    sortable: false,
    searchable: false,
  },
  {
    id: "pipeCount",
    header: "PIPES",
    accessor: (item) => {
      const totalPipes =
        item.isometric.sheets?.reduce((total, sheet) => {
          return total + (sheet.pipeLengths?.length || 0);
        }, 0) || 0;
      return totalPipes.toString();
    },
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
    searchable: true,
  },
  {
    id: "description",
    header: "DESCRIPTION",
    accessor: (item) => item.description,
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "isometric",
    header: "ISOMETRIC",
    accessor: (item) => item.isometricInfo?.internalId || "-",
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "sheet",
    header: "SHEET",
    accessor: (item) => item.isometricInfo?.sheetNumber?.toString() || "-",
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "length",
    header: "LENGTH",
    subheader: "mm",
    accessor: (item) => item.length.toString(),
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "diameter",
    header: "Ø",
    subheader: "DN",
    accessor: (item) => item.diameter.nominalMm.toString(),
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "material",
    header: "MATERIAL",
    accessor: (item) => item.material.name,
    className: "text-center",
    sortable: true,
    searchable: true,
  },
];

export const columnsAssemblyList: Column<AssemblyListDto>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (item) => item.internalId,
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "isometric",
    header: "ISOMETRIC",
    accessor: (item) => item.isometric?.internalId || "-",
    className: "text-center",
    sortable: true,
    searchable: true,
  },
  {
    id: "sheets",
    header: "SHEETS",
    accessor: (item) => {
      return item.isometric?.sheets?.map((s) => s.number).join(", ") || "-";
    },
    className: "text-center",
    sortable: false,
    searchable: false,
  },
  {
    id: "spoolCount",
    header: "SPOOLS",
    accessor: (item) => {
      const totalSpools =
        item.isometric?.sheets?.reduce((total, sheet) => {
          return total + (sheet.spools?.length || 0);
        }, 0) || 0;
      return totalSpools.toString();
    },
    className: "text-center",
    sortable: true,
    searchable: false,
  },
  {
    id: "weldCount",
    header: "WELDS",
    accessor: (item) => {
      const totalWelds =
        item.isometric?.sheets?.reduce((sheetTotal, sheet) => {
          const sheetWelds =
            sheet.spools?.reduce((spoolTotal, spool) => {
              const spoolWelds =
                spool.joints?.reduce((jointTotal, joint) => {
                  return jointTotal + (joint.welds?.length || 0);
                }, 0) || 0;
              return spoolTotal + spoolWelds;
            }, 0) || 0;
          return sheetTotal + sheetWelds;
        }, 0) || 0;
      return totalWelds.toString();
    },
    className: "text-center",
    sortable: true,
    searchable: false,
  },
];

export const columnsWeld: Column<WeldRow>[] = [
  {
    id: "spoolInternalId",
    header: "Spool",
    accessor: (item: WeldRow) => item.spoolInternalId,
    sortable: true,
    searchable: true,
  },
  {
    id: "isoInternalId",
    header: "Isometric",
    accessor: (item: WeldRow) => item.isoInternalId,
    sortable: true,
    searchable: true,
  },
  {
    id: "sheetNumber",
    header: "Sheet",
    accessor: (item: WeldRow) => item.sheetNumber,
    sortable: true,
    searchable: true,
  },
  {
    id: "weldCount",
    header: "Welds",
    accessor: (item: WeldRow) => item.weldCount.toString(),
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
    id: "number",
    header: "NUMBER",
    accessor: (item) => item.number,
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
    id: "number",
    header: "NUMBER",
    accessor: (item) => item.number,
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
