import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {

    const cities : string[] = Object.keys(ns.enums.CityName)

    const factionInvites = ns.singularity.checkFactionInvitations().filter(x => !cities.includes(x))

    for (const faction of factionInvites) {
        ns.singularity.joinFaction(faction)
    }    
}
