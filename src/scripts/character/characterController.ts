import { PlayerRequirement, CompanyPositionInfo, Task, Player, NS, CompanyName } from "@ns";

export interface PlayerWithWork extends Player {
    currentWork: Task | null
}

enum CityName {
    Aevum = "Aevum",
    Chongqing = "Chongqing",
    Sector12 = "Sector-12",
    NewTokyo = "New Tokyo",
    Ishima = "Ishima",
    Volhaven = "Volhaven",
}

export type AugmentData = {
    name: string;
    price: number;
    repReq: number;
}

export interface FactionPriority {
    totalWantedScore: number;
    maxRepNeeded: number;
    factionName: string;
    augments: AugmentData[];
    maxPrice: number;
    requirements: PlayerRequirement[];
    currentRep: number;
    currentJobRep: number | undefined;
    positions: CompanyPositionInfo[] | undefined;
    repNeededForAugsThatNextDoesntHave: number;
}

export type PrecalculatedValues = {
    fileSystem: string[];
    targetCityFaction: string | undefined;
}

interface IActionFormula {
    act(player: PlayerWithWork, precalculatedValues: PrecalculatedValues): IAction;
}

export interface IAction {
    type: string;
}

export class NoAction implements IAction {
    type = "noAction"
}

export class ChangeNothingAction implements IAction {
    type = "changeNothing"

    constructor(public noTravel: boolean = false) { }
}

export class TravelAction implements IAction {
    type = "travel";

    constructor(public destination: CityName) { }
}


/// best gym Powerhouse Gym in Sector-12

class FactionWorkFormula implements IActionFormula {
    private factionName: string;
    private hasEnoughRep: boolean;
    private hasEnoughJobRep: boolean | null = null;
    private jobRep: number | null = null;

    private requiredMoney: number | null = null;
    private requiredCity: CityName | null = null;

    private positions: CompanyPositionInfo[] | undefined;


    constructor(factionPriority: FactionPriority) {
        this.factionName = factionPriority.factionName
        this.hasEnoughRep = factionPriority.currentRep >= factionPriority.repNeededForAugsThatNextDoesntHave

        for (const requirement of factionPriority.requirements) {
            if (requirement.type === "city") {
                this.requiredCity = requirement.city
            }

            if (requirement.type === "money") {
                this.requiredMoney = requirement.money
            }

            if (requirement.type === "companyReputation") {
                this.hasEnoughJobRep = requirement.reputation <= factionPriority.currentJobRep!
                this.jobRep = factionPriority.currentJobRep!
            }

            this.positions = factionPriority.positions
        }
    }

    act(player: PlayerWithWork, precalculatedValues: PrecalculatedValues): IAction {
        if (this.hasEnoughRep) {
            return new NoAction()
        }

        if (!player.factions.includes(this.factionName)) {
            if (this.requiredCity && this.requiredMoney) {
                if (player.money >= this.requiredMoney) {
                    return new TravelAction(this.requiredCity)
                }
            }

            if (this.hasEnoughJobRep !== null && !this.hasEnoughJobRep) {
                const jobName = player.jobs[this.factionName as CompanyName]

                if (jobName && this.positions) {
                    const currentJob = this.positions.find(x => x.name === jobName)

                    if (currentJob) {
                        const nextPosition = this.positions.find(x => x.name === currentJob.nextPosition)
                        if (nextPosition && this.jobRep && nextPosition.requiredReputation <= this.jobRep) {
                            let action = new NoAction()

                            if (player.skills.hacking < nextPosition.requiredSkills.hacking) {
                                const hackingFormula = new UniversityFormula(CityName.Volhaven, "ZB Institute of Technology", "Algorithms")
                                action = hackingFormula.act(player, precalculatedValues)
                            }

                            if (player.skills.charisma < nextPosition.requiredSkills.charisma && action.type === "noAction") {
                                const charismaFormula = new UniversityFormula(CityName.Volhaven, "ZB Institute of Technology", "Leadership")
                                action = charismaFormula.act(player, precalculatedValues)
                            }

                            if (action.type !== "noAction") {
                                return action;
                            }
                        }
                    }

                    if (player.currentWork &&
                        player.currentWork.type === "COMPANY" &&
                        player.currentWork.companyName === this.factionName) {
                        return new ChangeNothingAction()
                    }


                    return new CompanyWorkAction(this.factionName)
                }
            }

            return new NoAction()
        }

        if (player.currentWork &&
            player.currentWork.type === "FACTION" &&
            player.currentWork.factionWorkType === "hacking" &&
            player.currentWork.factionName === this.factionName
        ) {
            return new ChangeNothingAction()
        }

        return new FactionWorkAction(this.factionName, "hacking")
    }
}
export class FactionWorkAction implements IAction {
    type = "factionWork"

    constructor(public factionName: string, public factionWorkType: string) { }
}
export class CompanyWorkAction implements IAction {
    type = "companyWork"

    constructor(public companyName: string) { }
}


class CreateProgramFormula implements IActionFormula {
    constructor(private programName: string, private hackLevelRequired: number) { }

    act(player: PlayerWithWork, precalculatedValues: PrecalculatedValues): IAction {
        if (player.currentWork &&
            player.currentWork.type === "CREATE_PROGRAM" &&
            player.currentWork.programName === this.programName
        ) {
            return new ChangeNothingAction()
        }

        if (player.skills &&
            player.skills.hacking >= this.hackLevelRequired &&
            !precalculatedValues.fileSystem.includes(this.programName)) {

            return new CreateProgramAction(this.programName)
        }

        return new NoAction()
    }
}
export class CreateProgramAction implements IAction {
    type = "createProgram";

    constructor(public programName: string) { }
}



class UniversityFormula implements IActionFormula {
    constructor(private locationCity: CityName, private universityName: string, private courseName: string) { }

    act(player: PlayerWithWork, precalculatedValues: PrecalculatedValues): IAction {
        if (player.currentWork &&
            player.currentWork.type === "CLASS" &&
            player.currentWork.location === this.universityName &&
            player.currentWork.classType === this.courseName) {

            return new ChangeNothingAction(true)
        }

        if (player.city !== this.locationCity) {
            return new TravelAction(this.locationCity)
        }

        return new UniversityAction(this.universityName, this.courseName)
    }
}
export class UniversityAction implements IAction {
    type = "university";

    constructor(public universityName: string, public courseName: string) { }
}


export class CharacterController {
    public actionRequired: IAction = new NoAction();

    private actionFormulas: IActionFormula[] = []

    constructor(player: PlayerWithWork, factionPriorities: FactionPriority[], precalculatedValues: PrecalculatedValues) {

        this.actionFormulas.push(new CreateProgramFormula("BruteSSH.exe", 50))
        this.actionFormulas.push(new CreateProgramFormula("FTPCrack.exe", 100))
        this.actionFormulas.push(new CreateProgramFormula("relaySMTP.exe", 250))
        this.actionFormulas.push(new CreateProgramFormula("HTTPWorm.exe", 500))
        this.actionFormulas.push(new CreateProgramFormula("SQLInject.exe", 750))

        for (const factionPriority of factionPriorities) {
            this.actionFormulas.push(new FactionWorkFormula(factionPriority))
        }

        this.actionFormulas.push(new UniversityFormula(CityName.Sector12, "Rothman University", "Computer Science"))


        for (const formula of this.actionFormulas) {
            this.actionRequired = formula.act(player, precalculatedValues)

            if (this.actionRequired.type !== "noAction") {
                break;
            }
        }

        if (this.actionRequired.type === "changeNothing" &&
            !(this.actionRequired as ChangeNothingAction).noTravel &&
            precalculatedValues.targetCityFaction
        ) {
            if (!player.factions.includes(precalculatedValues.targetCityFaction) && 
                player.money >= 20_000_000) {
                this.actionRequired = new TravelAction(precalculatedValues.targetCityFaction as CityName)
            }
        }
    }
}

export async function main(ns: NS): Promise<void> {

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"
    const factionPriorities: FactionPriority[] = JSON.parse(ns.read(factionAugmentScoreFile))

    const playerPath = "data/player.txt"
    const player = JSON.parse(ns.read(playerPath)) as PlayerWithWork

    const precalculations: PrecalculatedValues = JSON.parse(ns.read("data/precalculatedValues.txt"))

    const controller = new CharacterController(player, factionPriorities, precalculations)

    const actionFile = "data/action.txt"
    ns.rm(actionFile)
    ns.write(actionFile, JSON.stringify(controller.actionRequired))

}
