import {useState, useMemo} from 'react'
import {Joint} from '@models/joint.interface'

export interface IsoItem {
    id: string
    internalId: string
    sheets: {
        number: number
        revId: number
        spools: {
            id: number
            internalId: string
            welds: { id: number }[]
        }[]
    }[]
}

interface SpoolData {
    id: number
    internalId: string
    welds: Set<number>
}

interface SheetSpools {
    spoolIds: Set<number>
    revIds: number[]
}

export function useAssemblyTable(initialItems: Joint[]) {
    const [selectedIso, setSelectedIso] = useState<IsoItem | null>(null)

    const isometricItems = useMemo(() => {
        const spoolsMap = buildSpoolsMap(initialItems)
        const hierarchyMap = buildHierarchyMap(initialItems)

        return buildIsometricItems(hierarchyMap, spoolsMap)
    }, [initialItems])

    const handleSelectIso = (item: IsoItem) => setSelectedIso(item)

    return {isometricItems, selectedIso, handleSelectIso}
}

function buildSpoolsMap(joints: Joint[]): Map<number, SpoolData> {
    const spoolsMap = new Map<number, SpoolData>()

    joints.forEach(joint => {
        const spoolId = joint.spool.id

        if (!spoolsMap.has(spoolId)) {
            spoolsMap.set(spoolId, {
                id: joint.spool.id,
                internalId: joint.spool.internalId,
                welds: new Set()
            })
        }

        joint.welds.forEach(weld => {
            spoolsMap.get(spoolId)!.welds.add(weld.id)
        })
    })

    return spoolsMap
}

function buildHierarchyMap(joints: Joint[]): Map<string, Map<number, SheetSpools>> {
    const hierarchyMap = new Map<string, Map<number, SheetSpools>>()

    joints.forEach(joint => {
        joint.spool.revs.forEach(rev => {
            const isoId = rev.sheet.isometric.internalId
            const sheetNumber = rev.sheet.number
            const spoolId = joint.spool.id

            if (!hierarchyMap.has(isoId)) {
                hierarchyMap.set(isoId, new Map())
            }

            const isoMap = hierarchyMap.get(isoId)!
            if (!isoMap.has(sheetNumber)) {
                isoMap.set(sheetNumber, {spoolIds: new Set(), revIds: []})
            }

            const sheetData = isoMap.get(sheetNumber)!
            sheetData.spoolIds.add(spoolId)
            sheetData.revIds.push(rev.id)
        })
    })

    return hierarchyMap
}

function buildIsometricItems(
    hierarchyMap: Map<string, Map<number, SheetSpools>>,
    spoolsMap: Map<number, SpoolData>
): IsoItem[] {
    return Array.from(hierarchyMap.entries())
        .map(([isoId, sheetsMap]) => ({
            id: isoId,
            internalId: isoId,
            sheets: buildSheets(sheetsMap, spoolsMap)
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
}

function buildSheets(
    sheetsMap: Map<number, SheetSpools>,
    spoolsMap: Map<number, SpoolData>
) {
    return Array.from(sheetsMap.entries())
        .map(([sheetNumber, sheetData]) => ({
            number: sheetNumber,
            revId: Math.max(...sheetData.revIds),
            spools: buildSpools(sheetData.spoolIds, spoolsMap)
        }))
        .sort((a, b) => a.number - b.number)
}

function buildSpools(spoolIds: Set<number>, spoolsMap: Map<number, SpoolData>) {
    return Array.from(spoolIds)
        .map(spoolId => {
            const spoolData = spoolsMap.get(spoolId)!
            return {
                id: spoolData.id,
                internalId: spoolData.internalId,
                welds: Array.from(spoolData.welds)
                    .sort((a, b) => a - b)
                    .map(weldId => ({id: weldId}))
            }
        })
        .sort((a, b) => a.id - b.id)
}