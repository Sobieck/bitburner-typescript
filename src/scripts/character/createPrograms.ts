import { NS } from "@ns";
import { CreateProgramAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const actionFile = "data/action.txt"
    const action = JSON.parse(ns.read(actionFile)) as CreateProgramAction

    if(action.type === "createProgram"){
        ns.singularity.createProgram(action.programName, true)
    }
}
