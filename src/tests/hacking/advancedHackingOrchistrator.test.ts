import { AdvancedHackingOrchistratorController, AttackOnOneServer, AttackRecord, HackingAction, Precalculations, ServerWithAnalysis } from "../../scripts/hacking/advancedHackingOrchistrator"

export class MockServer implements ServerWithAnalysis {
    constructor(public hostname: string) { }
    hackMs: number = 0
    hackThreadsForAllMoney: number = 0
    hackChance: number = 0
    growthMs: number = 0
    numberOfGrowthThreadsNeededToMax: number = 0
    numberOfGrowthThreadsNeededToMaxHomeComputer: number = 0;
    weakenMs: number = 0
    freeRam: number = 0
    ip: string = "";
    sshPortOpen: boolean = false;
    ftpPortOpen: boolean = false;
    smtpPortOpen: boolean = true;
    httpPortOpen: boolean = false;
    sqlPortOpen: boolean = false;
    hasAdminRights: boolean = false;
    cpuCores: number = 123;
    isConnectedTo: boolean = true;
    ramUsed: number = 12;
    maxRam: number = 25;
    organizationName: string = "asdf";
    purchasedByPlayer: boolean = false;
    backdoorInstalled?: boolean | undefined;
    baseDifficulty?: number | undefined;
    hackDifficulty?: number | undefined;
    minDifficulty?: number | undefined;
    moneyAvailable?: number | undefined;
    moneyMax?: number | undefined;
    numOpenPortsRequired?: number | undefined;
    openPortCount?: number | undefined;
    requiredHackingSkill?: number | undefined;
    serverGrowth?: number | undefined;
}

describe("AdvancedHackingOrchistratorController", () => {
    const precalculations: Precalculations = {
        weakenAmountPerThread01Core: 0.5,
        weakenAmountPerThreadHomeComputer: 1,
        scriptRegistry: {
            scriptsWithCost: [
                { path: "scripts/hacking/hack.js", ramCost: 1 },
                { path: "scripts/hacking/weaken.js", ramCost: 2 },
                { path: "scripts/hacking/grow.js", ramCost: 4 }
            ]
        }
    }

    const now001 = new Date(Date.now())

    describe("when no cumulative record is present", () => {
        const mockServersPass001 = createMockServers()

        const pass001 = new AdvancedHackingOrchistratorController(mockServersPass001, precalculations, now001)

        const noPreviousAllAttacksFileResult = makeCopyOfController(pass001)

        describe("after the first pass", () => {
            it("should only be attacking one thing at this point", () => {
                expect(noPreviousAllAttacksFileResult.allAttacks.length).toBe(1)
            })

            it("should target 'earliest'", () => {
                expect(noPreviousAllAttacksFileResult.allAttacks[0].victimHostname).toBe("earliest")
            })

            it("should be the primary attack", () => {
                expect(noPreviousAllAttacksFileResult.allAttacks[0].primaryAttack).toBeTruthy()
            })

            it("should be a weaken attack", () => {
                expect(noPreviousAllAttacksFileResult.allAttacks[0].action).toBe("scripts/hacking/weaken.js")
            })

            it("should have the propery max money", () => {
                expect(noPreviousAllAttacksFileResult.allAttacks[0].maxMoney).toBe(10)
            })

            it("should have the correct start time", () => {
                expect(noPreviousAllAttacksFileResult.allAttacks[0].timeStartedInMs).toBe(now001.valueOf())
            })

            it("should have the proper end time", () => {
                expect(noPreviousAllAttacksFileResult.allAttacks[0].expectedEndTimeInMs).toBe(now001.valueOf() + 1000)
            })

            it("should use home only to weaken the server to the minimum", () => {
                const attackRecords = noPreviousAllAttacksFileResult.allAttacks[0].attackRecords

                expect(attackRecords.length).toBe(1)

                expect(attackRecords[0].attackingHostname).toBe("home")
                expect(attackRecords[0].commandSent).toBeFalsy()
                expect(attackRecords[0].isRunning).toBeFalsy()
                expect(attackRecords[0].pid).toBeUndefined()
                expect(attackRecords[0].treadCount).toBe(6)
            })
        })

        pass001.allAttacks[0].attackRecords[0].addPid(102)

        const firstSetOfPid = makeCopyOfController(pass001)

        describe("everything related to time and pids should be up to date", () => {
            it("should set all the properties correctly", () => {
                const updatedAttackRecord = firstSetOfPid.allAttacks[0].attackRecords[0]
                expect(updatedAttackRecord.pid).toBe(102)
                expect(updatedAttackRecord.commandSent).toBeTruthy()
                expect(updatedAttackRecord.isRunning).toBeTruthy()
            })
        })

        const now002 = addMs(now001, 100)
        const mockServersPass002 = createMockServers()
        const pass002 = new AdvancedHackingOrchistratorController(mockServersPass002, precalculations, now002, pass001.allAttacks)

        const secondPassShouldAddLessValuableServerResult = makeCopyOfController(pass002)

        describe("after the second pass", () => {
            it("should be attacking two thing at this point", () => {
                expect(secondPassShouldAddLessValuableServerResult.allAttacks.length).toBe(2)
            })

            it("should target 'earliestLessMoney'", () => {
                expect(secondPassShouldAddLessValuableServerResult.allAttacks[1].victimHostname).toBe("earliestLessMoney")
            })

            it("should be the not be the primary attack", () => {
                expect(secondPassShouldAddLessValuableServerResult.allAttacks[1].primaryAttack).toBeFalsy()
            })

            it("should be a weaken attack", () => {
                expect(secondPassShouldAddLessValuableServerResult.allAttacks[1].action).toBe("scripts/hacking/weaken.js")
            })

            it("should have the correct start time", () => {
                expect(secondPassShouldAddLessValuableServerResult.allAttacks[1].timeStartedInMs).toBe(now002.valueOf())
            })

            it("should have the proper end time", () => {
                expect(secondPassShouldAddLessValuableServerResult.allAttacks[1].expectedEndTimeInMs).toBe(now002.valueOf() + 899)
            })

            it("should have the propery max money", () => {
                expect(secondPassShouldAddLessValuableServerResult.allAttacks[1].maxMoney).toBe(8)
            })

            it("should confirm that nothing in the primary attack has been changed", () => {
                const updatedAttackRecord = secondPassShouldAddLessValuableServerResult.allAttacks[0].attackRecords[0]
                expect(updatedAttackRecord.pid).toBe(102)
                expect(updatedAttackRecord.commandSent).toBeTruthy()
                expect(updatedAttackRecord.isRunning).toBeTruthy()

                const attackRecords = secondPassShouldAddLessValuableServerResult.allAttacks[0].attackRecords

                expect(attackRecords.length).toBe(1)

                expect(attackRecords[0].attackingHostname).toBe("home")
                expect(attackRecords[0].commandSent).toBeTruthy()
                expect(attackRecords[0].isRunning).toBeTruthy()
                expect(attackRecords[0].pid).toBe(102)
                expect(attackRecords[0].treadCount).toBe(6)
            })

            it("should use weaken the server", () => {

                const attackRecords = secondPassShouldAddLessValuableServerResult.allAttacks[1].attackRecords


                expect(attackRecords[0].attackingHostname).toBe("home")
                expect(attackRecords[0].commandSent).toBeFalsy()
                expect(attackRecords[0].isRunning).toBeFalsy()
                expect(attackRecords[0].pid).toBeUndefined()
                expect(attackRecords[0].treadCount).toBe(10)

                expect(attackRecords[1].attackingHostname).toBe("earliestLessMoney")
                expect(attackRecords[1].commandSent).toBeFalsy()
                expect(attackRecords[1].isRunning).toBeFalsy()
                expect(attackRecords[1].pid).toBeUndefined()
                expect(attackRecords[1].treadCount).toBe(40)

                expect(attackRecords[2].attackingHostname).toBe("earliest")
                expect(attackRecords[2].commandSent).toBeFalsy()
                expect(attackRecords[2].isRunning).toBeFalsy()
                expect(attackRecords[2].pid).toBeUndefined()
                expect(attackRecords[2].treadCount).toBe(3)

                expect(attackRecords.length).toBe(3)
            })
        })

        pass002.allAttacks[1].attackRecords[0].addPid(0)
        pass002.allAttacks[1].attackRecords[1].addPid(1)
        pass002.allAttacks[1].attackRecords[2].addPid(2)

        const secondSetOfPids = makeCopyOfController(pass002)

        describe("everything related to time and pids should be up to date", () => {
            it("should set all the properties correctly", () => {
                const attackRecord0 = secondSetOfPids.allAttacks[1].attackRecords[0]
                expect(attackRecord0.pid).toBe(0)
                expect(attackRecord0.commandSent).toBeTruthy()
                expect(attackRecord0.isRunning).toBeTruthy()

                const attackRecord1 = secondSetOfPids.allAttacks[1].attackRecords[1]
                expect(attackRecord1.pid).toBe(1)
                expect(attackRecord1.commandSent).toBeTruthy()
                expect(attackRecord1.isRunning).toBeTruthy()

                const attackRecord2 = secondSetOfPids.allAttacks[1].attackRecords[2]
                expect(attackRecord2.pid).toBe(2)
                expect(attackRecord2.commandSent).toBeTruthy()
                expect(attackRecord2.isRunning).toBeTruthy()
            })
        })

        const now003 = addMs(now002, 10)
        const mockServersPass003 = createMockServers(true)

        pass002.allAttacks[1].attackRecords[0].isRunning = false
        pass002.allAttacks[1].attackRecords[2].isRunning = false

        const pass003 = new AdvancedHackingOrchistratorController(mockServersPass003, precalculations, now003, pass002.allAttacks)

        const thirdPassShouldRemoveDoneRecordsResult = makeCopyOfController(pass003)

        describe("after third pass", () => {
            it("should still have two attacks", () => {
                expect(thirdPassShouldRemoveDoneRecordsResult.allAttacks.length).toBe(2)
            })

            it("should not touch attack records on primary", () => {
                const updatedAttackRecord = thirdPassShouldRemoveDoneRecordsResult.allAttacks[0].attackRecords[0]
                expect(updatedAttackRecord.pid).toBe(102)
                expect(updatedAttackRecord.commandSent).toBeTruthy()
                expect(updatedAttackRecord.isRunning).toBeTruthy()
            })

            it("should remove done pids", () => {
                expect(thirdPassShouldRemoveDoneRecordsResult.allAttacks[1].attackRecords.length).toBe(1)

                const attackRecord1 = thirdPassShouldRemoveDoneRecordsResult.allAttacks[1].attackRecords[0]
                expect(attackRecord1.pid).toBe(1)
                expect(attackRecord1.commandSent).toBeTruthy()
                expect(attackRecord1.isRunning).toBeTruthy()
            })
        })

        pass003.allAttacks[1].attackRecords[0].isRunning = false
        pass003.allAttacks[0].attackRecords[0].isRunning = false

        pass003.allAttacks.reverse()

        const mockServersPass004 = createMockServers(true, "grow")

        const now004 = addMs(now003, 4000)

        const pass004 = new AdvancedHackingOrchistratorController(mockServersPass004, precalculations, now004, pass003.allAttacks)

        const shouldOnlyWorkOnPrimary = makeCopyOfController(pass004)

        describe("after the forth pass", () => {

            it("should be attacking two thing at this point", () => {
                expect(shouldOnlyWorkOnPrimary.allAttacks.length).toBe(2)
            })

            it("should have primary create new attacks", () => {
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].primaryAttack).toBeTruthy()
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].action).toBe("scripts/hacking/grow.js")
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].expectedEndTimeInMs).toBe(now004.valueOf() + 10000)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].expectedTimeInMs).toBe(10000)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].maxMoney).toBe(10)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].timeStartedInMs).toBe(now004.valueOf())
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].victimHostname).toBe("earliest")

                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords.length).toBe(5)



                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[0].attackingHostname).toBe("home")
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[0].treadCount).toBe(5)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[0].commandSent).toBeFalsy()


                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[1].attackingHostname).toBe("muchMoney")
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[1].treadCount).toBe(25)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[1].commandSent).toBeFalsy()


                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[2].attackingHostname).toBe("earliestLessMoney")
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[2].treadCount).toBe(20)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[2].commandSent).toBeFalsy()


                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[3].attackingHostname).toBe("earliest")
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[3].treadCount).toBe(10)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[3].commandSent).toBeFalsy()


                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[4].attackingHostname).toBe("earliestLessMoneyToLong")
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[4].treadCount).toBe(1)
                expect(shouldOnlyWorkOnPrimary.allAttacks[1].attackRecords[4].commandSent).toBeFalsy()
            })


            it("should target 'earliestLessMoney'", () => {
                expect(shouldOnlyWorkOnPrimary.allAttacks[0].victimHostname).toBe("earliestLessMoney")
            })

            it("should be the not be the primary attack", () => {
                expect(shouldOnlyWorkOnPrimary.allAttacks[0].primaryAttack).toBeFalsy()
            })

            it("should be a idle attack", () => {
                expect(shouldOnlyWorkOnPrimary.allAttacks[0].action).toBe("idle")
            })

            it("should have the propery max money", () => {
                expect(shouldOnlyWorkOnPrimary.allAttacks[0].maxMoney).toBe(8)
            })

            it("should have no attack records on non primary the server", () => {
                expect(shouldOnlyWorkOnPrimary.allAttacks[0].attackRecords.length).toBe(0)
            })

        })

        pass004.allAttacks[1].attackRecords[0].addPid(0)
        pass004.allAttacks[1].attackRecords[1].addPid(1)
        pass004.allAttacks[1].attackRecords[2].addPid(2)
        pass004.allAttacks[1].attackRecords[3].addPid(2)
        pass004.allAttacks[1].attackRecords[4].addPid(2)


        pass004.allAttacks[0].action = HackingAction.Grow

        const mockServersPass005 = createMockServers(true, "grow", "no memory")
        const now005 = addMs(now004, 1)
        const pass005 = new AdvancedHackingOrchistratorController(mockServersPass005, precalculations, now005, pass004.allAttacks)
        const noMemoryResult = makeCopyOfController(pass005)


        describe("after the 5th pass", () => {

            it("should be attacking two thing at this point", () => {
                expect(noMemoryResult.allAttacks.length).toBe(2)
            })

            it("should have primary with attacks", () => {
                expect(noMemoryResult.allAttacks[1].primaryAttack).toBeTruthy()
                expect(noMemoryResult.allAttacks[1].action).toBe("scripts/hacking/grow.js")
                expect(noMemoryResult.allAttacks[1].expectedEndTimeInMs).toBe(now004.valueOf() + 10000)
                expect(noMemoryResult.allAttacks[1].expectedTimeInMs).toBe(10000)
                expect(noMemoryResult.allAttacks[1].maxMoney).toBe(10)
                expect(noMemoryResult.allAttacks[1].timeStartedInMs).toBe(now004.valueOf())
                expect(noMemoryResult.allAttacks[1].victimHostname).toBe("earliest")

                expect(noMemoryResult.allAttacks[1].attackRecords.length).toBe(5)


                expect(noMemoryResult.allAttacks[1].attackRecords[0].attackingHostname).toBe("home")
                expect(noMemoryResult.allAttacks[1].attackRecords[0].treadCount).toBe(5)

                expect(noMemoryResult.allAttacks[1].attackRecords[1].attackingHostname).toBe("muchMoney")
                expect(noMemoryResult.allAttacks[1].attackRecords[1].treadCount).toBe(25)


                expect(noMemoryResult.allAttacks[1].attackRecords[2].attackingHostname).toBe("earliestLessMoney")
                expect(noMemoryResult.allAttacks[1].attackRecords[2].treadCount).toBe(20)


                expect(noMemoryResult.allAttacks[1].attackRecords[3].attackingHostname).toBe("earliest")
                expect(noMemoryResult.allAttacks[1].attackRecords[3].treadCount).toBe(10)


                expect(noMemoryResult.allAttacks[1].attackRecords[4].attackingHostname).toBe("earliestLessMoneyToLong")
                expect(noMemoryResult.allAttacks[1].attackRecords[4].treadCount).toBe(1)
            })


            it("should target 'earliestLessMoney'", () => {
                expect(noMemoryResult.allAttacks[0].victimHostname).toBe("earliestLessMoney")
            })

            it("should be the not be the primary attack", () => {
                expect(noMemoryResult.allAttacks[0].primaryAttack).toBeFalsy()
            })

            it("should be a idle attack", () => {
                expect(noMemoryResult.allAttacks[0].action).toBe("idle")
            })

            it("should have the propery max money", () => {
                expect(noMemoryResult.allAttacks[0].maxMoney).toBe(8)
            })

            it("should have no attack records on non primary the server", () => {
                expect(noMemoryResult.allAttacks[0].attackRecords.length).toBe(0)
            })
        })

        const mockServersPass006 = createMockServers(true, "grow", "plenty of memory")
        const now006 = addMs(now005, 1)
        const pass006 = new AdvancedHackingOrchistratorController(mockServersPass006, precalculations, now006, pass005.allAttacks)
        const secondaryToGrowResult = makeCopyOfController(pass006)

        describe("after the 6th pass", () => {

            it("should be attacking two thing at this point", () => {
                expect(secondaryToGrowResult.allAttacks.length).toBe(2)
            })

            it("should have primary with attacks", () => {
                expect(secondaryToGrowResult.allAttacks[1].primaryAttack).toBeTruthy()
                expect(secondaryToGrowResult.allAttacks[1].action).toBe("scripts/hacking/grow.js")
                expect(secondaryToGrowResult.allAttacks[1].expectedEndTimeInMs).toBe(now004.valueOf() + 10000)
                expect(secondaryToGrowResult.allAttacks[1].expectedTimeInMs).toBe(10000)
                expect(secondaryToGrowResult.allAttacks[1].maxMoney).toBe(10)
                expect(secondaryToGrowResult.allAttacks[1].timeStartedInMs).toBe(now004.valueOf())
                expect(secondaryToGrowResult.allAttacks[1].victimHostname).toBe("earliest")

                expect(secondaryToGrowResult.allAttacks[1].attackRecords.length).toBe(5)


                expect(secondaryToGrowResult.allAttacks[1].attackRecords[0].attackingHostname).toBe("home")
                expect(secondaryToGrowResult.allAttacks[1].attackRecords[0].treadCount).toBe(5)

                expect(secondaryToGrowResult.allAttacks[1].attackRecords[1].attackingHostname).toBe("muchMoney")
                expect(secondaryToGrowResult.allAttacks[1].attackRecords[1].treadCount).toBe(25)


                expect(secondaryToGrowResult.allAttacks[1].attackRecords[2].attackingHostname).toBe("earliestLessMoney")
                expect(secondaryToGrowResult.allAttacks[1].attackRecords[2].treadCount).toBe(20)


                expect(secondaryToGrowResult.allAttacks[1].attackRecords[3].attackingHostname).toBe("earliest")
                expect(secondaryToGrowResult.allAttacks[1].attackRecords[3].treadCount).toBe(10)


                expect(secondaryToGrowResult.allAttacks[1].attackRecords[4].attackingHostname).toBe("earliestLessMoneyToLong")
                expect(secondaryToGrowResult.allAttacks[1].attackRecords[4].treadCount).toBe(1)
            })


            it("should target 'earliestLessMoney'", () => {
                expect(secondaryToGrowResult.allAttacks[0].victimHostname).toBe("earliestLessMoney")
            })

            it("should be the not be the primary attack", () => {
                expect(secondaryToGrowResult.allAttacks[0].primaryAttack).toBeFalsy()
            })

            it("should be a grow attack", () => {
                expect(secondaryToGrowResult.allAttacks[0].action).toBe("scripts/hacking/grow.js")
            })

            it("should have the propery max money", () => {
                expect(secondaryToGrowResult.allAttacks[0].maxMoney).toBe(8)
            })

            it("should have attack records on non primary server", () => {
                expect(secondaryToGrowResult.allAttacks[0].attackRecords.length).toBe(1)
                expect(secondaryToGrowResult.allAttacks[0].attackRecords[0].attackingHostname).toBe("home")
                expect(secondaryToGrowResult.allAttacks[0].attackRecords[0].treadCount).toBe(2)
            })
        })

        pass006.allAttacks[0].attackRecords[0].isRunning = false

        // secondry stall due to time constraints, pick up new attack, while filtering out a server that is now available (but it has more money than the primary. Never attack something with more money than the primary)
        const mockServersPass007 = createMockServers(true, "grow", "plenty of memory")

        const now007 = addMs(now006, 9900)
        const pass007 = new AdvancedHackingOrchistratorController(mockServersPass007, precalculations, now007, pass006.allAttacks)
        const secondaryShouldBeNotDoingAnythingResult = makeCopyOfController(pass007)

        describe("after the 7th pass", () => {

            it("should be attacking two thing at this point", () => {
                expect(secondaryShouldBeNotDoingAnythingResult.allAttacks.length).toBe(2)
            })

            it("should be secondary idle", () => {
                expect(secondaryShouldBeNotDoingAnythingResult.allAttacks[0].action).toBe("idle")
            })

            it("should have no attacks on secondary server", () => {
                expect(secondaryShouldBeNotDoingAnythingResult.allAttacks[0].attackRecords.length).toBe(0)
            })
        })

        for (const attackRecord of pass007.allAttacks[1].attackRecords) {
            attackRecord.isRunning = false
        }

        const mockServersPass008 = createMockServers(true, "grow", "plenty of memory", "done growing earliest")

        const now008 = addMs(now007, 2000)
        const pass008 = new AdvancedHackingOrchistratorController(mockServersPass008, precalculations, now008, pass007.allAttacks)
        const shouldStartHackingPrimary = makeCopyOfController(pass008)


        describe("after the 8th pass", () => {

            it("should be attacking two thing at this point", () => {
                expect(shouldStartHackingPrimary.allAttacks.length).toBe(2)
            })

            it("should be secondary idle", () => {
                expect(shouldStartHackingPrimary.allAttacks[0].action).toBe("idle")
            })

            it("should have no attacks on secondary server", () => {
                expect(shouldStartHackingPrimary.allAttacks[0].attackRecords.length).toBe(0)
            })

            it("should be hacking on the primary server", () => {
                const hackPrimary = shouldStartHackingPrimary.allAttacks[1]
                expect(hackPrimary.action).toBe("scripts/hacking/hack.js")

                expect(hackPrimary.primaryAttack).toBeTruthy()
                expect(hackPrimary.expectedEndTimeInMs).toBe(now008.valueOf() + 100)
                expect(hackPrimary.expectedTimeInMs).toBe(100)
                expect(hackPrimary.maxMoney).toBe(10)
                expect(hackPrimary.timeStartedInMs).toBe(now008.valueOf())
                expect(hackPrimary.victimHostname).toBe("earliest")
            })

            it("should have all the hacks correct", () => {
                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[0].attackingHostname).toBe("muchMoney")
                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[0].treadCount).toBe(100)


                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[1].attackingHostname).toBe("earliestLessMoney")
                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[1].treadCount).toBe(80)


                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[2].attackingHostname).toBe("earliest")
                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[2].treadCount).toBe(40)


                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[3].attackingHostname).toBe("earliestLessMoneyToLong")
                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[3].treadCount).toBe(20)

                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[4].attackingHostname).toBe("home")
                expect(shouldStartHackingPrimary.allAttacks[1].attackRecords[4].treadCount).toBe(2)
            })
        })

        for (const attackRecord of pass008.allAttacks[1].attackRecords) {
            attackRecord.isRunning = false
        }

        const mockServersPass009 = createMockServers(true, "grow", "plenty of memory", "done growing earliest")

        const now009 = addMs(now008, 2000)
        const pass009 = new AdvancedHackingOrchistratorController(mockServersPass009, precalculations, now009, pass008.allAttacks)
        const shouldPickNewPrimaryResult = makeCopyOfController(pass009)

        describe("after the 9th pass", () => {

            it("should be attacking two thing at this point", () => {
                expect(shouldPickNewPrimaryResult.allAttacks.length).toBe(2)
            })

            it("should be secondary idle", () => {
                expect(shouldPickNewPrimaryResult.allAttacks[0].action).toBe("idle")
            })

            it("should have no attacks on secondary server", () => {
                expect(shouldPickNewPrimaryResult.allAttacks[0].attackRecords.length).toBe(0)
            })

            it("should be hacking on the primary server", () => {
                const hackPrimary = shouldPickNewPrimaryResult.allAttacks[1]
                expect(hackPrimary.action).toBe("scripts/hacking/weaken.js")

                expect(hackPrimary.primaryAttack).toBeTruthy()
                expect(hackPrimary.expectedEndTimeInMs).toBe(now009.valueOf() + 800)
                expect(hackPrimary.expectedTimeInMs).toBe(800)
                expect(hackPrimary.maxMoney).toBe(90000)
                expect(hackPrimary.timeStartedInMs).toBe(now009.valueOf())
                expect(hackPrimary.victimHostname).toBe("muchMoney")
            })

            it("should have all the hacks correct", () => {
                const attackRecords = shouldPickNewPrimaryResult.allAttacks[1].attackRecords

                expect(attackRecords.length).toBe(1)

                expect(attackRecords[0].attackingHostname).toBe("home")
                expect(attackRecords[0].commandSent).toBeFalsy()
                expect(attackRecords[0].isRunning).toBeFalsy()
                expect(attackRecords[0].pid).toBeUndefined()
                expect(attackRecords[0].treadCount).toBe(6)
            })
        })
    })

    describe("testing logic on when to allow a new attack", () => {
        let inputServers: ServerWithAnalysis[] = []
        let inputAttacks: AttackOnOneServer[] = []

        beforeEach(() => {
            const primaryAttack = new AttackOnOneServer("primary", 100, true)
            primaryAttack.expectedEndTimeInMs = now001.valueOf() + 2
            primaryAttack.action = HackingAction.Hack
            primaryAttack.maxMoney = 12000

            const attackRecord = new AttackRecord("secondary", 2)
            attackRecord.addPid(1)
            primaryAttack.attackRecords.push(attackRecord)

            inputAttacks = [primaryAttack]

            const primaryServer = new MockServer("primary")
            primaryServer.freeRam = 10000
            primaryServer.hasAdminRights = true
            primaryServer.moneyMax = 12000

            const secondaryServer = new MockServer("secondary")

            secondaryServer.hasAdminRights = true
            secondaryServer.hackMs = 3
            secondaryServer.weakenMs = 3
            secondaryServer.growthMs = 3
            secondaryServer.freeRam = 10000
            secondaryServer.minDifficulty = 10
            secondaryServer.moneyMax = 1000
            secondaryServer.moneyAvailable = 0
            secondaryServer.numberOfGrowthThreadsNeededToMax = 10
            secondaryServer.numberOfGrowthThreadsNeededToMaxHomeComputer = 20
            secondaryServer.hackThreadsForAllMoney = 100

            const homeServer = new MockServer("home")
            homeServer.freeRam = 0

            inputServers = [primaryServer, secondaryServer, homeServer]
        })


        describe("when to allow item in queue to start working", () => {
            beforeEach(() => {
                const secondaryAttack = new AttackOnOneServer("secondary", 1000)
                inputAttacks.push(secondaryAttack)
            })

            describe('when to weaken', () => {
                beforeEach(() => {
                    inputServers[1].hackDifficulty = 16
                })

                it('should not change anything because everything would finish after primary', () => {

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(0)
                    expect(result.allAttacks[1].action).toBe("idle")
                });

                it('should start a weakening round', () => {
                    inputServers[1].weakenMs = 1

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(1)
                    expect(result.allAttacks[1].action).toBe(HackingAction.Weaken)
                });
            });

            describe('when to grow', () => {
                beforeEach(() => {
                    inputServers[1].hackDifficulty = 10
                })

                it('should not change anything because everything would finish after primary', () => {

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(0)
                    expect(result.allAttacks[1].action).toBe("idle")
                });

                it('should start a growing round', () => {
                    inputServers[1].growthMs = 1

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(1)
                    expect(result.allAttacks[1].action).toBe(HackingAction.Grow)
                });
            });

            describe('when to hack', () => {
                beforeEach(() => {
                    inputServers[1].hackDifficulty = 10
                    inputServers[1].moneyAvailable = 999
                })

                it('should not change anything because everything would finish after primary', () => {

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(0)
                    expect(result.allAttacks[1].action).toBe("idle")
                });

                it('should start a hacking round', () => {
                    inputServers[1].hackMs = 1

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(1)
                    expect(result.allAttacks[1].action).toBe(HackingAction.Hack)
                });
            });
        })

        describe('when to allow a new target to be added', () => {
            describe('when to weaken', () => {
                beforeEach(() => {
                    inputServers[1].hackDifficulty = 16
                })

                it('should not change anything because everything would finish after primary', () => {

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(1)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()
                });

                it('should start a weakening round', () => {
                    inputServers[1].weakenMs = 1

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(1)
                    expect(result.allAttacks[1].action).toBe(HackingAction.Weaken)
                });
            });

            describe('when to grow', () => {
                beforeEach(() => {
                    inputServers[1].hackDifficulty = 10
                })

                it('should not change anything because everything would finish after primary', () => {

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(1)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()
                });

                it('should start a growing round', () => {
                    inputServers[1].growthMs = 1

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(1)
                    expect(result.allAttacks[1].action).toBe(HackingAction.Grow)
                });
            });

            describe('when to hack', () => {
                beforeEach(() => {
                    inputServers[1].hackDifficulty = 10
                    inputServers[1].moneyAvailable = 999
                })

                it('should not change anything because everything would finish after primary', () => {

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(1)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy() // 1718214771699 1718214771700
                });

                it('should start a hacking round', () => {
                    inputServers[1].hackMs = 1

                    const controller = new AdvancedHackingOrchistratorController(inputServers, precalculations, now001, inputAttacks)

                    const result = makeCopyOfController(controller)

                    expect(result.allAttacks.length).toBe(2)
                    expect(result.allAttacks[0].primaryAttack).toBeTruthy()

                    expect(result.allAttacks[1].attackRecords.length).toBe(1)
                    expect(result.allAttacks[1].action).toBe(HackingAction.Hack)
                });
            });
        });
    })
})

function makeCopyOfController(controller: AdvancedHackingOrchistratorController) {
    return JSON.parse(JSON.stringify(controller)) as AdvancedHackingOrchistratorController
}

function createMockServers(muchMoneyAdminRIghts = false, phase = "weaken", noMemory = "memory", growing = "none") {
    const mockServers = []

    const server001 = new MockServer("earliest")
    server001.hasAdminRights = true
    server001.baseDifficulty = 10
    server001.minDifficulty = 10
    server001.weakenMs = 1000

    server001.moneyMax = 10
    server001.moneyAvailable = 1

    server001.freeRam = 40

    if (phase === "weaken") {
        server001.hackDifficulty = 16
    }

    if (phase === "grow") {
        server001.hackDifficulty = 14

        server001.growthMs = 10000
        server001.numberOfGrowthThreadsNeededToMax = 111
        server001.numberOfGrowthThreadsNeededToMaxHomeComputer = 10
    }

    if (growing === "done growing earliest") {
        server001.hackMs = 100
        server001.hackThreadsForAllMoney = 242 // change
        server001.moneyAvailable = 7.8
        server001.hackDifficulty = 11
    }

    mockServers.push(server001)

    const server002 = new MockServer("earliestLessMoney")
    server002.hasAdminRights = true
    server002.baseDifficulty = 10
    server002.minDifficulty = 10
    server002.hackDifficulty = 10 + 10 + 20 + 1 // home + all of earliestLessMoney + some of earliest
    server002.weakenMs = 899

    server002.moneyMax = 8
    server002.moneyAvailable = 4

    server002.freeRam = 80
    server002.numberOfGrowthThreadsNeededToMaxHomeComputer = 10
    server002.numberOfGrowthThreadsNeededToMax = 20

    if (phase === "grow") {
        server002.hackDifficulty = 14

        server002.growthMs = 100
        server002.numberOfGrowthThreadsNeededToMax = 1000
        server002.numberOfGrowthThreadsNeededToMaxHomeComputer = 2
    }

    mockServers.push(server002)

    const home = new MockServer("home")
    home.hasAdminRights = true
    home.purchasedByPlayer = true
    home.freeRam = 20
    mockServers.push(home)


    // never used because too long and not enough money
    const server003 = new MockServer("earliestLessMoneyToLong")
    server003.hasAdminRights = true
    server003.baseDifficulty = 10
    server003.minDifficulty = 10
    server003.hackDifficulty = 20
    server003.weakenMs = 89900

    server003.moneyMax = 9

    server003.freeRam = 20

    mockServers.push(server003)

    const server004 = new MockServer("muchMoney")
    server004.hasAdminRights = muchMoneyAdminRIghts
    server004.baseDifficulty = 10
    server004.minDifficulty = 11
    server004.hackDifficulty = 17
    server004.weakenMs = 800

    server004.moneyMax = 90000

    server004.freeRam = 100

    mockServers.push(server004)

    const server005 = new MockServer("least money")
    server005.hasAdminRights = true
    server005.baseDifficulty = 10
    server005.minDifficulty = 10
    server005.hackDifficulty = 10 + 10 + 20 + 1 // home + all of earliestLessMoney + some of earliest
    server005.weakenMs = 899

    server005.moneyMax = 5

    server005.freeRam = 0.5
    server005.numberOfGrowthThreadsNeededToMaxHomeComputer = 10
    server005.numberOfGrowthThreadsNeededToMax = 20

    mockServers.push(server005)

    if (noMemory === "no memory") {
        for (const server of mockServers) {
            server.freeRam = .5
        }
    }


    return mockServers
}

function addMs(now: Date, msToAdd: number) {
    return new Date(now.getTime() + msToAdd)
}

