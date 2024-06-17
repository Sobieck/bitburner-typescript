import { NS, Server } from "@ns";

interface ServerWithPathAndConnections extends Server {
    path: string[];
    connections: string[];
}

export async function main(ns: NS): Promise<void> {
    if(ns.isRunning("scripts/hacking/backdoor.js")){
        return;
    }

    const environmentPath = "data/environment.txt"
    const servers = JSON.parse(ns.read(environmentPath)) as ServerWithPathAndConnections[]

    const serversNeedingBackdooring = ["run4theh111z", "CSEC", "I.I.I.I", "avmnite-02h", "fulcrumassets"]

    const serversToBackdoor = servers.filter(x => 
        !x.backdoorInstalled && 
        x.hasAdminRights && 
        serversNeedingBackdooring.includes(x.hostname))

    
    for (const serverToBackdoor of serversToBackdoor) {
        for (const nextServer of serverToBackdoor.path) {
            ns.singularity.connect(nextServer)
        }

        ns.singularity.installBackdoor()
        ns.singularity.connect("home")
    }

}
