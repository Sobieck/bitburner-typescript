import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const environment = getObjectFromFileSystem<Server[]>(ns, "data/environment.txt")

    if(!environment){
        return
    }

    const scriptsToKill = [
        "scripts/hacking/hack.js",
        "scripts/hacking/grow.js",
        "scripts/hacking/weaken.js"
    ]

    for (const server of environment.filter(x => x.hasAdminRights)) {
        for (const script of scriptsToKill) {
            if (ns.scriptRunning(script, server.hostname)) {
                ns.scriptKill(script, server.hostname)
            }
        }
    }
}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)){
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}