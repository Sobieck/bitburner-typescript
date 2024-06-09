import { MockServer } from "../MockServer"
import { BasicHackingOrchistratorController, HackingAction } from "../../scripts/hacking/basicHackingOrchistrator"

describe("BasicHackingOrchistratorController", () => {
    describe("when no cumulative record is present", () => {
        let mockServers = createMockServers(10, 16, 1)

        const ramReserveredOnHome = 5
        const now = new Date(Date.now())
        
        const pass01: BasicHackingOrchistratorController = new BasicHackingOrchistratorController(mockServers, ramReserveredOnHome)

        const noCumulativeRecordsInputResult: BasicHackingOrchistratorController = makeCopyOfController(pass01)

        it("should select the most valuable hackable target ('mid') when no attack records are implemented", () => {
            expect(noCumulativeRecordsInputResult.cumulativeAttackRecords.victimHostname).toBe("mid")
        })
    })
})

function makeCopyOfController(controller: BasicHackingOrchistratorController) {
    const newController: BasicHackingOrchistratorController = JSON.parse(JSON.stringify(controller))
    return newController
}

function createMockServers(minDifficulty: number, hackDifficulty: number, moneyAvailable: number, mostHasAdmin = false) {
    const mockServers = []

    const leastValuableServer = new MockServer("least")
    leastValuableServer.moneyMax = 1
    leastValuableServer.hasAdminRights = true
    leastValuableServer.maxRam = 50
    mockServers.push(leastValuableServer)

    const secondMostValuableServer = new MockServer("mid")
    secondMostValuableServer.moneyMax = 5
    secondMostValuableServer.hasAdminRights = true
    secondMostValuableServer.maxRam = 100
    // make params
    secondMostValuableServer.minDifficulty = minDifficulty
    secondMostValuableServer.hackDifficulty = hackDifficulty
    secondMostValuableServer.moneyAvailable = moneyAvailable
    mockServers.push(secondMostValuableServer)

    const mostValuableServer = new MockServer("most")
    mostValuableServer.moneyMax = 10
    mostValuableServer.hasAdminRights = mostHasAdmin
    mostValuableServer.minDifficulty = 10
    mostValuableServer.hackDifficulty = 20
    mostValuableServer.moneyAvailable = 1
    mostValuableServer.maxRam = 100
    mockServers.push(mostValuableServer)

    const home = new MockServer("home")
    home.purchasedByPlayer = true
    home.hasAdminRights = true
    home.moneyMax = 10000000000
    home.maxRam = 100
    mockServers.push(home)

    const smallServer = new MockServer("noMemory")
    smallServer.moneyMax = 1
    smallServer.hasAdminRights = true
    smallServer.maxRam = 1
    mockServers.push(smallServer)


    return mockServers
}
