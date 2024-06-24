import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const action = getObjectFromFileSystem<PurchaseServerAction>(ns, "data/investmentAction.txt")

    if (action) {
        if (action.type === "purchaseServer") {
            ns.purchaseServer(action.serverName, action.ram)
        }

        if (action.type === "upgradePurchasedServer"){
            ns.upgradePurchasedServer(action.serverName, action.ram)
        }
    }
}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)) {
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}

export class PurchaseServerAction {
    type = "purchaseServer"

    constructor(public serverName: string, public ram: number) { }
}
export class UpgradePurchasedServerAction {
    type = "upgradePurchasedServer"

    constructor(public serverName: string, public ram: number) { }
}
