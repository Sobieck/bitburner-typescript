import { NS } from "@ns";
import { ScriptRegistry } from "/scripts/scriptRegistry"

export async function main(ns: NS): Promise<void> {
  ns.run("scripts/scriptRegistry.js")

  const totalTimeInMs = 2_000

  await ns.sleep(totalTimeInMs)

  while(true){
    
    const scriptRegistry: ScriptRegistry = JSON.parse(ns.read("data/scriptRegistry.txt"))
    const numberOfMsPerAction = totalTimeInMs / scriptRegistry.scriptsWithCost.length

    for (const script of scriptRegistry.scriptsWithCost) {

      ns.run(script.path)
      await ns.sleep(numberOfMsPerAction)
    
    } 
  }
}
