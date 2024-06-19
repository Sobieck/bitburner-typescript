import { NS } from "@ns";

export interface FactionPriority {
    factionName: string;
}

export type PrecalculatedValues = {
    targetCityFaction: string | undefined;
}

export async function main(ns: NS): Promise<void> {

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"
    const factionPriorities: FactionPriority[] = JSON.parse(ns.read(factionAugmentScoreFile))

    const precalculatePath = "data/precalculatedValues.txt"
    const precalculations: PrecalculatedValues = JSON.parse(ns.read(precalculatePath))

    const cities : string[] = Object.keys(ns.enums.CityName)

    for (const faction of factionPriorities) {
        if(cities.includes(faction.factionName)){
            precalculations.targetCityFaction = faction.factionName
            break
        }
    }

    ns.rm(precalculatePath)
    ns.write(precalculatePath, JSON.stringify(precalculations))
}
