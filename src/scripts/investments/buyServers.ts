import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    // ns.tprint(ns.getPurchasedServerCost(32)) 

    const remoteName = "REMOTE-008"

    // ns.upgradePurchasedServer(remoteName, 2048)

    ns.purchaseServer(remoteName, 2048)  
} 