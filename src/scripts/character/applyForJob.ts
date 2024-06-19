import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const factionAugmentScoreFile = "data/factionAugmentRank.txt"

    type FactionPriority = {
        factionName: string;
    }

    const factionsWeWantToJoin = (JSON.parse(ns.read(factionAugmentScoreFile)) as FactionPriority[]).map(x => x.factionName)

    for (const [_, company] of Object.entries(ns.enums.CompanyName)) {
        if(factionsWeWantToJoin.includes(company)){
            ns.singularity.applyToCompany(company, ns.enums.JobField.software)
        }
    }
}

