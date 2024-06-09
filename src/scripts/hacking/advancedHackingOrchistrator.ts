import { NS, Server } from "@ns";

export interface Precalculations {
    weakenAmountPerThread01Core: number;
    weakenAmountPerThreadHomeComputer: number;
    scriptRegistry: ScriptRegistry
}

export interface ScriptRegistry {
    scriptsWithCost: ScriptWithCost[];
}

export interface ScriptWithCost {
    path: string;
    ramCost: number;
}

export interface ServerWithAnalysis extends Server {
    hackMs: number;
    hackThreadsForAllMoney: number;
    hackChance: number;

    growthMs: number;
    numberOfGrowthThreadsNeededToMax: number;
    numberOfGrowthThreadsNeededToMaxHomeComputer: number;

    weakenMs: number;
    freeRam: number;
}

export enum HackingAction {
    Hack = "scripts/hacking/hack.js",
    Weaken = "scripts/hacking/weaken.js",
    Grow = "scripts/hacking/grow.js",
    Idle = "idle"
}

export class AttackRecord {
    constructor(public attackingHostname: string, public treadCount: number) { }

    public isRunning = false
    public commandSent = false

    public pid: number | undefined;

    public addPid(pid: number) {
        this.pid = pid
        this.isRunning = true
        this.commandSent = true
    }
}

export class AttackOnOneServer {
    constructor(public victimHostname: string, public maxMoney: number, public primaryAttack = false) { }

    public timeStartedInMs: number = 0;
    public expectedTimeInMs: number = 0;
    public expectedEndTimeInMs: number = 0;

    public attackRecords: AttackRecord[] = []
    public action = HackingAction.Idle
}

interface ServerWithActionAndEndtime extends ServerWithAnalysis {
    expectedEndTimeInMs: number;
    action: HackingAction;
    timeStartedInMs: number;
    expectedTimeInMs: number;
}



export class AdvancedHackingOrchistratorController {
    private primaryAttack: AttackOnOneServer | undefined;
    private newVictim = false
    private serversWithEndtimesAndActions : ServerWithActionAndEndtime[] = []

    constructor(servers: ServerWithAnalysis[], precalculatedValues: Precalculations, now: Date, public allAttacks: AttackOnOneServer[] = []) {
        this.cleanAttackRecords()
        this.addActionsAndTimingsToServers(servers, now)

        this.setUpPrimaryAttack()

        const attackToWorkOn = this.getAttackToWorkOn()
        
        if (attackToWorkOn) {
            this.setAttackTimes(attackToWorkOn)

            this.setAttackRecords(attackToWorkOn, precalculatedValues, servers)

            if (attackToWorkOn.attackRecords.length === 0 && this.newVictim) {
                this.allAttacks = this.allAttacks.filter(x => x.victimHostname !== attackToWorkOn.victimHostname)
            }
        }

        for (const attack of this.allAttacks) {
            if (attack.attackRecords.length === 0) {
                attack.action = HackingAction.Idle
            }
        }
    }

    private cleanAttackRecords() {
        for (const attackOnOneServer of this.allAttacks) {
            attackOnOneServer.attackRecords = attackOnOneServer.attackRecords.filter(x => x.isRunning)
        }

        this.allAttacks = this.allAttacks.filter(x => !(x.action === HackingAction.Hack && x.attackRecords.length === 0))

        for (const attackOnOneServer of this.allAttacks) {
            if (attackOnOneServer.attackRecords.length === 0) {
                attackOnOneServer.action = HackingAction.Idle
            }
        }
    }

    private addActionsAndTimingsToServers(servers: ServerWithAnalysis[], now: Date) {
        for (const server of servers) {
            const serverWithActionAndEndtime = server as ServerWithActionAndEndtime

            serverWithActionAndEndtime.action = this.selectAction(server)
            serverWithActionAndEndtime.timeStartedInMs = now.valueOf()

            if (serverWithActionAndEndtime.action === HackingAction.Weaken) {
                serverWithActionAndEndtime.expectedTimeInMs = server.weakenMs
            }

            if (serverWithActionAndEndtime.action === HackingAction.Grow) {
                serverWithActionAndEndtime.expectedTimeInMs = server.growthMs
            }

            if (serverWithActionAndEndtime.action === HackingAction.Hack) {
                serverWithActionAndEndtime.expectedTimeInMs = server.hackMs
            }

            serverWithActionAndEndtime.expectedEndTimeInMs = serverWithActionAndEndtime.timeStartedInMs + serverWithActionAndEndtime.expectedTimeInMs

            this.serversWithEndtimesAndActions.push(serverWithActionAndEndtime)
        }
    }

    private setUpPrimaryAttack() {
        this.primaryAttack = this.allAttacks.find(x => x.primaryAttack)

        if (!this.primaryAttack) {
            const newPrimaryVictim = this.selectNewVictim()

            if (newPrimaryVictim) {
                this.primaryAttack = new AttackOnOneServer(newPrimaryVictim.hostname, newPrimaryVictim.moneyMax!, true)
                this.allAttacks.push(this.primaryAttack)
            }
        }
    }

    private getAttackToWorkOn(): AttackOnOneServer | null {
        if (this.primaryAttack!.action === HackingAction.Idle) {
            return this.primaryAttack!
        }

        const idleInQueue = this.allAttacks.filter(x =>
            !x.primaryAttack &&
            x.action === HackingAction.Idle)

        if (idleInQueue.length > 0) {
            for (const potentialAttack of idleInQueue) {
                const server = this.serversWithEndtimesAndActions.find(x => x.hostname === potentialAttack.victimHostname)!
                
                if(server.expectedEndTimeInMs < this.primaryAttack!.expectedEndTimeInMs){
                    return potentialAttack
                }
            }
        } else {
            const newVictim = this.selectNewVictim()

            if (newVictim) {
                const attackToWorkOn = new AttackOnOneServer(newVictim.hostname, newVictim.moneyMax!)
                this.allAttacks.push(attackToWorkOn)
                this.newVictim = true

                return attackToWorkOn
            }
        }

        return null
    }

    private setAttackTimes(attackToWorkOn: AttackOnOneServer) {
        const server = this.serversWithEndtimesAndActions.find(x => x.hostname === attackToWorkOn.victimHostname)!

        attackToWorkOn.timeStartedInMs = server.timeStartedInMs
        attackToWorkOn.expectedTimeInMs = server.expectedTimeInMs
        attackToWorkOn.expectedEndTimeInMs = server.expectedEndTimeInMs
        attackToWorkOn.action = server.action
    }

    private setAttackRecords(attackToWorkOn: AttackOnOneServer, precalculatedValues: Precalculations, servers: ServerWithAnalysis[]) {
        const home = servers.find(x => x.hostname === "home")!

        const serverBeingAttacked = servers.find(x => x.hostname === attackToWorkOn.victimHostname)!
        const ramCostPerThread = precalculatedValues.scriptRegistry.scriptsWithCost.find(x => x.path === attackToWorkOn.action)!.ramCost

        const sortedNonHomePwnedServers = servers
            .filter(x => x.hasAdminRights && x.hostname !== "home")
            .sort((a, b) => b.freeRam! - a.freeRam!)

        const maxThreadsOnHome = Math.floor(home.freeRam / ramCostPerThread)

        if (attackToWorkOn.action === HackingAction.Weaken || attackToWorkOn.action === HackingAction.Grow) {

            const homeThreadsNeeded = attackToWorkOn.action === HackingAction.Weaken
                ? Math.ceil((serverBeingAttacked.hackDifficulty! - serverBeingAttacked.minDifficulty!) / precalculatedValues.weakenAmountPerThreadHomeComputer)
                : serverBeingAttacked.numberOfGrowthThreadsNeededToMaxHomeComputer

            const threadsWithoutHome = attackToWorkOn.action === HackingAction.Weaken
                ? Math.ceil((serverBeingAttacked.hackDifficulty! - serverBeingAttacked.minDifficulty!) / precalculatedValues.weakenAmountPerThread01Core)
                : serverBeingAttacked.numberOfGrowthThreadsNeededToMax

            let threadsAllocatedToHome = homeThreadsNeeded

            if (maxThreadsOnHome <= homeThreadsNeeded) {
                threadsAllocatedToHome = maxThreadsOnHome
            }

            let remainingNonHomeThreadsNeeded = threadsWithoutHome

            if (threadsAllocatedToHome > 0) {
                attackToWorkOn.attackRecords.push(new AttackRecord("home", threadsAllocatedToHome))

                const percentDone = threadsAllocatedToHome / homeThreadsNeeded
                remainingNonHomeThreadsNeeded = Math.ceil(threadsWithoutHome * (1 - percentDone))
            }

            if (remainingNonHomeThreadsNeeded > 0) {
                for (const server of sortedNonHomePwnedServers) {
                    const maxThreadsOnServer = Math.floor(server.freeRam / ramCostPerThread)
                    let threadsToAllocate = remainingNonHomeThreadsNeeded

                    if (maxThreadsOnServer <= threadsToAllocate) {
                        threadsToAllocate = maxThreadsOnServer
                    }

                    if (threadsToAllocate > 0) {
                        attackToWorkOn.attackRecords.push(new AttackRecord(server.hostname, threadsToAllocate))
                        remainingNonHomeThreadsNeeded -= threadsToAllocate
                    }
                }
            }
        } else {
            let threadsNeededForHack = serverBeingAttacked.hackThreadsForAllMoney


            for (const attackingServer of sortedNonHomePwnedServers) {
                const maxThreadsForThisServer = Math.floor(attackingServer.freeRam / ramCostPerThread)

                let threadsToAllocate = threadsNeededForHack

                if (threadsToAllocate > maxThreadsForThisServer) {
                    threadsToAllocate = maxThreadsForThisServer
                }

                if (threadsToAllocate > 0) {
                    attackToWorkOn.attackRecords.push(new AttackRecord(attackingServer.hostname, threadsToAllocate))
                    threadsNeededForHack -= threadsToAllocate
                }
            }

            if (threadsNeededForHack > 0) {
                if (threadsNeededForHack > maxThreadsOnHome) {
                    threadsNeededForHack = maxThreadsOnHome
                }

                attackToWorkOn.attackRecords.push(new AttackRecord("home", threadsNeededForHack))
            }
        }
    }

    private selectAction(serverToAttack: ServerWithAnalysis) {
        if (serverToAttack.hackDifficulty! > serverToAttack.minDifficulty! + 5) {
            return HackingAction.Weaken
        } else if (serverToAttack.moneyAvailable! < serverToAttack.moneyMax! * .75) {
            return HackingAction.Grow
        } else {
            return HackingAction.Hack
        }
    }

    private selectNewVictim(): ServerWithAnalysis | undefined {
        const currentlyWorkedOnServers = this.allAttacks.map(x => x.victimHostname)

        let targetServers =
            this.serversWithEndtimesAndActions
                .filter(x =>
                    x.hasAdminRights &&
                    !x.purchasedByPlayer &&
                    !currentlyWorkedOnServers.includes(x.hostname))
                .sort((a, b) => b.moneyMax! - a.moneyMax!)

        if (this.primaryAttack) {
            targetServers = targetServers
                .filter(x => x.expectedEndTimeInMs < this.primaryAttack!.expectedEndTimeInMs &&
                    x.moneyMax! < this.primaryAttack!.maxMoney)
        }

        const newVictim = targetServers[0]

        if (newVictim) {
            this.newVictim = true
        }

        return newVictim
    }
}


export async function main(ns: NS): Promise<void> {

    const pathToRecords = "data/advancedHackingOrchistratorRecord.txt"

    let serversUnderAttack: AttackOnOneServer[] = []

    if (ns.fileExists(pathToRecords)) {
        serversUnderAttack = JSON.parse(ns.read(pathToRecords)) as AttackOnOneServer[]

        serversUnderAttack.forEach(attackOnOneServer => {
            attackOnOneServer.attackRecords.forEach(attack => {
                if (attack.pid !== undefined) {
                    attack.isRunning = ns.isRunning(attack.pid)
                }
            })
        });
    }

    const servers: ServerWithAnalysis[] = JSON.parse(ns.read("data/environment.txt"))
    const precalculations = JSON.parse(ns.read("data/precalculatedValues.txt")) as Precalculations

    const controller = new AdvancedHackingOrchistratorController(servers, precalculations, new Date(Date.now()), serversUnderAttack)

    for (const attackOnOneServer of controller.allAttacks) {
        for(const actionRecord of attackOnOneServer.attackRecords){
            if (!actionRecord.commandSent) {
                const pid = ns.exec(
                    attackOnOneServer.action,
                    actionRecord.attackingHostname,
                    actionRecord.treadCount,
                    attackOnOneServer.victimHostname)
    
                actionRecord.addPid(pid)
            }
        }
    }

    ns.rm(pathToRecords)
    ns.write(pathToRecords, JSON.stringify(controller.allAttacks))

}