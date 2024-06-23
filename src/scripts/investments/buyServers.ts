import { NS, Player, Server } from "@ns";

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
    if (!ns.fileExists("data/investAtWill.txt")) {
        return
    }

    const ramConstrainedFilePath = "data/ramConstrained.txt"

    if (!ns.fileExists(ramConstrainedFilePath)) {
        return
    }

    const purchasedServerNames = ns.getPurchasedServers()

    const purchasedServers = (JSON.parse(ns.read("data/environment.txt")) as Server[]).filter(x => purchasedServerNames.includes(x.hostname))

    const name = `REMOTE-${purchasedServerNames.length.toString().padStart(3, "0")}`

    const precalculations: PrecalculatedValues = JSON.parse(ns.read("data/precalculatedValues.txt"))
    const player: Player = JSON.parse(ns.read("data/player.txt"))

    let ramToBuy = 0
    const ramCosts = precalculations.remoteServerCosts.reverse()
    const playerMoney = player.money

    for (const memoryCost of ramCosts) {
        if (memoryCost.cost < playerMoney) {
            ramToBuy = memoryCost.ram
            break;
        }
    }

    if (ramToBuy > 0) {
        const serverWithLessRamThanPurchase = purchasedServers.find(x => x.maxRam < ramToBuy)

        let purchased = false

        if (serverWithLessRamThanPurchase) {
            ns.upgradePurchasedServer(serverWithLessRamThanPurchase.hostname, ramToBuy)
            purchased = true
        } else {
            if (purchasedServerNames.length < 26) {
                ns.purchaseServer(name, ramToBuy)
                purchased = true
            }
        }

        if (purchased) {
            ns.rm(ramConstrainedFilePath)
        }
    }
} 