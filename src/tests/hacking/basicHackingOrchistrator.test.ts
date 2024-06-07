import { MockServer } from "../MockServer"
import { BasicHackingOrchistratorController, HackingAction } from "../../scripts/hacking/basicHackingOrchistrator"

describe("BasicHackingOrchistratorController", () => {
    describe("when no cumulative record is present", () => {
        let mockServers = createMockServers(10, 16, 1)

        const ramReserveredOnHome = 5
        const pass01: BasicHackingOrchistratorController = new BasicHackingOrchistratorController(mockServers, ramReserveredOnHome)

        const noCumulativeRecordsInputResult: BasicHackingOrchistratorController = JSON.parse(JSON.stringify(pass01))

        it("should select the most valuable hackable target ('mid') when no attack records are implemented", () => {
            expect(noCumulativeRecordsInputResult.cumulativeAttackRecords.victimHostname).toBe("mid")
        })

        it("should set to weaken hacking action", () => {
            expect(noCumulativeRecordsInputResult.cumulativeAttackRecords.action).toBe(HackingAction.Weaken)
        })

        it("should run the weaken script", () => {
            expect(noCumulativeRecordsInputResult.cumulativeAttackRecords.action).toBe("scripts/hacking/weaken.js")
        })

        it("should assign jobs to least servers", () => {
            expect(noCumulativeRecordsInputResult.cumulativeAttackRecords.attackRecords.length).toBe(3)

            const leastValuable = noCumulativeRecordsInputResult.cumulativeAttackRecords.attackRecords[0]
            expect(leastValuable.attackingHostname).toBe("least")
            expect(leastValuable.isRunning).toBeFalsy()
            expect(leastValuable.pid).toBeUndefined()
            expect(leastValuable.commandSent).toBeFalsy()
            expect(leastValuable.timeStarted).toBeUndefined()
            expect(leastValuable.treadCount).toBe(28)
        })

        it("should assign jobs to mid server", () => {
            const mid = noCumulativeRecordsInputResult.cumulativeAttackRecords.attackRecords[1]
            expect(mid.attackingHostname).toBe("mid")
            expect(mid.treadCount).toBe(57)
        })

        it("should assign jobs to home server", () => {
            const home = noCumulativeRecordsInputResult.cumulativeAttackRecords.attackRecords[2]
            expect(home.attackingHostname).toBe("home")
            expect(home.treadCount).toBe(54)
        })

        pass01.cumulativeAttackRecords.attackRecords[0].addPid(12356)
        pass01.cumulativeAttackRecords.attackRecords[1].addPid(546)
        pass01.cumulativeAttackRecords.attackRecords[2].addPid(2138)

        const afterAddingPidResult = makeCopyOfController(pass01)

        it("should do everything proper when adding a pid", () => {
            const leastValuable = afterAddingPidResult.cumulativeAttackRecords.attackRecords[0]

            expect(leastValuable.pid).toBe(12356)
            expect(leastValuable.commandSent).toBeTruthy()
        })

        pass01.cumulativeAttackRecords.attackRecords[0].isRunning = false
        pass01.cumulativeAttackRecords.attackRecords[2].isRunning = false

        const pass02 = new BasicHackingOrchistratorController(mockServers, ramReserveredOnHome, pass01.cumulativeAttackRecords)

        const mostWeakeningsDoneResult = makeCopyOfController(pass02)

        describe("and then all but one job is done next time", () => {
            it("should select the most valuable hackable target ('mid') when no attack records are implemented", () => {
                expect(mostWeakeningsDoneResult.cumulativeAttackRecords.victimHostname).toBe("mid")
            })

            it("should set to weaken hacking action", () => {
                expect(mostWeakeningsDoneResult.cumulativeAttackRecords.action).toBe(HackingAction.Weaken)
            })

            it("should run the weaken script", () => {
                expect(mostWeakeningsDoneResult.cumulativeAttackRecords.action).toBe("scripts/hacking/weaken.js")
            })

            it("should return a result with one object on the attack records and nothing new to fire off", () => {
                expect(mostWeakeningsDoneResult.cumulativeAttackRecords.attackRecords.length).toBe(1)
                expect(mostWeakeningsDoneResult.cumulativeAttackRecords.attackRecords[0].commandSent).toBeTruthy()
            })
        })

        pass02.cumulativeAttackRecords.attackRecords[0].isRunning = false

        const serverCompletelyWeakenedServers = createMockServers(10, 14, 3.74)
        const pass03 = new BasicHackingOrchistratorController(serverCompletelyWeakenedServers, ramReserveredOnHome, pass02.cumulativeAttackRecords)
        const startingToGrowResult = makeCopyOfController(pass03)

        describe("and then the server is weakened enough to grow", () => {
            it("should still be selecting 'mid' as a target",() =>{
                expect(startingToGrowResult.cumulativeAttackRecords.victimHostname).toBe("mid")
            })

            it("should set to grow hacking action", () => {
                expect(startingToGrowResult.cumulativeAttackRecords.action).toBe(HackingAction.Grow)
            })
    
            it("should run the grow script", () => {
                expect(startingToGrowResult.cumulativeAttackRecords.action).toBe("scripts/hacking/grow.js")
            })
    
            it("should assign jobs to least servers", () => {
                expect(startingToGrowResult.cumulativeAttackRecords.attackRecords.length).toBe(3)
    
                const leastValuable = startingToGrowResult.cumulativeAttackRecords.attackRecords[0]
                expect(leastValuable.attackingHostname).toBe("least")
                expect(leastValuable.isRunning).toBeFalsy()
                expect(leastValuable.pid).toBeUndefined()
                expect(leastValuable.commandSent).toBeFalsy()
                expect(leastValuable.timeStarted).toBeUndefined()
                expect(leastValuable.treadCount).toEqual(28)
            })
    
            it("should assign jobs to mid server", () => {
                const mid = startingToGrowResult.cumulativeAttackRecords.attackRecords[1]
                expect(mid.attackingHostname).toBe("mid")
                expect(mid.treadCount).toEqual(57)
            })
    
            it("should assign jobs to home server", () => {
                const home = startingToGrowResult.cumulativeAttackRecords.attackRecords[2]
                expect(home.attackingHostname).toBe("home")
                expect(home.treadCount).toEqual(54)
            })
        })

        pass03.cumulativeAttackRecords.attackRecords[0].isRunning = false
        pass03.cumulativeAttackRecords.attackRecords[1].isRunning = false
        pass03.cumulativeAttackRecords.attackRecords[2].isRunning = false

        const serversReadyToHack = createMockServers(10, 14, 3.76)
        const pass04 = new BasicHackingOrchistratorController(serversReadyToHack, ramReserveredOnHome, pass03.cumulativeAttackRecords)
        const startingToHackResult = makeCopyOfController(pass04)

        describe("and then it is ready to hack", () => {
            it("should still be selecting 'mid' as a target",() =>{
                expect(startingToHackResult.cumulativeAttackRecords.victimHostname).toBe("mid")
            })

            it("should set to hack hacking action", () => {
                expect(startingToHackResult.cumulativeAttackRecords.action).toBe(HackingAction.Hack)
            })
    
            it("should run the hack script", () => {
                expect(startingToHackResult.cumulativeAttackRecords.action).toBe("scripts/hacking/hack.js")
            })
    
            it("should assign jobs to least servers", () => {
                expect(startingToHackResult.cumulativeAttackRecords.attackRecords.length).toBe(3)
    
                const leastValuable = startingToHackResult.cumulativeAttackRecords.attackRecords[0]
                expect(leastValuable.attackingHostname).toBe("least")
                expect(leastValuable.isRunning).toBeFalsy()
                expect(leastValuable.pid).toBeUndefined()
                expect(leastValuable.commandSent).toBeFalsy()
                expect(leastValuable.timeStarted).toBeUndefined()
                expect(leastValuable.treadCount).toEqual(29)
            })
    
            it("should assign jobs to mid server", () => {
                const mid = startingToHackResult.cumulativeAttackRecords.attackRecords[1]
                expect(mid.attackingHostname).toBe("mid")
                expect(mid.treadCount).toEqual(58)
            })
    
            it("should assign jobs to home server", () => {
                const home = startingToHackResult.cumulativeAttackRecords.attackRecords[2]
                expect(home.attackingHostname).toBe("home")
                expect(home.treadCount).toEqual(55)
            })
        })

        pass04.cumulativeAttackRecords.attackRecords[0].isRunning = false
        pass04.cumulativeAttackRecords.attackRecords[1].isRunning = false
        pass04.cumulativeAttackRecords.attackRecords[2].isRunning = false

        const serversReadyToHackAfterHack = createMockServers(10, 14, 3.76)
        const pass05 = new BasicHackingOrchistratorController(serversReadyToHackAfterHack, ramReserveredOnHome, pass04.cumulativeAttackRecords)
        const moreJuiceInSqueeaeResult = makeCopyOfController(pass05)

        describe("and then it finishes a hack but there is still more juice in the squeeze", () =>{ 
            it("should still be selecting 'mid' as a target",() =>{
                expect(moreJuiceInSqueeaeResult.cumulativeAttackRecords.victimHostname).toBe("mid")
            })

            it("should set to hack hacking action", () => {
                expect(moreJuiceInSqueeaeResult.cumulativeAttackRecords.action).toBe(HackingAction.Hack)
            })
    
            it("should run the hack script", () => {
                expect(moreJuiceInSqueeaeResult.cumulativeAttackRecords.action).toBe("scripts/hacking/hack.js")
            })
    
            it("should assign jobs to least servers", () => {
                expect(moreJuiceInSqueeaeResult.cumulativeAttackRecords.attackRecords.length).toBe(3)
    
                const leastValuable = moreJuiceInSqueeaeResult.cumulativeAttackRecords.attackRecords[0]
                expect(leastValuable.attackingHostname).toBe("least")
                expect(leastValuable.isRunning).toBeFalsy()
                expect(leastValuable.pid).toBeUndefined()
                expect(leastValuable.commandSent).toBeFalsy()
                expect(leastValuable.timeStarted).toBeUndefined()
                expect(leastValuable.treadCount).toEqual(29)
            })
    
            it("should assign jobs to mid server", () => {
                const mid = moreJuiceInSqueeaeResult.cumulativeAttackRecords.attackRecords[1]
                expect(mid.attackingHostname).toBe("mid")
                expect(mid.treadCount).toEqual(58)
            })
    
            it("should assign jobs to home server", () => {
                const home = moreJuiceInSqueeaeResult.cumulativeAttackRecords.attackRecords[2]
                expect(home.attackingHostname).toBe("home")
                expect(home.treadCount).toEqual(55)
            })
        })

        pass05.cumulativeAttackRecords.attackRecords[0].isRunning = false
        pass05.cumulativeAttackRecords.attackRecords[1].isRunning = false
        pass05.cumulativeAttackRecords.attackRecords[2].isRunning = false

        const pass05Copy = makeCopyOfController(pass05)
        
        const whenHackingIsDoneAndNoMoreSqueezeBecauseToStrongServers = createMockServers(10, 16, 3.76, true)
        const pass06 = new BasicHackingOrchistratorController(whenHackingIsDoneAndNoMoreSqueezeBecauseToStrongServers, ramReserveredOnHome, pass05.cumulativeAttackRecords)
        const newServerPickBecauseToStrong = makeCopyOfController(pass06)

        describe("and then it finishes a hack and the server is too strong", () =>{ 
            it("should still be selecting 'most' as a target",() =>{
                expect(newServerPickBecauseToStrong.cumulativeAttackRecords.victimHostname).toBe("most")
            })

            it("should set to weaken hacking action", () => {
                expect(newServerPickBecauseToStrong.cumulativeAttackRecords.action).toBe(HackingAction.Weaken)
            })
    
            it("should assign jobs to least servers", () => {
                expect(newServerPickBecauseToStrong.cumulativeAttackRecords.attackRecords.length).toBe(4)
    
                const leastValuable = newServerPickBecauseToStrong.cumulativeAttackRecords.attackRecords[0]
                expect(leastValuable.attackingHostname).toBe("least")
                expect(leastValuable.isRunning).toBeFalsy()
                expect(leastValuable.pid).toBeUndefined()
                expect(leastValuable.commandSent).toBeFalsy()
                expect(leastValuable.timeStarted).toBeUndefined()
                expect(leastValuable.treadCount).toEqual(28)
            })
    
            it("should assign jobs to mid server", () => {
                const mid = newServerPickBecauseToStrong.cumulativeAttackRecords.attackRecords[1]
                expect(mid.attackingHostname).toBe("mid")
                expect(mid.treadCount).toEqual(57)
            })

            it("should assign jobs to most server", () => {
                const most = newServerPickBecauseToStrong.cumulativeAttackRecords.attackRecords[2]
                expect(most.attackingHostname).toBe("most")
                expect(most.treadCount).toEqual(57)
            })
    
            it("should assign jobs to home server", () => {
                const home = newServerPickBecauseToStrong.cumulativeAttackRecords.attackRecords[3]
                expect(home.attackingHostname).toBe("home")
                expect(home.treadCount).toEqual(54)
            })
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
