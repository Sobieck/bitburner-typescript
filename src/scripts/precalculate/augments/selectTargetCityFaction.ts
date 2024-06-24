import { NS } from "@ns";

export interface FactionPriority {
    factionName: string;
}

export type PrecalculatedValues = {
    targetCityFaction: string | undefined;
}

export async function main(ns: NS): Promise<void> {

    const precalculatePath = "data/precalculatedValues.txt"
    const precalculations = getObjectFromFileSystem<PrecalculatedValues>(ns, precalculatePath) 
    const factionPriorities = getObjectFromFileSystem<FactionPriority[]>(ns, "data/factionAugmentRank.txt")

    if(factionPriorities && precalculations){
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
}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)){
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}