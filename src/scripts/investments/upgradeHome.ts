import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const action = getObjectFromFileSystem<BuyHomeRamAction>(ns, "data/investmentAction.txt")

    if (action) {
        if (action.type === new BuyHomeRamAction().type) {
            ns.singularity.upgradeHomeRam()
        }

        if(action.type === new BuyHomeCoreAction().type) {
            ns.singularity.upgradeHomeCores()
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

export class BuyHomeRamAction  {
    type = "buyHomeRam"
}
export class BuyHomeCoreAction {
    type = "buyHomeCore"
}