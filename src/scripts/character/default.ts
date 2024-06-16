import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    if (!ns.singularity.isBusy()) {
        ns.singularity.universityCourse(ns.enums.LocationName.Sector12RothmanUniversity, ns.enums.UniversityClassType.algorithms, true)
    }
}
