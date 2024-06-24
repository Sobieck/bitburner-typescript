import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const environmentPath = "data/environment.txt"

    const serversWithAnalysis = getObjectFromFileSystem<ServerWithAnalysis[]>(ns, environmentPath)
    const scriptRegistry = getObjectFromFileSystem<any>(ns, "data/scriptRegistry.txt")

    if (scriptRegistry && serversWithAnalysis) {
        const homeServer = serversWithAnalysis.find(x => x.hostname === "home")

        for (const server of serversWithAnalysis) {
            server.freeRam = server.maxRam - server.ramUsed

            if (server.hostname === "home") {
                server.freeRam = server.maxRam - (scriptRegistry.ramReservedOnHome + server.ramUsed)
            }

            if (server.moneyMax && server.hasAdminRights) {
                let moneyAvailable = server.moneyAvailable!

                if (moneyAvailable === 0) {
                    moneyAvailable = 1
                }

                const threadsForAllMoney = ns.hackAnalyzeThreads(server.hostname, moneyAvailable)

                if (threadsForAllMoney > 0) {
                    server.hackThreadsForAllMoney = Math.ceil(threadsForAllMoney)
                    server.hackChance = ns.hackAnalyzeChance(server.hostname)
                    server.hackMs = Math.ceil(ns.getHackTime(server.hostname))
                }

                const growthFactor = server.moneyMax / moneyAvailable

                server.numberOfGrowthThreadsNeededToMax = Math.ceil(ns.growthAnalyze(server.hostname, growthFactor))
                server.numberOfGrowthThreadsNeededToMaxHomeComputer = Math.ceil(ns.growthAnalyze(server.hostname, growthFactor, homeServer?.cpuCores))

                server.growthMs = Math.ceil(ns.getGrowTime(server.hostname))

                server.weakenMs = Math.ceil(ns.getWeakenTime(server.hostname))

                server.maxMoneyPerWeakenMs = server.moneyMax / server.weakenMs;
            }
        }


        ns.rm(environmentPath)
        ns.write(environmentPath, JSON.stringify(serversWithAnalysis.sort((a, b) => b.maxMoneyPerWeakenMs - a.maxMoneyPerWeakenMs)))
    }
}



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

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)) {
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}