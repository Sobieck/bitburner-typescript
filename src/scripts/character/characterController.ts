import { PlayerRequirement, CompanyPositionInfo, Task, Player, NS } from "@ns";

export interface PlayerWithWork extends Player  {
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

export interface FactionPriorities {
    totalWantedScore: number;
    maxRepNeeded: number;
    factionName: string;
    augments: string[];
    maxPrice: number;
    requirements: PlayerRequirement[];
    currentRep: number;
    currentJobRep: number | undefined;
    positions: CompanyPositionInfo[] | undefined;
}

export type PrecalculatedValues = {
    fileSystem: string[];
}

export interface IAction {
    type: string;
}

export class TravelAction implements IAction {
    type: string = "travel";

    constructor(public destination: CityName){}
}

export class UniversityAction implements IAction {
    type: string = "university";

    constructor(public universityName: string, public courseName: string){}
}


export class CharacterController {
    public actionRequired: IAction | undefined;

    constructor(player: PlayerWithWork, factionPriorities: FactionPriorities[], precalculatedValues: PrecalculatedValues){
        if(player.city !== CityName.Sector12){
            this.actionRequired = new TravelAction(CityName.Sector12)
            return
        }

        this.actionRequired = new UniversityAction("Rothman University", "Computer Science")

    }
}

// priority: PROGRAMS, then augments

//{"type":"CLASS","cyclesWorked":1865,"classType":"Algorithms","location":"Rothman University"}
//{"type":"CREATE_PROGRAM","cyclesWorked":5,"programName":"BruteSSH.exe"}
// "COMPANY"
// "CRIME"
// "FACTION"
// "GRAFTING"

// BruteSSH.exe: 50
// FTPCrack.exe: 100
// relaySMTP.exe: 250
// HTTPWorm.exe: 500
// SQLInject.exe: 750

export async function main(ns: NS): Promise<void> {

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"
    const factionAugments: FactionPriorities[] = JSON.parse(ns.read(factionAugmentScoreFile))

    const playerPath = "data/player.txt"
    const player = JSON.parse(ns.read(playerPath)) as PlayerWithWork

    const precalculations: PrecalculatedValues = JSON.parse(ns.read("data/precalculatedValues.txt"))
}
