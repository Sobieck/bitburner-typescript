import { NS, Server } from "@ns";

type PrecalculatedValues = {
    upgradeHomeRamCost: number;
    upgradeHomeCoresCost: number;
    purchasedServerLimit: number;
}

export async function main(ns: NS): Promise<void> {


    const pathToPrecalculations = "data/precalculatedValues.txt"
    const precalculatedValues: PrecalculatedValues = JSON.parse(ns.read(pathToPrecalculations))

    precalculatedValues.upgradeHomeCoresCost = ns.singularity.getUpgradeHomeCoresCost()
    precalculatedValues.upgradeHomeRamCost = ns.singularity.getUpgradeHomeRamCost()
    precalculatedValues.purchasedServerLimit = ns.getPurchasedServerLimit()
    // ns.singularity.getDarkwebProgramCost()

    ns.rm(pathToPrecalculations)
    ns.write(pathToPrecalculations, JSON.stringify(precalculatedValues))
}
