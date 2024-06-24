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

    if (ns.fileExists(backdoorFlagFile, "home")) {
        return;
    }

    ns.write(backdoorFlagFile)

    const servers = getObjectFromFileSystem<ServerWithPathAndConnections[]>(ns, "data/environment.txt")
    const factionPriorities = getObjectFromFileSystem<FactionPriority[]>(ns, "data/factionAugmentRank.txt")

    if (servers && factionPriorities) {

        const serversNeedingBackdooring = [
            "run4theh111z",
            "CSEC",
            "I.I.I.I",
            "avmnite-02h",
            "zb-institute",
            "powerhouse-fitness",
        ]



        for (const factionPriority of factionPriorities) {
            const factionsServer = servers.find(x => x.organizationName === factionPriority.factionName)

            if (factionsServer && !serversNeedingBackdooring.includes(factionsServer.hostname)) {
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
}


function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)) {
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}