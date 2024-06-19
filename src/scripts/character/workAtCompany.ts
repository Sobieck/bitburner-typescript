import { CompanyName, NS } from "@ns";
import { CompanyWorkAction } from "scripts/character/characterController";

export async function main(ns: NS): Promise<void> {
    const actionFile = "data/action.txt"
    const action = JSON.parse(ns.read(actionFile)) as CompanyWorkAction

    if(action.type === "companyWork"){
        ns.singularity.workForCompany(action.companyName as CompanyName, true)
    }
}
