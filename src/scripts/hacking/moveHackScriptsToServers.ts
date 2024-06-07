import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    const servers: Server[] = JSON.parse(ns.read("data/environment.txt"))

    for (const server of servers) {
        if (server.hasAdminRights) {
            if (!ns.fileExists("scripts/hacking/hack.js", server.hostname)) {
                ns.scp(["scripts/hacking/hack.js", "scripts/hacking/grow.js", "scripts/hacking/weaken.js"], server.hostname)
            }
        }
    }
}
