import { NS, Player, Server } from "@ns";

/// TODO 

export async function main(ns: NS): Promise<void> {
    if(!ns.fileExists("Formulas.exe")){
        return
    }

    const environmentPath = "data/environment.txt"
    const serversWithAnalysis = JSON.parse(ns.read(environmentPath)) as ServerWithAnalysis[]

    const precalculations = (JSON.parse(ns.read("data/precalculatedValues.txt")) as PrecalculatedValues)
    const player = precalculations.player

    const homeServer = serversWithAnalysis.find(x => x.hostname === "home")!

    for (const server of serversWithAnalysis) {
        if (server.moneyMax && server.hasAdminRights) {

            
            const growthPhaseServer = JSON.parse(JSON.stringify(server)) as Server
            growthPhaseServer.moneyAvailable = 0;
            growthPhaseServer.hackDifficulty = growthPhaseServer.minDifficulty

            const growThreadsHome = ns.formulas.hacking.growThreads(growthPhaseServer, player, server.moneyMax, homeServer.cpuCores)
            const growSecurityIncreaseHome = ns.growthAnalyzeSecurity(growThreadsHome, server.hostname, homeServer.cpuCores)
            

            const growThreads = ns.formulas.hacking.growThreads(growthPhaseServer, player, server.moneyMax, 1)
            const growSecurityIncrease =  ns.growthAnalyzeSecurity(growThreads, server.hostname, 1)

            const hackPhaseServer = JSON.parse(JSON.stringify(server)) as Server
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
    numberOfGrowthThreadsNeededToMax: number;

    numberOfGrowthThreadsNeededToMaxHomeComputer: number;


    weakenMs: number;
    maxMoneyPerMs: number;

    freeRam: number;
} 


type PrecalculatedValues = {
    player: Player;
    weakenAmountPerThread01Core: number;
    weakenAmountPerThreadHomeComputer: number;
}