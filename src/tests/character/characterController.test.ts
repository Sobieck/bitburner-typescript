import { HP, Multipliers, PlayerRequirement, Skills, Task, CompanyPositionInfo } from "@ns"
import { FactionPriority, CharacterController, PlayerWithWork, PrecalculatedValues, TravelAction, UniversityAction, CreateProgramAction, ChangeNothingAction, AugmentData, FactionWorkAction, CompanyWorkAction } from "../../scripts/character/characterController";

class MockPrecalculations implements PrecalculatedValues {
    fileSystem: string[] = []
    targetCityFaction: string | undefined;
}

enum JobName {
    software0 = "Software Engineering Intern",
    software1 = "Junior Software Engineer",
    IT0 = "IT Intern",
    IT1 = "IT Analyst",
}

enum CityName {
    Aevum = "Aevum",
    Chongqing = "Chongqing",
    Sector12 = "Sector-12",
    NewTokyo = "New Tokyo",
    Ishima = "Ishima",
    Volhaven = "Volhaven",
}

enum FactionWorkType {
    hacking = "hacking",
    field = "field",
    security = "security",
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

const defaultActionType = "university"

describe("PlayerController", () => {
    let player: PlayerWithWork;
    let factionPriorities: FactionPriority[];
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
            const result = controller.actionRequired as TravelAction

            expect(result.type).toBe("travel")
            expect(result.destination).toBe(CityName.Sector12)
        })

        it('should assign rothman: computer science as an action', () => {
            player.city = CityName.Sector12

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as UniversityAction

            expect(result.type).toBe("university")
            expect(result.universityName).toBe("Rothman University")
            expect(result.courseName).toBe("Computer Science")
        });

        it("should do nothing when it already has the task", () => {
            player.city = CityName.Aevum

            player.currentWork = {
                type: "CLASS",
                classType: "Computer Science",
                location: "Rothman University",
                cyclesWorked: 12
            }

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as ChangeNothingAction

            expect(result.type).toBe("changeNothing")
            expect(result.noTravel).toBeTruthy()
        })
    })

    describe("when a program can be made and it isn't in the file system", () => {
        beforeEach(() => {
            player.skills.hacking = 50
        })

        it("should create Brute.exe", () => {
            const controller = new CharacterController(player, factionPriorities, precalculatedValues)

            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe("createProgram")
            expect(result.programName).toBe("BruteSSH.exe")
        })

        it("should go to the default when brute is there", () => {
            precalculatedValues.fileSystem.push("BruteSSH.exe")

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe(defaultActionType)
        })

        it("should go to the default when skill is low", () => {
            player.skills.hacking = 49

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe(defaultActionType)
        })

        it("shouldn't when the work is already being done", () => {
            player.currentWork = {
                type: "CREATE_PROGRAM",
                programName: "BruteSSH.exe",
                cyclesWorked: 1
            }

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe("changeNothing")
        })

        it("should make FTPCrack.exe if Brute.exe is on disk", () => {
            player.skills.hacking = 100
            precalculatedValues.fileSystem.push("BruteSSH.exe")

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe("createProgram")
            expect(result.programName).toBe("FTPCrack.exe")
        })

        it("should make relaySMTP.exe if FTPCrack.exe is on disk", () => {
            player.skills.hacking = 250
            precalculatedValues.fileSystem.push("BruteSSH.exe")
            precalculatedValues.fileSystem.push("FTPCrack.exe")

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe("createProgram")
            expect(result.programName).toBe("relaySMTP.exe")
        })

        it("should make HTTPWorm.exe if relaySMTP.exe is on disk", () => {
            player.skills.hacking = 500
            precalculatedValues.fileSystem.push("BruteSSH.exe")
            precalculatedValues.fileSystem.push("FTPCrack.exe")
            precalculatedValues.fileSystem.push("relaySMTP.exe")

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe("createProgram")
            expect(result.programName).toBe("HTTPWorm.exe")
        })

        it("should make SQLInject.exe if relaySMTP.exe is on disk", () => {
            player.skills.hacking = 750
            precalculatedValues.fileSystem.push("BruteSSH.exe")
            precalculatedValues.fileSystem.push("FTPCrack.exe")
            precalculatedValues.fileSystem.push("relaySMTP.exe")
            precalculatedValues.fileSystem.push("HTTPWorm.exe")

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as CreateProgramAction

            expect(result.type).toBe("createProgram")
            expect(result.programName).toBe("SQLInject.exe")
        })
    })

    // hacking factions and location faction

    describe("when we are working towards augments", () => {
        const bName = "B"
        const cityName = "city"

        beforeEach(() => {
            player.factions.push(bName)

            const aFaction = new MockFactionPriority()
            aFaction.currentRep = 0
            aFaction.repNeededForAugsThatNextDoesntHave = 1
            aFaction.factionName = "a"
            factionPriorities.push(aFaction)

            const bFaction = new MockFactionPriority()
            bFaction.currentRep = 0
            bFaction.repNeededForAugsThatNextDoesntHave = 2
            bFaction.factionName = bName
            factionPriorities.push(bFaction)


            const cityFaction = new MockFactionPriority()
            cityFaction.currentRep = 0
            cityFaction.repNeededForAugsThatNextDoesntHave = 1
            cityFaction.requirements = [
                {
                    type: "city",
                    city: CityName.Chongqing
                },
                {
                    type: "money",
                    money: 200
                }
            ]
            cityFaction.factionName = cityName
            factionPriorities.push(cityFaction)
        })

        it("should start working for faction b", () => {
            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as FactionWorkAction

            expect(result.type).toBe("factionWork")
            expect(result.factionName).toBe(bName)
        })

        it("should do a continue action when it is already working", () => {
            player.currentWork = {
                type: "FACTION",
                factionWorkType: FactionWorkType.hacking,
                cyclesWorked: 1,
                factionName: bName
            }


            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as ChangeNothingAction

            expect(result.type).toBe("changeNothing")
        })

        it("should do a faction action when it is already working for someone else", () => {
            player.currentWork = {
                type: "FACTION",
                factionWorkType: FactionWorkType.hacking,
                cyclesWorked: 1,
                factionName: cityName
            }

            const controller = new CharacterController(player, factionPriorities, precalculatedValues)
            const result = controller.actionRequired as FactionWorkAction

            expect(result.type).toBe("factionWork")
            expect(result.factionName).toBe(bName)
            expect(result.factionWorkType).toBe("hacking")
        })

        describe("when we hit our rep goals for the first one", () => {
            beforeEach(() => {
                factionPriorities[1].currentRep = 2
            })

            it("should move on to the city faction if we are already part of that faction", () => {
                player.factions.push(cityName)

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as FactionWorkAction

                expect(result.type).toBe("factionWork")
                expect(result.factionName).toBe(cityName)
                expect(result.factionWorkType).toBe("hacking")
            })

            it("should travel if we have enough money in the bank", () => {
                player.city = CityName.Aevum
                player.money = 200

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as TravelAction

                expect(result.type).toBe("travel")
                expect(result.destination).toBe(CityName.Chongqing)
            })

            it("should move on to the next thing if there isn't enough money, default action", () => {
                player.money = 199

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as TravelAction

                expect(result.type).toBe(defaultActionType)
            })
        })

        describe("when working with a company faction", () => {
            beforeEach(() => {
                factionPriorities[1].currentRep = 2
                factionPriorities[2].currentRep = 2

                const targetCompany = new MockFactionPriority()
                targetCompany.currentRep = 0
                targetCompany.repNeededForAugsThatNextDoesntHave = 1
                targetCompany.factionName = CompanyName.BachmanAndAssociates
                targetCompany.currentJobRep = 0

                targetCompany.requirements.push(
                    {
                        type: "companyReputation",
                        reputation: 20000,
                        company: CompanyName.BachmanAndAssociates
                    }
                )

                const positions = JSON.parse(`[
                    {
                        "name": "Software Engineering Intern",
                        "field": "Software",
                        "nextPosition": "Junior Software Engineer",
                        "salary": 85.8,
                        "requiredReputation": 0,
                        "requiredSkills": {
                            "hacking": 225,
                            "strength": 0,
                            "defense": 0,
                            "dexterity": 0,
                            "agility": 0,
                            "charisma": 0,
                            "intelligence": 0
                        }
                    },
                    {
                        "name": "Junior Software Engineer",
                        "field": "Software",
                        "nextPosition": "Senior Software Engineer",
                        "salary": 208,
                        "requiredReputation": 8000,
                        "requiredSkills": {
                            "hacking": 275,
                            "strength": 0,
                            "defense": 0,
                            "dexterity": 0,
                            "agility": 0,
                            "charisma": 200,
                            "intelligence": 0
                        }
                    }
                ]`)

                targetCompany.positions = positions

                factionPriorities.push(targetCompany)

                precalculatedValues.fileSystem.push("BruteSSH.exe")
                precalculatedValues.fileSystem.push("FTPCrack.exe")
                precalculatedValues.fileSystem.push("relaySMTP.exe")
                precalculatedValues.fileSystem.push("HTTPWorm.exe")
            })

            it("should start working on the job if there is a job", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as CompanyWorkAction

                expect(result.type).toBe("companyWork")
                expect(result.companyName).toBe(CompanyName.BachmanAndAssociates.valueOf())
            })

            it("should start working on the job if there is a job but working somewhere else", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0

                player.currentWork = {
                    type: "COMPANY",
                    companyName: CompanyName.ECorp,
                    cyclesWorked: 0
                }

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as CompanyWorkAction

                expect(result.type).toBe("companyWork")
                expect(result.companyName).toBe(CompanyName.BachmanAndAssociates.valueOf())
            })

            it("should continue to work on the job we are already doing that", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0

                player.currentWork = {
                    type: "COMPANY",
                    companyName: CompanyName.BachmanAndAssociates,
                    cyclesWorked: 0
                }

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as ChangeNothingAction

                expect(result.type).toBe("changeNothing")
            })

            it("should start hacking training if we have enough company rep", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.skills.hacking = 200
                factionPriorities[3].currentJobRep = 8000
                player.city = CityName.Volhaven

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as UniversityAction

                expect(result.type).toBe("university")
                expect(result.universityName).toBe("ZB Institute of Technology")
                expect(result.courseName).toBe("Algorithms")
            })

            it("should start travel to volhaven for hacking training if we have enough company rep", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.skills.hacking = 200
                factionPriorities[3].currentJobRep = 8000

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as TravelAction

                expect(result.type).toBe("travel")
                expect(result.destination).toBe("Volhaven")
            })

            it("should continue hacking training if we have enough company rep", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.skills.hacking = 200
                factionPriorities[3].currentJobRep = 8000
                player.currentWork = {
                    type: "CLASS",
                    classType: "Algorithms",
                    location: "ZB Institute of Technology",
                    cyclesWorked: 1
                }

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as ChangeNothingAction

                expect(result.type).toBe("changeNothing")
                expect(result.noTravel).toBeTruthy()
            })

            it("should start cha training if we have enough company rep", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.skills.hacking = 275
                factionPriorities[3].currentJobRep = 8000
                player.city = CityName.Volhaven

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as UniversityAction

                expect(result.type).toBe("university")
                expect(result.universityName).toBe("ZB Institute of Technology")
                expect(result.courseName).toBe("Leadership")
            })

            it("should start travel to volhaven for cha training if we have enough company rep", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.skills.hacking = 275
                factionPriorities[3].currentJobRep = 8000

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as TravelAction

                expect(result.type).toBe("travel")
                expect(result.destination).toBe("Volhaven")
            })

            it("should continue cha training if we have enough company rep", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.skills.hacking = 275
                factionPriorities[3].currentJobRep = 8000
                player.currentWork = {
                    type: "CLASS",
                    classType: "Leadership",
                    location: "ZB Institute of Technology",
                    cyclesWorked: 1
                }

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as ChangeNothingAction

                expect(result.type).toBe("changeNothing")
                expect(result.noTravel).toBeTruthy()
            })

            it("should do nothing if there is no job and no faction", () => {
                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as UniversityAction

                expect(result.type).toBe(defaultActionType)
            })

            it("should work for the FACTION if the faction is available to work with", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.skills.hacking = 275
                factionPriorities[3].currentJobRep = 8000
                player.currentWork = {
                    type: "CLASS",
                    classType: "Leadership",
                    location: "ZB Institute of Technology",
                    cyclesWorked: 1
                }
                player.factions.push("Bachman & Associates")

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as FactionWorkAction

                expect(result.type).toBe("factionWork")
                expect(result.factionName).toBe(CompanyName.BachmanAndAssociates)
                expect(result.factionWorkType).toBe("hacking")
            })

            it("should travel to Aevum when we give it that as a target", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.money = 20_000_000

                player.currentWork = {
                    type: "COMPANY",
                    companyName: CompanyName.BachmanAndAssociates,
                    cyclesWorked: 0
                }

                precalculatedValues.targetCityFaction = CityName.Aevum

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as TravelAction

                expect(result.type).toBe("travel")
                expect(result.destination).toBe("Aevum")
            })

            it("should travel to Aevum when we give it that as a target", () => {
                player.jobs.AeroCorp = JobName.IT0
                player.jobs["Bachman & Associates"] = JobName.software0
                player.money = 20_000

                player.currentWork = {
                    type: "COMPANY",
                    companyName: CompanyName.BachmanAndAssociates,
                    cyclesWorked: 0
                }

                precalculatedValues.targetCityFaction = CityName.Aevum

                const controller = new CharacterController(player, factionPriorities, precalculatedValues)
                const result = controller.actionRequired as ChangeNothingAction

                expect(result.type).toBe("changeNothing")
            })
        })
    })
    // special faction?

    // next, augment bs and all the logic with that
    // if we can't work on priority 0, move on to next, etc.


})