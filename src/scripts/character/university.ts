import { LocationName, NS, UniversityClassType } from "@ns";
import { UniversityAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const actionFile = "data/action.txt"
    const action = JSON.parse(ns.read(actionFile)) as UniversityAction

    if(action.type === "university"){
        ns.singularity.universityCourse(action.universityName, action.courseName, true)
    }
}
