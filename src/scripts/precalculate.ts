import { NS, Player } from "@ns";

type ServerMemoryWithCost = {
    ram: number;
    cost: number;
}

type PrecalculatedValues = {
    remoteServerCosts: ServerMemoryWithCost[];
    player: Player;
}

export async function main(ns: NS): Promise<void> {
    const precalculatedValues: PrecalculatedValues = {
        remoteServerCosts: [],
        player: ns.getPlayer()
    }

    let ramAmount = 32
    let maxAmountOfRam = 1_048_576;

    while (ramAmount <= maxAmountOfRam) {
        const serverMemoryWithCost = {
            ram: ramAmount,
            cost: ns.getPurchasedServerCost(ramAmount)
        }

        precalculatedValues.remoteServerCosts.push(serverMemoryWithCost)

        ramAmount *= 2 
    }

    const path = "data/precalculatedValues.txt"

    ns.rm(path)
    ns.write(path, JSON.stringify(precalculatedValues))
}
