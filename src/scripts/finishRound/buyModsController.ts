import { Player, NS, Task } from "@ns";


export type AugmentData = {
    name: string;
    price: number;
    repReq: number;
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
}

interface PlayerWithWork extends Player  {
    currentWork: Task | null
    factionsWithRep: FactionsWithRep[]
}

class FactionsWithRep {
    constructor(public factionName: string, public rep: number) { }
}


export class PurchaseAugmentationOrder {
    constructor(public factionName: string, public augName: string, public price: string){}
}

export class PurchaseAugmentationData {
    public totalPrice = Number.MAX_VALUE
    public orders: PurchaseAugmentationData[] = []

    public hasRequiredRepForAllManditoryAugs = false
    public shouldBuyAllAugments = false

    constructor(public playersMoney: number){}
}

export class BuyModsController {
    public completePurchaseData;

    constructor(player: Player, factionPriorities: FactionPriority[], allAugments: Augment[]) {
        this.completePurchaseData = new PurchaseAugmentationData(player.money)
    }
}

export async function main(ns: NS): Promise<void> {

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"
    const factionPriorities: FactionPriority[] = JSON.parse(ns.read(factionAugmentScoreFile))

    const playerPath = "data/player.txt"
    const player = JSON.parse(ns.read(playerPath)) as Player

    const augmentsPath = "data/augments.txt"
    const allAugments: Augment[] = JSON.parse(ns.read(augmentsPath))

    const controller = new BuyModsController(player, factionPriorities, allAugments)

    const purchaseAugmentsDataFile = "data/purchaseAugmentsData.txt"
    ns.rm(purchaseAugmentsDataFile)
    ns.write(purchaseAugmentsDataFile, JSON.stringify(controller.completePurchaseData))
}
