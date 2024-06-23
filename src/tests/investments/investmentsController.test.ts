import { HP, Multipliers, Player, Server, Skills } from "@ns"
import { BuyProgramAction, InvestmentsController, PrecalculatedValues } from "../../scripts/investments/investmentsController"

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
        precalculatedValue.fileSystem = []

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
})