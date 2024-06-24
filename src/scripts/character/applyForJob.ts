import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {

    type FactionPriority = {
        factionName: string;
    }

    const factionPriorities = getObjectFromFileSystem<FactionPriority[]>(ns, "data/factionAugmentRank.txt")

    if (factionPriorities) {

        const factionsWeWantToJoin = factionPriorities.map(x => x.factionName)

        for (const [_, company] of Object.entries(ns.enums.CompanyName)) {
            if (factionsWeWantToJoin.includes(company)) {
                ns.singularity.applyToCompany(company, ns.enums.JobField.software)
            }
        }
    }
}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)) {
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}