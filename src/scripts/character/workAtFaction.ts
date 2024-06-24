import { FactionWorkType, NS } from "@ns";
import { FactionWorkAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {

    const action = getObjectFromFileSystem<FactionWorkAction>(ns, "data/action.txt")

    if (action) {
        if (action.type === "factionWork") {
            ns.singularity.workForFaction(action.factionName, action.factionWorkType as FactionWorkType, true)
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