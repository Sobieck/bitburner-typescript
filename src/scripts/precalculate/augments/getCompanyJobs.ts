import { CompanyName, CompanyPositionInfo, Multipliers, NS, PlayerRequirement } from "@ns";

export async function main(ns: NS): Promise<void> {

    type AugmentData = {
        name: string;
        price: number;
        repReq: number;
    }

    type FactionPriority = {
        totalWantedScore: number;
        maxRepNeeded: number;
        factionName: string;
        augments: AugmentData[];
        maxPrice: number;
        requirements: PlayerRequirement[];
        currentRep: number;
        currentJobRep: number | undefined;
        positions: CompanyPositionInfo[] | undefined;
    }

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"
    const factionAugments: FactionPriority[] = JSON.parse(ns.read(factionAugmentScoreFile))

    for (const [_, companyName] of Object.entries(ns.enums.CompanyName)) {
        const companyInQuestion = factionAugments.find(x => x.factionName === companyName)
        if (companyInQuestion) {
            companyInQuestion.positions = []

            for (const jobTitle of ns.singularity.getCompanyPositions(companyName)) {
                companyInQuestion.positions.push(
                    ns.singularity.getCompanyPositionInfo(companyName, jobTitle)
                )
            }
        }
    }

    ns.rm(factionAugmentScoreFile)
    ns.write(factionAugmentScoreFile, JSON.stringify(factionAugments))
}
