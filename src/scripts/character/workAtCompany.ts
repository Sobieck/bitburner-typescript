import { CompanyName, NS } from "@ns";
import { CompanyWorkAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const action = getObjectFromFileSystem<CompanyWorkAction>(ns, "data/action.txt")

    if (action) {
        if (action.type === "companyWork") {
            ns.singularity.workForCompany(action.companyName as CompanyName, true)
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