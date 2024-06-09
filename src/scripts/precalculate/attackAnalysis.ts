import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const environmentPath = "data/environment.txt"

    const serversWithAnalysis = JSON.parse(ns.read(environmentPath)) as ServerWithAnalysis[]

    for (const server of serversWithAnalysis) {
        if (server.moneyAvailable && server.moneyMax && server.hasAdminRights) {
            const threadsForAllMoney = ns.hackAnalyzeThreads(server.hostname, server.moneyAvailable)
            
            if (threadsForAllMoney > 0) {
                server.hackThreadsForAllMoney = threadsForAllMoney
                server.hackChance = ns.hackAnalyzeChance(server.hostname)
                server.hackMs = ns.getHackTime(server.hostname)
            }

            const growthFactor = server.moneyMax / server.moneyAvailable

            server.numberOfGrowthThreadsNeededToMax = ns.growthAnalyze(server.hostname, growthFactor)
            server.growthMs = ns.getGrowTime(server.hostname)

            server.weakenMs = ns.getWeakenTime(server.hostname)
        }
    }

    ns.rm(environmentPath)
    ns.write(environmentPath, JSON.stringify(serversWithAnalysis))
}

interface ServerWithAnalysis extends Server {
    hackMs: number;
    hackThreadsForAllMoney: number;
    hackChance: number;

    growthMs: number;
    numberOfGrowthThreadsNeededToMax: number; // needs testing

    weakenMs: number;
} 
