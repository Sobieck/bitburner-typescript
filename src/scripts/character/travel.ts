import { NS } from "@ns";
import { TravelAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const actionFile = "data/action.txt"
    const action = JSON.parse(ns.read(actionFile)) as TravelAction

    if(action.type === "travel"){
        ns.singularity.travelToCity(action.destination)
    }
}
