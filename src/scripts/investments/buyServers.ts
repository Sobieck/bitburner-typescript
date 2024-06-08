import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.tprint(ns.getPurchasedServerCost(32)) 

    const remoteName = "REMOTE-003"

    // ns.purchaseServer(remoteName, 32) 
} 