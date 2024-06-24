import { NS, ToastVariant } from "@ns";

export async function main(ns: NS): Promise<void> {
  const scriptsToRun: string[] = []

  scriptsToRun.push("scripts/scriptRegistry.js")
  scriptsToRun.push("scripts/scan.js")
  scriptsToRun.push("scripts/getRoot.js")

  //precalculate
  scriptsToRun.push("scripts/precalculate/precalculate.js")
  scriptsToRun.push("scripts/precalculate/attackAnalysis.js")
  //augments 
  scriptsToRun.push("scripts/precalculate/augments/whereToGet.js")
  scriptsToRun.push("scripts/precalculate/augments/getPrereqs.js")
  scriptsToRun.push("scripts/precalculate/augments/getRepAndBasePrice.js")
  scriptsToRun.push("scripts/precalculate/augments/getStats.js")
  scriptsToRun.push("scripts/precalculate/augments/isOwned.js")
  scriptsToRun.push("scripts/precalculate/augments/targetAugmentFilter.js")
  scriptsToRun.push("scripts/precalculate/augments/getCompanyJobs.js")
  scriptsToRun.push("scripts/precalculate/augments/selectTargetCityFaction.js")
  // player 
  scriptsToRun.push("scripts/precalculate/player/player.js")
  // investments 
  scriptsToRun.push("scripts/precalculate/investments/homeUpgrade.js")
  scriptsToRun.push("scripts/precalculate/investments/torStuff.js")

  // hacking
  scriptsToRun.push("scripts/hacking/moveHackScriptsToServers.js")
  scriptsToRun.push("scripts/hacking/advancedHackingOrchistrator.js")
  scriptsToRun.push("scripts/hacking/backdoor.js")

  //characterShit 
  // just happening stuff
  scriptsToRun.push("scripts/character/joinFaction.js")
  scriptsToRun.push("scripts/character/applyForJob.js")
  // controller and controlled
  scriptsToRun.push("scripts/character/characterController.js")
  scriptsToRun.push("scripts/character/createPrograms.js")
  scriptsToRun.push("scripts/character/travelAndUniversity.js")
  scriptsToRun.push("scripts/character/workAtFaction.js")
  scriptsToRun.push("scripts/character/workAtCompany.js")

  //investments
  scriptsToRun.push("scripts/investments/investmentsController.js")
  scriptsToRun.push("scripts/investments/buyPrograms.js")
  scriptsToRun.push("scripts/investments/buyRemoteServers.js")
  scriptsToRun.push("scripts/investments/upgradeHome.js")

  //finish round
  scriptsToRun.push("scripts/finishRound/buyModsController.js")

  const scriptWithRamCost: ScriptWithCost[] = []

  const allScripts = ns.ls("home", "/scripts").filter(x => !x.endsWith(".txt"))

  for (const script of scriptsToRun) {

    if (!allScripts.includes(script)) {
      ns.toast(`${script} doesn't exist on your home computers hd.`, "error")
    }
  }


  allScripts.forEach(path => {
    scriptWithRamCost.push(
      new ScriptWithCost(path, ns.getScriptRam(path))
    )
  });

  const coordinatorRamCost = ns.getScriptRam("scripts/coordinator.js")
  const maxCost = Math.max(...scriptWithRamCost.map(x => x.ramCost))

  const keyLog = scriptWithRamCost.find(x => x.ramCost === maxCost)!

  const scriptRegistry = new ScriptRegistry(scriptsToRun, scriptWithRamCost, maxCost + coordinatorRamCost, keyLog)

  ns.rm("data/scriptRegistry.txt")
  ns.write("data/scriptRegistry.txt", JSON.stringify(scriptRegistry))
}


export class ScriptRegistry {
  constructor(public scriptsToRun: string[], public scriptsWithCost: ScriptWithCost[], public ramReservedOnHome: number, public mostRam: ScriptWithCost) { }
}

export class ScriptWithCost {
  constructor(public path: string, public ramCost: number) { }
}