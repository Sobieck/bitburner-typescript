import { NS } from "@ns";

type PrecalculatedValues = {
    targetCityFaction: string | undefined;
}

export async function main(ns: NS): Promise<void> {
   
    const precalculatePath = "data/precalculatedValues.txt"
    const precalculations: PrecalculatedValues = JSON.parse(ns.read(precalculatePath))

    const citiesToNotJoin : string[] = Object
        .keys(ns.enums.CityName)
        .filter(x => x !== precalculations.targetCityFaction)

    const factionInvites = ns.singularity.checkFactionInvitations().filter(x => !citiesToNotJoin.includes(x))

    for (const faction of factionInvites) {
        ns.singularity.joinFaction(faction)
    }    
}
