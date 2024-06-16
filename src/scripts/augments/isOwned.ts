import { Multipliers, NS } from "@ns";

export async function main(ns: NS): Promise<void> {

    type Augment = {
        name: string;
        sources: string[];
        repReq: number;
        price: number;
        stats: Multipliers;
        prereqs: string[]
        isOwned: boolean
    }

    const augmentsPath = "data/augments.txt"

    const allAugments: Augment[] = JSON.parse(ns.read(augmentsPath))

    const allOwnedAugs = ns.singularity.getOwnedAugmentations()

    for (const augment of allAugments) {
        augment.isOwned = allOwnedAugs.some(x => x === augment.name)
    }

    ns.rm(augmentsPath)
    ns.write(augmentsPath, JSON.stringify(allAugments))
}
