import { NS, Server } from "@ns";

type PrecalculatedValues = {
    hasTor: boolean;
    programCosts: [string, number][]
}

export async function main(ns: NS): Promise<void> {


    const pathToPrecalculations = "data/precalculatedValues.txt"
    const precalculatedValues: PrecalculatedValues = JSON.parse(ns.read(pathToPrecalculations))

    precalculatedValues.hasTor = ns.hasTorRouter()

    precalculatedValues.programCosts = []

    for (const program of ns.singularity.getDarkwebPrograms()) {
        precalculatedValues.programCosts.push(
            [
                program, 
                ns.singularity.getDarkwebProgramCost(program)
            ])
    }

    ns.rm(pathToPrecalculations)
    ns.write(pathToPrecalculations, JSON.stringify(precalculatedValues))
}
