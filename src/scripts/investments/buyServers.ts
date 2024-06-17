import { NS, Player } from "@ns";

type ServerMemoryWithCost = {
    ram: number;
    cost: number;
}

type PrecalculatedValues = {
    remoteServerCosts: ServerMemoryWithCost[];
    weakenAmountPerThread01Core: number;
    weakenAmountPerThreadHomeComputer: number;
}

export async function main(ns: NS): Promise<void> {
    // ns.tprint(ns.getPurchasedServerCost(32)) 

    const purchasedServers = ns.getPurchasedServers()

    const name = `REMOTE-${purchasedServers.length.toString(3).padStart(3, "0")}`

    const precalculations: PrecalculatedValues = JSON.parse(ns.read("data/precalculatedValues.txt"))
    const player : Player = JSON.parse(ns.read("data/player.txt"))

    let memoryToBuy = 0
    const memoryCosts = precalculations.remoteServerCosts.reverse()
    const playerMoney = player.money

    for (const memoryCost of memoryCosts) {
        if (memoryCost.cost < playerMoney) {
            memoryToBuy = memoryCost.ram
            break;
        }
    }

    // ns.upgradePurchasedServer(remoteName, 2048)
    if (memoryToBuy > 0) {
        ns.purchaseServer(name, memoryToBuy)
    }

} 