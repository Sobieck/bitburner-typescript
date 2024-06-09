import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const scriptsToRun: string[] = []

  scriptsToRun.push("scripts/scriptRegistry.js")
  scriptsToRun.push("scripts/scan.js")
  scriptsToRun.push("scripts/getRoot.js")

  //precalculate
  scriptsToRun.push("scripts/precalculate/precalculate.js")
  scriptsToRun.push("scripts/precalculate/attackAnalysis.js")

  // hacking
  scriptsToRun.push("scripts/hacking/moveHackScriptsToServers.js")
  scriptsToRun.push("scripts/hacking/basicHackingOrchistrator.js")


  // add cost
  const scriptWithRamCost: ScriptWithCost[] = []

  const allScripts = ns.ls("home", "/scripts")

  allScripts.forEach(path => {
    scriptWithRamCost.push(
      new ScriptWithCost(path, ns.getScriptRam(path))
    )
  });

  const coordinatorRamCost = ns.getScriptRam("scripts/coordinator.js")
  const maxCost = Math.max(...scriptWithRamCost.map(x => x.ramCost))

  const scriptRegistry = new ScriptRegistry(scriptsToRun, scriptWithRamCost, maxCost + coordinatorRamCost)

  ns.rm("data/scriptRegistry.txt")
  ns.write("data/scriptRegistry.txt", JSON.stringify(scriptRegistry))
}


export class ScriptRegistry {
  constructor(public scriptsToRun: string[], public scriptsWithCost: ScriptWithCost[], public ramReservedOnHome: number){}
}

export class ScriptWithCost {
  constructor(public path: string, public ramCost: number){}
}