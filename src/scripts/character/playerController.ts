import { NS, Player, Task } from "@ns";

type PrecalculatedValues = {
    player: Player;
}


export class PlayerController {
    constructor(player: Player, currentTask: Task | null){

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
    const precalculate = JSON.parse(ns.read("data/precalculatedValues.txt")) as PrecalculatedValues
    const work = ns.singularity.getCurrentWork();  
    const augments = ns.singularity.getOwnedAugmentations()
}
