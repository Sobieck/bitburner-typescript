import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {

    const factionInvites = ns.singularity.checkFactionInvitations()

    for (const faction of factionInvites) {
        ns.singularity.joinFaction(faction)
    }    
}
