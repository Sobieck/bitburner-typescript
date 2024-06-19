import { FactionWorkType, NS } from "@ns";
import { FactionWorkAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const actionFile = "data/action.txt"
    const action = JSON.parse(ns.read(actionFile)) as FactionWorkAction

    if(action.type === "factionWork"){
        ns.singularity.workForFaction(action.factionName, action.factionWorkType as FactionWorkType, true)
    }
}
