import { NS, Player, Server } from "@ns";

/// TODO 

export async function main(ns: NS): Promise<void> {
    if (!ns.fileExists("Formulas.exe")) {
        return
    }

    const environmentPath = "data/environment.txt"
    const serversWithAnalysis = getObjectFromFileSystem<ServerWithAnalysis[]>(ns, environmentPath)

    const precalculations = getObjectFromFileSystem<PrecalculatedValues>(ns, "data/precalculatedValues.txt")
    const player = getObjectFromFileSystem<Player>(ns, "data/player.txt")

    if (serversWithAnalysis && precalculations && player) {
        const homeServer = serversWithAnalysis.find(x => x.hostname === "home")!

        for (const server of serversWithAnalysis) {
            if (server.moneyMax && server.hasAdminRights) {
                server.formulasAnalysis = {} as FormulasServerAnalysis

                const growthPhaseServer = JSON.parse(JSON.stringify(server)) as Server
                growthPhaseServer.moneyAvailable = 0;
                growthPhaseServer.hackDifficulty = growthPhaseServer.minDifficulty

                server.formulasAnalysis.numberOfGrowthThreadsNeededHome = Math.ceil(ns.formulas.hacking.growThreads(growthPhaseServer, player, server.moneyMax, homeServer.cpuCores))
                server.formulasAnalysis.growThreadsSecurityIncreaseHome = ns.growthAnalyzeSecurity(server.formulasAnalysis.numberOfGrowthThreadsNeededHome, server.hostname, homeServer.cpuCores)

                server.formulasAnalysis.numberOfGrowthThreadsNeeded = Math.ceil(ns.formulas.hacking.growThreads(growthPhaseServer, player, server.moneyMax, 1))
                server.formulasAnalysis.growThreadsSecurityIncrease = ns.growthAnalyzeSecurity(server.formulasAnalysis.numberOfGrowthThreadsNeeded, server.hostname, 1)

                const hackPhaseServer = JSON.parse(JSON.stringify(server)) as Server
                hackPhaseServer.moneyAvailable = hackPhaseServer.moneyMax
                hackPhaseServer.hackDifficulty = hackPhaseServer.minDifficulty

                server.formulasAnalysis.oneThreadHackPercent = ns.formulas.hacking.hackPercent(hackPhaseServer, player)

                server.formulasAnalysis.hackThreadsForMaxMoney = Math.ceil(1 / server.formulasAnalysis.oneThreadHackPercent)
                server.formulasAnalysis.hackThreadsForMaxMoneySecurityIncrease = ns.hackAnalyzeSecurity(server.formulasAnalysis.hackThreadsForMaxMoney, server.hostname)

                /// get MS for all these things
            }
        }

        ns.rm(environmentPath)
        ns.write(environmentPath, JSON.stringify(serversWithAnalysis))
    }
}
// givemore stucture FORMULAS numbers
interface ServerWithAnalysis extends Server {
    formulasAnalysis: FormulasServerAnalysis
}

interface FormulasServerAnalysis {
    numberOfGrowthThreadsNeededHome: number;
    growThreadsSecurityIncreaseHome: number;

    numberOfGrowthThreadsNeeded: number;
    growThreadsSecurityIncrease: number;

    oneThreadHackPercent: number;
    hackThreadsForMaxMoney: number;
    hackThreadsForMaxMoneySecurityIncrease: number;

    hackMs: number;
    weakenMs: number;
    growMs: number;
}


type PrecalculatedValues = {
    player: Player;
    weakenAmountPerThread01Core: number;
    weakenAmountPerThreadHomeComputer: number;
}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)) {
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}