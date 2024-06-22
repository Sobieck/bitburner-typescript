import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const environment = JSON.parse(ns.read("data/environment.txt")) as Server[]

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
