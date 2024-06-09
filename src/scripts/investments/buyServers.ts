import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    // ns.tprint(ns.getPurchasedServerCost(32)) 

    const remoteName = "REMOTE-001"

    // ns.upgradePurchasedServer(remoteName, 2048)

    ns.purchaseServer(remoteName, 4096)  
} 