import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {

    const investAtWill = "data/investAtWill.txt"

    if (ns.fileExists(investAtWill)) {
        ns.rm(investAtWill)
    } else {
        ns.write(investAtWill)
    }

}
