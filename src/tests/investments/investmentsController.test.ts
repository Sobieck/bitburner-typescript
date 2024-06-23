import { HP, Multipliers, Player, Server, Skills } from "@ns"
import { BuyProgramAction, InvestmentsController, PrecalculatedValues, PurchaseServerAction, UpgradePurchasedServerAction } from "../../scripts/investments/investmentsController"

enum JobName {
    software0 = "Software Engineering Intern",
}
enum CityName {
    Aevum = "Aevum",
}
enum CompanyName {
    BachmanAndAssociates = "Bachman & Associates",
}

class MockPrecalculatedValues implements PrecalculatedValues {
    remoteServerCosts: { ram: number; cost: number }[] = []
    upgradeHomeRamCost: number = Number.MAX_VALUE
    upgradeHomeCoresCost: number = Number.MAX_VALUE
    purchasedServerLimit: number = 2
    fileSystem: string[] = [
        "data/investAtWill.txt",
        "data/ramConstrained.txt"
    ]
    hasTor: boolean = true
}

class MockPlayer implements Player {
    money: number = 0
    numPeopleKilled: number = 0
    entropy: number = 0
    jobs: Partial<Record<CompanyName, JobName>> = {
    }
    factions: string[] = []
    totalPlaytime: number = 123
    location: string = ""
    karma: number = 12
    hp: HP = {
        current: 0,
        max: 0
    }
    skills: Skills = {
        hacking: 0,
        strength: 0,
        defense: 0,
        dexterity: 0,
        agility: 0,
        charisma: 0,
        intelligence: 0
    }
    exp: Skills = {
        hacking: 0,
        strength: 0,
        defense: 0,
        dexterity: 0,
        agility: 0,
        charisma: 0,
        intelligence: 0
    }
    mults: Multipliers = {
        hacking: 0,
        strength: 0,
        defense: 0,
        dexterity: 0,
        agility: 0,
        charisma: 0,
        hacking_exp: 0,
        strength_exp: 0,
        defense_exp: 0,
        dexterity_exp: 0,
        agility_exp: 0,
        charisma_exp: 0,
        hacking_chance: 0,
        hacking_speed: 0,
        hacking_money: 0,
        hacking_grow: 0,
        company_rep: 0,
        faction_rep: 0,
        crime_money: 0,
        crime_success: 0,
        work_money: 0,
        hacknet_node_money: 0,
        hacknet_node_purchase_cost: 0,
        hacknet_node_ram_cost: 0,
        hacknet_node_core_cost: 0,
        hacknet_node_level_cost: 0,
        bladeburner_max_stamina: 0,
        bladeburner_stamina_gain: 0,
        bladeburner_analysis: 0,
        bladeburner_success_chance: 0
    }
    city: CityName = CityName.Aevum
}

export class MockServer implements Server {
    constructor(public hostname: string) { }
    ip: string = "";
    sshPortOpen: boolean = false;
    ftpPortOpen: boolean = false;
    smtpPortOpen: boolean = true;
    httpPortOpen: boolean = false;
    sqlPortOpen: boolean = false;
    hasAdminRights: boolean = false;
    cpuCores: number = 123;
    isConnectedTo: boolean = true;
    ramUsed: number = 0;
    maxRam: number = 0;
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

describe("investmentsController", () => {
    let player: Player;
    let precalculatedValue: PrecalculatedValues;
    let environment: Server[]

    beforeEach(() => {
        player = new MockPlayer()
        precalculatedValue = new MockPrecalculatedValues()
        environment = []
    })

    it("should return a NoInvestmentAction", () => {
        const controller = new InvestmentsController(player, precalculatedValue, environment)
        const result = controller.action

        expect(result.type).toBe("noInvestment")
    })

    it("should return a NoInvestmentAction when we don't have the investAtWill thing on the HD", () => {
        player.skills.hacking = 46
        precalculatedValue.fileSystem = ["data/ramConstrained.txt"]

        const controller = new InvestmentsController(player, precalculatedValue, environment)
        const result = controller.action

        expect(result.type).toBe("noInvestment")
    })

    describe("when buying programs", () => {
        it("should attempt to buy tor when there is no tor and we want to buy another program", () => {
            player.skills.hacking = 46
            precalculatedValue.hasTor = false

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action

            expect(result.type).toBe("buyTor")

        })

        it("should attempt to buy BruteSSH.exe if the player is high enough hacking level and BruteSSH doesn't exist on server.", () => {
            player.skills.hacking = 46

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action as BuyProgramAction

            expect(result.type).toBe("buyProgram")
            expect(result.programName).toBe("BruteSSH.exe")
        })

        it("should attempt to buy FTPCrack.exe", () => {
            precalculatedValue.fileSystem.push("BruteSSH.exe")
            player.skills.hacking = 90

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action as BuyProgramAction

            expect(result.type).toBe("buyProgram")
            expect(result.programName).toBe("FTPCrack.exe")
        })

        it("should attempt nothing when there isn't enough juice in hacking", () => {
            precalculatedValue.fileSystem.push("BruteSSH.exe")
            player.skills.hacking = 89

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action

            expect(result.type).toBe("noInvestment")
        })

        it("should attempt to buy relaySMTP.exe", () => {
            precalculatedValue.fileSystem.push("BruteSSH.exe")
            precalculatedValue.fileSystem.push("FTPCrack.exe")
            player.skills.hacking = 225

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action as BuyProgramAction

            expect(result.type).toBe("buyProgram")
            expect(result.programName).toBe("relaySMTP.exe")
        })

        it("should attempt to buy HTTPWorm.exe", () => {
            precalculatedValue.fileSystem.push("BruteSSH.exe")
            precalculatedValue.fileSystem.push("FTPCrack.exe")
            precalculatedValue.fileSystem.push("relaySMTP.exe")
            player.skills.hacking = 450

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action as BuyProgramAction

            expect(result.type).toBe("buyProgram")
            expect(result.programName).toBe("HTTPWorm.exe")
        })

        it("should attempt to buy HTTPWorm.exe", () => {
            precalculatedValue.fileSystem.push("BruteSSH.exe")
            precalculatedValue.fileSystem.push("FTPCrack.exe")
            precalculatedValue.fileSystem.push("relaySMTP.exe")
            player.skills.hacking = 451

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action as BuyProgramAction

            expect(result.type).toBe("buyProgram")
            expect(result.programName).toBe("HTTPWorm.exe")
        })

        it("should attempt to buy SQLInject.exe", () => {
            player.money = 2
            precalculatedValue.upgradeHomeCoresCost = 1
            precalculatedValue.upgradeHomeRamCost = 0

            precalculatedValue.fileSystem.push("BruteSSH.exe")
            precalculatedValue.fileSystem.push("FTPCrack.exe")
            precalculatedValue.fileSystem.push("relaySMTP.exe")
            precalculatedValue.fileSystem.push("HTTPWorm.exe")
            player.skills.hacking = 675

            const controller = new InvestmentsController(player, precalculatedValue, environment)
            const result = controller.action as BuyProgramAction

            expect(result.type).toBe("buyProgram")
            expect(result.programName).toBe("SQLInject.exe")
        })
        
    })

    describe("when investing in servers", () => {
        describe("when buying cores", () => {
            it("should return a purchase a core situatoin when cores are affordable", () => {
                player.money = 2
                precalculatedValue.upgradeHomeCoresCost = 1
                precalculatedValue.upgradeHomeRamCost = 0
                
                const controller = new InvestmentsController(player, precalculatedValue, environment)
                const result = controller.action
    
                expect(result.type).toBe("buyHomeCore")
            })
    
            it("should return a not purchase a core situatoin when cores are not affordable", () => {
                player.money = 2
                precalculatedValue.upgradeHomeCoresCost = 3
                
                const controller = new InvestmentsController(player, precalculatedValue, environment)
                const result = controller.action
    
                expect(result.type).toBe("noInvestment")
            })
    
            it("should return a not purchase a core situatoin when cores are affordable but not resource constrained", () => {
                player.money = 2
                precalculatedValue.upgradeHomeCoresCost = 1
                precalculatedValue.fileSystem = ["data/investAtWill.txt"]
                
                const controller = new InvestmentsController(player, precalculatedValue, environment)
                const result = controller.action
    
                expect(result.type).toBe("noInvestment")
            })
        })

        describe("when buying home ram", () => {
            it("should buy home ram when it is affordable", () => {
                player.money = 2
                precalculatedValue.upgradeHomeRamCost = 1
                
                const controller = new InvestmentsController(player, precalculatedValue, environment)
                const result = controller.action
    
                expect(result.type).toBe("buyHomeRam")
            })

            it("should NOT buy home ram when it is NOT affordable", () => {
                player.money = 2
                precalculatedValue.upgradeHomeRamCost = 3
                
                const controller = new InvestmentsController(player, precalculatedValue, environment)
                const result = controller.action
    
                expect(result.type).toBe("noInvestment")
            })

            it("should NOT buy home ram when we don't need memory", () => {
                player.money = 2
                precalculatedValue.upgradeHomeRamCost = 1
                precalculatedValue.fileSystem = ["data/investAtWill.txt"]
                
                const controller = new InvestmentsController(player, precalculatedValue, environment)
                const result = controller.action
    
                expect(result.type).toBe("noInvestment")
            })
        })

        describe('when working with remote servers', () => {
            beforeEach(() => {
                const server0Name = "0"
                const server0 = new MockServer(server0Name)
                server0.maxRam = 40
                server0.purchasedByPlayer = true
                environment.push(server0)

                const server1Name = "1"
                const server1 = new MockServer(server1Name)
                server1.maxRam = 20
                server1.purchasedByPlayer = true
                environment.push(server1)

                const homeServerName = "home"
                const homeServer = new MockServer(homeServerName)
                homeServer.purchasedByPlayer = true
                homeServer.maxRam = 10
                environment.push(homeServer)

                const notOwned = new MockServer("not owned")
                notOwned.maxRam = 10
                notOwned.purchasedByPlayer = false
                environment.push(notOwned)

                precalculatedValue.remoteServerCosts.push({
                    ram: 10,
                    cost: 10
                })

                precalculatedValue.remoteServerCosts.push({
                    ram: 30,
                    cost: 100
                })
            })
            
            describe("when upgrading", () => {
                beforeEach(() => {
                    player.money = 100
                })

                it("should NOT do anything when we don't need new resources.", () => {
                    precalculatedValue.fileSystem = ["data/investAtWill.txt"]
                    
                    const controller = new InvestmentsController(player, precalculatedValue, environment)
                    const result = controller.action
        
                    expect(result.type).toBe("noInvestment")
                })

                it("should select server 1 to upgrade", () => {
                    const controller = new InvestmentsController(player, precalculatedValue, environment)
                    const result = controller.action as UpgradePurchasedServerAction

                    expect(result.type).toBe("upgradePurchasedServer")
                    expect(result.ram).toBe(30)
                    expect(result.serverName).toBe("1")
                })

                it("should do nothing if ram is too expensive", () => {
                    precalculatedValue.remoteServerCosts[0].cost = 101
                    precalculatedValue.remoteServerCosts[1].cost = 102

                    const controller = new InvestmentsController(player, precalculatedValue, environment)
                    const result = controller.action as UpgradePurchasedServerAction

                    expect(result.type).toBe("noInvestment")
                })
            })

            describe("when buying new", () => {
                beforeEach(() => {
                    player.money = 20
                    precalculatedValue.purchasedServerLimit = 3
                })

                it("should NOT do anything when we don't need new resources.", () => {
                    precalculatedValue.fileSystem = ["data/investAtWill.txt"]
                    
                    const controller = new InvestmentsController(player, precalculatedValue, environment)
                    const result = controller.action
        
                    expect(result.type).toBe("noInvestment")
                })

                it("should create a new server", () => {
                    const controller = new InvestmentsController(player, precalculatedValue, environment)
                    const result = controller.action as PurchaseServerAction

                    expect(result.type).toBe("purchaseServer")
                    expect(result.ram).toBe(10)
                    expect(result.serverName).toBe("REMOTE-002")
                })

                it("should do nothing if ram is too expensive", () => {
                    precalculatedValue.remoteServerCosts[0].cost = 101
                    precalculatedValue.remoteServerCosts[1].cost = 102

                    const controller = new InvestmentsController(player, precalculatedValue, environment)
                    const result = controller.action as PurchaseServerAction

                    expect(result.type).toBe("noInvestment")
                })

                it("should NOT create a new server if there are already more than enough servers", () => {
                    precalculatedValue.purchasedServerLimit = 2

                    const controller = new InvestmentsController(player, precalculatedValue, environment)
                    const result = controller.action as PurchaseServerAction

                    expect(result.type).toBe("noInvestment")
                })
            })
        })
    })
})