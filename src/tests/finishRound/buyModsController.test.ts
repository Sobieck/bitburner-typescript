import { HP, Multipliers, PlayerRequirement, Skills, Task, CompanyPositionInfo, Player } from "@ns"
import { FactionPriority, AugmentData, Augment, BuyModsController, PlayerWithWork, FactionsWithRep } from "../../scripts/finishRound/buyModsController";


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
    constructor(public name: string, public price: number, public wantedScorePriceWeighted: number = 0){}

    sources: string[] = ["random"];
    repReq: number = 10;
    prereqs: string[] = [];
    isOwned: boolean = false;
    isWanted: boolean = false;
    wantedScore: number = 0;

    factionToBuyFrom: string = "";
    neededFor: string | undefined;
}

class MockPlayer implements PlayerWithWork {
    factionsWithRep: FactionsWithRep[] = []
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
    let player: PlayerWithWork; 
    let factionPriorities: FactionPriority[];
    let allAugments: Augment[];

    const factionName000 = "faction000"
    const factionName001 = "faction001"
    const factionName002NotInPriorities = "faction003"

    const augmentName000 = "aug00"
    const augmentName001 = "aug01"
    const augmentName002 = "aug02"
    const augmentName003 = "aug03"
  
    beforeEach(() => {
        player = new MockPlayer()

        player.factionsWithRep.push(new FactionsWithRep(factionName000, 11))
        player.factionsWithRep.push(new FactionsWithRep(factionName001, 11))
        player.factionsWithRep.push(new FactionsWithRep(factionName002NotInPriorities, 11))
        
        factionPriorities = []
        const factionPriority000 = new MockFactionPriority()
        factionPriority000.factionName = factionName000
        
        factionPriority000.augments.push({
            name: augmentName000,
            nextFactionHas: false
        })
        
        factionPriority000.augments.push({
            name: augmentName001,
            nextFactionHas: true
        })
        
        factionPriority000.augments.push({
            name: augmentName002,
            nextFactionHas: true
        })
        
        factionPriorities.push(factionPriority000)
        
        
        const factionPriority001 = new MockFactionPriority()
        factionPriority001.factionName = factionName001
        factionPriority001.augments.push({
            name: augmentName000,
            nextFactionHas: false
        })
        
        factionPriority001.augments.push({
            name: augmentName003,
            nextFactionHas: false
        })
        
        factionPriorities.push(factionPriority001)
        
        const aug00 = new MockAugment(augmentName000, 1)
        aug00.sources.push(factionName002NotInPriorities)
        aug00.sources.push(factionName000)

        const aug01 = new MockAugment(augmentName001, 2)
        aug01.sources.push(factionName001)

        const aug02 = new MockAugment(augmentName002, 4)
        aug02.sources.push(factionName001)
        aug02.sources.push(factionName000)

        const aug03 = new MockAugment(augmentName003, 3)
        aug03.sources.push(factionName000)
        
        allAugments = [
            aug00,
            aug01,
            aug02,
            aug03
        ]
    })

    it("should return all buyable augments", () => {
        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders.length).toBe(4)
    })

    it("should return the augments in order of price", () => {
        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].price).toBe(4)
        expect(result.orders[1].price).toBe(3)
        expect(result.orders[2].price).toBe(2)
        expect(result.orders[3].price).toBe(1)

        expect(result.orders[0].augName).toBe(augmentName002)
        expect(result.orders[1].augName).toBe(augmentName003)
        expect(result.orders[2].augName).toBe(augmentName001)
        expect(result.orders[3].augName).toBe(augmentName000)

        expect(result.orders[0].factionName).toBe(factionName001)
        expect(result.orders[1].factionName).toBe(factionName000)
        expect(result.orders[2].factionName).toBe(factionName001)
        expect(result.orders[3].factionName).toBe(factionName002NotInPriorities)
    })

    it("should do proper for wantedScorePriceWeighted", () => {
        allAugments[2].wantedScorePriceWeighted = 12
        allAugments[3].wantedScorePriceWeighted = 1
        allAugments[1].wantedScorePriceWeighted = 3
        allAugments[0].wantedScorePriceWeighted = 0

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].wantedScorePriceWeighted).toBe(12)
        expect(result.orders[1].wantedScorePriceWeighted).toBe(1)
        expect(result.orders[2].wantedScorePriceWeighted).toBe(3)
        expect(result.orders[3].wantedScorePriceWeighted).toBe(0)
    })

    it("should do proper for nextFactionHas", () => {
        // aug1 and aug2 true
        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].nextFactionHas).toBeTruthy()
        expect(result.orders[1].nextFactionHas).toBeFalsy()
        expect(result.orders[2].nextFactionHas).toBeTruthy()
        expect(result.orders[3].nextFactionHas).toBeFalsy()
    })

    it("should do proper for targetFactionHas", () => {
        // aug1 and aug2 true
        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].targetFactionHas).toBeTruthy()
        expect(result.orders[1].targetFactionHas).toBeFalsy()
        expect(result.orders[2].targetFactionHas).toBeTruthy()
        expect(result.orders[3].targetFactionHas).toBeTruthy()
    })

    it("should return the expected price", () => {
        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].expectedPrice).toBe(4)
        expect(result.orders[1].expectedPrice).toBeCloseTo(5.7)
        expect(result.orders[2].expectedPrice).toBe(7.22)
        expect(result.orders[3].expectedPrice).toBeCloseTo(6.859)        
    })

    it("should have the correct total price", () => {
        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.totalPrice).toBe(4 + 5.7 + 7.22 + 6.859)

        expect(result.totalPriceFormatted).toBe("$23.78")
    })

    it("should return the augments in order of price, but filter out already owned ones", () => {
        allAugments[1].isOwned = true

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].price).toBe(4)
        expect(result.orders[1].price).toBe(3)
        expect(result.orders[2].price).toBe(1)

        expect(result.orders[0].augName).toBe(augmentName002)
        expect(result.orders[1].augName).toBe(augmentName003)
        expect(result.orders[2].augName).toBe(augmentName000)

        expect(result.orders[0].factionName).toBe(factionName001)
        expect(result.orders[1].factionName).toBe(factionName000)
        expect(result.orders[2].factionName).toBe(factionName002NotInPriorities)
    })

    it("should return the augments in order of price, but get from different place if other source is low rep", () => {
        player.factionsWithRep[2].rep = 9

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].price).toBe(4)
        expect(result.orders[1].price).toBe(3)
        expect(result.orders[2].price).toBe(2)
        expect(result.orders[3].price).toBe(1)

        expect(result.orders[0].augName).toBe(augmentName002)
        expect(result.orders[1].augName).toBe(augmentName003)
        expect(result.orders[2].augName).toBe(augmentName001)
        expect(result.orders[3].augName).toBe(augmentName000)

        expect(result.orders[0].factionName).toBe(factionName001)
        expect(result.orders[1].factionName).toBe(factionName000)
        expect(result.orders[2].factionName).toBe(factionName001)
        expect(result.orders[3].factionName).toBe(factionName000)
    })

    it("shouldn't add a augment with too high of requirements", () => {
        const augOutOfReach = new MockAugment("soething", 19)
        augOutOfReach.repReq = 100
        augOutOfReach.sources.push(factionName000)

        allAugments.push(augOutOfReach)

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].price).toBe(4)
        expect(result.orders[1].price).toBe(3)
        expect(result.orders[2].price).toBe(2)
        expect(result.orders[3].price).toBe(1)

        expect(result.orders[0].augName).toBe(augmentName002)
        expect(result.orders[1].augName).toBe(augmentName003)
        expect(result.orders[2].augName).toBe(augmentName001)
        expect(result.orders[3].augName).toBe(augmentName000)

        expect(result.orders[0].factionName).toBe(factionName001)
        expect(result.orders[1].factionName).toBe(factionName000)
        expect(result.orders[2].factionName).toBe(factionName001)
        expect(result.orders[3].factionName).toBe(factionName002NotInPriorities)
    })

    it("should add a thing with a more expensive dependency first", () => {
        allAugments[2].prereqs.push(augmentName003) // aug 2 is dependent on 3
        allAugments[3].prereqs.push(augmentName000) // aug 3 is dependent on 0

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].augName).toBe(augmentName000)
        expect(result.orders[1].augName).toBe(augmentName003)
        expect(result.orders[2].augName).toBe(augmentName002)
        expect(result.orders[3].augName).toBe(augmentName001)

        expect(result.orders[1].neededFor).toBe(augmentName002)
        expect(result.orders[0].neededFor).toBe(augmentName003)
    })

    it("should work with arrays of augment depedencies", () =>{
        allAugments[2].prereqs.push(augmentName003)
        allAugments[2].prereqs.push(augmentName000)

        allAugments[2].price = 4
        allAugments[3].price = 1
        allAugments[0].price = 3
        allAugments[1].price = 5

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].augName).toBe(augmentName001)
        expect(result.orders[1].augName).toBe(augmentName000)
        expect(result.orders[2].augName).toBe(augmentName003)
        expect(result.orders[3].augName).toBe(augmentName002)

        expect(result.orders[1].neededFor).toBe(augmentName002)
        expect(result.orders[2].neededFor).toBe(augmentName002)
    })
    

    it("should remove items with dependencies with too high of requirements and not purchasable", () => {
        const augOutOfReach = new MockAugment("soething", 19)
        augOutOfReach.repReq = 100
        augOutOfReach.sources.push(factionName000)

        allAugments.push(augOutOfReach)

        allAugments[2].prereqs.push(augOutOfReach.name)

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].augName).toBe(augmentName003)
        expect(result.orders[1].augName).toBe(augmentName001)
        expect(result.orders[2].augName).toBe(augmentName000)
    })

    it("should work because the dependency aug is already owned", () => {
        const augOutOfReach = new MockAugment("soething", 19)
        augOutOfReach.repReq = 100
        augOutOfReach.sources.push(factionName000)
        augOutOfReach.isOwned = true

        allAugments.push(augOutOfReach)

        allAugments[2].prereqs.push(augOutOfReach.name)

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].augName).toBe(augmentName002)
        expect(result.orders[1].augName).toBe(augmentName003)
        expect(result.orders[2].augName).toBe(augmentName001)
        expect(result.orders[3].augName).toBe(augmentName000)

    })

    it("should shoudlnt't work because one isn't owned and not available", () => {
        const augOutOfReach = new MockAugment("soething", 19)
        augOutOfReach.repReq = 100
        augOutOfReach.sources.push(factionName000)

        allAugments.push(augOutOfReach)

        allAugments[2].prereqs.push(augOutOfReach.name)

        const augOutOfReachOwned = new MockAugment("soething1", 19)
        augOutOfReachOwned.repReq = 100
        augOutOfReachOwned.sources.push(factionName000)
        augOutOfReachOwned.isOwned = true

        allAugments.push(augOutOfReachOwned)

        allAugments[2].prereqs.push(augOutOfReachOwned.name)

        const controller = new BuyModsController(player, factionPriorities, allAugments)
        const result = controller.completePurchaseData

        expect(result.orders[0].augName).toBe(augmentName003)
        expect(result.orders[1].augName).toBe(augmentName001)
        expect(result.orders[2].augName).toBe(augmentName000)
    })

    // cash constrained: 
    // filter out options that aren't wanted
    // filter out wanted items that the next faction has
})