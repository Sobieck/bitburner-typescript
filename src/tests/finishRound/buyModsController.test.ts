import { HP, Multipliers, PlayerRequirement, Skills, Task, CompanyPositionInfo, Player } from "@ns"
import { FactionPriority, AugmentData, Augment, BuyModsController } from "../../scripts/finishRound/buyModsController";


enum JobName {
    software0 = "Software Engineering Intern",
}

enum CityName {
    Aevum = "Aevum",
    Chongqing = "Chongqing",
    Sector12 = "Sector-12",
    NewTokyo = "New Tokyo",
    Ishima = "Ishima",
    Volhaven = "Volhaven",
}


enum CompanyName {
    BachmanAndAssociates = "Bachman & Associates",
    ECorp = "ECorp",
}

class MockFactionPriority implements FactionPriority {
    totalWantedScore: number = 0
    maxRepNeeded: number = 0
    factionName: string = "marge"
    augments: AugmentData[] = []
    maxPrice: number = 13
    requirements: PlayerRequirement[] = []
    currentRep: number = 12
    currentJobRep: number | undefined
    positions: CompanyPositionInfo[] | undefined
    repNeededForAugsThatNextDoesntHave = 0
}

class MockAugment implements Augment {
    name: string = "";
    sources: string[] = [];
    repReq: number = 0;
    price: number = 0;
    prereqs: string[] = [];
    isOwned: boolean = false;
    isWanted: boolean = false;
    wantedScore: number = 0;
    wantedScorePriceWeighted: number = 0;
}

class MockPlayer implements Player {
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


describe("BuyModsController", () => {
    let player: Player; // PLAYER WITH FACTION REP
    let factionPriorities: FactionPriority[];
    let allAugments: Augment[];

    beforeEach(() => {
        player = new MockPlayer()
        factionPriorities = []
        allAugments = []
    })

    it("should set players money", () => {
        player.money = 123

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.playersMoney).toBe(123)
    })
})