import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    const action = getObjectFromFileSystem<BuyProgramAction>(ns, "data/investmentAction.txt")

    if (action) {
        if (action.type === "buyTor") {
            ns.singularity.purchaseTor()
        }

        if (action.type === "buyProgram") {
            ns.singularity.purchaseProgram(action.programName)
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

export class BuyProgramAction {
    type = "buyProgram"

    constructor(public programName: string) { }
}