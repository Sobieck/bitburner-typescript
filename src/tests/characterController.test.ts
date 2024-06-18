import { HP, Multipliers, PlayerRequirement, Skills, Task, CompanyPositionInfo, JobName, CompanyName } from "@ns"
import { FactionPriorities, CharacterController, PlayerWithWork, PrecalculatedValues, TravelAction, UniversityAction } from "../scripts/character/characterController";

class MockPrecalculations implements PrecalculatedValues {
    fileSystem: string[] = []
}

enum CityName {
    Aevum = "Aevum",
    Chongqing = "Chongqing",
    Sector12 = "Sector-12",
    NewTokyo = "New Tokyo",
    Ishima = "Ishima",
    Volhaven = "Volhaven",
}

class MockFactionPriorities implements FactionPriorities {
    totalWantedScore: number = 0
    maxRepNeeded: number = 0
    factionName: string = "marge"
    augments: string[] = []
    maxPrice: number = 13
    requirements: PlayerRequirement[] = []
    currentRep: number = 12
    currentJobRep: number | undefined
    positions: CompanyPositionInfo[] | undefined
}

class MockPlayer implements PlayerWithWork {
    currentWork: Task | null = null
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
    city: CityName = CityName.Sector12
}

describe("PlayerController", () => {
    let player: PlayerWithWork;
    let factionPriorities: FactionPriorities[];
    let precalculatedValues: PrecalculatedValues;
    
    beforeEach(() => {
        player = new MockPlayer()
        factionPriorities = []
        precalculatedValues = new MockPrecalculations()
    })

    describe("When there are no other options they should start Rothman University:Computer Science:Sector12", () => {
        it("should travel to the city when in different city", () => {
            player.city = CityName.Aevum

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)

            const result = controller.actionRequired! as TravelAction

            expect(result.type).toBe("travel")
            expect(result.destination).toBe(CityName.Sector12)
        })

        it('should assign rothman: computer science as an action', () => {
            player.city = CityName.Sector12

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)

            const result = controller.actionRequired! as UniversityAction

            expect(result.type).toBe("university")
            expect(result.universityName).toBe("Rothman University")
            expect(result.courseName).toBe("Computer Science")
        });
    })

    // travel to all cities to get factoins running every game

    // the target 0 has only augments that also belong to target 1. Obviously, skip 0. 

})