import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {

    const environment = JSON.parse(ns.read("data/environment.txt")) as Server[]
    const player = ns.getPlayer()

    for (const server of environment) {
        if (!server.hasAdminRights && server.requiredHackingSkill && player.skills.hacking >= server.requiredHackingSkill) {
            if (server.numOpenPortsRequired !== undefined && server.openPortCount !== undefined) {
                if(server.numOpenPortsRequired <= server.openPortCount){
                    ns.nuke(server.hostname)
                }
            } else {
                
            }
        }
    }
} 