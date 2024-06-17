import { Multipliers, NS } from "@ns";

export async function main(ns: NS): Promise<void> {

    type Augment = {
        name: string;
        sources: string[];
        repReq: number;
        price: number;
        stats: Multipliers;
        prereqs: string[]
    }

    const augmentsPath = "data/augments.txt"


    const allAugments: Augment[] = JSON.parse(ns.read(augmentsPath))

    for (const augment of allAugments) {
        augment.prereqs = ns.singularity.getAugmentationPrereq(augment.name)
    }

    ns.rm(augmentsPath)
    ns.write(augmentsPath, JSON.stringify(allAugments)) 
}
