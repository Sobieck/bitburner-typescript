import { NS, Player, Task } from "@ns";


interface PlayerWithWork extends Player  {
    currentWork: Task | null
    factionsWithRep: FactionsWithRep[]
}

class FactionsWithRep {
    constructor(public factionName: string, public rep: number) { }
}

export async function main(ns: NS): Promise<void> {

    const player = ns.getPlayer() as PlayerWithWork
    player.currentWork = ns.singularity.getCurrentWork()

    const factionsWithRep: FactionsWithRep[] = []

    for (const faction of player.factions) {
        factionsWithRep.push(new FactionsWithRep(faction, ns.singularity.getFactionRep(faction)))
    }

    player.factionsWithRep = factionsWithRep

    const playerPath = "data/player.txt"

    ns.rm(playerPath)
    ns.write(playerPath, JSON.stringify(player))
}
