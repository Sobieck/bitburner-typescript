import { NS, Server } from "@ns";

interface ServerWithPathAndConnections extends Server {
    path: string[];
    connections: string[];
}

type FactionPriority = {
    factionName: string;
    augments: AugmentData[];
}

type AugmentData = {
    name: string;
    nextFactionHas: boolean;
}

export async function main(ns: NS): Promise<void> {
    const backdoorFlagFile = "data/backdooring.txt"

    if(ns.fileExists(backdoorFlagFile, "home")){
        return;
    }

    ns.write(backdoorFlagFile)
    
    const environmentPath = "data/environment.txt"
    const servers = JSON.parse(ns.read(environmentPath)) as ServerWithPathAndConnections[]

    const serversNeedingBackdooring = [
        "run4theh111z", 
        "CSEC", 
        "I.I.I.I", 
        "avmnite-02h", 
        "zb-institute", 
        "powerhouse-fitness", 
    ]

    const factionAugmentScoreFile = "data/factionAugmentRank.txt"
    const factionPriorities: FactionPriority[] = JSON.parse(ns.read(factionAugmentScoreFile))

    for (const factionPriority of factionPriorities) {
        const factionsServer = servers.find(x => x.organizationName === factionPriority.factionName)

        if (factionsServer && !serversNeedingBackdooring.includes(factionsServer.hostname)){
            serversNeedingBackdooring.push(factionsServer.hostname)
        }
    }

    const serversToBackdoor = servers.filter(x => 
        !x.backdoorInstalled && 
        x.hasAdminRights && 
        serversNeedingBackdooring.includes(x.hostname))

    // ns.write("stuff.txt", JSON.stringify(serversToBackdoor))

    for (const serverToBackdoor of serversToBackdoor) {
        for (const nextServer of serverToBackdoor.path) {
            ns.singularity.connect(nextServer)
        }

        await ns.singularity.installBackdoor()
        ns.singularity.connect("home")
    }

    ns.rm(backdoorFlagFile)

}
