import { NS, Player, Server, Task } from "@ns";


interface PlayerWithWork extends Player  {
    currentWork: Task | null
}

export async function main(ns: NS): Promise<void> {

    const player = ns.getPlayer() as PlayerWithWork
    player.currentWork = ns.singularity.getCurrentWork()

    const playerPath = "data/player.txt"

    ns.rm(playerPath)
    ns.write(playerPath, JSON.stringify(player))
}
