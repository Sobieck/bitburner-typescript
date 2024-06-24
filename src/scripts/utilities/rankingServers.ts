import { NS, Server } from "@ns";

interface ServerWithAnalysis extends Server {
    hackMs: number;
    hackThreadsForAllMoney: number;
    hackChance: number;

    growthMs: number;
    numberOfGrowthThreadsNeededToMax: number;
    numberOfGrowthThreadsNeededToMaxHomeComputer: number;

    weakenMs: number;
    maxMoneyPerWeakenMs: number;

    freeRam: number;
}

export async function main(ns: NS): Promise<void> {

    const servers = getObjectFromFileSystem<ServerWithAnalysis[]>(ns, "data/environment.txt")

    if (servers) {
        const attackableServers = servers.filter(x => x.maxMoneyPerWeakenMs).sort((a,b) => a.maxMoneyPerWeakenMs - b.maxMoneyPerWeakenMs)

        const rankedServersPath = "data/rankedServers.txt"
        ns.rm(rankedServersPath)
        ns.write(rankedServersPath, JSON.stringify(attackableServers))
    }

}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)) {
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}