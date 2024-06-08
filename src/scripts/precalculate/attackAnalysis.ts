import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const environmentPath = "data/environment.txt"

    const serversWithAnalysis = JSON.parse(ns.read(environmentPath)) as ServerWithAnalysis[]

    for (const server of serversWithAnalysis) {
        if (server.moneyAvailable && server.moneyMax) {
            const threadsForAllMoney = ns.hackAnalyzeThreads(server.hostname, server.moneyAvailable)
            if (threadsForAllMoney > 0) {
                server.hackThreadsForAllMoney = threadsForAllMoney
                server.hackChance = ns.hackAnalyzeChance(server.hostname)
            }

            const growthFactor = server.moneyMax / server.moneyAvailable

            server.numberOfGrowthThreadsNeededToMax = ns.growthAnalyze(server.hostname, growthFactor)
        }
    }

    ns.rm(environmentPath)
    ns.write(environmentPath, JSON.stringify(serversWithAnalysis))
}

interface ServerWithAnalysis extends Server {
    hackThreadsForAllMoney: number;
    hackChance: number;
    numberOfGrowthThreadsNeededToMax: number; // needs testing
} 
