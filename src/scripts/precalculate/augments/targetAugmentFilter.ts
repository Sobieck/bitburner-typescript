import { CompanyName, Multipliers, NS, Player, PlayerRequirement } from "@ns";

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
        wantedScorePriceWeighted: number;
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
            augment.wantedScorePriceWeighted = (score / augment.price) * 100_000_000_000
        }
    }

    const sortedAugments = allAugments.sort((a, b) => b.wantedScore - a.wantedScore) //allAugments.sort(function (a, b) { return Number(b.isWanted) - Number(a.isWanted) || a.repReq - b.repReq })
    
    ns.rm(augmentsPath)
    ns.write(augmentsPath, JSON.stringify(sortedAugments))

    type AugmentData = {
        name: string;
        price: number;
        repReq: number;
        nextFactionHas: boolean;
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
        repNeededForAugsThatNextDoesntHave: number;
    }

    const factionAugmentScore: Map<string, FactionPriority> = new Map()

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

                current.augments.push({
                    name: augment.name,
                    repReq: augment.repReq,
                    price: augment.price,
                    nextFactionHas: false
                })

                factionAugmentScore.set(faction, current)
            } else {
                let requirements = ns.singularity.getFactionInviteRequirements(faction)

                if (faction === "Tian Di Hui") {
                    requirements = requirements.filter(x => x.type !== "someCondition")

                    requirements.push({
                        type: "city",
                        city: ns.enums.CityName.Chongqing
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
                    augments: [{
                        name: augment.name,
                        price: augment.price,
                        repReq: augment.repReq,
                        nextFactionHas: false
                    }],
                    maxPrice: augment.price,
                    requirements: requirements,
                    currentRep: ns.singularity.getFactionRep(faction),
                    currentJobRep,
                    repNeededForAugsThatNextDoesntHave: augment.repReq
                })
            }
        }
    }

    //todo
    // add all unwanted augments at the end before we get to the endgame factions that require other stats. Do the same ranking process but based on a secondary score

    const playerPath = "data/player.txt"
    const player = JSON.parse(ns.read(playerPath)) as Player

    const dontWorryAboutMoney = player.mults.hacking_exp > 4 ? true : false

    let bestFactionAugmentScores = Array.from(factionAugmentScore.values()).sort((a, b) => a.maxPrice - b.maxPrice || b.totalWantedScore - a.totalWantedScore) 
    
    if(dontWorryAboutMoney){
        bestFactionAugmentScores = Array.from(factionAugmentScore.values()).sort((a, b) => b.totalWantedScore - a.totalWantedScore) 
    }

    for (let i = 0; i < bestFactionAugmentScores.length - 1; i++) {
        const higherRankedFaction = bestFactionAugmentScores[i];
        const lowerRankedFaction = bestFactionAugmentScores[i + 1]

        const lowerRankedFactionAugmentNames = lowerRankedFaction.augments.map(x => x.name)

        for (const augment of higherRankedFaction.augments) {
            if (lowerRankedFactionAugmentNames.includes(augment.name)) {
                augment.nextFactionHas = true
            }
        }

        higherRankedFaction.repNeededForAugsThatNextDoesntHave = Math.max(...higherRankedFaction.augments.filter(x => !x.nextFactionHas).map(x => x.repReq))
    }

    bestFactionAugmentScores = bestFactionAugmentScores.filter(x => !x.augments.every(y => y.nextFactionHas))

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"

    ns.rm(factionAugmentScoreFile)
    ns.write(factionAugmentScoreFile, JSON.stringify(bestFactionAugmentScores))
}
