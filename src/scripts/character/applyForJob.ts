import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    for (const [_, company] of Object.entries(ns.enums.CompanyName)) {
        ns.singularity.applyToCompany(company, ns.enums.JobField.software)
    }
}

