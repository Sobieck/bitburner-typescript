import { Player, NS, Task } from "@ns";


export type AugmentData = {
    name: string;
    nextFactionHas: boolean;
}

export type FactionPriority = {
    factionName: string;
    augments: AugmentData[];
}

export type Augment = {
    name: string;
    sources: string[];
    repReq: number;
    price: number;
    prereqs: string[];
    isOwned: boolean;
    isWanted: boolean;
    wantedScore: number;
    wantedScorePriceWeighted: number;

    factionToBuyFrom: string;
}

export interface PlayerWithWork extends Player {
    currentWork: Task | null
    factionsWithRep: FactionsWithRep[]
}

export class FactionsWithRep {
    constructor(public factionName: string, public rep: number) { }
}


export class PurchaseAugmentationOrder {
    constructor(public factionName: string, public augName: string, public price: number) { }
}

export class PurchaseAugmentationData {
    public totalPrice = Number.MAX_VALUE
    public orders: PurchaseAugmentationOrder[] = []

    public hasRequiredRepForAllManditoryAugs = false
    public shouldBuyAllAugments = false

}

export class BuyModsController {
    public completePurchaseData;

    constructor(player: PlayerWithWork, factionPriorities: FactionPriority[], allAugments: Augment[]) {
        this.completePurchaseData = new PurchaseAugmentationData()

        const sortedPurchasableAugments = this.getPurchasableAugmentsInOrderOfPriceLeastToMost(allAugments, player);
        const ownedAugments = allAugments.filter(x => x.isOwned).map(x => x.name)


        let augmentsWithPrereqsRespected = sortedPurchasableAugments

        let i = 0;
        do {
            const augment = augmentsWithPrereqsRespected[i];

            if (augment.prereqs.length > 0) {
                augment.prereqs = augment.prereqs.filter(x => !ownedAugments.includes(x))

                if (augment.prereqs.length > 0) {
                    const indexOfPrereq = augmentsWithPrereqsRespected.findIndex(x => augment.prereqs.includes(x.name))

                    if (indexOfPrereq === -1) {
                        augmentsWithPrereqsRespected.splice(i, 1)
                    }

                    if (indexOfPrereq > i) {
                        const dependencyAug = augmentsWithPrereqsRespected[indexOfPrereq]

                        augment.prereqs = augment.prereqs.filter(x => dependencyAug.name !== x)

                        augmentsWithPrereqsRespected.splice(i, 0, dependencyAug)

                        augmentsWithPrereqsRespected.splice(indexOfPrereq + 1, 1)

                        i = 0
                        continue
                    }
                }
            }

            i++;

        } while (i < augmentsWithPrereqsRespected.length);

        this.completePurchaseData.orders = augmentsWithPrereqsRespected.map(x => new PurchaseAugmentationOrder(x.factionToBuyFrom, x.name, x.price))
    }


    private getPurchasableAugmentsInOrderOfPriceLeastToMost(allAugments: Augment[], player: PlayerWithWork) {
        const sortedPurchasableAugments = [];

        for (const augment of allAugments.sort((a, b) => b.price - a.price)) {
            for (const source of augment.sources) {
                const factionWithCurrentRep = player.factionsWithRep.find(x => x.factionName === source);

                if (factionWithCurrentRep &&
                    factionWithCurrentRep.rep > augment.repReq) {

                    augment.factionToBuyFrom = factionWithCurrentRep.factionName
                    sortedPurchasableAugments.push(augment);
                    break;
                }
            }
        }
        return sortedPurchasableAugments;
    }
}

export async function main(ns: NS): Promise<void> {

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"
    const factionPriorities: FactionPriority[] = JSON.parse(ns.read(factionAugmentScoreFile))

    const playerPath = "data/player.txt"
    const player = JSON.parse(ns.read(playerPath)) as PlayerWithWork

    const augmentsPath = "data/augments.txt"
    const allAugments: Augment[] = JSON.parse(ns.read(augmentsPath))

    const controller = new BuyModsController(player, factionPriorities, allAugments)

    const purchaseAugmentsDataFile = "data/purchaseAugmentsData.txt"
    ns.rm(purchaseAugmentsDataFile)
    ns.write(purchaseAugmentsDataFile, JSON.stringify(controller.completePurchaseData))
}