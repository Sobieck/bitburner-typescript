import { NS } from "@ns";
import { TravelAction, UniversityAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const action = getObjectFromFileSystem<TravelAction | UniversityAction>(ns, "data/action.txt")

    if(action){
        if(action.type === "travel"){
            ns.singularity.travelToCity((action as TravelAction).destination)
        }
    
        if(action.type === "university"){
            const universityAction = action as UniversityAction
            ns.singularity.universityCourse(universityAction.universityName, universityAction.courseName, true)
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