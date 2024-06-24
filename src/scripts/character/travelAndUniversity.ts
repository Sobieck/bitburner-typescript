import { NS } from "@ns";
import { TravelAction, UniversityAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const actionFile = "data/action.txt"
    const action = JSON.parse(ns.read(actionFile)) as TravelAction | UniversityAction

    if(action.type === "travel"){
        ns.singularity.travelToCity((action as TravelAction).destination)
    }

    if(action.type === "university"){
        const universityAction = action as UniversityAction
        ns.singularity.universityCourse(universityAction.universityName, universityAction.courseName, true)
    }    
}
