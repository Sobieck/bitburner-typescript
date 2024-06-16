import { Multipliers, NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const allAugmentsWithSources: Map<string, string[]> = new Map()

    const factionNames = [
        "NiteSec",
        "Clarke Incorporated",
        "KuaiGong International",
        "Blade Industries",
        "MegaCorp",
        "Four Sigma",
        "Bachman & Associates",
        "OmniTek Incorporated",
        "NWO",
        "ECorp",
        "CyberSec",
        "Tian Di Hui",
        "Netburners",
        "Shadows of Anarchy",
        "Sector-12",
        "Chongqing",
        "New Tokyo",
        "Ishima",
        "Aevum",
        "Volhaven",
        "The Black Hand",
        "BitRunners",
        "Fulcrum Secret Technologies",
        "The Covenant",
        "Daedalus",
        "Illuminati"
    ]

    for (const factionName of factionNames) {
        const augments = ns.singularity.getAugmentationsFromFaction(factionName)

        for (const augmentName of augments) {
            if (allAugmentsWithSources.has(augmentName)) {
                const arrayOfSources = allAugmentsWithSources.get(augmentName)!
                arrayOfSources.push(factionName)
            } else {
                allAugmentsWithSources.set(augmentName, [factionName])
            }
        }
    }

    type Augment = {
        name: string;
        sources: string[];
    }

    const allAugments = []

    for (const augmentNameWithSources of allAugmentsWithSources) {
        const augment: Augment =
        {
            name: augmentNameWithSources[0],
            sources: augmentNameWithSources[1]
        }

        allAugments.push(augment)
    }

    const augmentsPath = "data/augments.txt" 
    ns.rm(augmentsPath)
    ns.write(augmentsPath, JSON.stringify(allAugments))
}
