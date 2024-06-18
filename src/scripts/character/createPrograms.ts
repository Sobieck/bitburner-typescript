import { NS, Player } from "@ns";

type PrecalculatedValues = {
    player: Player;
}

export async function main(ns: NS): Promise<void> {
    // const precalculate = JSON.parse(ns.read("data/precalculatedValues.txt")) as PrecalculatedValues
    // const work = ns.singularity.getCurrentWork();  

    // const brute = "BruteSSH.exe"
    // if (!ns.fileExists(brute) && precalculate.player.skills.hacking > 50 && work?.type !== "CREATE_PROGRAM") {
    //     ns.singularity.createProgram(brute, true)
    // }
}
