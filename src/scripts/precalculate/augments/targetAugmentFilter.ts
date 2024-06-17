import { CompanyName, Multipliers, NS, PlayerRequirement } from "@ns";

export async function main(ns: NS): Promise<void> {

    type Augment = {
        name: string;
        sources: string[];
        repReq: number;
        price: number;
        stats: Multipliers;
        prereqs: string[];
        isOwned: boolean;
        isWanted: boolean;
        wantedScore: number;
    }

    const augmentsPath = "data/augments.txt"

    const allAugments: Augment[] = JSON.parse(ns.read(augmentsPath))

    const wantedAugments = allAugments.filter(x =>
        x.stats.hacking > 1 ||
        x.stats.hacking_chance > 1 ||
        x.stats.hacking_exp > 1 ||
        x.stats.hacking_grow > 1 ||
        x.stats.hacking_money > 1 ||
        x.stats.hacking_speed > 1 ||
        x.stats.charisma > 1 ||
        x.stats.charisma_exp > 1 ||
        x.stats.faction_rep > 1 ||
        x.stats.company_rep > 1
    ).map(x => x.name)

    for (const augment of allAugments) {
        augment.isWanted = wantedAugments.some(x => x === augment.name)

        const score = augment.stats.hacking +
            augment.stats.hacking_chance +
            augment.stats.hacking_exp +
            augment.stats.hacking_grow +
            augment.stats.hacking_money +
            augment.stats.hacking_speed +
            augment.stats.charisma +
            augment.stats.charisma_exp +
            augment.stats.faction_rep +
            augment.stats.company_rep
            - 10

        if (score === 0) {
            augment.wantedScore = 0
        } else {
            augment.wantedScore = (score / augment.repReq) * 1_000_000
        }
    }

    const sortedAugments = allAugments.sort((a, b) => b.wantedScore - a.wantedScore) //allAugments.sort(function (a, b) { return Number(b.isWanted) - Number(a.isWanted) || a.repReq - b.repReq })

    ns.rm(augmentsPath)
    ns.write(augmentsPath, JSON.stringify(sortedAugments))

    type FactionInfo = {
        totalWantedScore: number;
        maxRepNeeded: number;
        factionName: string;
        augments: string[];
        maxPrice: number;
        requirements: PlayerRequirement[];
        currentRep: number;
        currentJobRep: number | undefined;
    }

    const factionAugmentScore: Map<string, FactionInfo> = new Map()

    const companies: CompanyName[] = []

    for (const [_, value] of Object.entries(ns.enums.CompanyName)) {
        companies.push(value)
    }

    for (const augment of allAugments) {
        for (const faction of augment.sources) {
            if (augment.isOwned || !augment.isWanted) {
                continue
            }

            if (factionAugmentScore.has(faction)) {
                const current = factionAugmentScore.get(faction)!

                if (current.maxRepNeeded < augment.repReq) {
                    current.maxRepNeeded = augment.repReq
                }

                if (current.maxPrice < augment.price) {
                    current.maxPrice = augment.price
                } 

                current.totalWantedScore += augment.wantedScore
                current.augments.push(augment.name)

                factionAugmentScore.set(faction, current)
            } else {
                let requirements = ns.singularity.getFactionInviteRequirements(faction)

                if (faction === "Tian Di Hui") {
                    requirements = requirements.filter(x => x.type !== "someCondition")

                    requirements.push({
                        type: "city",
                        city: ns.enums.CityName.NewTokyo
                    })
                }

                let currentJobRep: number | undefined;

                const companyName = companies.find(x => x === faction)

                if (companyName) {
                    currentJobRep = ns.singularity.getCompanyRep(companyName)
                }


                factionAugmentScore.set(faction, {
                    totalWantedScore: augment.wantedScore,
                    maxRepNeeded: augment.repReq,
                    factionName: faction,
                    augments: [augment.name],
                    maxPrice: augment.price,
                    requirements: requirements,
                    currentRep: ns.singularity.getFactionRep(faction),
                    currentJobRep
                })
            }
        }
    }

    const bestFactionAugmentScores = Array.from(factionAugmentScore.values()).sort((a, b) => a.maxPrice - b.maxPrice || b.totalWantedScore - a.totalWantedScore)

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"

    ns.rm(factionAugmentScoreFile)
    ns.write(factionAugmentScoreFile, JSON.stringify(bestFactionAugmentScores))
}
