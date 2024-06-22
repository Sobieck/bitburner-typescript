import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {

    const stopInvestingFile = "data/stopInvesting.txt"

    if (ns.fileExists(stopInvestingFile)) {
        ns.rm(stopInvestingFile)
    } else {
        ns.write(stopInvestingFile)
    }

}
