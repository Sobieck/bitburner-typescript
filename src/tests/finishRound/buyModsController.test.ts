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
    constructor(public name: string, public price: number){}

    sources: string[] = ["random"];
    repReq: number = 10;
    prereqs: string[] = [];
    isOwned: boolean = false;
    isWanted: boolean = false;
    wantedScore: number = 0;
    wantedScorePriceWeighted: number = 0;

    factionToBuyFrom: string = "";
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

    const factionName001 = "faction001"
    const factionName002 = "faction002"
    const factionName003NotInPriorities = "faction003"

    const augmentName000 = "aug00"
    const augmentName001 = "aug01"
    const augmentName002 = "aug02"
    const augmentName003 = "aug03"
  
    beforeEach(() => {
        player = new MockPlayer()

        player.factionsWithRep.push(new FactionsWithRep(factionName001, 11))
        player.factionsWithRep.push(new FactionsWithRep(factionName002, 11))
        player.factionsWithRep.push(new FactionsWithRep(factionName003NotInPriorities, 11))
        
        factionPriorities = []
        const factionPriority001 = new MockFactionPriority()
        factionPriority001.factionName = factionName001
        
        factionPriority001.augments.push({
            name: augmentName000,
            nextFactionHas: false
        })
        
        factionPriority001.augments.push({
            name: augmentName001,
            nextFactionHas: false
        })
        
        factionPriority001.augments.push({
            name: augmentName002,
            nextFactionHas: false
        })
        
        factionPriorities.push(factionPriority001)
        
        
        const factionPriority002 = new MockFactionPriority()
        factionPriority002.factionName = factionName002
        factionPriority002.augments.push({
            name: augmentName000,
            nextFactionHas: false
        })
        
        factionPriority002.augments.push({
            name: augmentName003,
            nextFactionHas: false
        })
        
        factionPriorities.push(factionPriority002)
        
        const aug00 = new MockAugment(augmentName000, 1)
        aug00.sources.push(factionName003NotInPriorities)
        aug00.sources.push(factionName001)

        const aug01 = new MockAugment(augmentName001, 2)
        aug01.sources.push(factionName002)

        const aug02 = new MockAugment(augmentName002, 4)
        aug02.sources.push(factionName002)
        aug02.sources.push(factionName001)

        const aug03 = new MockAugment(augmentName003, 3)
        aug03.sources.push(factionName001)
        
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

        expect(result.orders[0].factionName).toBe(factionName002)
        expect(result.orders[1].factionName).toBe(factionName001)
        expect(result.orders[2].factionName).toBe(factionName002)
        expect(result.orders[3].factionName).toBe(factionName003NotInPriorities)
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

        expect(result.orders[0].factionName).toBe(factionName002)
        expect(result.orders[1].factionName).toBe(factionName001)
        expect(result.orders[2].factionName).toBe(factionName002)
        expect(result.orders[3].factionName).toBe(factionName001)
    })

    it("shouldn't add a augment with too high of requirements", () => {
        const augOutOfReach = new MockAugment("soething", 19)
        augOutOfReach.repReq = 100
        augOutOfReach.sources.push(factionName001)

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

        expect(result.orders[0].factionName).toBe(factionName002)
        expect(result.orders[1].factionName).toBe(factionName001)
        expect(result.orders[2].factionName).toBe(factionName002)
        expect(result.orders[3].factionName).toBe(factionName003NotInPriorities)
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
    })

    it("should work with arrays of augment depedencies", () =>{
        allAugments[2].prereqs.push(augmentName003) // aug 2 is dependent on 3
        allAugments[2].prereqs.push(augmentName000) // aug 2 is dependent on 3

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
    })
    

    it("should remove items with dependencies with too high of requirements and not purchasable", () => {
        const augOutOfReach = new MockAugment("soething", 19)
        augOutOfReach.repReq = 100
        augOutOfReach.sources.push(factionName001)

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
        augOutOfReach.sources.push(factionName001)
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
        augOutOfReach.sources.push(factionName001)

        allAugments.push(augOutOfReach)

        allAugments[2].prereqs.push(augOutOfReach.name)

        const augOutOfReachOwned = new MockAugment("soething1", 19)
        augOutOfReachOwned.repReq = 100
        augOutOfReachOwned.sources.push(factionName001)
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
    // add things based on the wanted score / money first 

})

//https://github.com/bitburner-official/bitburner-src/blob/99b22a221c56528ae0f923261c5f2fe4000e8edf/src/Constants.ts#L90

//https://github.com/bitburner-official/bitburner-src/issues/863


// getBaseAugmentationPriceMultiplier = CONSTANTS.MultipleAugMultiplier * [1, 0.96, 0.94, 0.93][Player.sourceFileLvl(11)];
// getGenericAugmentationPriceMultiplier = Math.pow(getBaseAugmentationPriceMultiplier, Player.queuedAugmentations.length);
// getAugmentationBasePrice = aug.baseCost * currentNodeMults.AugmentationMoneyCost
