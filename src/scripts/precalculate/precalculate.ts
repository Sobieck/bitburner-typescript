import { NS, Player, Server } from "@ns";

type ServerMemoryWithCost = {
    ram: number;
    cost: number;
}

type PrecalculatedValues = {
    remoteServerCosts: ServerMemoryWithCost[];
    player: Player;
    weakenAmountPerThread01Core: number;
    weakenAmountPerThreadHomeComputer: number;
}

export async function main(ns: NS): Promise<void> {
    const environment: Server[] = JSON.parse(ns.read("data/environment.txt"))

    const homeComputer = environment.find(x => x.hostname === "home")!

    const precalculatedValues: PrecalculatedValues = {
        remoteServerCosts: [],
        player: ns.getPlayer(),
        weakenAmountPerThread01Core: ns.weakenAnalyze(1, 1),
        weakenAmountPerThreadHomeComputer: ns.weakenAnalyze(1, homeComputer.cpuCores)
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