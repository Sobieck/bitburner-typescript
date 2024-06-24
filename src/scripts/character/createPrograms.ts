import { NS } from "@ns";
import { CreateProgramAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const action = getObjectFromFileSystem<CreateProgramAction>(ns, "data/action.txt")

    if (action){
        if(action.type === "createProgram"){
            ns.singularity.createProgram(action.programName, true)
        }
    }
}

function getObjectFromFileSystem<T>(ns: NS, path: string) {
    let objectWeWant: T | undefined;

    if (ns.fileExists(path)){
        objectWeWant = JSON.parse(ns.read(path))
    }

    return objectWeWant
}