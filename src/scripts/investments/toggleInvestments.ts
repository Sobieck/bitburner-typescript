import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {

    const investAtWill = "data/investAtWill.txt"

    if (ns.fileExists(investAtWill)) {
        ns.rm(investAtWill)
        ns.tprint("Investment stopped")
    } else {
        ns.write(investAtWill)
        ns.tprint("Investment started") 
    }

}
